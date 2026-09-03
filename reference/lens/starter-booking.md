<!-- starter -->

# Booking and Scheduling

## Who this lens is for

People reserving a slot in time: an appointment, a table, a seat, a delivery window, a class, a
room. They are choosing between options that differ mainly in **when**, they often book for
someone else as well as themselves, and the thing they are booking can disappear while they are
looking at it.

This is a starting point, not a finished lens. It describes the category. Add who your customers
actually are and what your real flows look like, and the evaluation gets much sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen can be understood and operated. They cannot see that a
time is shown in the wrong timezone, that a slot was taken between the tap and the confirmation,
or that "Tuesday" is ambiguous when the booking is nine days away.

The gap is **time, and what it costs to get it wrong.** A person who misreads a date does not
discover the mistake on this screen. They discover it when they arrive on the wrong day.

## Principles

### B1 A date is never ambiguous

**Plain meaning:** the customer can tell exactly which day and time they picked, without counting.

A violation looks like: "Tuesday, 3:00" with no date. A relative label like "tomorrow" that is
still on screen the next morning. A 12-hour time with no am or pm. A date format that reads
differently in different countries, like 03/04.

Red flags: weekday without date; "today", "tomorrow" or "next week" as the only label on a
confirmation; times with no timezone on a product that crosses timezones.

### B2 Availability is honest and current

**Plain meaning:** what the screen offers can actually be booked, and it says when it cannot.

A violation looks like: a slot that fails at the confirmation step. A calendar that shows a month
with nothing bookable in it and no explanation. Greyed-out slots that do not say whether they are
full, closed, or outside the booking window.

Red flags: a disabled slot with no reason; an error that appears only after the user commits; no
indication that availability is live and can change.

### B3 Changing and cancelling are as easy as booking

**Plain meaning:** the customer can find, change and cancel a booking without contacting anyone.

A violation looks like: a confirmation email as the only route back to the booking. A cancellation
buried under account settings. A change flow that is really "cancel, then book again", losing the
original slot in between.

Red flags: no visible link from a confirmation to the booking itself; cancel presented only as
destructive red with no reschedule option beside it; a policy stated only after the user tries.

### B4 The rules are stated before the choice, not after

**Plain meaning:** deadlines, fees, deposits and limits appear while the customer is deciding.

A violation looks like: a cancellation deadline shown for the first time on the confirmation. A
deposit revealed at payment. A minimum party size discovered after picking a time.

Red flags: policy text below the primary button; terms in a modal the user must open; a rule that
only appears in the error that it causes.

### B5 One booking, one identity

**Plain meaning:** it is clear who the booking is for, and the person booking can say it is not
them.

A violation looks like: no way to book on behalf of someone else. A form that assumes the account
holder is the attendee. A confirmation that names the account, not the guest.

Red flags: name and contact fields prefilled with no way to change them; no field for who is
actually attending; a group booking with only one name captured.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| Getting it wrong means arriving at the wrong place or time | +2 | 4 | The customer cannot recover on the day, and neither can you |
| The screen involves a deposit, fee or penalty | +1 | 4 | A mistake here costs the customer money |
| The booking cannot be changed after this step | +1 | 4 | There is no second chance to correct it |
| The finding is on the confirmation the customer will re-read later | +1 | 3 | This is the record they trust when they turn up |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `booking_step` | `search`, `select`, `details`, `confirm`, `manage` | Where in the booking path the finding sits |
| `time_clarity` | `explicit`, `relative`, `ambiguous` | How the date and time are expressed here |
| `recoverable` | `yes`, `no` | Whether the customer can fix this themselves after this step |

## Out of scope

- **The availability itself.** A fully booked week is business, not design.
- **Cancellation policies.** Whether a policy is strict is commercial. Whether it is visible in
  time is the finding.
- **Pricing.** Same rule.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
