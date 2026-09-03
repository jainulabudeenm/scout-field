<!-- starter -->

# Consumer App

## Who this lens is for

People using the app occasionally rather than professionally. They have had no training, they did
not read anything before opening it, and they will not read anything now. They arrived with an
intention but no commitment, a competitor is one tap away, and if the app makes them feel stupid
they leave and do not report why.

Many are using it for the first time. Most are not signed in. Some will not come back after this
screen.

This is a starting point, not a finished lens. It describes a kind of user, not your product. Say
who your customers actually are and what their real flows are, and the evaluation gets much
sharper.

## What the universal layers miss here

Nielsen and WCAG evaluate whether a screen **can** be understood and operated. They do not ask
whether someone will **bother**.

That is the gap. A professional pushes through friction because they must. A consumer closes the
app. So the finding that matters most here is often not "this is unusable", it is "this is the
point where a reasonable person gives up", and no universal heuristic names that.

## Principles

### C1 The next step is obvious without reading

**Plain meaning:** a person who skips all the text can still tell what to do.

A violation looks like: two buttons of equal weight where only one is the real path. An
instruction that carries information the buttons do not repeat. A primary action below the fold. A
screen whose purpose is only explained in a paragraph.

Red flags: the eye has to choose between equals; the button verb is generic ("Continue", "OK")
where something specific was possible; the key control needs a scroll.

### C2 Value comes before demands

**Plain meaning:** the person sees something worth having before being asked for anything.

A violation looks like: a sign-up wall on the first screen. A permission prompt before any
context. A required account to see a price. An email field before the person knows what they get.

Red flags: a form is the first thing; a system permission dialog with no preceding explanation;
the guest path is a text link while "Create account" is a button.

### C3 Every commitment is visible before it is made

**Plain meaning:** cost, terms, recurrence and consequences appear while the person is deciding.

A violation looks like: a fee revealed at payment. A free trial that does not say what happens on
day eight. An auto-renewal in fine print. A permission whose real scope is only in settings.

Red flags: policy text below the primary button; "starting from" with no explanation of what
changes it; a total that changes between screens; the word "free" near a card field.

### C4 A mistake is cheap

**Plain meaning:** the person can go back, edit, or undo without losing what they did.

A violation looks like: a back gesture that discards a filled form. A destructive action with no
undo. A wrong choice that can only be fixed by starting the flow again. An error that clears the
fields it complains about.

Red flags: no edit affordance beside a summary; a confirmation dialog used in place of an undo;
input lost on validation failure.

### C5 It speaks the person's language, not the system's

**Plain meaning:** labels, errors and empty states use words the user already has.

A violation looks like: an error code shown raw. "Invalid input" with no statement of what would
be valid. An empty state that says "no data". Internal words on user-facing controls, like
"entity", "sync" or "config".

Red flags: an error with a number and no sentence; a message that describes what the system did
rather than what the person should do; nouns from the database in the interface.

## Severity amplifiers

| Condition | Raise by | Ceiling | Reason shown to the reader |
|---|---|---|---|
| The screen is in a first-time path | +1 | 3 | A new user has no reason to persist, and leaving is free |
| The screen takes or changes money | +1 | 4 | A mistake costs the person money, not time |
| The screen asks for something before giving anything | +1 | 4 | This is where people abandon, and they never say why |
| The person cannot correct it themselves afterwards | +1 | 4 | It becomes a support contact, or a lost customer |
| The problem is silent, with no error or feedback | +1 | 4 | A person who does not know they went wrong cannot recover |

An amplifier never lowers a severity, and never fires twice on the same finding.

## Tags this lens contributes

| Key | Values | Meaning |
|---|---|---|
| `journey_stage` | `discover`, `decide`, `commit`, `after` | Where in the customer's path this sits |
| `commitment_visible` | `clear`, `partial`, `hidden` | Whether cost and terms are knowable at this point |
| `exit_risk` | `low`, `medium`, `high` | How likely a reasonable person is to give up here |

## Out of scope

- **Prices, fees and policies themselves.** A high charge is a business decision. Whether it is
  visible in time is the finding.
- **Which features exist.** Never mark a screen down for lacking something not built.
- **Brand and visual taste.** Judge clarity and effort, not whether the palette is fashionable.
- **Anything the universal layers already own.** Contrast, touch targets, focus order and labels
  belong to WCAG and the platform layer. Raise their severity here, do not restate them.
