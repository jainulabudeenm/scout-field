# Apple Human Interface Guidelines: Design Conventions (iOS)

Design conventions only. Accessibility for iOS lives in `platform/mobile-a11y.md`. Do not restate it here, and do not write a finding twice under both files.

Use this layer to check whether the screen behaves like an iOS screen. A deviation is only a finding when it costs the user something. House style that differs from the HIG without hurting the user belongs in What's working, or nowhere.

---

## Navigation

- **Navigation bar** carries the title and, at most, a small number of controls. The back control shows the previous screen's title where it fits, which is a wayfinding aid, not decoration.
- **Large title** on top-level screens, collapsing to a standard title on scroll. A deep detail screen with a large title reads as top level.
- **Tab bar** for 2 to 5 peer destinations that are available at all times. Tabs are not a place for actions.
- The **left-edge swipe-back** gesture must work on every pushed screen. Breaking it is a real cost, because it is the most used navigation gesture on iOS.
- Modality is a commitment: a sheet interrupts. Use it for a self-contained task, and give it an obvious Cancel and a clear confirming action.

## Modality and sheets

- **Sheet** (page or form): a focused subtask, dismissible by swipe and by an explicit control.
- **Alert**: a short, important decision only. An alert with three or more actions, or a long body, is the wrong component.
- **Action sheet / menu**: a short list of choices related to something the user just touched. Destructive options are styled destructive and placed apart from routine ones.
- **Full screen cover**: only for immersive tasks. If the user can still reason about the screen underneath, it should not be full screen.
- Never use a modal to deliver information the user did not ask for and cannot act on.

## Components and their semantics

- **Filled / prominent button**: one per screen, the primary action.
- **Bordered and plain buttons**: secondary and tertiary.
- Bottom-anchored primary buttons must respect the home indicator's safe area. Content flush against it looks unfinished and is hard to hit.
- **Segmented control**: mutually exclusive views of the same content, typically 2 to 4 segments. Not a navigation control.
- **Switch**: an immediate on/off state change with no confirmation. If a change needs a Save, it is a checkbox-style choice, not a switch.
- **Stepper, slider, picker**: choose by the shape of the value. A slider for a precise numeric input is wrong; a picker for a binary choice is heavy.
- **Toast-style banners are not native.** Transient feedback on iOS is usually inline or a brief overlay; a bottom snackbar reads as an Android import.

## Layout

- Respect **safe areas** at the top, bottom, and on the sides in landscape. Content under the notch, the Dynamic Island, or the home indicator is a finding.
- Standard content margin: 16pt (20pt on larger devices). Keep one consistent left edge.
- **Lists**: grouped (inset, rounded) for settings and forms; plain for content collections. A settings screen using plain style reads unstructured.
- Separators start at the content's left edge, aligned with text rather than the screen edge, when the row has a leading icon or image.

## Touch and feedback

- Minimum comfortable target: 44x44 pt.
- Every tappable element has a visible pressed state. Highlight-on-press for rows, opacity or tint change for buttons.
- **Haptics** confirm meaningful events: success, warning, error, selection change. Haptics on every tap is noise.
- Pull-to-refresh where a list is expected to update. Do not invent a custom refresh gesture in its place.

## Motion

- Transitions are directional and reversible: push moves right to left, pop reverses it. A push that fades gives no sense of place.
- Interactive dismissal (drag a sheet down) should track the finger and be cancellable.
- Motion follows physics rather than fixed timing curves for anything the user drags.
- Motion must not be the only signal that something changed.

## Typography and colour

- Use the **text styles** (Large Title, Title, Headline, Body, Callout, Caption) rather than ad-hoc sizes, so system text sizing works.
- Prefer **semantic system colours** (label, secondaryLabel, systemBackground, separator) so light and dark mode and high contrast follow automatically. Hard-coded hex is where dark mode breaks.
- The tint colour identifies what is interactive. Applying it to non-interactive text teaches the wrong affordance.
