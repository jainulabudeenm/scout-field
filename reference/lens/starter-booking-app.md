<!-- starter -->

# Booking App

## Make this yours

This lens describes booking and scheduling apps in general. It does not know your product. Three
steps, about ten minutes:

1. **Say who your customers are.** Replace the paragraph below with your real users. Booking for
   themselves or for a group? Days ahead or minutes ahead? Across timezones?
2. **Replace one principle with your own.** Delete whichever of K1 to K5 matters least and write
   the rule your team actually argues about. Keep the shape: an ID, a plain-English meaning, and
   what a violation looks like.
3. **Set your amplifiers.** The table says what makes a problem worse in your business. If a
   no-show costs you a slot you cannot resell, say so there.

You can do this two ways. Paste your changes into the box under the lens picker, which applies to
one run. Or save the whole edited file in Settings under "Your own lenses", which keeps it.

## Who this lens is for

People reserving a slot in time. An appointment, a table, a seat, a class, a room, a delivery
window. They are choosing between options that differ mainly in **when**, they often book for
other people as well as themselves, and what they are booking can disappear while they look at it.

## What the universal layers miss here

Nielsen and WCAG ask whether a screen can be understood and operated. They cannot see that a time
is in the wrong timezone, that a slot was taken between the tap and the confirmation, or that
"Tuesday" is ambiguous nine days out. And the customer does not find the mistake on this screen.
They find it when they arrive on the wrong day.

## Principles

### K1 A date is never ambiguous
**Plain meaning:** the customer can tell exactly which day and time, without counting.
**Watch for:** a weekday with no date; "tomorrow" still on screen the next morning; 12-hour times
with no am or pm; formats like 03/04 that read differently by country.

### K2 Availability is honest and current
**Plain meaning:** what the screen offers can actually be booked, and says when it cannot.
**Watch for:** a slot that fails at confirmation; an empty month with no explanation; greyed-out
slots that do not say whether they are full, closed, or outside the window.

### K3 Changing and cancelling are as easy as booking
**Plain meaning:** the customer can find, change and cancel without contacting anyone.
**Watch for:** the confirmation email as the only route back; cancellation buried in settings; a
change flow that is really cancel-then-rebook and loses the original slot.

### K4 The rules appear before the choice, not after
**Plain meaning:** deadlines, deposits and limits are visible while deciding.
**Watch for:** a cancellation deadline first shown on the confirmation; a deposit revealed at
payment; a minimum party size discovered after picking a time.

### K5 It is clear who the booking is for
**Plain meaning:** the person booking can say it is not for them.
**Watch for:** fields prefilled with the account holder and no way to change them; no field for
who is actually attending; a group booking capturing one name.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| Getting it wrong means arriving at the wrong place or time | +2 | 4 | Neither the customer nor you can fix it on the day |
| The booking cannot be changed after this step | +1 | 4 | There is no second chance to correct it |
| A deposit, fee or penalty is involved | +1 | 4 | A mistake here costs the customer money |
| The finding is on the confirmation they will re-read | +1 | 3 | This is the record they trust when they turn up |

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `booking_step` | `search`, `select`, `details`, `confirm`, `manage` | Where in the booking path this sits |
| `time_clarity` | `explicit`, `relative`, `ambiguous` | How the date and time are expressed |
| `recoverable` | `yes`, `no` | Whether the customer can fix this themselves after this step |

## Out of scope

- **Availability itself.** A fully booked week is business, not design.
- **Cancellation policies and pricing.** Whether a policy is strict is commercial. Whether it is
  visible in time is the finding.
- **Capacity decisions.** How many slots exist is not a UX finding.
- **Anything the universal layers own.** Contrast, touch targets and labels belong to WCAG and the
  platform layer. Raise their severity here, do not restate them.
