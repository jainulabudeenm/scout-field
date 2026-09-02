# Report Template

This is the shape of the `report_markdown` field. Follow it exactly. Consistency across screens is what makes a set of evaluations comparable.

> **Findings are grouped BY LAYER, not by severity.** This is locked. An earlier draft drifted to by-severity grouping; do not reintroduce it. Grouping by layer keeps "is it usable" and "is it accessible" legible as separate concerns, and it matches the `layer` field on every finding, so results roll up cleanly across screens.
>
> Within each layer, list findings high to low severity.

Write in plain words. No em dashes.

---

```markdown
# Screen Eval: {screen_name}

**Screen type:** {entry | list | detail | form | confirmation | error | empty | modal | bottom sheet | offline | other}
**Platform:** {Android | iOS | Web}
**Source:** {Design file (handoff or review state) | Production}
**Lenses applied:** {none | comma-separated lens names}
**Evaluated:** {date}

---

## Assumptions made

{Only when flow, user goal, or source was inferred. State each inference plainly.
Name which findings would change if an assumption is wrong.
If nothing was inferred, write "None. Context was provided."}

---

## What's working

{2 to 6 observations. Lead with the plain-language observation of why the pattern
works, then name the principle as a trailing reference. Never lead with the
principle name.

Example:
- The error message names the exact field that failed and says what to change, so
  the user can act without rereading the form. *(H9 Help users recover from errors)*

If nothing stands out, write "No standout positives noted on this screen." Do not pad.}

---

## Findings

### Layer 1: Nielsen's 10 Heuristics

#### [Sev X] H{n}, {heuristic name}: {short issue headline}

**What H{n} means:** {one line, plain language, written for this screen}

**Element:** {the exact UI element, named specifically}
**Observation:** {what was seen. A measurement, a colour, a string, a proportion. Plain words, no jargon.}
**Why it's a problem:** {the concrete consequence for the user. Not "it's confusing".}
**Recommendation:** {an implementable fix that shows what good looks like. If it is a copy fix, write the actual copy.}
**Effort hint:** {S = hours | M = days | L = weeks}
**Also touches:** {only when the SAME element genuinely fails another layer}
- {Layer and criterion name}: {one sentence on how the breach happens here, with its definition embedded}

{Repeat per finding. If the layer is clean, write "No findings in this layer."}

---

### Layer 2: WCAG 2.1 AA

#### [Sev X] {criterion number}, {criterion name}: {short issue headline}

**What this criterion means:** {one line, plain language}

{... same fields ...}

---

### Layer 3: Platform Guidelines

#### [Sev X] {guideline name}: {short issue headline}

**What this means:** {one line, plain language}

{... same fields ...}

---

### Layer 4: {Lens name}

{Only when a lens has been applied.}

#### [Sev X] {principle ID and name}: {short issue headline}

**What {principle} means:** {one line, plain language}

{... same fields, plus any tags the lens contributes ...}

---

## Recommendations, prioritised

Single-line items. Sorted by severity first, then by impact over effort inside each
severity. No sub-headers, no multi-line items.

1. [Sev 4] {issue headline}, {recommendation headline}
2. [Sev 4] {issue headline}, {recommendation headline}
3. [Sev 3] {issue headline}, {recommendation headline}
{... and so on}

---

## Open questions

{Anything the evaluation could not resolve without more context. One numbered
question each. Omit the section if nothing is unclear.}
```

---

## Formatting rules

- **Group by layer. Sort by severity inside each layer.** Not the other way round.
- **Every finding carries its plain-language definition line.** No exceptions.
- **Severity appears in the heading as `[Sev X]`**, so the report is scannable without reading bodies.
- **Name the element specifically.** "The grey text under the total", not "some text".
- **No em dashes** in the body.
- **A clean layer says so.** "No findings in this layer." Never pad to look thorough.
- **Estimated positions are badged.** If a finding's location came from an estimate rather than layer data, append ` *(estimated position)*` to its Element line.
