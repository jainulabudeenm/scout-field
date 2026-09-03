# Figma Community listing copy

Paste these into the publish form. Written 3 Sep 2026 for milestone P2.

## Name

```
Scout
```

## Tagline

56 characters. Limit is 100.

```
Heuristic and accessibility review, drawn on your canvas
```

Alternative, plainer, if "heuristic" feels like jargon for the audience:

```
Reviews your screen and marks every problem on the canvas
```

The first one is better for search. "Heuristic evaluation" is the term designers type.

## Description

```
Select a frame. Press one button. Scout evaluates the screen and draws the
findings on your canvas, next to the design, numbered and boxed on the
element each one is about.

WHAT IT CHECKS

Three layers, every run:

- Nielsen's 10 usability heuristics
- WCAG 2.1 AA accessibility
- Platform guidelines: Apple HIG, Material 3, or web, picked from your screen

You can add a fourth layer: a lens carrying your own product's principles.
Four starting points ship with it, for e-commerce, banking, delivery and
booking apps. Edit one, or write your own. A lens adds findings the general
layers cannot see, and raises the severity of ones that matter more in your
product, always with a stated reason.

WHAT YOU GET BACK

- A copy of your frame with a numbered box on each finding. Your original
  is never touched.
- A report in the panel: a headline, a severity from 0 to 4, what to do
  about it, and a crop of the element.
- A report board built as a Figma frame, so you can share the result
  without sharing the plugin.
- Export as rich text, markdown or JSON.

The boxes land accurately because the model never guesses coordinates. It
names a Figma layer, and the plugin looks up that layer's real position.

BUILT TO BE READ BY EVERYONE

Every finding explains the rule it cites in plain words. A product manager
or a researcher can act on the report without knowing what Nielsen H4 is.
That is a design constraint, not a footnote.

BEFORE YOU START

Scout runs on your own API key, so nobody else pays for your evaluations.
A free Google Gemini key takes about a minute at aistudio.google.com/apikey.
The key is stored on your computer and sent only to the model you choose.

One evaluation takes 90 to 160 seconds.

A note worth reading: Google's free tier may use what you send to improve
their products. For confidential work, use a paid key or switch to Claude
in Settings.
```

## Category

**Pick `Accessibility`.**

It is accurate (WCAG 2.1 AA is one of the three layers), it is specific, and it is a smaller
category than the general ones, so the listing is easier to find. The people browsing it are
exactly the audience.

If the form does not offer it, in order of preference: `Design tools`, `Productivity`,
`Utilities`.

Avoid `AI` even if offered. It is crowded, and it describes how Scout is built rather than what
it does for the reader.

## Support contact

Decide before publishing. Options: a GitHub issues link, or an email you are
willing to put in public. A plugin with no route for bug reports gets one-star
reviews instead of bug reports.

---

## Two lines to keep honest

**Do not claim it finds everything.** It is an evaluation, not a certification. If the copy
implies WCAG compliance, somebody will quote it in an audit.

**Say the key requirement in the first screen of the description.** Somebody who installs it
expecting a free tool and hits a key request will leave a bad review, and they will be right
to. It is stated above, in its own section.
