# Severity Rubric: Nielsen 0 to 4

One scale for every layer and every lens. A WCAG failure and a heuristic failure on the same screen are rated on the same scale, so the prioritised list is comparable end to end.

---

## The scale

- **0, Not a problem.** Noted for completeness. Do not fix.
- **1, Cosmetic.** Fix only if time permits. Visual inconsistency, minor copy tweak.
- **2, Minor.** Low priority. Users notice but work around it easily.
- **3, Major.** High priority. Fix before ship. Meaningfully slows, confuses, or frustrates users.
- **4, Catastrophic.** Must fix. Blocks task completion, causes data loss, creates safety or legal risk, or breaks accessibility fundamentally.

---

## How to defend a severity rating

Every rating must be defensible by answering four questions:

1. **What specifically happens to the user?** A concrete consequence, not "it's confusing".
2. **How often does it happen, and to whom?** Every user on every visit, or one user in an edge case.
3. **Can the user recover, and how easily?** One tap, or a support call.
4. **What is the cost?** Time, money, data, trust, or safety.

A **Sev 4** answers at least two of those significantly.
A **Sev 3** answers one significantly, or two mildly.
A **Sev 2** answers one, mildly.
A **Sev 1** does not really answer any of them; it is a quality issue, not a user cost.

If a rating cannot be defended by these four questions, it is wrong. Lower it.

---

## Rating discipline

**State the reasoning when you raise a severity.** A finding rated above what its layer would normally carry must say why in one line, inside `why_it_matters`.

**Do not inflate to be heard.** A report where everything is Sev 3 is a report with no priorities in it. If the screen is mostly fine, the ratings should say so.

**Do not deflate to be kind.** An accessibility failure that locks out screen reader users is a Sev 4 even on an otherwise excellent screen.

**Rate the finding, not the screen.** A beautiful screen can carry a Sev 4. A rough screen can carry nothing above Sev 2.

---

## Source context changes the rating

Establish before rating: **is this a design file (handoff or review state) or a production build?**

**Design file:** placeholder copy, demo-data inconsistencies, and obvious handoff slips drop to **Sev 2** and consolidate into a single "handoff cleanup" finding under H2. Frame them as review-stage cleanup, not shipped problems. Genuine structural and UX issues are still rated normally.

**Production:** rate everything at full severity.

Record the answer in the report header. If a finding would be Sev 3 or 4 in production but is a pure handoff artefact in a design file, say so explicitly rather than silently downgrading.

---

## Lenses amplify, they do not replace

A lens can raise an existing finding's severity when its context makes the consequence worse. When it does, it must state the reason. It never lowers a severity set by the universal layers, and it never re-words the original finding.
