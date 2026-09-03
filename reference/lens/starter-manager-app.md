<!-- starter -->

# Manager App

## Who this lens is for

People who oversee other people's work rather than doing it themselves. A fleet owner, a shift
supervisor, a store manager, an operations lead, a support team lead, a small business owner
running a handful of staff.

They do not perform the task; they watch it, decide about it, and answer for it when it goes
wrong. They check in several times a day, they care about the exception rather than the average,
and their actions change somebody else's day, pay or schedule.

This is a starting point, not a finished lens. It describes a kind of user, not your product. Say
who your managers actually are and what their real flows are, and the evaluation gets much
sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate a screen as one person's interaction with one interface. They have no
concept of **blast radius**: the fact that the person who suffers the mistake is not the person who
made it.

They also assume a first encounter. This person opens the same screen every morning and needs it
to answer one question fast: **what needs me today?** A screen that is friendly on day one and
slow on day two hundred fails them.

## Principles

### G1 The exception finds the manager, not the other way round

**Plain meaning:** what is wrong is surfaced, not buried in a list of what is fine.

A violation looks like: a table where a failed item looks like a successful one. A dashboard of
healthy totals with problems only visible after filtering. An alert that exists in a separate
screen nobody opens. Sorting that defaults to newest rather than to what needs attention.

Red flags: no default view of problems; state carried only by a small colour dot; a count with no
way to reach the items behind it.

### G2 The total and the individual are both one step away

**Plain meaning:** the manager can move between the summary and the specific record without losing
their place.

A violation looks like: a metric that cannot be clicked. A number whose definition is not stated,
so nobody knows which records it counts. A drill-down that loses the filter it came from.

Red flags: a headline figure with no route to its rows; a filter that resets on back; two screens
showing the same metric with different numbers.

### G3 The effect on other people is stated before the action

**Plain meaning:** before a change, the manager can see who it touches and what they will
experience.

A violation looks like: "Deactivate" with no count and no note that the person is notified
immediately. A shift change that silently sends a message. A bulk approval that reports "done"
without saying how many succeeded and which failed.

Red flags: a confirmation dialog that restates the button instead of naming the consequence; no
count in a destructive prompt; a side effect first learned about from a complaint.

### G4 Data says how fresh it is

**Plain meaning:** the manager can tell whether a number is live, delayed or stale.

A violation looks like: a figure with no timestamp on a screen used for decisions. An empty table
that means "nothing happened" and "failed to load" identically. A metric that holds its last value
while the refresh silently fails.

Red flags: no "last updated" anywhere; one empty state for several causes; no visible difference
between zero and unknown.

### G5 Density suits daily use

**Plain meaning:** somebody checking this every morning needs to see more at once, not less.

A violation looks like: six records per screen because each is a padded card. A filter whose
current setting is only visible after opening a panel. A layout tuned for a first impression on a
screen used two hundred times.

Red flags: a list of records rendered as large cards; one metric per screenful; a saved view that
cannot be saved.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The action changes another person's pay, shift or account | +2 | 4 | The person who suffers the mistake is not the one who made it |
| The action cannot be reversed inside the tool | +1 | 4 | Recovery needs an engineer, and the affected person waits |
| The figure shown drives a decision made elsewhere | +1 | 4 | A wrong or stale number propagates past this screen |
| The screen is used under time pressure with a person waiting | +1 | 4 | Errors rise exactly when the cost of an error is highest |
| The screen is opened many times a day | +1 | 3 | Friction is multiplied by frequency, and paid for in hours |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `blast_radius` | `self`, `one_other`, `many` | Who is affected when this goes wrong |
| `data_freshness` | `live`, `delayed`, `unstated` | Whether the screen says how current it is |
| `decision_weight` | `informational`, `operational`, `financial` | What the manager does with what they see here |

## Out of scope

- **Permissions and policy.** Who is allowed to do what is a business rule. How clearly the tool
  says no is not.
- **Staffing and business outcomes.** A bad week is not a design finding.
- **Visual polish for its own sake.** This is a working tool. Judge it on time to answer the
  question.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
