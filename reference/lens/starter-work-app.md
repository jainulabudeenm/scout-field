<!-- starter -->

# Work App

## Who this lens is for

People who use the app to do their job. A driver, a rider, a field technician, a warehouse picker,
a sales agent, a shift worker. They open it dozens of times a day, they know it well, and their
income depends on completing tasks inside it. They often use it one-handed, outdoors, in bright
sun or poor light, on a mid-range phone with a weak connection, while something else demands their
attention.

This is a starting point, not a finished lens. It describes a kind of user, not your product. Say
who your workers actually are and what their real flows are, and the evaluation gets much sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen can be understood and operated by someone meeting it.
They optimise for the first encounter. This person is on their four hundredth.

Two things fall outside them. First, **repetition**: a helpful hint is noise on day two, and two
extra taps become an hour a month. Second, **stakes**: the person on this screen is losing money
while it is confusing, and cannot choose a different app.

## Principles

### W1 The frequent path is the shortest path

**Plain meaning:** the thing done fifty times a day takes the fewest taps, not the most prominent
marketing feature.

A violation looks like: the main action behind a menu while a promotion holds the primary button.
A confirmation dialog on a routine action, which trains people to dismiss dialogs without reading.
A flow that reintroduces a choice the worker makes the same way every time.

Red flags: the primary button does something the user does rarely; a modal on a daily action; a
setting the user changes back after every session.

### W2 Readable in the real conditions of the job

**Plain meaning:** it works in sunlight, in motion, one-handed, on a cheap phone.

A violation looks like: a critical control at the top of a tall screen, out of thumb reach. Text
that meets contrast on a desk monitor but not on a phone at midday. A tap target sized for a
stylus. Information carried by colour alone, on a screen with a cracked protector.

Red flags: primary actions in the upper corners; grey-on-grey secondary text; a status shown only
by colour; layouts that assume two hands.

### W3 The worker can always answer "what do I do next"

**Plain meaning:** the current job, its state, and the next action are visible without hunting.

A violation looks like: a screen that shows history but not the live task. A status word with no
action attached. Two things that look equally like the next step. A completed task that stays on
screen next to an incoming one with no visual difference.

Red flags: no single obvious next action; state expressed only as a past-tense label; the live
item not distinguished from finished ones.

### W4 Money and time are exact, never approximate

**Plain meaning:** earnings, deductions, deadlines and penalties are shown as real figures, with
their basis named.

A violation looks like: a rounded payout. An earnings figure with no breakdown of what was added
or deducted. "Soon" where a time exists. A penalty mentioned only after it is applied.

Red flags: "approx" or "~" on a figure the worker will check against their bank; a total that does
not match the lines above it; a deadline expressed relatively on a screen read hours later.

### W5 Interruption is the normal case, not the edge case

**Plain meaning:** the app is put down mid-task and picked up later, and it survives that.

A violation looks like: a form that clears on backgrounding. A multi-step flow with no way to see
how far along you are. A session that expires while the worker is doing the physical part of the
job. A retry that starts from step one.

Red flags: no progress indicator on a multi-step flow; unsaved input with no draft; a timeout with
no warning; no way to resume.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The screen affects the worker's earnings | +2 | 4 | A mistake here costs this person income, not convenience |
| The action cannot be undone by the worker | +1 | 4 | Recovery means calling support and losing working time |
| The task is done many times a day | +1 | 3 | Friction is multiplied by frequency, and paid for in hours |
| The screen is used while moving, outdoors or one-handed | +1 | 4 | The conditions that make it hard are the conditions it is used in |
| The problem blocks the task entirely | +1 | 4 | The worker cannot work around it and cannot switch app |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `task_frequency` | `rare`, `daily`, `constant` | How often this screen is met in a working day |
| `income_impact` | `none`, `indirect`, `direct` | Whether this screen touches what the worker is paid |
| `use_condition` | `seated`, `moving`, `outdoors` | The physical situation the screen is used in |

## Out of scope

- **Pay rates, penalties and policies themselves.** What the worker is paid is a business decision.
  Whether they can see and understand it in time is the finding.
- **Onboarding and training.** Real, but different. Do not penalise a screen for assuming training
  that genuinely happens.
- **Unshipped features.** Never mark a screen down for lacking something the team has planned.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
