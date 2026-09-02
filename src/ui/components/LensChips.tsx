import type { LensInfo } from '../api';

export default function LensChips({
  available,
  applied,
  busy,
  status,
  onApply,
  onRemove,
}: {
  available: LensInfo[];
  applied: string[];
  busy: string;
  status: string;
  onApply: (lens: LensInfo) => void;
  onRemove: (id: string) => void;
}) {
  if (available.length === 0 && applied.length === 0) return null;

  return (
    <div className="lenses">
      <span className="lenses-label">Extend with</span>
      <div className="lens-row">
        {available.map((lens) => {
          const on = applied.includes(lens.id);
          return (
            <button
              key={lens.id}
              className="lens-chip"
              data-on={on}
              disabled={Boolean(busy)}
              title={lens.description}
              onClick={() => (on ? onRemove(lens.id) : onApply(lens))}
            >
              {busy === lens.id && <span className="spinner" aria-hidden="true" />}
              {lens.name}
              {on && busy !== lens.id && <span className="lens-x">×</span>}
            </button>
          );
        })}
      </div>
      {busy && <p className="lens-status">{status || 'Applying the lens…'}</p>}
    </div>
  );
}
