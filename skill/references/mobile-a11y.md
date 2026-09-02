# Mobile Platform Accessibility

Even a screen that passes WCAG can still fail real users on a phone. These platform checks go beyond the standard. Load this alongside `core/wcag-aa.md` for any iOS or Android screen.

---

## Touch and tap targets

**iOS HIG:** minimum 44x44 pt hit area.
**Material Design:** minimum 48x48 dp hit area.

Both platforms agree the visible element may be smaller than the hit area. Use padding or an invisible touch area to meet the minimum without changing the visual design.

Spacing between adjacent targets: minimum 8dp, to prevent mis-taps.

High-risk placements for small targets:
- Icon-only buttons in toolbars
- Checkbox and radio controls
- Inline text links
- Close and dismiss buttons on modals

---

## Text and typography

- Respect the system font-size setting (Dynamic Type on iOS, Font Scale on Android)
- Minimum body text: 16sp on Android, 17pt on iOS
- Line height at least 1.4x the font size for body copy
- No clipping, truncation, or layout breakage at 200% system font scale
- Test at the largest accessibility text size, not just the default

---

## Screen reader: VoiceOver (iOS) and TalkBack (Android)

- Every interactive element has an accessible label
- Custom components declare their role: button, toggle, slider, tab
- Decorative elements are hidden from screen readers
- Reading order matches the visual order
- State changes are announced: loading, complete, error, selected, expanded
- Grouped content is grouped accessibly. A card should be announced as one unit, not element by element
- After a modal or sheet opens, focus moves to it; after it closes, focus returns to the trigger

---

## Motion and animation

- Respect Reduce Motion (iOS) and the Animate setting (Android)
- Essential information is never carried by animation alone
- No content flashes more than 3 times per second, which is a seizure risk
- Auto-playing animations can be paused

---

## Colour and theming

- The screen works correctly in both light and dark mode if the app supports both
- System high-contrast mode is respected where applicable
- No information is communicated by colour alone. Covered by WCAG 1.4.1, but worth explicit on-device testing

---

## Input and keyboard

- Correct input type for every field: numeric for phone numbers and OTPs, email for email addresses, URL for web addresses
- Autofill attributes set correctly: username, password, one-time-code, phone, email
- Forms can be submitted with the keyboard return key where sensible
- Error states preserve valid input. Never clear the field on error

---

## Haptics and audio

- Critical actions have haptic confirmation
- Any audio cue that carries information has a visual equivalent for deaf and hard-of-hearing users

---

## Offline and degraded states

- Offline state is communicated explicitly, never silently failed
- Cached or stale content is marked as such
- Actions queue and sync when connectivity returns, rather than silently dropping

---

## One-handed and in-motion use

- Primary actions sit within comfortable thumb reach on a large device
- Destructive actions do not sit where a thumb naturally rests
- The screen is readable in bright outdoor light: contrast, weight, and size all matter more than in an office
- Critical information survives a glance, not a study

---

## Platform conventions

**iOS:**
- Left-edge swipe-back gesture works throughout the app
- System share sheet used for sharing actions
- Tab bar uses native patterns, not custom replacements that lose accessibility semantics

**Android:**
- Hardware and gesture back works predictably throughout the app
- Snackbars used for transient feedback, not blocking modals
- FAB placement follows Material spec
