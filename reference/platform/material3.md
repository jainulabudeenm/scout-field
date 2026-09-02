# Material 3 Design Conventions (Android)

Design conventions only. Accessibility for Android lives in `platform/mobile-a11y.md`. Do not restate it here, and do not write a finding twice under both files.

Use this layer to check whether the screen behaves like an Android screen. A deviation is only a finding when it costs the user something: broken expectation, lost affordance, or added effort. House style that differs from Material without hurting the user belongs in What's working, or nowhere.

---

## Navigation

- **Top app bar** carries the screen title and up to three actions. More than three actions belong in an overflow menu.
- **Navigation bar** (bottom) for 3 to 5 top-level destinations. Fewer than 3 means a bar is not warranted; more than 5 means the information architecture needs work.
- **Navigation drawer** for 6 or more destinations, or for secondary destinations that do not deserve permanent space.
- **Up** (back arrow in the app bar) and **Back** (system gesture or button) are different: Up moves within the app hierarchy, Back moves through history. If they behave identically on a deep screen, that is usually wrong.
- Do not replace the system back gesture with a custom one.

## Surfaces and elevation

- M3 expresses depth with **tonal surface colour** first and shadow second. A card that is only separated by a heavy drop shadow is pre-M3 styling.
- Surface levels rise with importance: background, surface, surface container, surface container high. Two adjacent surfaces at the same level with no divider read as one block.
- Dialogs and bottom sheets sit above a scrim. A modal surface with no scrim reads as inline content.

## Components and their semantics

Choosing the wrong component is a finding even when it looks fine, because users read intent from the component.

- **Filled button**: the single highest-emphasis action on the screen. More than one is a hierarchy failure.
- **Filled tonal / outlined button**: secondary actions.
- **Text button**: lowest emphasis, and the correct choice inside dialogs and cards.
- **FAB**: exactly one per screen, for the screen's single most common constructive action. A FAB used for a destructive or navigational action is misused.
- **Chips**: filter, input, suggestion, or assist. A chip that navigates is a mis-cast button.
- **Bottom sheet**: content related to the current screen. **Dialog**: a decision that blocks progress. **Full screen**: a task in its own right. Using a dialog for a long task, or a bottom sheet for a blocking decision, is a finding.
- **Snackbar**: brief, non-blocking feedback with at most one action. Never for anything the user must acknowledge.

## State and feedback

- Interactive elements need a **state layer**: hover, focus, pressed, dragged. A control with no pressed state feels dead on touch.
- **Ripple** originates at the touch point and is bounded by the component. A ripple that spills across the whole row when only the icon is tappable teaches the wrong tap area.
- Selected state is carried by container colour, not by text colour alone.

## Layout

- Default screen margin: 16dp. Spacing on a 4dp grid, mostly in multiples of 8.
- Content is aligned to a consistent left edge. A screen with three different left edges reads as unstructured.
- List items use consistent height classes. Mixed heights with no logic look like a bug.

## Motion

- Standard easing for most transitions, emphasised easing for large or attention-carrying ones.
- Shared-axis transitions for peer-to-peer navigation, container transform for entering a detail from a list.
- Duration scales with distance and size. A full-screen transition at 100ms feels broken; a chip state change at 500ms feels slow.
- Motion must not be the only signal that something changed.

## Typography and colour

- Use the M3 type scale roles (display, headline, title, body, label) rather than ad-hoc sizes. Two body sizes 1px apart is a system smell.
- Colour comes from roles (primary, secondary, tertiary, error, surface, outline) and their `on-` pairs. A foreground colour that is not the `on-` pair of its background is how contrast failures start.
- Error colour is reserved for errors. Using it for emphasis breaks the meaning of the channel.
