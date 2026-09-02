# How to write a lens

A **lens** is an optional extra layer. The universal evaluation (Nielsen, WCAG, platform) runs first with no setup. A lens is then applied on top, and it does exactly two things:

1. **Adds findings** the universal layers cannot see, because they need domain knowledge.
2. **Raises the severity** of existing findings whose consequence is worse in this domain, with a stated reason.

A lens never lowers a severity, never re-words a universal finding, and never repeats one.

Everything client-specific or product-specific belongs in a lens file. The `core/` and `platform/` files stay domain-neutral so any team can use them.

---

## Required sections

Copy this structure. Every section is load-bearing.

### 1. Who this lens is for

One paragraph. The product, the users, and what makes their context different from a general audience. Concrete, not aspirational.

### 2. What the universal layers miss here

The reason this lens exists. If the three universal layers already catch everything, do not write a lens.

### 3. Principles

The domain's own design principles, each with:
- A short ID and name, so findings can cite it (for example `S1 Clarity Under Pressure`)
- **A one-line plain-language definition.** Required, same rule as the universal layers. It goes into the finding's `ref_meaning`.
- What a violation looks like, concretely
- Red flags to scan for

### 4. Severity amplifiers

The conditions that make an ordinary problem worse in this domain. Each amplifier states:
- The condition (for example: the screen affects the user's income)
- How much it raises severity, and the ceiling
- The reason, in one sentence, that will be shown to the reader

Amplifiers are what let a lens upgrade an existing finding. Without them the lens can only add, not sharpen.

### 5. Tags this lens contributes

A lens can attach extra key-value tags to any finding, its own or a universal one. Tags are a free-form map, so no schema change is needed.

List each tag: its key, its allowed values, and what it means. Example:

| Key | Values | Meaning |
|---|---|---|
| `user_segment` | `new`, `returning`, `both` | Which group the finding hits, when severity genuinely differs by group |

### 6. Out of scope

What this lens must not flag. Usually: planned-but-unshipped features, deliberate business constraints, and anything the universal layers already own. Write this section honestly; it prevents the most common lens failure, which is inventing problems to justify the lens.

---

## Rules every lens must follow

- **Do not repeat a universal finding.** When extending, you are given the existing findings. Read them. If your point is already made, raise its severity instead of adding a duplicate.
- **Every principle needs its plain-language definition.** Non-designers read these reports.
- **Amplify with a reason.** "Severity 2 to 3 because this screen affects the user's income" is usable. A silent bump is not.
- **Business constraints are not UX bugs.** A time limit or a required fee that exists for a real reason is context, not a finding. Evaluate what the user can do inside the constraint.
- **Unshipped features are not gaps.** Never penalise a screen for lacking something the team has planned but not built.
