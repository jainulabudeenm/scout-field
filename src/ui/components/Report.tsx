import { LAYER_LABEL } from '../../shared/severity';
import type { EvalResult, Finding as F } from '../api';
import Finding from './Finding';

const ORDER: F['layer'][] = ['nielsen', 'wcag', 'platform', 'lens'];

export default function Report({ result }: { result: EvalResult }) {
  const numbering = new Map(result.findings.map((f, i) => [f.id, i + 1]));

  return (
    <div className="report">
      <div className="meta">
        <strong>{result.screen_name}</strong>
        <span>
          {result.screen_type} · {result.platform}
          {result.lenses_applied.length > 0 && ` · ${result.lenses_applied.join(', ')}`}
        </span>
      </div>

      {result.prioritised.length > 0 && (
        <section>
          <h3>Fix these first</h3>
          <ol className="plain">
            {result.prioritised.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </section>
      )}

      {result.open_questions.length > 0 && (
        <section>
          <h3>Open questions</h3>
          <ol className="plain">
            {result.open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </section>
      )}

      {result.assumptions.length > 0 && (
        <section>
          <h3>Assumptions</h3>
          <ul className="plain">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {ORDER.map((layer) => {
        const group = result.findings
          .filter((f) => f.layer === layer)
          .sort((a, b) => b.severity - a.severity);
        if (group.length === 0) return null;
        return (
          <section key={layer}>
            <h3>
              {layer === 'lens' && group[0].lens ? group[0].lens : LAYER_LABEL[layer]}
              <span className="count">{group.length}</span>
            </h3>
            {group.map((f) => (
              <Finding key={f.id} finding={f} index={numbering.get(f.id) ?? 0} />
            ))}
          </section>
        );
      })}

      {result.whats_working.length > 0 && (
        <section>
          <h3>What's working</h3>
          <ul className="plain">
            {result.whats_working.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
