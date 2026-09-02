# Test assets

Neutral screens for testing Scout. Nothing here is client work, so these are safe to
send through a free-tier model and safe to commit.

## checkout.html / checkout.png

A synthetic mobile checkout screen with deliberate, known problems. Rendered at 2x:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --hide-scrollbars --screenshot=checkout.png --window-size=390,844 \
  --force-device-scale-factor=2 file://$PWD/checkout.html
```

Planted problems, and whether the current prompt catches them:

| # | Problem | Layer | Caught |
|---|---|---|---|
| 1 | `ERR_CODE 4012` in user-facing copy | H2 / H9 | yes |
| 2 | "Invalid input" with no guidance | H9 | yes |
| 3 | Grey text at roughly 2:1 contrast | WCAG 1.4.3 | yes |
| 4 | Placeholder used as the only field label | H6 / WCAG 3.3.2 | yes |
| 5 | `Svc. chg.` abbreviation | H2 | yes |
| 6 | Close icon at 20pt, under the 44pt floor | WCAG 2.5.5 | yes, after the sweep |
| 7 | Chips at roughly 17pt height | Platform | yes, after the sweep |
| 8 | Cancel styled destructive-red, equal weight to Pay | H4 / H5 | yes |
| 9 | Pay button label truncated | H8 / Platform | yes |
| 10 | Terms text truncated at the right edge | H8 | yes |
| 11 | Fees named but never explained | Lens (consumer) | universal layers do not own this |

## checkout-baseline-gemini.json

A full `EvalResult` from `gemini-3.6-flash`, 9 findings. The regression baseline.
Compare against it after any prompt change:

```
node worker/test/smoke.mjs test-assets/checkout.png --route eval --platform ios --code $CODE
```

Fewer than 9 findings, or a target-size miss, means the prompt lost something.
