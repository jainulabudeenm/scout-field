# Figma Community listing art: image prompts

For milestone P1. Paste these into ChatGPT, Gemini or any image model.

Figma requires two files:

| Asset | Size |
|---|---|
| Plugin icon | 128 x 128 px |
| Cover art | 1920 x 960 px (2:1) |

## The style

A strict square grid where every tile is either a flat colour or an off-white tile
holding one monospace `0` or `1`. Flat, hard-edged, no anti-aliasing. Taken from reference
images Zain supplied on 3 Sep 2026: a mouth, a hand with a skull, and a magnifying glass,
all built the same way.

Keep the palette identical across both assets.

```
background   #1C1C1C   near-black
tiles        #F5F5F5   off-white
digits       #33DD33   bright phosphor green   (a few in #3355FF blue)
accent 1     #6BC8E8   sky cyan
accent 2     #E63DE6   hot magenta
accent 3     #7A1515   dark blood red, hatched with black diagonal stripes
outlines     #CC2222   red, on small empty squares scattered loose
```

---

## Prompt 1: the icon

```
Pixel mosaic illustration of a magnifying glass, built on a strict square
grid about 20 tiles wide. Every tile is the same size, hard-edged, with a
thin dark gap between tiles. Each tile is either a flat colour or an
off-white tile containing one monospace digit, 0 or 1, in bright green.

The circular lens is filled with flat hot magenta. The metal rim and the
handle are off-white tiles carrying green binary digits, with scattered
dark blood-red tiles hatched with black diagonal stripes. A few sky cyan
tiles sit along the rim. A handful of small red-outlined empty squares
float loose outside the shape, and three or four stray tiles drift away
from the main form.

Flat 2D, no anti-aliasing, no gradients, no shading, no perspective, no
3D. Chunky and low resolution, like an 8-bit sprite. Near-black background
#1C1C1C. Centred, with even margin on all sides.
```

**Negative prompt**

```
smooth edges, gradients, glow, 3D, bevel, drop shadow, photorealistic,
text, words, letters, logo type, watermark
```

### Alternative: an eye

An eye reads faster than a magnifying glass at 128px, because the shape is solid rather
than mostly outline. To try it, swap the first paragraph for:

```
Pixel mosaic illustration of a single wide-open eye, built on a strict
square grid about 20 tiles wide. The iris is flat hot magenta with one
sky cyan tile at its centre for the pupil.
```

Keep everything from the second paragraph down unchanged.

---

## Prompt 2: the cover

```
Wide banner, 2:1. Pixel mosaic illustration on a strict square grid, tiles
about 18px each, hard-edged with thin dark gaps.

On the left, a tall phone screen drawn as a mosaic in off-white tiles
carrying bright green monospace binary digits, with blocks of sky cyan and
a hot magenta band. On the right, the same phone repeated, but now three
bright red hollow rectangles are drawn over parts of it, each with a small
solid red numbered square at its top-left corner. A large magnifying glass
with a flat hot magenta lens overlaps the gap between the two phones.

Scattered dark blood-red tiles hatched with black diagonal stripes.
Loose stray tiles and small red-outlined empty squares drifting in the
empty space, more sparse toward the edges.

Flat 2D, no anti-aliasing, no gradients, no shading, no 3D. Near-black
background #1C1C1C. Generous empty space in the upper right.
```

**Negative prompt**

```
smooth edges, gradients, glow, 3D, bevel, drop shadow, photorealistic,
text, words, letters, logo type, watermark, busy background, clutter,
centered composition
```

The cover shows the product's actual claim: the same screen twice, the second one with
numbered boxes on it. That is what Scout does, so the picture does the explaining.

---

## Three practical notes

**Ask for no text.** Image models garble letters. Leave the upper right empty and type
"Scout" there yourself in Figma. It looks better and takes two minutes.

**Generate square, then crop.** Most models do 1:1 best. Ask for 1024 x 1024, place it in a
1920 x 960 Figma frame, and extend the background to fill.

**The icon must survive at 128px.** Ask for 20 tiles wide, not 40. If you cannot tell what
it is at thumbnail size, it has too much detail. Shrink it and squint before committing.

---

## Checklist before submitting

- [ ] Icon exported at exactly 128 x 128
- [ ] Cover exported at exactly 1920 x 960
- [ ] Both use the same palette
- [ ] Icon still readable shrunk to thumbnail size
- [ ] No garbled generated text anywhere in either image
- [ ] "Scout" set in real type, not generated
