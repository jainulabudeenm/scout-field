import { useState } from 'react';
import type { CustomLens, Settings as S } from '../../shared/messages';
import { fetchLensText, type LensInfo } from '../api';
import { statsReport, totalsOf, type RunRecord } from '../../shared/stats';

// The shape a lens needs to be useful. Everything the evaluation can act on:
// who the users are, what they are trying to do, the rules, and what makes a
// problem worse here. Offered as placeholder text so nobody faces a blank box.
const SCAFFOLD = `# <Your product> App

## Who this lens is for
One paragraph. Who uses this, on what device, in what situation. Concrete, not aspirational.

## Personas
- **<Name the group>** — what they know, what they are short of (time, signal, literacy, patience),
  and what failure costs them.
- **<Second group>** — same, and say how they differ from the first.

## Flows
The paths that matter. Name each one and what "done" means.
1. <Flow name> — starts at <...>, ends when <...>
2. <Flow name> — starts at <...>, ends when <...>

## Principles
### P1 <Short name>
**Plain meaning:** one sentence a non-designer understands.
**Watch for:** what a violation actually looks like on screen.

### P2 <Short name>
**Plain meaning:**
**Watch for:**

## Severity amplifiers
What makes an ordinary problem worse in your product. Each needs a reason, because the reason is
shown to whoever reads the report.

| Condition | Raise by | Ceiling | Reason |
|---|---|---|---|
| <e.g. the screen affects the user's income> | +2 | 4 | <one sentence> |
| <e.g. the action cannot be undone> | +1 | 4 | <one sentence> |

## Out of scope
What this lens must not flag. Usually: business decisions, planned-but-unbuilt features, and
anything contrast, touch targets and labels already cover.
`;

