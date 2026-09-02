export interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ProviderRequest {
  /** System prompt in cache-ordered blocks, most stable first. */
  systemBlocks: { text: string; cache: boolean }[];
  imageBase64: string;
  userText: string;
  /** JSON Schema derived from the zod schema. The caller validates the result. */
  schema: Record<string, unknown>;
  /** Gemini needs its own dialect of the same schema. */
  geminiSchema: unknown;
  /** Prior turns, for follow-up questions. Empty on a first request. */
  history?: Turn[];
  /** Follow-ups answer in prose, so no schema is imposed. */
  freeform?: boolean;
  /** "low" for detect, "high" for a full eval. */
  effort: 'low' | 'high';
  onProgress?: (stage: string) => void;
}

export interface ProviderResponse {
  /** Raw parsed JSON. The caller validates it. */
  data: unknown;
  usage: { input: number; output: number; cacheRead: number };
}

/**
 * Several keys may be supplied. A provider should move to the next one when a key
 * is out of quota, and only fail when every key is spent.
 */
export type Provider = (req: ProviderRequest, apiKeys: string[]) => Promise<ProviderResponse>;
