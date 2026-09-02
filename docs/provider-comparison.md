# Provider comparison

The M4b gate. Decide the default from measured output, not from price.

## Status

**Incomplete.** Only Gemini has been measured. No Anthropic key was available on 28 Aug 2026,
so the comparison cannot be finished and the default stays Gemini by necessity, not by evidence.

## What was measured

Screen: `test-assets/checkout.png`, a synthetic checkout with 11 planted problems.
Platform iOS, source production, flat image so every finding falls back to `bbox`.

### gemini-3.6-flash

| Run | Findings | Sev 3 | Sev 2 | Time | In / out / cached tokens |
|---|---|---|---|---|---|
| Before the sweep instruction | 7 | 5 | 2 | 71s | 11,615 / 4,481 / 0 |
| After the sweep instruction | 9 | 5 | 4 | 95s | 12,029 / 5,622 / 7,440 |

Scored against the four M4b criteria:

1. **Grounding.** 9 of 9 findings carried a usable rectangle. Every observation checked out
   against the image, including two that looked like hallucinations and were not: the Pay button
   label and the terms line really are truncated.
2. **Severity defensibility.** Ratings were reasonable. Nothing inflated, nothing obviously deflated.
3. **Intent-check.** It did not flag deliberate decisions. It correctly credited the delivery
   status indicator under What's working, because it pairs the dot with a text label.
4. **Cross-layer dedup.** One element, one finding held. The truncated Pay button appeared once,
   with the second layer noted rather than duplicated.

### Where Gemini Flash is weak

**Recall, not precision.** Everything it reported was true. What it missed was the most
objectively checkable failure on the screen: a 20pt close button against the 44pt floor.

The fix was a prompt change, not a model change. An explicit closing sweep in
`reference/output/finding-contract.md` recovered both target-size findings. Keep that sweep.
It is the difference between a report a designer trusts and one that reads clean because the
model stopped early.

### Operational notes

- **503 under load.** The free tier is deprioritised and returns 503 on large requests. Three
  retries with backoff (2s, 5s, 12s) cleared it. Without retry, roughly one run in three failed.
- **Implicit caching works.** 7,440 cached input tokens on the second run, with no cache config.
- **`gemini-2.5-flash` is retired** for keys created in 2026. Pinned to `gemini-3.6-flash`.
- **`thinkingBudget` is gone** on Gemini 3.x. It is `thinkingLevel: low | high`, and sending the
  old key returns a 400.

## Still to do

Run the same screen through `claude-opus-5` and fill in the table. Then decide.
