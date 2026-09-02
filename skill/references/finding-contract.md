# Finding Contract

How to fill the response schema. The response is one JSON object, validated against the schema. The markdown report is a field inside it, not a separate reply.

Both must agree. The findings array and `report_markdown` describe the same findings in the same order.

---

## Locating a finding on the screen

This is the part that makes findings land on the design instead of in a document. Get it right.

### When layer data is supplied

The request includes a **node index**: a flat list of the screen's layers, each with an `id`, a `name`, a `type`, coordinates relative to the screen's top-left corner, and text content where it exists.

**Set `node_id` to the id of the layer the finding is about. Set `bbox` to null.**

Pick the node that *is* the element, not its parent container and not a child fragment. For a finding about a button whose label is too small, the node is the text layer. For a finding about the button's hit area, it is the button frame.

Never invent an id. If nothing in the index matches, follow the no-match rule below.

### When layer data is not supplied

Flat images have no layers. The request will say so and give the image dimensions.

**Set `bbox` to the rectangle on a 0 to 1000 scale. Set `node_id` to null.**

`bbox` is `{x, y, w, h}`, origin at the top-left. 0 is the left or top edge, 1000 is the right
or bottom edge. Both axes run 0 to 1000 whatever the image's real proportions are, so an
element halfway down the screen has `y` near 500 however tall the image is. Do not answer in
pixels. The request states the pixel size so you can judge text and target sizes, not so you
can place boxes with it.

Every finding located this way is marked "estimated position" in the report, because a visual estimate is not exact and the reader should know.

### When nothing matches

If the finding is about the screen as a whole (missing help, no way back, an absent state) rather than a specific element, set **both** `node_id` and `bbox` to null. This is correct and expected. Do not force a rectangle onto a finding that has no location.

---

## Field by field

| Field | Rule |
|---|---|
| `id` | Stable within this response. `F1`, `F2`, `F3`. A lens extension refers back to these. |
| `layer` | `nielsen`, `wcag`, `platform`, or `lens`. The layer where the failure is most fundamental. |
| `lens` | The lens name when `layer` is `lens`. Otherwise null. |
| `ref` | The exact criterion. `H4 Consistency and standards`. `1.4.3 Contrast (Minimum)`. `Material 3 FAB usage`. |
| `ref_meaning` | **Required.** One line of plain language defining `ref`, written for this screen. A reader who has never heard of Nielsen must be able to follow the finding from this line alone. |
| `headline` | Short issue title. Under 80 characters. Names the problem, not the fix. |
| `severity` | 0 to 4, defended against the four questions in the severity rubric. |
| `element` | The exact UI element, named as a person would point at it. |
| `node_id` / `bbox` | Per the rules above. Exactly one of them, or neither. Never both. |
| `observation` | What was seen. A measurement, a colour, a string, a proportion. Evidence, not judgement. |
| `why_it_matters` | The concrete consequence for the user. If severity was raised, the reason goes here. |
| `recommendation` | Implementable. Shows what good looks like. For copy fixes, write the actual copy. |
| `effort` | `S` hours, `M` days, `L` weeks. Engineering effort, not design effort. |
| `also_touches` | Other layers the same element fails, one sentence each with its definition embedded. Empty array when it fails only one layer. |
| `tags` | Free-form key-value map. Empty object unless a lens contributes tags. |

---

## Response-level fields

| Field | Rule |
|---|---|
| `screen_name` | Read it from the screen. Fall back to the layer name of the selection. |
| `screen_type` | One of the types listed in the report template. |
| `platform` | `android`, `ios`, or `web`. |
| `lenses_applied` | Empty array on a universal run. |
| `assumptions` | Every inference made. Empty array if context was complete. |
| `whats_working` | 2 to 6 items. Empty array if genuinely nothing stands out. Do not pad. |
| `findings` | Ordered by layer, then by severity descending inside each layer. |
| `prioritised` | One line per item: `[Sev 4] {issue}, {fix}`. Sorted by severity, then impact over effort. |
| `open_questions` | Anything unresolved. Empty array if nothing is unclear. |
| `report_markdown` | The full report, shaped by `output/report-template.md`. |

---

## Extending with a lens

A lens extension receives the universal findings that already exist. It returns a different shape:

- `new_findings`, findings the universal layers could not see. **Never a restatement of an existing finding.** Read the existing list first.
- `severity_upgrades`, `{finding_id, new_severity, reason}` for existing findings whose consequence is worse under this lens. The reason is shown to the reader, so write it for them.
- `lens_summary`, two or three sentences on what this lens changed about the picture.

A lens never lowers a severity and never rewrites a universal finding.

---

## Hard rules

- **`ref_meaning` is never empty.** A finding without it is unusable by half the audience.
- **One element, one finding.** Cross-layer overlaps go in `also_touches`, not in a second finding.
- **Never invent a `node_id`.** A wrong id draws a box on the wrong element, which is worse than drawing none.
- **The markdown and the findings array must match.** Same findings, same order, same severities.
- **No em dashes anywhere in the output.** Not in headlines, not in `report_markdown`, not in
  chat answers. Use a comma, a colon, or a full stop. This is a house style rule, and it is checked.
- **`report_markdown` is the only field that carries markdown.** Every other field is plain text:
  no `**bold**`, no `#` headings, no backticks. Those fields are rendered as-is in a panel and on a
  canvas, where the asterisks show up literally.

---

## Before you finish: the sweep

Models under-report. A short eval reads as a clean screen, and a designer trusts it. So before
returning, walk this list once and confirm each item was actually considered on this screen.
Add any finding you missed. If an item genuinely does not apply, move on without comment.

1. **Target sizes.** Measure every tappable thing: icon-only buttons, close and dismiss controls,
   chips, inline links, checkboxes. Anything under 44 units is a finding. This is the most commonly
   missed check on any screen, and the easiest to verify, so do it first.
2. **Contrast.** Every text colour against its background, including placeholder text, helper text,
   disabled states, and text on images. Grey-on-white is the most common failure there is.
3. **Labels.** Every input, every icon-only control. Placeholder text is not a label.
4. **Colour-only signals.** Status dots, error states, required-field markers, selected states.
5. **Error copy.** Does every error say what to do next, in plain words, with no codes?
6. **Truncation and overflow.** Any text cut off, clipped, or running past its container.
7. **Recovery.** If the user gets this screen wrong, can they notice and fix it?
8. **Hierarchy.** Is there exactly one primary action? Do destructive and routine actions look different?
9. **Empty, loading, and offline states.** Present, or absent and unaccounted for?
10. **Platform conventions.** Safe areas, navigation, the component chosen for the job.

Then check the count. A real screen with real problems rarely yields fewer than eight findings.
If you have fewer, you have almost certainly stopped early: go back through the sweep. If the screen
genuinely is clean, say so plainly and explain why, rather than padding.
