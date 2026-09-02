import { useState } from 'react';
import { severityOf } from '../../shared/severity';
import type { Finding as F } from '../api';

export default function Finding({ finding, index }: { finding: F; index: number }) {
  const [open, setOpen] = useState(false);
  const sev = severityOf(finding.severity);

  return (
    <article className="finding" data-open={open}>
      <button className="finding-head" onClick={() => setOpen(!open)}>
        <span className="badge" style={{ background: sev.hex }}>
          {index}
        </span>
        <span className="finding-title">
          <strong>{finding.headline}</strong>
          <span className="finding-ref">
            {finding.ref}
            {finding.estimated && <em className="estimated"> estimated position</em>}
          </span>
        </span>
        <span className="sev-chip" style={{ color: sev.hex, borderColor: sev.hex }}>
          Sev {finding.severity}
        </span>
      </button>

      {/* ref_meaning is always visible: half the audience has never heard of Nielsen. */}
      <p className="meaning">{finding.ref_meaning}</p>

      {finding.crop && <img className="crop" src={finding.crop} alt={finding.element} />}

      {open && (
        <div className="finding-body">
          <dl>
            <dt>Element</dt>
            <dd>{finding.element}</dd>
            <dt>What was seen</dt>
            <dd>{finding.observation}</dd>
            <dt>Why it matters</dt>
            <dd>{finding.why_it_matters}</dd>
            <dt>Fix</dt>
            <dd>{finding.recommendation}</dd>
            <dt>Effort</dt>
            <dd>{finding.effort === 'S' ? 'Hours' : finding.effort === 'M' ? 'Days' : 'Weeks'}</dd>
          </dl>

          {finding.upgradeReason && (
            <p className="upgrade">
              Raised from Sev {finding.upgradedFrom} by the {finding.lens} lens: {finding.upgradeReason}
            </p>
          )}

          {finding.also_touches.length > 0 && (
            <div className="also">
              <strong>Also touches</strong>
              <ul>
                {finding.also_touches.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {finding.tags.length > 0 && (
            <div className="tags">
              {finding.tags.map((t, i) => (
                <span key={i} className="tag">
                  {t.key}: {t.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
