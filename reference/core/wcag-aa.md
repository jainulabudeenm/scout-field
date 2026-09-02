# WCAG 2.1 AA

The international accessibility standard published by the W3C. Version 2.1 (2018) added criteria that matter on touch devices. Level AA is the working standard: the floor for legal compliance in most jurisdictions and the target for professional development on any platform.

Organised under four principles: Perceivable, Operable, Understandable, Robust.

This file is platform-neutral. Platform-specific accessibility lives in `platform/mobile-a11y.md` and `platform/web-a11y.md`.

**Every finding citing a criterion must carry a one-line plain-language definition of it.** A reader who does not know WCAG must still be able to follow the finding.

---

## 1. Perceivable

### 1.1 Text alternatives
- Every non-text element that conveys meaning has an accessible label
- Decorative images are marked decorative so screen readers skip them
- Icons acting as buttons have a label matching their function

*Plain definition: anything that is not text and carries meaning needs a text description for people who cannot see it.*

### 1.3 Adaptable
- Screen reader reading order matches visual reading order
- Form fields are programmatically associated with their labels
- Headings are declared as headings, not just styled text
- Content works in both orientations unless one is essential

*Plain definition: the structure the eye sees must also exist in code, so assistive technology reads it the same way.*

### 1.4 Distinguishable

**Colour contrast, text:**
- Body text: minimum 4.5:1 against its background
- Large text (18pt regular or 14pt bold and above): minimum 3:1
- Text over images: contrast must hold at every point the text overlaps

**Colour contrast, non-text:**
- Component borders, icons, and graphical elements: minimum 3:1 against adjacent colours
- Focus indicators: minimum 3:1

**Colour is never the only signal:**
- Any information carried by colour must also be carried by text, icon, or pattern
- Error states, status indicators, and required fields cannot rely on colour alone

**Resizing:**
- Text stays readable and functional at 200% zoom
- Content reflows at narrow widths without horizontal scrolling

*Plain definition: text and controls must be easy to tell apart from their background, and colour alone must never be the only way something is communicated.*

---

## 2. Operable

### 2.2 Enough time
- Time limits can be extended, turned off, or the user is warned before expiry with time to extend
- Auto-advancing carousels or banners can be paused

*Plain definition: people work at different speeds, so time limits must be adjustable or avoidable.*

### 2.4 Navigable
- Every screen or page has a clear, descriptive title
- Focus order follows a logical sequence
- Focus indicator is visible, not removed without a replacement
- Link and button purpose is clear from the label alone, not from surrounding context

*Plain definition: people must be able to find their way around and always know where they are.*

### 2.5 Input modalities
- **Target size: minimum 44x44 dp/pt (WCAG 2.5.5).** A hard floor, not a target.
- Gesture-only interactions have a non-gesture alternative
- Destructive actions require confirmation or are reversible
- Visible label text matches or is contained in the accessible name

*Plain definition: controls must be big enough to hit and usable without requiring a specific gesture or input device.*

---

## 3. Understandable

### 3.1 Readable
- The language of the content is declared programmatically
- Abbreviations are expanded or explained on first use
- Reading level is appropriate for the intended audience

*Plain definition: the words must be understandable by the people actually using the product.*

### 3.2 Predictable
- Focus moving to an element does not cause an unexpected context change
- Selecting from a dropdown or toggle does not auto-submit without warning
- Navigation and labelling are consistent across the product
- Components that do the same thing look and behave the same way everywhere

*Plain definition: nothing should change unexpectedly just because the user moved focus or made a selection.*

### 3.3 Input assistance
- Errors are identified in text, not only by colour or icon
- Labels or instructions are provided before input is required
- Where possible, suggest a correction
- Legal or financial operations are reversible, checkable, or confirmable

*Plain definition: the product should help people get input right, and explain clearly when they get it wrong.*

---

## 4. Robust

### 4.1 Compatible
- Standard platform controls used wherever possible
- Custom components declare their role, name, and state to assistive technology
- Status messages are announced by screen readers without requiring focus

*Plain definition: the product must work correctly with screen readers and other assistive technology, not just with a mouse and eyes.*

---

# Most frequent AA failures

Check these first. They account for the majority of real violations found in audits.

1. Grey text below 4.5:1 contrast. The single most common failure on any platform.
2. Icons without accessible labels, especially icon-only buttons.
3. Placeholder text used as the only field label. It disappears on focus.
4. Colour-only status indicators: red and green with no text or icon.
5. Focus indicator removed for aesthetic reasons with nothing replacing it.
6. Custom controls that do not announce their state.
7. Status messages and toasts not announced to screen readers.
8. Targets below 44dp, especially icon-only and inline controls.
9. Layout breaking or text clipping at 200% zoom or largest text size.
10. Modals that trap focus and do not restore it on dismiss.
