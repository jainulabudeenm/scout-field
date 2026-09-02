import { useState } from 'react';
import type { CustomLens, Settings as S } from '../../shared/messages';
import { statsReport, totalsOf, type RunRecord } from '../../shared/stats';

export default function Settings({
  settings,
  runs,
  onSave,
  onClearRuns,
  onClose,
}: {
  settings: S;
  runs: RunRecord[];
  onSave: (patch: Partial<S>) => void;
  onClearRuns: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState('');
  const [lensName, setLensName] = useState('');
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
        <label>
          Lens name
          <input
            value={lensName}
            placeholder="Name it, or pick a starting point below"
            onChange={(e) => setLensName(e.target.value)}
          />
        </label>
        <div className="lens-presets">
          {['Driver app', 'Customer app', 'Owner app', 'Design system'].map((name) => (
            <button
              key={name}
              className="lens-chip"
              data-on={lensName === name}
              onClick={() => setLensName(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label>
          Principles, as markdown
          <textarea
            rows={5}
            value={lensText}
            placeholder="Paste your design principles, or upload a file below"
            onChange={(e) => setLensText(e.target.value)}
          />
        </label>
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
