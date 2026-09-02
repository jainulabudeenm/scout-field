# Web Platform Accessibility

Load this alongside `core/wcag-aa.md` for any web screen. WCAG covers the standard; this file covers what browsers, keyboards, and pointer devices add on top.

---

## Keyboard operation

Everything that works with a mouse must work with a keyboard alone. This is the single highest-value web accessibility check.

- Every interactive element is reachable by Tab
- Tab order follows the visual order
- Enter and Space activate buttons; Enter activates links
- Escape closes modals, popovers, and menus
- Arrow keys move within composite widgets: menus, tabs, listboxes, radio groups
- Nothing traps focus except a modal, which must trap it deliberately and release it on close
- Custom controls built from div or span have `tabindex`, a role, and key handlers, or they are not keyboard operable at all

---

## Focus visibility and focus management

- A visible focus indicator on every focusable element, at minimum 3:1 contrast against the adjacent background
- `outline: none` without a replacement is a failure, not a style choice
- Opening a modal moves focus into it; closing it returns focus to the trigger
- Route changes in a single-page app move focus to the new page heading, and announce the change
- Deleting a row or item moves focus somewhere sensible, not to the top of the document

---

## Semantic structure and landmarks

- One `<h1>` per page, with heading levels descending without skipping
- Landmarks present: `header`, `nav`, `main`, `footer`, and `aside` where relevant
- A skip link to main content as the first focusable element
- Lists marked as lists, tables marked as tables with `<th>` and scope
- Buttons are `<button>`, links are `<a href>`. A link that acts as a button breaks keyboard expectations, and the reverse breaks browser navigation

---

## Forms

- Every input has a `<label>` with a `for` that matches the input `id`, or an equivalent accessible name
- Placeholder is never the only label
- Required fields are marked in text, not by colour or an asterisk alone
- Errors are associated with their field via `aria-describedby`
- An error summary at the top links to each failing field
- Related controls are grouped in a `fieldset` with a `legend`
- Autocomplete attributes set on personal-data fields

---

## Zoom and reflow

- Content reflows to a 320 CSS pixel width with no horizontal scrolling (WCAG 1.4.10)
- Text remains readable and functional at 200% browser zoom
- Text spacing can be overridden by the user without loss of content (WCAG 1.4.12)
- Fixed headers and footers do not consume the viewport at high zoom

---

## Dynamic content

- Content that updates without a page load is announced with an appropriate live region
- `aria-live="polite"` for status; `assertive` only for genuine interruptions
- Loading states are announced, not just spun
- Infinite scroll has a keyboard-reachable alternative, and does not strand the footer

---

## Motion and preferences

- `prefers-reduced-motion` is respected: parallax, autoplay, and large transitions are reduced or removed
- `prefers-color-scheme` is respected if the product offers themes
- Auto-playing video or carousels have a visible pause control

---

## Pointer and target size

- Click targets at least 24x24 CSS pixels (WCAG 2.5.8 AA), and 44x44 where the interface is also used on touch
- Hover-only interactions have a keyboard and touch equivalent
- Content revealed on hover is dismissible, hoverable, and persistent (WCAG 1.4.13)
- Drag-based interactions have a single-pointer alternative (WCAG 2.5.7)

---

## Page-level essentials

- A unique, descriptive `<title>` per page, most specific part first
- `lang` set on the `<html>` element
- Links make sense out of context. "Read more" repeated ten times is a failure
- No content relies on a specific browser feature with no fallback
