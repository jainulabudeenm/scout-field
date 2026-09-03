import { z } from 'zod';
import { buildSystem, BUILTIN_LENSES, DETECT_SYSTEM, LENS_CATALOGUE, type Platform } from './library';
import { DetectResult, EvalResult, LensResult, geminiSchema, jsonSchema } from './schema';
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import type { Provider } from './providers/types';

export interface Env {
  PROVIDER?: string;
  SCOUT_ACCESS_CODE: string;
  GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}

const CORS = {
  // The Figma plugin iframe sends Origin: null, so a wildcard is the only thing that works.
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, x-scout-code, x-scout-key, x-scout-provider',
  'access-control-max-age': '86400',
};

const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  text: z.string().optional(),
});

const Body = z.object({
  image: z.string(),
  width: z.number(),
  height: z.number(),
  scale: z.number().default(2),
  platform: z.enum(['android', 'ios', 'web']).optional(),
  nodes: z.array(NodeSchema).default([]),
  screenName: z.string().optional(),
  source: z.enum(['design', 'production']).default('design'),
  notes: z.string().optional(),
  // /eval and /extend: a lens can be chosen before a run or added after one
  lens: z.string().optional(),
  lensText: z.string().optional(),
  lensNotes: z.string().optional(),
  previous: z.unknown().optional(),
  // /ask only
  question: z.string().optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string() })).default([]),
});

