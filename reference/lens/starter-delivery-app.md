<!-- starter -->

# Delivery App

## Make this yours

This lens describes delivery and field-work apps in general, the side used by the person doing the
job. It does not know your product. Three steps, about ten minutes:

1. **Rewrite Personas and Flows.** They are filled in with a generic example. Replace
   them with your real users and your real paths. This is the change that sharpens findings most.
2. **Replace one principle with your own.** Delete whichever of D1 to D5 matters least and write
   the rule your team actually argues about. Keep the shape: an ID, a plain-English meaning, and
   what a violation looks like.
3. **Set your amplifiers.** The table says what makes a problem worse in your business. If a
   missed pickup costs more than a late drop, say so there.

You can do this two ways. Paste your changes into the box under the lens picker, which applies to
one run. Or save the whole edited file in Settings under "Your own lenses", which keeps it.

If your app is the **customer** side of delivery, use the E-commerce App lens instead. This one is
for the person earning.

## Who this lens is for

People who use the app to do their job. Drivers, riders, couriers, field technicians. They open it
dozens of times a day, they know it well, and their income depends on finishing tasks inside it.
Usually one-handed, outdoors, in sun or rain, on a mid-range phone with a weak signal, with
something else demanding their attention.

## Personas

Replace these with yours. Two is usually enough to sharpen an evaluation.

- **New worker, first weeks** — still learning the app, afraid of making a mistake that costs
  money, checks twice before acting.
- **Experienced full-timer** — knows every screen, works fast, resents anything that adds a tap.
  Their whole income runs through this app.

## Flows

Name the paths that matter and say what "done" means.

1. **Take a job and finish it** — starts at the offer, ends when it is marked complete and paid.
2. **Handle an exception** — starts when reality does not match the app (nobody home, wrong
   address, damaged item), ends when the worker knows they will not be penalised.
3. **Check the money** — starts at earnings, ends when they can match what they see to what
   reaches their bank.

## What the universal layers miss here

Nielsen and WCAG optimise for the first encounter. This person is on their four hundredth. Two
things fall outside: repetition, where two extra taps become an hour a month, and stakes, because
this person is losing money while the screen is confusing and cannot switch to a different app.

## Principles

### D1 The frequent path is the shortest path
**Plain meaning:** the thing done fifty times a day takes the fewest taps.
**Watch for:** the main action behind a menu while a promotion holds the primary button; a
confirmation dialog on a routine action; a choice re-asked that is always answered the same way.

### D2 Readable in the real conditions of the job
**Plain meaning:** it works in sunlight, in motion, one-handed, on a cheap phone.
**Watch for:** critical controls out of thumb reach; contrast that passes on a desk monitor but
not at midday; status carried by colour alone; layouts that need two hands.

### D3 The worker can always answer "what do I do next"
**Plain meaning:** the live task, its state, and the next action are visible without hunting.
**Watch for:** history shown but not the current job; a status word with no action attached; a
finished task that looks the same as an incoming one.

### D4 Money and time are exact, never approximate
**Plain meaning:** earnings, deductions, deadlines and penalties are real figures.
**Watch for:** a rounded payout; earnings with no breakdown; "soon" where a time exists; a penalty
mentioned only after it is applied.

### D5 Interruption is normal, not an edge case
**Plain meaning:** the app is put down mid-task and picked up later, and survives it.
**Watch for:** a form that clears on backgrounding; a multi-step flow with no progress shown; a
session that expires during the physical part of the job; a retry that starts from step one.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The screen affects the worker's earnings | +2 | 4 | A mistake costs this person income, not convenience |
| The problem blocks the task entirely | +1 | 4 | They cannot work around it and cannot switch app |
| The screen is used while moving or outdoors | +1 | 4 | The conditions that make it hard are the conditions it is used in |
| The task is done many times a day | +1 | 3 | Friction is multiplied by frequency and paid for in hours |

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `task_frequency` | `rare`, `daily`, `constant` | How often this screen is met in a working day |
| `income_impact` | `none`, `indirect`, `direct` | Whether this screen touches what the worker is paid |
| `use_condition` | `seated`, `moving`, `outdoors` | The physical situation it is used in |

## Out of scope

- **Pay rates and penalty policies themselves.** Business decisions. Whether the worker can see and
  understand them in time is the finding.
- **Training.** Do not mark a screen down for assuming training that genuinely happens.
- **Unshipped features.** Never penalise a screen for lacking something not built.
- **Anything the universal layers own.** Contrast, touch targets and labels belong to WCAG and the
  platform layer. Raise their severity here, do not restate them.
