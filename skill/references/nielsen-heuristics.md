# Nielsen's 10 Usability Heuristics

Each heuristic gives: what it means, what violations look like on mobile, what they look like on web, and a one-line plain-language definition.

**The one-line definition is not optional.** Every finding that cites a heuristic must carry it, so a reader who has never heard of Nielsen can still follow the finding. Copy it into the finding's `ref_meaning` field, adapted to the specific screen.

---

## H1: Visibility of system status

Keep users informed about what is going on, through appropriate feedback within reasonable time.

**What it means:** Every action that changes state must have immediate, unambiguous feedback. Users on unreliable connections especially need to know whether their action registered.

**Red flags on mobile:**
- No loading indicator during network calls
- Submit button doesn't disable after tap, so double-submission is possible
- Action confirmed with no visible state change
- Background processes (syncing, uploading) with no progress indicator
- Status changes that take 2+ seconds with no interim feedback

**Red flags on web:**
- Form submits with no pending state, so the user clicks again
- Long table or search operations with no skeleton or spinner
- Async saves with no "saved" confirmation, so the user cannot tell if work persisted
- Multi-step wizards with no step indicator
- File uploads with no progress or size feedback

**One-line definition:** *The product should always tell users what is happening, immediately and clearly.*

---

## H2: Match between system and the real world

Speak the users' language. Use words, phrases, and concepts familiar to them, not system or engineering terminology.

**What it means:** Vocabulary, icons, and metaphors should match how users naturally think about the task, not how the backend categorises it.

**Red flags on mobile:**
- Tech jargon in user-facing strings ("sync failed", "null value", "HTTP 403")
- Business or internal jargon that users don't recognise
- Icons whose meaning requires learning (abstract glyphs rather than recognisable objects)
- Date and time formats not matching the user's locale
- Abbreviations that aren't universally understood

**Red flags on web:**
- Database column names surfacing as field labels
- Admin-console vocabulary shown to end users ("entity", "record", "instance")
- Status values that are raw enum strings ("PENDING_REVIEW_2")
- Navigation labelled by internal team ownership rather than user task
- Currency, number, or timezone formatting that ignores the user's locale

**One-line definition:** *The product should speak the user's language: words, icons, and concepts they already know.*

---

## H3: User control and freedom

Users need a clearly marked emergency exit to leave unwanted states without going through an extended dialogue.

**What it means:** Mistakes happen constantly. Recovery must be immediate and obvious.

**Red flags on mobile:**
- No back button, or unclear back navigation behaviour
- Irreversible destructive actions with no confirmation
- Confirmation dialogs where the default button is the destructive action
- Getting trapped in a state with no back, no close, no cancel
- Modals and bottom sheets without a visible close affordance
- No undo for actions that could reasonably be reversed

**Red flags on web:**
- Browser back button breaks the app or loses form state
- Multi-step flows with no way to return to a previous step
- Bulk actions applied with no undo and no confirmation summary
- Modal dialogs that trap the user with no escape key handling and no close control
- Navigating away silently discards unsaved work with no warning

**One-line definition:** *Users need a clear way out of any state they didn't intend to reach.*

---

## H4: Consistency and standards

Follow platform conventions. Don't make users wonder whether different words, situations, or actions mean the same thing.

**What it means:** Muscle memory is real. Inconsistency breaks it and forces users to re-learn patterns they thought they knew.

**Red flags on mobile:**
- Same action in different positions across similar screens
- Same colour carrying different meanings in different contexts
- Bottom sheet, modal, and full screen used inconsistently for similar-priority content
- Icon styles mixed (filled and outlined) with no system logic
- Inconsistent terminology for the same concept across screens
- Non-standard platform patterns such as custom back behaviour or non-native form controls

**Red flags on web:**
- Primary action position and colour varying between pages
- Some destructive actions confirm, others don't
- Mixed date formats within one product
- Links that look like buttons and buttons that look like links
- Two different components solving the same job on different pages

**One-line definition:** *Consistent design lets users rely on learned patterns. Inconsistency forces them to re-learn.*

---

## H5: Error prevention

Good error messages matter, but the best designs prevent problems from occurring in the first place.

**What it means:** Guard rails and confirmations prevent costly mistakes before they happen.

**Red flags on mobile:**
- Destructive actions with no confirmation step
- Forms that accept invalid input (wrong keyboard type, no format constraint)
- Primary and secondary actions indistinguishable in visual weight
- No safeguard against accidental double-tap on high-stakes actions
- Required fields not indicated until after a submission attempt
- No offline protection for actions that require connectivity

