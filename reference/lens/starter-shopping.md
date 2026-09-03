<!-- starter -->

# Shopping and Checkout

## Who this lens is for

People browsing, comparing and buying things on a phone. They arrived with intent but not
commitment, they are comparing you against a competitor one tab away, and every extra step is a
chance to leave. Most of them are not signed in, and many are buying from you for the first time.

This is a starting point, not a finished lens. It describes the category. Add who your customers
actually are and what your real flows look like, and the evaluation gets much sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen can be understood and operated. They do not know that a
shopper abandons a cart over a delivery fee revealed at step four, or that a size guide hidden
behind a modal costs a return three weeks later.

The gap is **commercial consequence**. A confusing label on a settings screen is an annoyance. The
same confusion on a price is lost money and lost trust, and the user often does not come back to
tell you.

## Principles

### S1 No surprises about money

**Plain meaning:** the customer knows the full price before they commit, not after.

A violation looks like: a delivery charge, tax, service fee or currency conversion appearing for
the first time on the payment step. A price shown "from" without saying what changes it. A
discount that silently expires between the product page and the cart.

Red flags: the word "from" next to a price with no explanation nearby; a total that changes
between screens; fees stated only in fine print or behind an information icon.

### S2 The state of the cart is always visible

**Plain meaning:** the customer can tell what they are buying and what it costs, at any point.

A violation looks like: an "added to bag" confirmation that vanishes with no lasting cue. A cart
count that does not update. A quantity control with no visible current value. A saved item and a
cart item that look identical.

Red flags: a confirmation that appears only as a toast; no persistent cart indicator; an item
whose selected size, colour or variant is not repeated on the cart line.

### S3 Every commitment is reversible until it is not

**Plain meaning:** the customer can undo, edit or go back until the moment their money moves, and
that moment is unmistakable.

A violation looks like: a back gesture that empties the cart. A "Pay" button that reads like
"Next". An address that cannot be edited after the delivery step without starting again.

Red flags: the final action is not labelled with what it does; no edit affordance beside a summary
line; destructive actions with no undo.

### S4 Out of stock is information, not a dead end

**Plain meaning:** when something is not available, the screen says what to do next.

A violation looks like: a greyed-out size with no explanation. "Unavailable" with no restock
signal, no notify option and no alternative. An error at payment time for stock that ran out
during checkout, with the cart discarded.

Red flags: a disabled control with no reason attached; an empty state with no exit; the word
"error" where the real event is "sold out".

### S5 A guest can buy

**Plain meaning:** account creation is never the price of a first purchase.

A violation looks like: a sign-up wall between the cart and payment. A guest path that exists but
is visually subordinate to "Create account". An order confirmation reachable only by logging in.

Red flags: two buttons where the guest option is a text link; a required field that only an
account needs; a password field before a payment field.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The finding is on a screen where money moves | +1 | 4 | A mistake here costs the customer money, not time |
| The finding hides or changes a price | +1 | 4 | Unexpected cost is the most common reason a cart is abandoned |
| The screen is in the path of a first-time buyer | +1 | 3 | A new customer has no reason to persist through friction |
| The problem is only reachable after payment | +1 | 4 | The customer cannot correct it themselves and will contact support |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `funnel_step` | `browse`, `product`, `cart`, `checkout`, `post_purchase` | Where in the buying path the finding sits |
| `cost_visibility` | `clear`, `partial`, `hidden` | Whether the full price is knowable at this point |
| `guest_blocked` | `yes`, `no` | Whether this screen forces an account |

## Out of scope

- **Prices, fees and policies themselves.** A high delivery charge is a business decision. Whether
  the customer can see it in time is the finding.
- **Stock levels.** Running out is not a UX bug. Handling it badly is.
- **Payment methods offered.** Which ones exist is commercial. How they are presented is not.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