/** Keys may be a comma or whitespace separated list, so a free tier can be pooled. */
function splitKeys(value: string | undefined): string[] {
  return (value ?? '')
    .split(/[,\s]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

function pickProvider(env: Env, req: Request): { provider: Provider; name: string; keys: string[] } {
  const override = req.headers.get('x-scout-provider');
  const ownKeys = splitKeys(req.headers.get('x-scout-key') ?? undefined);
  const name = override || env.PROVIDER || 'gemini';

  if (name === 'anthropic') {
    const keys = ownKeys.length ? ownKeys : splitKeys(env.ANTHROPIC_API_KEY);
    if (!keys.length) throw httpError(500, 'This deployment has no Anthropic key configured.');
    return { provider: anthropicProvider, name, keys };
  }
  const keys = ownKeys.length ? ownKeys : splitKeys(env.GEMINI_API_KEY);
  if (!keys.length) throw httpError(500, 'This deployment has no Gemini key configured.');
  return { provider: geminiProvider, name: 'gemini', keys };
}

/**
 * The lens pack for a request: a custom upload, or a built-in by id. Notes typed
 * against a starter lens are appended, so a generic pack can describe a real product
 * without anyone editing the repo.
 */
function lensFor(body: z.infer<typeof Body>): string | undefined {
  const base = body.lensText || (body.lens ? BUILTIN_LENSES[body.lens] : undefined);
  if (!base) return undefined;
  const notes = body.lensNotes?.trim();
  return notes ? `${base}\n\n## Added for this product\n\n${notes}` : base;
}

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function nodeIndexText(body: z.infer<typeof Body>): string {
  if (body.nodes.length === 0) {
    return `No layer data is available for this screen. It is a flat image, ${body.width} by ${body.height} pixels.
Locate every finding with "bbox" on a 0 to 1000 scale, origin top-left: 0 is the left or top
edge, 1000 is the right or bottom edge. Both axes run 0 to 1000 whatever the image's real
proportions are, so a button halfway down the screen has y near 500 no matter how tall the
image is. Do not answer in pixels. Leave "node_id" as an empty string.
Findings located this way must be marked "estimated position" in the report.`;
  }
  const rows = body.nodes
    .map((n) => `${n.id}\t${n.type}\t${n.name}\t${n.x},${n.y} ${n.w}x${n.h}${n.text ? `\t"${n.text}"` : ''}`)
    .join('\n');
  return `Layer data for this screen. Coordinates are in screen units relative to the screen's
top-left corner. The exported image is ${body.scale}x these units.

Set "node_id" on every finding to the id of the layer it is about. Leave "bbox" out.
Never invent an id. If a finding has no single element, leave "node_id" empty too.

id\ttype\tname\tx,y wxh\ttext
${rows}`;
}

function contextText(body: z.infer<typeof Body>): string {
  const bits = [
    `Screen name: ${body.screenName || 'unknown'}`,
    `Source: ${body.source === 'production' ? 'Production build. Rate everything at full severity.' : 'Design file (handoff or review state). Apply the design-file severity rule.'}`,
  ];
  if (body.notes) bits.push(`Context from the person requesting this: ${body.notes}`);
  return bits.join('\n');
}

function sse(handler: (send: (event: string, data: unknown) => void) => Promise<void>): Response {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const send = (event: string, data: unknown) => {
    void writer.write(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  // A 90s silence reads as a hang. Keep a visible pulse on the stream.
  const started = Date.now();
  let lastStage = 'Working';
  // Echo the stage with elapsed time so the client can tell a slow call from a
  // stuck one, without the log filling with the same line.
  const heartbeat = setInterval(() => {
    send('progress', {
      stage: lastStage,
      elapsed: Math.round((Date.now() - started) / 1000),
      heartbeat: true,
    });
  }, 5000);

  (async () => {
    try {
      await handler((event, data) => {
        if (event === 'progress' && data && typeof data === 'object' && 'stage' in data) {
          lastStage = String((data as { stage: unknown }).stage);
        }
        send(event, data);
      });
    } catch (err) {
      const e = err as Error & { status?: number };
      send('error', { message: e.message, status: e.status ?? 500 });
    } finally {
      clearInterval(heartbeat);
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { ...CORS, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ ok: true, provider: env.PROVIDER ?? 'gemini' }, { headers: CORS });
    }
    if (url.pathname === '/lenses') {
      return Response.json({ lenses: LENS_CATALOGUE }, { headers: CORS });
    }
    // A starter is a draft to edit, so the panel has to be able to read one back.
    if (url.pathname.indexOf('/lenses/') === 0) {
      const id = decodeURIComponent(url.pathname.slice('/lenses/'.length));
      const info = LENS_CATALOGUE.find((l) => l.id === id);
      const text = BUILTIN_LENSES[id];
      if (!info || !text) return Response.json({ error: 'No such lens.' }, { status: 404, headers: CORS });
      return Response.json({ id, name: info.name, text }, { headers: CORS });
    }
    if (request.method !== 'POST') return new Response('Not found', { status: 404, headers: CORS });

    const ownKey = request.headers.get('x-scout-key');
    if (!ownKey && request.headers.get('x-scout-code') !== env.SCOUT_ACCESS_CODE) {
      return Response.json({ error: 'Wrong access code.' }, { status: 401, headers: CORS });
    }

    let body: z.infer<typeof Body>;
    try {
      body = Body.parse(await request.json());
    } catch {
      return Response.json({ error: 'Malformed request body.' }, { status: 400, headers: CORS });
    }

    let picked: ReturnType<typeof pickProvider>;
    try {
      picked = pickProvider(env, request);
    } catch (err) {
      const e = err as Error & { status?: number };
      return Response.json({ error: e.message }, { status: e.status ?? 500, headers: CORS });
    }
    const { provider, name: providerName, keys } = picked;

    if (url.pathname === '/detect') {
      return sse(async (send) => {
        const out = await provider(
          {
            systemBlocks: DETECT_SYSTEM,
            imageBase64: body.image,
            userText: `Identify this screen. It is ${body.width} by ${body.height} pixels.`,
            schema: jsonSchema(DetectResult),
            geminiSchema: geminiSchema(DetectResult),
            effort: 'low',
            onProgress: (stage) => send('progress', { stage }),
          },
          keys,
        );
        send('result', { result: DetectResult.parse(out.data), usage: out.usage, provider: providerName });
      });
    }

    if (url.pathname === '/eval') {
      const platform = (body.platform ?? 'android') as Platform;
      // A lens can be picked before the run as well as added after it. Choosing it here
      // costs one call instead of two, at the price of losing the upgrade trail: a lens
      // added later says which findings it made worse and why, and this cannot.
      const lensText = lensFor(body);
      return sse(async (send) => {
        send('progress', {
          stage: lensText ? 'Loading the evaluation library and lens' : 'Loading the evaluation library',
        });
        const out = await provider(
          {
            systemBlocks: buildSystem({ platform, lensText }),
            imageBase64: body.image,
            userText: [
              contextText(body),
              `Platform: ${platform}`,
              '',
              nodeIndexText(body),
              '',
              'Run every universal layer.',
              ...(lensText
                ? [
                    'Then apply the active lens on top, in the same pass. A lens finding uses',
                    'layer "lens" and names the lens. List the lens in lenses_applied. Where the',
                    'lens makes a universal problem worse, raise that finding\'s severity and say',
                    'in why_it_matters what the lens changed.',
                  ]
                : []),
              'Return the schema object, with report_markdown filled in.',
            ].join('\n'),
            schema: jsonSchema(EvalResult),
            geminiSchema: geminiSchema(EvalResult),
            effort: 'high',
            onProgress: (stage) => send('progress', { stage }),
          },
          keys,
        );
        send('result', { result: EvalResult.parse(out.data), usage: out.usage, provider: providerName });
      });
    }

    if (url.pathname === '/extend') {
      const platform = (body.platform ?? 'android') as Platform;
      const lensText = lensFor(body);
      if (!lensText) return Response.json({ error: 'Unknown lens.' }, { status: 400, headers: CORS });

      return sse(async (send) => {
        send('progress', { stage: `Applying the ${body.lens ?? 'custom'} lens` });
        const out = await provider(
          {
            systemBlocks: buildSystem({ platform, lensText }),
            imageBase64: body.image,
            userText: [
              contextText(body),
              `Platform: ${platform}`,
              '',
              nodeIndexText(body),
              '',
              'These findings already exist from the universal evaluation:',
              JSON.stringify(body.previous ?? {}, null, 1),
              '',
              'Apply the active lens on top. Return only the lens result:',
              '- new_findings: what the universal layers could not see. Never restate an existing finding.',
              '- severity_upgrades: existing findings whose consequence is worse under this lens, each with a reason written for the reader.',
              '- lens_summary: two or three sentences on what this lens changed.',
            ].join('\n'),
            schema: jsonSchema(LensResult),
            geminiSchema: geminiSchema(LensResult),
            effort: 'high',
            onProgress: (stage) => send('progress', { stage }),
          },
          keys,
        );
        send('result', { result: LensResult.parse(out.data), usage: out.usage, provider: providerName });
      });
    }

    if (url.pathname === '/ask') {
      const platform = (body.platform ?? 'android') as Platform;
      if (!body.question) return Response.json({ error: 'No question given.' }, { status: 400, headers: CORS });

      return sse(async (send) => {
        send('progress', { stage: 'Thinking' });
        const out = await provider(
          {
            // Same cached system prefix as the eval, so the answer stays on the rubric.
            systemBlocks: [
              ...buildSystem({ platform, lensText: body.lensText }),
              {
                text: `A follow-up question about an evaluation you already produced.
Answer in plain prose, not JSON. Be specific and cite the rubric or the criterion when it matters.
If the answer would change a severity, say so and say why. Keep it short. No em dashes.`,
                cache: false,
              },
            ],
            imageBase64: body.image,
            userText: [
              contextText(body),
              '',
              nodeIndexText(body),
              '',
              'The evaluation you produced:',
              JSON.stringify(body.previous ?? {}, null, 1),
              '',
              `Question: ${body.question}`,
            ].join('\n'),
            schema: jsonSchema(DetectResult),
            geminiSchema: geminiSchema(DetectResult),
            effort: 'high',
            freeform: true,
            history: body.history,
            onProgress: (stage) => send('progress', { stage }),
          },
          keys,
        );
        const text = (out.data as { text?: string }).text ?? '';
        send('result', { result: { text }, usage: out.usage, provider: providerName });
      });
    }

    return new Response('Not found', { status: 404, headers: CORS });
  },
};
