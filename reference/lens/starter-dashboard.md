<!-- starter -->

# Dashboards and Internal Tools

## Who this lens is for

People using software as part of their job: an operations console, an admin panel, a reporting
dashboard, a support agent's queue. They are trained, they return every day, and they are fast.
They are also often under time pressure with someone waiting on them, and their mistakes affect
other people rather than themselves.

This is a starting point, not a finished lens. It describes the category. Add who your users
actually are and what your real flows look like, and the evaluation gets much sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen can be understood and operated by someone encountering
it. They optimise for the first use. An internal tool is used for the four hundredth time, by
someone who knows it well and needs it to get out of the way.

The gap is **repetition and blast radius**. A friendly onboarding hint is noise on day two. A
confirmation dialog on a hundred-times-a-day action trains people to dismiss it, which is worse
than having none. And an action here often changes someone else's account, order or shift.

## Principles

### D1 Density is a feature, not a failure

**Plain meaning:** an expert needs more on screen at once, not less.

A violation looks like: a table showing eight rows because each one is a card with generous
padding. A dashboard that needs three scrolls to see what one screen should show. Whitespace
tuned for a marketing page on a screen someone stares at all day.

Red flags: a list of records rendered as cards; one metric per screenful; a filter that requires
opening a panel to see what is currently applied.

### D2 The keyboard is a first-class input

**Plain meaning:** a frequent task can be done without reaching for the mouse.

A violation looks like: a search field that is not focused on open. No way to move between rows or
submit a form from the keyboard. A modal that traps focus but offers no way to confirm from the
keyboard.

Red flags: no visible focus ring; tab order that jumps around the layout; a primary action
reachable only by clicking.

### D3 Bulk work is supported, not simulated

**Plain meaning:** when the job is to do the same thing to many records, the tool does that.

A violation looks like: approving fifty items one at a time. A filter that cannot be saved. An
export that returns the current page rather than the current query. No multi-select where the
workflow is obviously repetitive.

Red flags: an action that exists only in a row menu; pagination with no "select all matching";
copying values out by hand to use elsewhere.

### D4 Consequence is visible before the action

**Plain meaning:** the user can see who and what a change affects, before they make it.

A violation looks like: "Delete" with no count of what it removes. A status change that silently
notifies a customer with no warning that it will. A bulk action that reports success without
saying how many succeeded.

Red flags: a confirmation dialog that repeats the button label instead of naming the effect; no
count in a destructive prompt; a side effect discovered from a complaint.

### D5 State is honest about the system, not just the screen

**Plain meaning:** the user can tell whether data is fresh, stale, loading, or failed to load.

A violation looks like: a dashboard showing yesterday's number with no timestamp. An empty table
that means "no results" and "failed to load" identically. A metric that keeps its last value while
the refresh silently fails.

Red flags: no "last updated" anywhere; an empty state with one message for several causes; no
distinction between zero and unknown.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The action changes a record belonging to someone else | +1 | 4 | The person who suffers the mistake is not the person who made it |
| The task is performed many times a day | +1 | 3 | Friction is multiplied by frequency, and cost is measured in hours |
| The screen is used under time pressure with a person waiting | +1 | 4 | Errors rise exactly when the cost of an error is highest |
| The data shown drives a decision made elsewhere | +1 | 4 | A wrong or stale figure propagates beyond this screen |
| The action cannot be undone from within the tool | +1 | 4 | Recovery means an engineer and a database |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `task_frequency` | `rare`, `daily`, `constant` | How often this screen is used in a working day |
| `blast_radius` | `self`, `one_other`, `many` | Who is affected when this goes wrong |
| `expert_cost` | `none`, `slows`, `blocks` | What this costs someone who already knows the tool |

## Out of scope

- **Visual polish for its own sake.** This is a tool, not a landing page. Judge it on time to
  complete the task.
- **Onboarding for new staff.** Real, but a different problem. Do not penalise a screen for
  assuming training that genuinely exists.
- **Permissions and access rules.** Who is allowed to do what is policy. How clearly the tool says
  no is not.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
