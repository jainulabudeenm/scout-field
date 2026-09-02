import { useState } from 'react';
import type { EvalResult } from '../api';
import { copyRichText, download, toPlain } from '../export';

export default function Actions({
  result,
  onRedraw,
  onBoard,
  status,
}: {
  result: EvalResult;
  onRedraw: () => void;
  onBoard: () => void;
  status: string;
}) {
  const [note, setNote] = useState('');
  const say = (text: string) => {
    setNote(text);
    setTimeout(() => setNote(''), 2500);
  };
  const slug = (result.screen_name || 'screen').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  return (
    <div className="actions">
      <div className="actions-row">
        <button className="ghost small" onClick={onRedraw}>
          Redraw boxes
        </button>
        <button className="ghost small" onClick={onBoard}>
          Report board
        </button>
        <button className="ghost small" onClick={async () => say(await copyRichText(result))}>
          Copy
        </button>
        <button
          className="ghost small"
          onClick={async () => say(await download(`${slug}-eval.md`, toPlain(result), 'text/markdown'))}
        >
          Markdown
        </button>
        <button
          className="ghost small"
          onClick={async () =>
            say(
              await download(
                `${slug}-eval.json`,
                // Crops are large and rebuildable, so leave them out of the file.
                JSON.stringify({ ...result, findings: result.findings.map(({ crop, ...f }) => f) }, null, 2),
                'application/json',
              ),
            )
          }
        >
          JSON
        </button>
      </div>
      {(note || status) && <p className="actions-note">{note || status}</p>}
    </div>
  );
}
