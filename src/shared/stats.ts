// Local tally for the budget case. Nothing leaves the machine.

export interface RunRecord {
  at: number;
  screen: string;
  provider: string;
  platform: string;
  findings: number;
  bySeverity: Record<string, number>;
  seconds: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

/** Published rates, USD per million tokens. Update when they move. */
export const RATES: Record<string, { in: number; out: number; label: string }> = {
  gemini: { in: 0, out: 0, label: 'Gemini 3.6 Flash, free tier' },
  anthropic: { in: 5, out: 25, label: 'Claude Opus 5' },
};

export function costOf(r: RunRecord, provider = r.provider): number {
  const rate = RATES[provider] ?? RATES.gemini;
  return (r.inputTokens / 1e6) * rate.in + (r.outputTokens / 1e6) * rate.out;
}

export interface Totals {
  runs: number;
  findings: number;
  sev34: number;
  minutes: number;
  inputTokens: number;
  outputTokens: number;
  /** What these runs actually cost. */
  spent: number;
  /** What the same runs would cost on Claude. This is the number for the ask. */
  onClaude: number;
}

export function totalsOf(runs: RunRecord[]): Totals {
  const t: Totals = {
    runs: runs.length,
    findings: 0,
    sev34: 0,
    minutes: 0,
    inputTokens: 0,
    outputTokens: 0,
    spent: 0,
    onClaude: 0,
  };
  for (const r of runs) {
    t.findings += r.findings;
    t.sev34 += (r.bySeverity['3'] ?? 0) + (r.bySeverity['4'] ?? 0);
    t.minutes += r.seconds / 60;
    t.inputTokens += r.inputTokens;
    t.outputTokens += r.outputTokens;
    t.spent += costOf(r);
    t.onClaude += costOf(r, 'anthropic');
  }
  return t;
}

/** Minutes a person would spend doing this review by hand, for the comparison. */
export const MANUAL_MINUTES_PER_SCREEN = 45;

export function statsReport(runs: RunRecord[]): string {
  const t = totalsOf(runs);
  if (t.runs === 0) return 'No evaluations run yet.';
  const perRun = (n: number) => (n / t.runs).toFixed(0);
  const manualHours = (t.runs * MANUAL_MINUTES_PER_SCREEN) / 60;

  return [
    `Scout usage, ${t.runs} evaluation${t.runs === 1 ? '' : 's'}`,
    '',
    `Screens evaluated       ${t.runs}`,
    `Findings surfaced       ${t.findings}  (${perRun(t.findings)} per screen)`,
    `Sev 3 and 4             ${t.sev34}  (${perRun(t.sev34)} per screen)`,
    `Time in the tool        ${t.minutes.toFixed(0)} min  (${(t.minutes / t.runs).toFixed(1)} min per screen)`,
    '',
    `Tokens in / out         ${t.inputTokens.toLocaleString()} / ${t.outputTokens.toLocaleString()}`,
    `Spent so far            $${t.spent.toFixed(2)}  (${RATES.gemini.label})`,
    `Same runs on Claude     $${t.onClaude.toFixed(2)}  ($${(t.onClaude / t.runs).toFixed(2)} per screen)`,
    '',
    `At this rate, a dedicated Claude key costs:`,
    `  100 screens a month   $${((t.onClaude / t.runs) * 100).toFixed(0)}`,
    `  500 screens a month   $${((t.onClaude / t.runs) * 500).toFixed(0)}`,
    '',
    `The same ${t.runs} review${t.runs === 1 ? '' : 's'} by hand at ${MANUAL_MINUTES_PER_SCREEN} min each: ${manualHours.toFixed(1)} designer hours.`,
  ].join('\n');
}
