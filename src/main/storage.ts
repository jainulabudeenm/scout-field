import type { Settings } from '../shared/messages';
import type { RunRecord } from '../shared/stats';

const KEY = 'scout.settings';

const DEFAULTS: Settings = {
  accessCode: '',
  workerUrl: 'https://scout-field.jain-sathak.workers.dev',
  ownKey: '',
  provider: '',
  customLenses: [],
};

export async function loadSettings(): Promise<Settings> {
  const saved = (await figma.clientStorage.getAsync(KEY)) as Partial<Settings> | undefined;
  return { ...DEFAULTS, ...(saved ?? {}) };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  await figma.clientStorage.setAsync(KEY, next);
  return next;
}

const STATS_KEY = 'scout.runs';
const MAX_RUNS = 500;

export async function loadRuns(): Promise<RunRecord[]> {
  return ((await figma.clientStorage.getAsync(STATS_KEY)) as RunRecord[] | undefined) ?? [];
}

export async function recordRun(run: RunRecord): Promise<RunRecord[]> {
  const runs = [...(await loadRuns()), run].slice(-MAX_RUNS);
  await figma.clientStorage.setAsync(STATS_KEY, runs);
  return runs;
}

export async function clearRuns(): Promise<void> {
  await figma.clientStorage.deleteAsync(STATS_KEY);
}
