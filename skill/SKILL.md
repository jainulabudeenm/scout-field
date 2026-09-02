---
name: scout-screen-eval
description: Run a rigorous heuristic and accessibility evaluation on a product screen. Use whenever someone wants to heuristic-eval, UX audit, critique, accessibility-check, or review a screen, whether it arrives as a Figma frame, an exported image, or a description. Applies Nielsen's 10 usability heuristics, WCAG 2.1 AA, and platform guidelines (Material 3, Apple HIG, or web), then optionally extends with a product-specific lens. Produces findings rated on Nielsen's 0 to 4 scale, each with a plain-language definition so a product manager or researcher can read it. Trigger even when someone just pastes a screen and says "review this", "audit this", "any issues here", or "what would you change". Works for mobile and web, any domain.
---

# Scout Screen Eval

The same evaluation the Scout Figma plugin runs, available wherever Claude is.

Findings are specific, evidence-based, and actionable. The audience includes people who do not
know the frameworks by name, so every finding carries a one-line plain-language definition of
whatever it cites. That is not decoration; a finding a product manager cannot read is a finding
that does not get fixed.

## How this differs from the plugin

The plugin can read the Figma layer tree, so it resolves findings to exact coordinates. Here there
is no layer tree, so locations are visual estimates. Say so: mark located findings
"estimated position", and never claim a measurement you cannot actually make from the image.

## Workflow

### Step 1 — Understand the screen

Identify the screen type: entry, list, detail, form, confirmation, error, empty, modal, bottom
sheet, offline, or other. Note the user's apparent goal.

If a Figma link is given and the Figma MCP is connected, call `get_design_context` for real layer
data, and use it. That upgrades estimates into measurements.

### Step 2 — Establish platform and source

**Platform:** Android, iOS, or web. Judge from the status bar, navigation pattern, component style,
and aspect ratio. State your reading; do not silently assume.

**Source:** a design file (handoff or review state) or a production build. This changes severity.
Ask if it is not obvious. See `references/severity-rubric.md`.

### Step 3 — Load the layers you need

Always: `references/eval-discipline.md`, `references/severity-rubric.md`,
`references/nielsen-heuristics.md`, `references/wcag-aa.md`.

Then by platform:

| Platform | Also load |
|---|---|
| Android | `references/mobile-a11y.md` and `references/material3.md` |
| iOS | `references/mobile-a11y.md` and `references/ios-hig.md` |
| Web | `references/web-a11y.md` |

### Step 4 — Run every layer, in order

Nielsen, then WCAG, then platform. Be exhaustive inside each. A clean layer says
"No findings in this layer" and nothing more. Never pad.

### Step 5 — Rate, then sweep

Rate every finding against the four questions in the rubric.

Then run the closing sweep in `references/finding-contract.md` before you write anything up.
Models under-report, and a short evaluation reads as a clean screen. The sweep is what catches
the target sizes and the contrast failures that otherwise get missed.

### Step 6 — Write the report

Use `references/report-template.md` exactly. Findings are grouped **by layer, not by severity**.
That is locked.

### Step 7 — Offer a lens, do not assume one

After delivering the universal evaluation, offer to extend it:

> "Want me to extend this with a lens for your product? A lens adds a fourth layer for your own
> design principles, and it can raise the severity of findings that matter more in your context.
> Paste your principles, or point me at a file."

If they accept, load their lens and produce **only** the extension:

- **New findings** the universal layers could not see. Never restate one that already exists.
- **Severity upgrades** to existing findings, each with a reason written for the reader. A lens
  only raises. It never lowers a severity the universal layers set.
- **A short summary** of what the lens changed about the picture.

`references/lens-template.md` explains how to write one.

## Producing machine-readable output

When asked for JSON, or when the output will feed the Scout triage board, emit the same shape the
plugin uses. `references/finding-contract.md` is the authority on every field. Set `node_id` to an
empty string and use `bbox` in image pixels, because there is no layer tree here.

## Principles

- **Specificity beats volume.** Name the exact element, the exact criterion, and a concrete fix.
  "Improve the hierarchy" is not a finding.
- **Evidence-based.** Cite what you observed: a colour, a string, a proportion, a measurement.
- **Actionable.** "Increase the target from roughly 32dp to at least 44dp", not "make buttons bigger".
- **Honest about uncertainty.** If the resolution prevents a check, say so.
- **Preservation-first.** Do not flag what is working. If a screen is clean on a layer, say it is clean.
- **No em dashes** in the output.
