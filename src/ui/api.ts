import type { Capture } from '../shared/messages';

export interface Finding {
  id: string;
  layer: 'nielsen' | 'wcag' | 'platform' | 'lens';
  lens: string;
  ref: string;
  ref_meaning: string;
  headline: string;
  severity: number;
  element: string;
  node_id: string;
  bbox?: { x: number; y: number; w: number; h: number };
  observation: string;
  why_it_matters: string;
  recommendation: string;
  effort: 'S' | 'M' | 'L';
  also_touches: string[];
  tags: { key: string; value: string }[];
  /** Added client-side. */
  crop?: string;
  estimated?: boolean;
  upgradedFrom?: number;
  upgradeReason?: string;
}

export interface EvalResult {
  screen_name: string;
  screen_type: string;
  platform: string;
  lenses_applied: string[];
  assumptions: string[];
  whats_working: string[];
  findings: Finding[];
  prioritised: string[];
  open_questions: string[];
  report_markdown: string;
}

export interface LensResult {
  lens: string;
  new_findings: Finding[];
  severity_upgrades: { finding_id: string; new_severity: number; reason: string }[];
  lens_summary: string;
}

export interface DetectResult {
  platform: 'android' | 'ios' | 'web';
  screen_type: string;
  screen_name: string;
  confidence: 'high' | 'low';
}

export interface LensInfo {
  id: string;
  name: string;
  description: string;
  /** Ships with Scout and describes a category, not a real product. */
  starter?: boolean;
}

export async function fetchLenses(conn: Conn): Promise<LensInfo[]> {
  try {
    const res = await fetch(`${conn.workerUrl.replace(/\/$/, '')}/lenses`);
    if (!res.ok) return [];
    return ((await res.json()) as { lenses: LensInfo[] }).lenses ?? [];
  } catch {
    return [];
  }
}

/** A starter's full markdown, so Settings can prefill it for editing. */
export async function fetchLensText(
  conn: { workerUrl: string },
  id: string,
): Promise<{ name: string; text: string } | null> {
  try {
    const res = await fetch(`${conn.workerUrl.replace(/\/$/, '')}/lenses/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as { name: string; text: string };
  } catch {
    return null;
  }
}

export interface Usage {
  input: number;
  output: number;
  cacheRead: number;
}

export interface Conn {
  workerUrl: string;
  accessCode: string;
  ownKey: string;
  provider: string;
}

export interface RunOptions {
  route: 'detect' | 'eval' | 'extend' | 'ask';
  capture: Capture;
  platform?: string;
  source?: 'design' | 'production';
  notes?: string;
  lens?: string;
  lensText?: string;
  lensNotes?: string;
  previous?: unknown;
  question?: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
  onProgress?: (stage: string) => void;
  signal?: AbortSignal;
}

export class ScoutError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}

/** POST to the worker and read its SSE stream to the single result event. */
export async function run<T>(conn: Conn, opts: RunOptions): Promise<{ result: T; usage: Usage; provider: string }> {
  if (!conn.workerUrl) throw new ScoutError('No server address set. Open Settings.', 400);
  if (!conn.accessCode && !conn.ownKey) throw new ScoutError('No API key set. Open Settings and paste one.', 401);

  const c = opts.capture;
  let res: Response;
  try {
    res = await fetch(`${conn.workerUrl.replace(/\/$/, '')}/${opts.route}`, {
      method: 'POST',
      signal: opts.signal,
      headers: {
        'content-type': 'application/json',
        ...(conn.accessCode ? { 'x-scout-code': conn.accessCode } : {}),
        ...(conn.ownKey ? { 'x-scout-key': conn.ownKey } : {}),
        ...(conn.provider ? { 'x-scout-provider': conn.provider } : {}),
      },
      body: JSON.stringify({
        image: c.pngBase64,
        width: c.width,
        height: c.height,
        scale: c.scale,
        nodes: c.nodes,
        screenName: c.screenName,
        platform: opts.platform,
        source: opts.source ?? 'design',
        notes: opts.notes,
        lens: opts.lens,
        lensText: opts.lensText,
        lensNotes: opts.lensNotes,
        previous: opts.previous,
        question: opts.question,
        history: opts.history ?? [],
      }),
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new ScoutError('Cancelled.', 499);
    throw new ScoutError(
      `Cannot reach Scout's server at ${conn.workerUrl}. Is it running?`,
      503,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `Server returned ${res.status}.`;
    try {
      message = (JSON.parse(body) as { error?: string }).error ?? message;
    } catch {
      /* keep the generic message */
    }
    throw new ScoutError(message, res.status);
  }
  if (!res.body) throw new ScoutError('Server sent an empty response.');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let out: { result: T; usage: Usage; provider: string } | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const event = /^event: (.+)$/m.exec(frame)?.[1];
      const raw = /^data: (.+)$/m.exec(frame)?.[1];
      if (!event || !raw) continue;
      const data = JSON.parse(raw);
      if (event === 'progress') {
        // A heartbeat repeats the current stage. Show elapsed time instead of
        // printing the same line again.
        opts.onProgress?.(data.heartbeat && data.elapsed ? `${data.stage} (${data.elapsed}s)` : data.stage);
      }
      if (event === 'error') throw new ScoutError(data.message, data.status);
      if (event === 'result') out = data;
    }
  }

  if (!out) throw new ScoutError('Server closed the connection before finishing.');
  return out;
}
