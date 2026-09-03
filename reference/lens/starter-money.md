<!-- starter -->

# Money and Payments

## Who this lens is for

People moving, holding or tracking their own money: a transfer, a balance, a bill, a loan, a
statement, a payout. They are cautious because the stakes are real, they are often in a hurry,
and a mistake is frequently irreversible. Many are anxious before they even open the screen.

This is a starting point, not a finished lens. It describes the category. Add who your customers
actually are and what your real flows look like, and the evaluation gets much sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen can be understood and operated. They cannot see that a
transfer to the wrong account cannot be undone, that a pending balance and an available balance
mean different things, or that a rounded figure on a payout screen destroys trust.

The gap is **irreversibility and trust**. In most software a mistake costs a minute. Here it costs
money, and the user knows it, so ambiguity reads as either incompetence or deceit.

## Principles

### M1 Numbers are exact and their basis is named

**Plain meaning:** the customer sees the real figure, and knows what it includes.

A violation looks like: a rounded total where the exact one exists. A balance with no label saying
whether it is available, pending or total. A converted amount with no rate and no timestamp. A fee
folded into a total with no breakdown.

Red flags: "approx", "about" or "~" on a real figure; a currency symbol with no currency code on a
multi-currency product; a total that does not equal the visible lines above it.

### M2 The point of no return is unmistakable

**Plain meaning:** the customer knows which tap moves the money, and what happens after it.

A violation looks like: a "Confirm" button identical in weight to "Next". A final review screen
that looks like the form before it. No statement that the action cannot be undone, when it cannot.

Red flags: the last step is not visually different from the ones before it; the button verb is
generic; no summary of amount, destination and fee immediately above the action.

### M3 The recipient is verifiable before, not after

**Plain meaning:** the customer can confirm who receives the money while they can still stop.

A violation looks like: an account number with no name check. A masked destination that hides the
part that distinguishes two similar accounts. A saved payee list where two entries look identical.

Red flags: only digits shown for a destination; no name confirmation step; a payee label the user
never set and cannot edit.

### M4 Pending is a state, not a mystery

**Plain meaning:** money in transit is visible, explained, and has an expectation attached.

A violation looks like: a transfer that disappears from both balances. "Processing" with no
timescale. A failed payment with no reason and no next step. A statement that does not distinguish
posted from pending.

Red flags: a status with no date attached; an amount missing from every total; the word "failed"
with no cause and no retry.

### M5 Errors say what to do, not what went wrong internally

**Plain meaning:** when a payment fails, the customer learns their next action.

A violation looks like: a bank error code shown raw. "Something went wrong" on a screen where
money may or may not have moved. An error that does not say whether to retry.

Red flags: an error with a number and no sentence; no statement of whether the money left the
account; a retry button that might double-charge.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The action cannot be reversed by the customer | +2 | 4 | There is no undo, so the design has to be right the first time |
| The screen shows or changes a figure the customer will act on | +1 | 4 | A wrong number here becomes a wrong decision |
| The finding concerns who receives the money | +2 | 4 | Money sent to the wrong recipient is usually unrecoverable |
| The screen is a record the customer will re-read later, such as a receipt or statement | +1 | 3 | This is what they will trust and quote in a dispute |
| The state is ambiguous about whether money moved | +1 | 4 | Uncertainty here leads to duplicate payments |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `money_step` | `view`, `compose`, `review`, `confirm`, `receipt` | Where in the money path the finding sits |
| `reversible` | `yes`, `no`, `unclear` | Whether the customer can undo this themselves |
| `figure_precision` | `exact`, `rounded`, `unlabelled` | How the amounts on this screen are expressed |

## Out of scope

- **Fees, rates and limits themselves.** Whether a fee is fair is commercial. Whether it is
  visible before the customer commits is the finding.
- **Regulatory steps.** A required identity check or a mandated warning is context, not a bug.
  Evaluate how well the customer gets through it.
- **Fraud rules.** A blocked transaction is a business decision. The message explaining it is not.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
