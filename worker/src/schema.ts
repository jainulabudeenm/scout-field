import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Shapes chosen for provider parity. Anthropic structured outputs and Gemini
// responseSchema disagree on nullable and free-form maps, so:
//   "" means "none" for lens and node_id
//   tags is an array of pairs, not a record
//   bbox is optional rather than nullable

export const Finding = z.object({
  id: z.string().describe('Stable within this response: F1, F2, F3.'),
  layer: z.enum(['nielsen', 'wcag', 'platform', 'lens']),
  lens: z.string().describe('Lens name when layer is "lens", otherwise an empty string.'),
  ref: z.string().describe('Exact criterion, e.g. "H4 Consistency and standards".'),
  ref_meaning: z.string().describe('REQUIRED. One line of plain language defining ref, written for this screen.'),
  headline: z.string(),
  severity: z.number().int().min(0).max(4),
  element: z.string(),
  node_id: z.string().describe('Layer id from the node index. Empty string when there is no layer data or no match.'),
  bbox: z
    .object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })
    .optional()
    .describe('Image-pixel rectangle. Only when there is no node index.'),
  observation: z.string(),
  why_it_matters: z.string(),
  recommendation: z.string(),
  effort: z.enum(['S', 'M', 'L']),
  also_touches: z.array(z.string()),
  tags: z.array(z.object({ key: z.string(), value: z.string() })),
});
export type Finding = z.infer<typeof Finding>;

export const EvalResult = z.object({
  screen_name: z.string(),
  screen_type: z.string(),
  platform: z.string(),
  lenses_applied: z.array(z.string()),
  assumptions: z.array(z.string()),
  whats_working: z.array(z.string()),
  findings: z.array(Finding),
  prioritised: z.array(z.string()),
  open_questions: z.array(z.string()),
  report_markdown: z.string(),
});
export type EvalResult = z.infer<typeof EvalResult>;

export const LensResult = z.object({
  lens: z.string(),
  new_findings: z.array(Finding),
  severity_upgrades: z.array(
    z.object({
      finding_id: z.string(),
      new_severity: z.number().int().min(0).max(4),
      reason: z.string().describe('Shown to the reader. Write it for them.'),
    }),
  ),
  lens_summary: z.string(),
});
export type LensResult = z.infer<typeof LensResult>;

export const DetectResult = z.object({
  platform: z.enum(['android', 'ios', 'web']),
  screen_type: z.string(),
  screen_name: z.string(),
  confidence: z.enum(['high', 'low']),
});
export type DetectResult = z.infer<typeof DetectResult>;

// Gemini's responseSchema is an OpenAPI 3.0 subset and rejects unknown keys.
function forGemini(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(forGemini);
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === '$schema' || k === 'additionalProperties' || k === 'default') continue;
      out[k] = forGemini(v);
    }
    return out;
  }
  return node;
}

export const jsonSchema = (s: z.ZodType) =>
  zodToJsonSchema(s, { target: 'openApi3' }) as Record<string, unknown>;
export const geminiSchema = (s: z.ZodType) => forGemini(jsonSchema(s));
