import type { Provider } from './types';

// Pinned, not an alias: an eval tool needs the same model on every run.
// gemini-2.5-flash was retired for new keys in 2026.
const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const RETRY_DELAYS_MS = [2000, 5000, 12000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const geminiProvider: Provider = async (req, apiKeys) => {
  const keys = apiKeys.filter(Boolean);
  if (keys.length === 0) throw Object.assign(new Error('No Gemini key configured.'), { status: 500 });

  req.onProgress?.('Reading the screen');

  // Free-tier keys have a daily cap. Roll to the next one rather than stopping.
  for (let k = 0; k < keys.length; k++) {
    const apiKey = keys[k];
    const isLastKey = k === keys.length - 1;
    try {
      return await callGemini(req, apiKey);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 429 && !isLastKey) {
        req.onProgress?.(`Key ${k + 1} is out of quota, trying key ${k + 2}`);
        continue;
      }
      if (status === 429) {
        throw Object.assign(
          new Error(
            keys.length > 1
              ? `All ${keys.length} Gemini keys have hit their daily limit. Try tomorrow, or switch provider in Settings.`
              : 'Gemini free tier limit reached. Add another key in Settings, or switch provider.',
          ),
          { status: 429 },
        );
      }
      throw err;
    }
  }
  throw new Error('No Gemini key could be used.');
};

async function callGemini(req: Parameters<Provider>[0], apiKey: string): Promise<{ data: unknown; usage: { input: number; output: number; cacheRead: number } }> {

  // The free tier gets deprioritised under load and answers 503. That is transient,
  // unlike 429, which means the daily quota is actually gone.
  let res: Response | undefined;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.systemBlocks.map((b) => b.text).join('\n\n') }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'image/png', data: req.imageBase64 } },
              { text: req.userText },
            ],
          },
          ...(req.history ?? []).map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
        ],
        generationConfig: {
          ...(req.freeform
            ? {}
            : { responseMimeType: 'application/json', responseSchema: req.geminiSchema }),
          maxOutputTokens: req.effort === 'low' ? 4000 : 32000,
          // Gemini 3.x replaced thinkingBudget with thinkingLevel. Sending the old key is a 400.
          thinkingConfig: { thinkingLevel: req.effort === 'low' ? 'low' : 'high' },
        },
      }),
    });

    if (res.status !== 503 || attempt >= RETRY_DELAYS_MS.length) break;
    req.onProgress?.(`Model is busy, retrying in ${RETRY_DELAYS_MS[attempt] / 1000}s`);
    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw Object.assign(new Error('Key out of quota.'), { status: 429 });
    if (res.status === 503) {
      throw Object.assign(
        new Error('Gemini is busy right now and did not recover after three retries. Try again in a minute.'),
        { status: 503 },
      );
    }
    throw Object.assign(new Error(`Gemini ${res.status}: ${body.slice(0, 400)}`), { status: res.status });
  }

  req.onProgress?.('Writing findings');
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; cachedContentTokenCount?: number };
  };

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('Gemini returned no content. The response may have been blocked.');

  return {
    data: req.freeform ? { text } : JSON.parse(text),
    usage: {
      input: json.usageMetadata?.promptTokenCount ?? 0,
      output: json.usageMetadata?.candidatesTokenCount ?? 0,
      cacheRead: json.usageMetadata?.cachedContentTokenCount ?? 0,
    },
  };
}
