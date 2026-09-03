<!-- starter -->

# Banking App

## Make this yours

This lens describes banking and payment apps in general. It does not know your product. Three
steps, about ten minutes:

1. **Rewrite Personas and Flows.** They are filled in with a generic example. Replace
   them with your real users and your real paths. This is the change that sharpens findings most.
2. **Replace one principle with your own.** Delete whichever of B1 to B5 matters least and write
   the rule your team actually argues about. Keep the shape: an ID, a plain-English meaning, and
   what a violation looks like.
3. **Set your amplifiers.** The table says what makes a problem worse in your business. If your
   regulator or your support queue has taught you something, put it there.

You can do this two ways. Paste your changes into the box under the lens picker, which applies to
one run. Or save the whole edited file in Settings under "Your own lenses", which keeps it.

## Who this lens is for

People moving, holding or checking their own money. A transfer, a balance, a bill, a card, a
statement. They are cautious because the stakes are real, often in a hurry, and a mistake is
frequently impossible to undo. Many are anxious before they open the screen.

## Personas

Replace these with yours. Two is usually enough to sharpen an evaluation.

- **Everyday account holder** — checks a balance, pays a bill, moves money to a known person.
  Confident with the app, still cautious with money.
- **Someone under money stress** — near the end of a balance, or chasing a payment that has not
  arrived. Reads every number twice and will call support if the screen is unclear.

## Flows

Name the paths that matter and say what "done" means.

1. **Check standing** — starts at open, ends when they know what they can spend today.
2. **Move money** — starts at compose, ends at a receipt naming the amount, the recipient and the
   status.
3. **Something went wrong** — starts at a failed or missing payment, ends when they know whether
   the money moved and what to do next.

## What the universal layers miss here

Nielsen and WCAG ask whether a screen can be understood and operated. They cannot see that a
transfer to the wrong account is gone, that "pending" and "available" mean different things, or
that a rounded figure destroys trust. The gap is irreversibility, and what ambiguity costs when
money is involved.

## Principles

### B1 Numbers are exact, and their basis is named
**Plain meaning:** the real figure, and what it includes.
**Watch for:** rounded totals where an exact one exists; a balance with no label; a converted
amount with no rate or time; a total that does not equal the lines above it.

### B2 The point of no return is unmistakable
**Plain meaning:** the customer knows which tap moves the money.
**Watch for:** a final step that looks like the ones before it; a generic button verb; no summary
of amount, destination and fee right above the action.

### B3 The recipient is verifiable before, not after
**Plain meaning:** they can confirm who receives it while they can still stop.
**Watch for:** an account number with no name check; masking that hides what distinguishes two
similar accounts; two saved payees that look identical.

### B4 Pending is a state, not a mystery
**Plain meaning:** money in transit is visible, explained, and has a time attached.
**Watch for:** a transfer missing from every balance; "processing" with no timescale; a failure
with no cause and no next step; posted and pending shown the same.

### B5 Errors say what to do next
**Plain meaning:** when a payment fails, the customer learns their next action.
**Watch for:** a raw bank error code; "something went wrong" where money may or may not have
moved; a retry button that could double-charge.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The action cannot be reversed by the customer | +2 | 4 | There is no undo, so it has to be right the first time |
| The finding concerns who receives the money | +2 | 4 | Money sent to the wrong person is usually unrecoverable |
| The state is unclear about whether money moved | +1 | 4 | Uncertainty here causes duplicate payments |
| The screen is a record read later, such as a receipt or statement | +1 | 3 | This is what they will trust and quote in a dispute |

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `money_step` | `view`, `compose`, `review`, `confirm`, `receipt` | Where in the money path this sits |
| `reversible` | `yes`, `no`, `unclear` | Whether the customer can undo this themselves |
| `figure_precision` | `exact`, `rounded`, `unlabelled` | How amounts are expressed here |

## Out of scope

- **Fees, rates and limits themselves.** Business decisions. Whether they are visible in time is
  the finding.
- **Required regulatory steps.** An identity check or a mandated warning is context. How well the
  customer gets through it is not.
- **Fraud rules.** A blocked transaction is a business call. The message explaining it is not.
- **Anything the universal layers own.** Contrast, touch targets and labels belong to WCAG and the
  platform layer. Raise their severity here, do not restate them.
