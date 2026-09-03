<!-- starter -->

# E-commerce App

## Make this yours

This lens describes shopping apps in general. It does not know your product. Three steps, about
ten minutes:

1. **Say who your shoppers are.** Replace the paragraph below with your real customers. New or
   returning? Buying for themselves or for work? On what phone, in what situation?
2. **Replace one principle with your own.** Delete whichever of E1 to E5 matters least to you and
   write the rule your team actually argues about. Keep the shape: an ID, a plain-English meaning,
   and what a violation looks like.
3. **Set your amplifiers.** The table says what makes a problem worse in your business. If a
   returning customer matters more than a new one, say so there.

You can do this two ways. Paste your changes into the box under the lens picker, which applies to
one run. Or save the whole edited file in Settings under "Your own lenses", which keeps it.

## Who this lens is for

People browsing, comparing and buying things on a phone. They arrived with intent but not
commitment, a competitor is one tap away, and most are not signed in. Every extra step is a place
to leave, and they do not tell you why.

## What the universal layers miss here

Nielsen and WCAG ask whether a screen can be understood and operated. They do not know that a
delivery fee revealed at step four loses the sale, or that a hidden size guide becomes a return
three weeks later. The gap is commercial consequence.

## Principles

### E1 No surprises about money
**Plain meaning:** the shopper knows the full price before they commit, not after.
**Watch for:** fees, tax or delivery appearing first at payment; "from" prices with no explanation;
a total that changes between screens.

### E2 The cart's state is always visible
**Plain meaning:** the shopper can tell what they are buying and what it costs, at any point.
**Watch for:** an "added" toast with no lasting cue; a cart count that does not update; a cart line
that omits the chosen size or colour.

### E3 Everything is reversible until the money moves
**Plain meaning:** they can edit or go back until one unmistakable step.
**Watch for:** a pay button labelled like a next button; an address that cannot be edited without
restarting; back gestures that empty the cart.

### E4 Out of stock is information, not a dead end
**Plain meaning:** when something is unavailable, the screen says what to do instead.
**Watch for:** greyed-out options with no reason; "unavailable" with no alternative and no notify;
stock failures at payment that discard the cart.

### E5 A guest can buy
**Plain meaning:** making an account is never the price of a first purchase.
**Watch for:** a sign-up wall before checkout; a guest path shown as a text link beside a button;
an order confirmation that requires logging in.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The screen takes or changes money | +1 | 4 | A mistake costs the customer money, not time |
| The finding hides or changes a price | +1 | 4 | Unexpected cost is the most common reason a cart is abandoned |
| The screen is in a first-time buyer's path | +1 | 3 | A new customer has no reason to push through friction |
| The problem is only reachable after payment | +1 | 4 | They cannot fix it themselves and will contact support |

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `funnel_step` | `browse`, `product`, `cart`, `checkout`, `post_purchase` | Where in the buying path this sits |
| `cost_visibility` | `clear`, `partial`, `hidden` | Whether the full price is knowable here |
| `guest_blocked` | `yes`, `no` | Whether this screen forces an account |

## Out of scope

- **Prices, fees and return policies themselves.** Those are business decisions. Whether the
  customer sees them in time is the finding.
- **Stock levels.** Running out is not a bug. Handling it badly is.
- **Which payment methods exist.** Commercial. How they are presented is not.
- **Anything the universal layers own.** Contrast, touch targets and labels belong to WCAG and the
  platform layer. Raise their severity here, do not restate them.
