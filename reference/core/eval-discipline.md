# Evaluation Discipline

How to run the eval, and the traps that produce bad findings. These rules came from calibrating real evaluations against reviewed screens. They override generic instincts when they conflict.

---

## Workflow

**Step 1, Understand the screen.**
Identify the screen type: entry, list, detail, form, confirmation, error, empty state, modal, bottom sheet, offline, other. Note the user's apparent goal. If layer data is available, use it; the structure tells you things the pixels do not.

**Step 2, Establish source.** Design file or production build. This changes severity. See `core/severity-rubric.md`.

**Step 3, Run every layer in order.** Nielsen, then WCAG, then platform. Be exhaustive. If a layer has nothing, say "No findings in this layer" and move on. Do not pad.

**Step 4, Severity-rate everything** against the four questions in the rubric.

**Step 5, Produce the report** in the shape defined by `output/report-template.md`.

---

## One element, one finding

If the same element fails several layers, write **one** consolidated finding under the layer where the failure is most fundamental, and list the other layers under `also_touches` with a one-sentence rationale each.

Never write the same element up three times under three layers. It inflates the count, hides the real number of problems, and makes the prioritised list useless.

`also_touches` entries carry their own inline definition, exactly like a headline finding does.

---

## Intent-check before flagging

Before writing any finding, ask: **is this a deliberate design decision with a rationale?**

If yes, it belongs in What's working, not in Findings.

If uncertain, say so in the finding rather than asserting a failure, and add the question to Open questions. "Is this placement intentional?" costs ten seconds and prevents a wasted finding.

A design that breaks a convention on purpose, to solve a real problem, is good design. Flagging it as a violation makes the whole report less trustworthy.

---

## Inline framework definitions are required

Every finding that cites a heuristic, a WCAG criterion, a platform guideline, or a lens principle **must** carry a one-line plain-language definition of that item, in the `ref_meaning` field, written for the specific screen.

This is load-bearing, not decoration. The audience includes product managers and researchers who do not know Nielsen's numbering. A finding they cannot read is a finding that does not get fixed.

A finding combining two heuristics carries a definition for each.

In **What's working**, apply the same rule in reverse: lead with the plain observation of why the pattern works, then name the principle as a trailing reference. Never lead with the principle name.

---

## Work in progress is not a gap

On a design file, distinguish **not yet designed** from **deliberately removed**.

Do not flag missing-but-planned elements as gaps or regressions on an incomplete design. If a design looks partial, evaluate the complete version instead, or say in Open questions that completeness needs confirming.

---

## Recovery path check, on every action screen

For any screen where the user takes an action, explicitly ask and answer: **if they get this wrong, skip a step, or end up off the intended path, is there a clear, discoverable way to notice and fix it?**

Answer this even when nothing on the screen prompts it. Do not wait for it to surface under H9. If the answer is no, that is a finding, regardless of how clean the happy path looks.

---

## Handling missing context

When flow or user goal is unknown:

1. Infer from visual evidence.
2. State the inference explicitly in Assumptions.
3. Evaluate against the inferred context.
4. Name which findings would change if the assumption is wrong.

Never silently guess. An explicit assumption can be corrected in seconds; a silent one costs a re-review.

If a finding hinges entirely on what came before or after this screen, put the question in Open questions rather than writing a finding on a guess.

---

## Data and content correctness is a finding category

If visible data looks wrong for the screen's context (the wrong information type surfaced, critical data missing, a value that contradicts another value on the same screen), flag it under H2. These are often the highest-impact findings, because they corrupt the decision the screen exists to support.

Flag a discrepancy. Do not assert a bug. Note when engineering needs to confirm.

---

## Current design before proposed design

Always evaluate the shipped or current design first. Flag explicitly when something is a concept or a proposal. Findings on concept screens are direction-setting feedback, not ship blockers.

---

## In-file annotations are not ground truth

When a design file carries commentary alongside the UI (designer notes, sticky-note critiques, generated summaries, a colleague's draft), treat it as **unverified**. It may be someone's working draft or machine-generated, not validated fact.

Evaluate the UI on its own merit. Cite in-file notes only as unverified annotation. Never present agreement between your findings and an unvalidated in-file analysis as external validation. Two analyses agreeing is suggestive, not proof.

---

## Copy: when it is a UX issue, when it is not

**In scope** when the copy is also a usability problem:
- An error message that does not say what to do next (H9)
- A label using system terminology the user does not know (H2)
- Instructions too dense for the time available (H8)

**Out of scope** when the issue is purely tone, brand voice, or style preference. That belongs in a copy audit.

---

## Language register

Write findings in plain words. No design jargon in the body of a finding. Say "how the screen is organised", not "information architecture". Say "what makes it look tappable", not "affordance".

**Length rule: adequate, not short.** Write enough for the finding to be understood, and not one word more. Do not enforce arbitrary sentence limits.

If the finding is about unclear copy, the recommendation must show the actual replacement copy, not describe it abstractly.

---

## The five principles

- **Specificity beats volume.** Every finding names the exact element, the exact criterion, and a concrete implementable fix. "Improve the hierarchy" is not a finding.
- **Evidence-based.** Every finding cites what was observed: a measurement, a colour, a specific string, a layout proportion. No vibes.
- **Actionable.** "Increase the tap target from roughly 32dp to a minimum of 44dp", not "consider making buttons bigger".
- **Honest about uncertainty.** If the image resolution prevents a check, say so. If context is missing, say so.
- **Preservation-first.** Do not flag what is working. Do not invent issues. If a screen is clean on a layer, say it is clean.
