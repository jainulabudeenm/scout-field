import Anthropic from '@anthropic-ai/sdk';
import type { Provider } from './types';

const MODEL = 'claude-opus-5';

export const anthropicProvider: Provider = async (req, apiKeys) => {
  const apiKey = apiKeys.filter(Boolean)[0];
  if (!apiKey) throw Object.assign(new Error('No Anthropic key configured.'), { status: 500 });
  const client = new Anthropic({ apiKey });

  const system: Anthropic.TextBlockParam[] = req.systemBlocks.map((b) => ({
    type: 'text',
    text: b.text,
    ...(b.cache ? { cache_control: { type: 'ephemeral' as const } } : {}),
  }));

  req.onProgress?.('Reading the screen');

  // Streaming keeps the connection alive through a 30-90s eval.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: req.effort === 'low' ? 4000 : 32000,
    thinking: { type: 'adaptive' },
    output_config: req.freeform
      ? { effort: req.effort }
      : { effort: req.effort, format: { type: 'json_schema', schema: req.schema } },
    system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: req.imageBase64 } },
          { type: 'text', text: req.userText },
        ],
      },
      ...(req.history ?? []).map((t) => ({ role: t.role, content: t.text })),
    ],
  });

  let announced = false;
  stream.on('text', () => {
    if (!announced) {
      announced = true;
      req.onProgress?.('Writing findings');
    }
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return {
    data: req.freeform ? { text } : JSON.parse(text),
    usage: {
      input: message.usage.input_tokens,
      output: message.usage.output_tokens,
      cacheRead: message.usage.cache_read_input_tokens ?? 0,
    },
  };
};
