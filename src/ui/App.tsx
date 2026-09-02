import { useCallback, useEffect, useRef, useState } from 'react';
import type { Capture, MainToUI, SelectionInfo, Settings as S, UIToMain } from '../shared/messages';
import { fetchLenses, run, ScoutError, type DetectResult, type EvalResult, type LensInfo, type LensResult } from './api';
import { addCrops } from './crop';
import type { RunRecord } from '../shared/stats';
import { cropSize, dataUriToBytes } from './crop';
import Actions from './components/Actions';
import LensChips from './components/LensChips';
import Chat, { type Turn } from './components/Chat';
import SettingsPanel from './components/Settings';
import Report from './components/Report';

const send = (msg: UIToMain) => parent.postMessage({ pluginMessage: msg }, '*');

type Phase = 'idle' | 'working' | 'needs-platform' | 'done';

export default function App() {
  const [settings, setSettings] = useState<S | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selection, setSelection] = useState<SelectionInfo>({ count: 0, name: null, supported: false, flat: false });
  const [phase, setPhase] = useState<Phase>('idle');
  const [stage, setStage] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('');
  const [source, setSource] = useState<'design' | 'production'>('design');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [annotated, setAnnotated] = useState('');
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [boardNote, setBoardNote] = useState('');
  const [lenses, setLenses] = useState<LensInfo[]>([]);
  // A lens chosen before the run, so one call does both layers instead of two.
  const [upfrontLens, setUpfrontLens] = useState('');
  // Principles typed or uploaded to make a starter lens describe a real product.
  const [lensNotes, setLensNotes] = useState('');
  const [lensBusy, setLensBusy] = useState('');
  const [lensStage, setLensStage] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [asking, setAsking] = useState(false);
  const [applying, setApplying] = useState(false);
  // How many of the user's turns have already been folded into the findings.
  const [foldedIn, setFoldedIn] = useState(0);
  const [updateNote, setUpdateNote] = useState('');
  // Snapshot of the universal result, so removing a lens can revert cleanly.
  const baseRef = useRef<EvalResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const captureRef = useRef<Capture | null>(null);
  const resolveCapture = useRef<((c: Capture) => void) | null>(null);
  const rejectCapture = useRef<((e: Error) => void) | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = e.data.pluginMessage as MainToUI | undefined;
      if (!msg) return;
      switch (msg.type) {
        case 'ready':
          setSettings(msg.settings);
          void fetchLenses(msg.settings).then(setLenses);
          setSelection(msg.selection);
          if (!msg.settings.accessCode && !msg.settings.ownKey) setShowSettings(true);
          break;
        case 'selection-changed':
          setSelection(msg.selection);
          break;
        case 'capture':
          captureRef.current = msg.capture;
          resolveCapture.current?.(msg.capture);
          break;
        case 'settings-saved':
          setShowSettings(false);
          break;
        case 'runs':
          setRuns(msg.runs);
          break;
        case 'board-built':
          setBoardNote(
            msg.note
              ? `Could not build the board: ${msg.note}`
              : msg.shown < msg.total
                ? `Board built with ${msg.shown} of ${msg.total} findings`
                : `Board built with ${msg.shown} findings`,
          );
          break;
        case 'annotated':
          setAnnotated(
            msg.count > 0
              ? `Drew ${msg.count} on the canvas`
              : msg.note
                ? `Could not draw: ${msg.note}`
                : 'Nothing to draw',
          );
          break;
        case 'error':
          rejectCapture.current?.(new Error(msg.message));
          setError(msg.message);
          setPhase('idle');
          break;
      }
    };
    window.addEventListener('message', onMessage);
    send({ type: 'ui-ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (phase !== 'working') return;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase]);

  const grabCapture = useCallback(
    () =>
      new Promise<Capture>((resolve, reject) => {
        resolveCapture.current = resolve;
        rejectCapture.current = reject;
        send({ type: 'capture' });
      }),
    [],
  );

  const start = useCallback(
    async (forcedPlatform?: string) => {
      if (!settings) return;
      setError('');
      setResult(null);
      setPhase('working');
      setStage('Exporting the screen');

      const runStarted = Date.now();
      const controller = new AbortController();
      abortRef.current = controller;
      // Nothing legitimate takes four minutes. Past that it is hung, not slow.
      const timeout = setTimeout(() => controller.abort(), 240_000);

      try {
        const capture = captureRef.current && forcedPlatform ? captureRef.current : await grabCapture();
        let chosen = forcedPlatform || platform;

        if (!chosen) {
          setStage('Working out the platform');
          const detected = await run<DetectResult>(settings, {
            route: 'detect',
            capture,
            signal: controller.signal,
            onProgress: setStage,
          });
          chosen = detected.result.platform;
          setPlatform(chosen);
          if (detected.result.confidence === 'low') {
            setStage('');
            setPhase('needs-platform');
            return;
          }
        }

        setStage(upfrontLens ? 'Running the evaluation with the lens' : 'Running the evaluation');
        const out = await run<EvalResult>(settings, {
          route: 'eval',
          capture,
          platform: chosen,
          source,
          // Picked before the run, so one call covers both layers.
          lens: upfrontLens || undefined,
          lensText: settings.customLenses.find((l) => l.id === upfrontLens)?.text,
          lensNotes: lensNotes || undefined,
          signal: controller.signal,
          onProgress: setStage,
        });
        const bySeverity: Record<string, number> = {};
        for (const f of out.result.findings) {
          bySeverity[String(f.severity)] = (bySeverity[String(f.severity)] ?? 0) + 1;
        }
        send({
          type: 'record-run',
          run: {
            at: Date.now(),
            screen: out.result.screen_name || capture.screenName,
            provider: out.provider,
            platform: chosen,
            findings: out.result.findings.length,
            bySeverity,
            seconds: Math.round((Date.now() - runStarted) / 1000),
            inputTokens: out.usage.input,
            outputTokens: out.usage.output,
            cachedTokens: out.usage.cacheRead,
          },
        });

        const withCrops = await addCrops(out.result.findings, capture);
        const base = {
          ...out.result,
          findings: withCrops,
          // The model answers with the lens's display name, and the chips match on id.
          // We know which id we sent, so use it rather than trusting the echo.
          lenses_applied: upfrontLens ? [upfrontLens] : out.result.lenses_applied,
        };
        baseRef.current = base;
        setResult(base);
        setFoldedIn(0);
        setUpdateNote('');
        setPhase('done');
        setAnnotated('');
        // Draw straight away: the point of the plugin is findings landing on the design.
        send({
          type: 'annotate',
          scale: capture.scale,
          findings: withCrops.map((f) => ({
            id: f.id,
            severity: f.severity,
            headline: f.headline,
            node_id: f.node_id,
            bbox: f.bbox,
          })),
        });
      } catch (err) {
        const aborted = controller.signal.aborted;
        setError(
          aborted
            ? 'The model did not answer in four minutes. It is usually busy. Try again.'
            : err instanceof ScoutError || err instanceof Error
              ? err.message
              : 'Something went wrong.',
        );
        setPhase('idle');
      } finally {
        clearTimeout(timeout);
        abortRef.current = null;
      }
    },
    [settings, platform, source, upfrontLens, lensNotes, grabCapture],
  );

  const applyLens = useCallback(
    async (lens: LensInfo) => {
      const capture = captureRef.current;
      if (!settings || !capture || !result) return;
      setLensBusy(lens.id);
      setError('');
      const startedAt = Date.now();
      setLensStage(`Applying the ${lens.name} lens…`);
      const tick = setInterval(
        () => setLensStage(`Applying the ${lens.name} lens… ${Math.round((Date.now() - startedAt) / 1000)}s`),
        1000,
      );
      try {
        const out = await run<LensResult>(settings, {
          route: 'extend',
          capture,
          platform: result.platform,
          source,
          lens: lens.id,
          lensText: settings.customLenses.find((l) => l.id === lens.id)?.text,
          previous: {
            findings: result.findings.map((f) => ({
              id: f.id,
              layer: f.layer,
              ref: f.ref,
              headline: f.headline,
              severity: f.severity,
              element: f.element,
            })),
          },
          onProgress: (st) =>
            setLensStage(`${st} ${Math.round((Date.now() - startedAt) / 1000)}s`),
        });

        const upgrades = new Map(out.result.severity_upgrades.map((u) => [u.finding_id, u]));
        const existing = result.findings.map((f) => {
          const up = upgrades.get(f.id);
          // A lens only sharpens. It never lowers a severity the universal layers set.
          if (!up || up.new_severity <= f.severity) return f;
          return { ...f, severity: up.new_severity, upgradedFrom: f.severity, upgradeReason: up.reason, lens: lens.id };
        });

        const added = out.result.new_findings.map((f, i) => ({
          ...f,
          id: f.id || `${lens.id}-${i + 1}`,
          layer: 'lens' as const,
          lens: lens.name,
        }));

        setResult({
          ...result,
          lenses_applied: [...result.lenses_applied, lens.id],
          findings: [...existing, ...(await addCrops(added, capture))],
        });
        setUpdateNote(
          `${lens.name} applied: ${added.length} new finding${added.length === 1 ? '' : 's'}, ` +
            `${out.result.severity_upgrades.length} severity change${out.result.severity_upgrades.length === 1 ? '' : 's'}.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The lens could not be applied.');
      } finally {
        clearInterval(tick);
        setLensBusy('');
        setLensStage('');
      }
    },
    [settings, result, source],
  );

  const removeLens = useCallback(
    (id: string) => {
      const base = baseRef.current;
      if (!base || !result) return;
      // Reverting means going back to the snapshot, then replaying the lenses that stay.
      const keep = result.lenses_applied.filter((l) => l !== id);
      setResult({ ...base, lenses_applied: [] });
      if (keep.length > 0) {
        const next = lenses.find((l) => keep.includes(l.id));
        if (next) void applyLens(next);
      }
    },
    [result, lenses, applyLens],
  );

  const ask = useCallback(
    async (question: string) => {
      const capture = captureRef.current;
      if (!settings || !capture || !result) return;
      const history = turns;
      setUpdateNote('');
      setTurns([...history, { role: 'user', text: question }]);
      setAsking(true);
      try {
        const out = await run<{ text: string }>(settings, {
          route: 'ask',
          capture,
          platform: result.platform,
          source,
          question,
          history,
          previous: {
            findings: result.findings.map((f) => ({
              id: f.id,
              ref: f.ref,
              headline: f.headline,
              severity: f.severity,
              why_it_matters: f.why_it_matters,
            })),
          },
        });
        setTurns((t) => [...t, { role: 'assistant', text: out.result.text }]);
      } catch (err) {
        setTurns((t) => [
          ...t,
          { role: 'assistant', text: err instanceof Error ? err.message : 'That question failed.' },
        ]);
      } finally {
        setAsking(false);
      }
    },
    [settings, result, source, turns],
  );

  const applyAnswers = useCallback(async () => {
    const capture = captureRef.current;
    if (!settings || !capture || !result) return;
    setApplying(true);
    setError('');
    setStage('Rewriting the findings');
    try {
      const notes = turns
        .map((t) => (t.role === 'user' ? `Designer: ${t.text}` : `You previously answered: ${t.text}`))
        .join('\n');
      const out = await run<EvalResult>(settings, {
        route: 'eval',
        capture,
        platform: result.platform,
        source,
        notes:
          'The designer has answered questions about this screen. Treat what they say as fact ' +
          'and re-evaluate accordingly: drop findings their answers resolve, adjust severities ' +
          'their answers change, and remove any open question they have answered.\n\n' +
          notes,
        onProgress: setStage,
      });
      const before = result.findings.length;
      const base = { ...out.result, findings: await addCrops(out.result.findings, capture) };
      baseRef.current = base;
      setResult(base);
      setFoldedIn(turns.filter((t) => t.role === 'user').length);
      const delta = base.findings.length - before;
      setUpdateNote(
        `Findings updated: ${base.findings.length} now` +
          (delta ? ` (${delta > 0 ? '+' : ''}${delta})` : '') +
          `, ${base.open_questions.length} question${base.open_questions.length === 1 ? '' : 's'} left.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the findings.');
    } finally {
      setApplying(false);
      setStage('');
    }
  }, [settings, result, source, turns]);

  if (!settings) return <main className="center">Starting…</main>;

  if (showSettings) {
    return (
      <SettingsPanel
        runs={runs}
        onClearRuns={() => send({ type: 'clear-runs' })}
        settings={settings}
        onSave={(patch) => {
          setSettings({ ...settings, ...patch });
          send({ type: 'save-settings', settings: patch });
        }}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  const canRun = selection.supported && phase !== 'working';

  const allLenses: LensInfo[] = [
    ...lenses,
    ...settings.customLenses.map((l) => ({
      id: l.id,
      name: l.name,
      description: 'Your own lens, stored on this machine.',
      starter: false,
    })),
  ];
  // This app's persona and flows have not been written yet. The house principles still
  // apply, so say what is missing rather than implying the lens is tuned to this app.
  const pickedStarter = allLenses.find((l) => l.id === upfrontLens && l.starter);

  return (
    <main>
      <header className="top">
        <h1>Scout</h1>
        <button className="ghost small" onClick={() => setShowSettings(true)}>
          Settings
        </button>
      </header>

      <div className="controls">
        <div className="selection">
          {selection.count === 0 && <span className="muted">Select a frame on the canvas</span>}
          {selection.count > 0 && !selection.supported && <span className="muted">That selection cannot be exported</span>}
          {selection.supported && (
            <>
              <strong>{selection.name}</strong>
              {selection.flat && <span className="muted"> · flat image, positions will be estimated</span>}
              {selection.count > 1 && <span className="muted"> · first of {selection.count}</span>}
            </>
          )}
        </div>

        <div className="row">
          <label className="inline">
            Platform
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="">Detect</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="web">Web</option>
            </select>
          </label>
          <label className="inline">
            Source
            <select value={source} onChange={(e) => setSource(e.target.value as 'design' | 'production')}>
              <option value="design">Design file</option>
              <option value="production">Production</option>
            </select>
          </label>
          <label className="inline">
            Lens
            <select
              value={upfrontLens}
              onChange={(e) => {
                setUpfrontLens(e.target.value);
                setLensNotes('');
              }}
            >
              <option value="">General</option>
              {allLenses.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {pickedStarter && (
          <div className="notice starter">
            <div>
              Design principles are applied to <strong>{pickedStarter.name}</strong> already. Who
              uses it and what the flows are has not been written yet, so findings will be about
              how the screen is built rather than who it is for.
              <textarea
                rows={3}
                value={lensNotes}
                placeholder="Who uses this app, and what are the main flows? Or upload a file below."
                onChange={(e) => setLensNotes(e.target.value)}
              />
              <input
                type="file"
                accept=".md,.txt,text/markdown,text/plain"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setLensNotes(await file.text());
                }}
              />
              <p className="muted">
                Leave it empty and the run still happens on the principles alone. Anything you
                write is used for this run only; Settings can save it as a lens of its own.
              </p>
            </div>
          </div>
        )}

        {phase === 'working' ? (
          <div className="row">
            <button className="primary" disabled>
              {stage || 'Working'}… {elapsed}s
            </button>
            <button className="ghost" style={{ flex: 'none' }} onClick={() => abortRef.current?.abort()}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="primary" disabled={!canRun} onClick={() => start()}>
            Run evaluation
          </button>
        )}
        {phase === 'working' && elapsed > 45 && (
          <p className="muted" style={{ marginTop: 6 }}>
            A screen with a deep layer tree takes longer. Two to three minutes is normal.
          </p>
        )}
      </div>

      {phase === 'needs-platform' && (
        <div className="notice">
          Not sure what platform this is. Pick one above, then run again.
          <button className="ghost small" onClick={() => start(platform || 'android')}>
            Use {platform || 'Android'}
          </button>
        </div>
      )}

      {error && <div className="notice error">{error}</div>}

      {result && (
        <>
          <LensChips
            available={allLenses}
            applied={result.lenses_applied}
            busy={lensBusy}
            status={lensStage}
            onApply={applyLens}
            onRemove={removeLens}
          />
          <Actions
            result={result}
            status={boardNote || annotated}
            onRedraw={() =>
              send({
                type: 'annotate',
                replace: true,
                scale: captureRef.current?.scale ?? 2,
                findings: result.findings.map((f) => ({
                  id: f.id,
                  severity: f.severity,
                  headline: f.headline,
                  node_id: f.node_id,
                  bbox: f.bbox,
                })),
              })
            }
            onBoard={async () => {
              setBoardNote('Building the board…');
              const findings = await Promise.all(
                result.findings.map(async (f) => {
                  const size = f.crop ? await cropSize(f.crop) : null;
                  return {
                    id: f.id,
                    layer: f.layer,
                    lens: f.lens,
                    ref: f.ref,
                    ref_meaning: f.ref_meaning,
                    headline: f.headline,
                    severity: f.severity,
                    element: f.element,
                    observation: f.observation,
                    why_it_matters: f.why_it_matters,
                    recommendation: f.recommendation,
                    effort: f.effort,
                    also_touches: f.also_touches,
                    tags: f.tags,
                    estimated: f.estimated,
                    cropBytes: f.crop ? dataUriToBytes(f.crop) : undefined,
                    cropW: size?.w,
                    cropH: size?.h,
                  };
                }),
              );
              send({
                type: 'board',
                data: {
                  screen_name: result.screen_name,
                  screen_type: result.screen_type,
                  platform: result.platform,
                  source,
                  lenses_applied: result.lenses_applied,
                  assumptions: result.assumptions,
                  whats_working: result.whats_working,
                  findings,
                  prioritised: result.prioritised,
                  open_questions: result.open_questions,
                },
              });
            }}
          />
          <Report result={result} />
          <Chat
            turns={turns}
            busy={asking}
            applying={applying}
            pending={turns.filter((t) => t.role === 'user').length > foldedIn}
            updateNote={updateNote}
            openQuestions={result.open_questions.length}
            onAsk={ask}
            onApply={applyAnswers}
          />
        </>
      )}
    </main>
  );
}
