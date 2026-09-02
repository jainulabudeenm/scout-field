import { useEffect, useRef, useState } from 'react';
import Markdown from '../markdown';

export interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

export default function Chat({
  turns,
  busy,
  applying,
  /** True only while there are answers Scout has not folded in yet. */
  pending,
  /** Result of the last update, shown once and then cleared by the next question. */
  updateNote,
  openQuestions,
  onAsk,
  onApply,
}: {
  turns: Turn[];
  busy: boolean;
  applying: boolean;
  pending: boolean;
  updateNote: string;
  openQuestions: number;
  onAsk: (question: string) => void;
  onApply: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(true);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: 'nearest' });
  }, [turns.length, busy, open]);

  const submit = () => {
    const q = draft.trim();
    if (!q || busy) return;
    setDraft('');
    onAsk(q);
  };

  return (
    <section className="chat">
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        <span>Ask about this evaluation</span>
        <span className="chat-caret">{open ? 'Hide' : `Show${turns.length ? ` (${turns.length})` : ''}`}</span>
      </button>

      {/* One slot, three states: nothing to do, something to fold in, or just done. */}
      {applying && (
        <div className="apply-banner" data-tone="busy">
          <span>Rewriting the findings with what you said…</span>
        </div>
      )}

      {!applying && pending && (
        <div className="apply-banner">
          <div>
            <strong>You have told Scout something new.</strong>
            <span>Fold it into the findings and drop what it resolves.</span>
          </div>
          <button className="primary" disabled={busy} onClick={onApply}>
            Update findings
          </button>
        </div>
      )}

      {!applying && !pending && updateNote && (
        <div className="apply-banner" data-tone="done">
          <span>{updateNote}</span>
        </div>
      )}

      {open && (
        <>
          {turns.length === 0 && (
            <p className="muted chat-hint">
              {openQuestions > 0
                ? `${openQuestions} open question${openQuestions === 1 ? '' : 's'} above. Answer one here, then update the findings.`
                : 'Ask why something is rated the way it is, or tell Scout something it could not see.'}
            </p>
          )}

          <div className="chat-log">
            {turns.map((t, i) =>
              t.role === 'user' ? (
                <p key={i} className="turn-you">
                  {t.text}
                </p>
              ) : (
                <div key={i} className="turn-scout">
                  <Markdown text={t.text} />
                </div>
              ),
            )}
            {busy && <p className="muted">Thinking…</p>}
            <div ref={end} />
          </div>

          <div className="row">
            <input
              value={draft}
              placeholder="Ask, or answer an open question"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <button className="ghost" style={{ flex: 'none' }} disabled={busy || !draft.trim()} onClick={submit}>
              Ask
            </button>
          </div>
        </>
      )}
    </section>
  );
}