export default function Settings({
  settings,
  starters,
  runs,
  onSave,
  onClearRuns,
  onClose,
}: {
  settings: S;
  starters: LensInfo[];
  runs: RunRecord[];
  onSave: (patch: Partial<S>) => void;
  onClearRuns: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState('');
  const [lensName, setLensName] = useState('');
  const [loading, setLoading] = useState('');
  const [loadError, setLoadError] = useState('');
  const [lensText, setLensText] = useState('');
  const totals = totalsOf(runs);
  const [draft, setDraft] = useState(settings);
  const [advanced, setAdvanced] = useState(false);
  const set = (patch: Partial<S>) => setDraft({ ...draft, ...patch });

  return (
    <div className="panel">
      <header className="panel-head">
        <h2>Settings</h2>
        <button className="ghost" onClick={onClose}>
          Done
        </button>
      </header>

      <label>
        Your API key
        <input
          type="password"
          value={draft.ownKey}
          placeholder="paste a Gemini or Claude key"
          onChange={(e) => set({ ownKey: e.target.value })}
        />
        <small>
          Scout runs on your own key, so nobody else pays for your evaluations. A free Gemini key
          takes a minute at aistudio.google.com. It is stored on this computer and sent only to
          the model you pick.
        </small>
      </label>

      <label>
        Model
        <select value={draft.provider} onChange={(e) => set({ provider: e.target.value })}>
          <option value="">Gemini (free)</option>
          <option value="anthropic">Claude (best quality)</option>
        </select>
      </label>

      <button className="ghost small" onClick={() => setAdvanced(!advanced)}>
        {advanced ? 'Hide' : 'Show'} advanced
      </button>

      {advanced && (
        <>
          <label>
            Server address
            <input value={draft.workerUrl} onChange={(e) => set({ workerUrl: e.target.value })} />
            <small>Point this at your own deployment to keep screens off the shared one.</small>
          </label>
          <label>
            Access code
            <input
              type="password"
              value={draft.accessCode}
              placeholder="only if your team runs its own server"
              onChange={(e) => set({ accessCode: e.target.value })}
            />
            <small>Leave empty when you are using your own key.</small>
          </label>
        </>
      )}

      <button className="primary" onClick={() => onSave(draft)}>
        Save
      </button>

      <section className="usage">
        <h3>Your own lenses</h3>
        <small>
          A lens adds a fourth layer for your product's own principles. It is stored on this machine
          and sent with each run, so nothing confidential enters the codebase.
        </small>
        {draft.customLenses.length > 0 && (
          <ul className="lens-list">
            {draft.customLenses.map((l) => (
              <li key={l.id}>
                <span>{l.name}</span>
                <button
                  className="ghost small"
                  onClick={() => set({ customLenses: draft.customLenses.filter((x) => x.id !== l.id) })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {starters.length > 0 && (
          <>
            <small className="muted">
              Start from one of these. It loads the whole lens so you can edit it: personas, flows,
              principles, and what makes a problem worse in your product. Or write your own below.
            </small>
            <div className="lens-presets">
              {starters.map((s) => (
                <button
                  key={s.id}
                  className="lens-chip"
                  disabled={loading === s.id}
                  onClick={async () => {
                    setLoading(s.id);
                    const got = await fetchLensText(draft, s.id);
                    setLoading('');
                    if (!got) return setLoadError('Could not load that one. Check the server address.');
                    setLoadError('');
                    setLensName(`${got.name} (ours)`);
                    setLensText(got.text);
                  }}
                >
                  {loading === s.id ? 'Loading' : s.name}
                </button>
              ))}
            </div>
            {loadError && <small className="muted">{loadError}</small>}
          </>
        )}
        <label>
          Lens name
          <input
            value={lensName}
            placeholder="Name it after your product"
            onChange={(e) => setLensName(e.target.value)}
          />
        </label>
        <label>
          The lens, as markdown
          <textarea
            rows={12}
            value={lensText}
            placeholder={SCAFFOLD}
            onChange={(e) => setLensText(e.target.value)}
          />
          <small>
            Personas, flows, principles and severity rules. Pick a starting point above to load a
            full one, or paste the placeholder structure and fill it in.
          </small>
        </label>
        <button
          className="ghost small"
          disabled={Boolean(lensText.trim())}
          onClick={() => setLensText(SCAFFOLD)}
        >
          Use the blank structure
        </button>
        <div className="row">
          <input
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLensText(await file.text());
              if (!lensName) setLensName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
            }}
          />
          <button
            className="ghost small"
            disabled={!lensName.trim() || !lensText.trim()}
            onClick={() => {
              const lens: CustomLens = {
                id: `custom-${lensName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: lensName.trim(),
                text: lensText,
              };
              set({ customLenses: [...draft.customLenses.filter((x) => x.id !== lens.id), lens] });
              setLensName('');
              setLensText('');
            }}
          >
            Add lens
          </button>
        </div>
      </section>

      {totals.runs > 0 && (
        <section className="usage">
          <h3>Usage on this machine</h3>
          <dl className="usage-grid">
            <dt>Screens evaluated</dt>
            <dd>{totals.runs}</dd>
            <dt>Findings surfaced</dt>
            <dd>
              {totals.findings} <span className="muted">({totals.sev34} at Sev 3 or 4)</span>
            </dd>
            <dt>Time in the tool</dt>
            <dd>{totals.minutes.toFixed(0)} min</dd>
            <dt>Spent so far</dt>
            <dd>${totals.spent.toFixed(2)}</dd>
            <dt>Same runs on Claude</dt>
            <dd>
              ${totals.onClaude.toFixed(2)}{' '}
              <span className="muted">(${(totals.onClaude / totals.runs).toFixed(2)} per screen)</span>
            </dd>
          </dl>
          <div className="row">
            <button
              className="ghost small"
              onClick={() => {
                void navigator.clipboard.writeText(statsReport(runs));
                setCopied('Copied');
                setTimeout(() => setCopied(''), 1500);
              }}
            >
              {copied || 'Copy stats'}
            </button>
            <button className="ghost small" onClick={onClearRuns}>
              Reset
            </button>
          </div>
          <small>Stored on this machine only. Nothing is sent anywhere.</small>
        </section>
      )}
    </div>
  );
}