**Red flags on web:**
- Free-text fields where a constrained picker would remove the error class entirely
- No inline validation, so all errors arrive at submit
- Destructive buttons adjacent to routine ones with no visual separation
- Bulk operations with no preview of what will be affected
- Session timeout that discards a long form with no draft saved and no warning

**One-line definition:** *The best defence is not letting errors happen: constraints, confirmations, and clear affordances.*

---

## H6: Recognition rather than recall

Minimise memory load. Make objects, actions, and options visible. Users shouldn't have to remember information from one screen to use another.

**What it means:** Users can't hold product state in working memory. Everything they need to make a decision must be visible.

**Red flags on mobile:**
- Confirmation screen that omits the thing being confirmed
- Forms where the user must remember a value from a previous step
- Icons without labels where the meaning isn't universally obvious
- Navigation that requires remembering where a feature lives
- Search results with no indication of what was searched
- Previous selections not shown when returning to a flow

**Red flags on web:**
- Filters applied but not displayed as removable chips
- Wizard summary step that omits earlier answers
- Keyboard shortcuts with no discoverable reference
- Data tables where the column meaning is only in a tooltip
- Copying an ID from one page to paste into another

**One-line definition:** *The product should show users what they need, not make them remember it.*

---

## H7: Flexibility and efficiency of use

Accelerators may speed up expert users. Both novices and experts should be well served.

**What it means:** First-time users need guidance; daily users need shortcuts. Designing only for one group penalises the other.

**Red flags on mobile:**
- No way to dismiss onboarding tooltips permanently after first use
- Repetitive confirmation flows for actions experts perform constantly
- Forms that re-ask for information the system already knows
- No smart defaults based on prior behaviour
- Novice-focused hints cluttering expert flows
- Expert shortcuts requiring non-obvious gestures with no fallback

**Red flags on web:**
- No bulk actions where the task is inherently repetitive
- No keyboard path through a high-frequency flow
- No saved views, filters, or presets
- Export or import missing where users are clearly working at volume
- Deep links not supported, so every visit starts from the top

**One-line definition:** *Novices need guidance; experts need shortcuts. Good design serves both.*

---

## H8: Aesthetic and minimalist design

Every extra element competes with the elements that matter. Remove what doesn't earn its place.

**What it means:** Clutter is not decoration. It is signal loss.

**Red flags on mobile:**
- Multiple competing primary CTAs on the same screen
- Decorative elements taking space from content
- Copy that repeats the same information in different forms
- Promotional content on task-critical screens
- Dense text blocks that could be progressive disclosure
- Animations that delay comprehension without adding meaning

**Red flags on web:**
- Dashboards showing every available metric rather than the decision-relevant ones
- Sidebars, banners, and modals competing at the same moment
- Tables with columns nobody reads
- Help text repeating what the label already says
- Empty states filled with marketing rather than a next action

**One-line definition:** *Every element on screen competes for attention. Remove anything that doesn't earn its place.*

---

## H9: Help users recognise, diagnose, and recover from errors

Error messages should be in plain language, precisely indicate the problem, and constructively suggest a solution.

**What it means:** A user hitting an error is already frustrated. The message must be instantly understandable and say what to do next, not describe what the system did.

**Red flags on mobile:**
- Error codes shown to users ("Error 4012", "500 Internal Server Error")
- Generic messages with no specifics ("Something went wrong, try again")
- Error messages that state the problem but not the solution
- No recovery action offered, just an "OK" button
- Technical language in error copy (server, API, timeout, database)
- Errors that blame the user without clear guidance ("Invalid input")
- Error states not localised

**Red flags on web:**
- Field errors shown far from the field that failed
- Error summary with no anchor links to the failing fields
- Validation that clears the user's input on failure
- 404 and 500 pages with no route back into the product
- Errors announced visually only, never to a screen reader

**One-line definition:** *Error messages should name what went wrong in plain language and tell the user exactly what to do next.*

---

## H10: Help and documentation

Even the best systems sometimes need documentation. When help is needed, it should be easy to find and focused on the user's task.

**What it means:** In-context help is the only form of help that reliably reaches users. Dedicated help screens mostly serve support teams.

**Red flags on mobile:**
- Complex features with no first-use coach mark or tooltip
- "Help" or "Learn more" links that open generic FAQs
- Help content written in product or policy language rather than user language
- Support entry points buried deep in navigation
- No visible path to human support when self-service fails
- Help content not localised

**Red flags on web:**
- Complex form fields with no inline explanation of what is expected
- Documentation that describes the UI instead of the task
- No empty-state guidance on a feature the user has never used
- Search inside help that returns nothing for the product's own vocabulary
- Onboarding that cannot be replayed

**One-line definition:** *Help should appear where users need it, in the language they use, not in a manual they'll never read.*
