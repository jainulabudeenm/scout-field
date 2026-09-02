// Boxes arrive on a 0 to 1000 scale. Getting this wrong put every finding in the
// top third of the screen, so it gets a check.
import assert from 'node:assert/strict';
import { toPixels } from '../src/ui/crop.ts';

const IMG = { w: 780, h: 1688 };

// Halfway down a tall screen must stay halfway down after converting.
const mid = toPixels({ x: 0, y: 500, w: 1000, h: 10 }, IMG.w, IMG.h);
assert.equal(Math.round(mid.y), 844, 'y=500 should land at half the image height');
assert.equal(Math.round(mid.w), 780, 'w=1000 should span the full width');

// The bug: the real Cancel button sat at y=932 on the 0 to 1000 scale. Read as
// pixels it landed on blank space 55% up. Converted it lands near the bottom.
const cancel = toPixels({ x: 41, y: 932, w: 590, h: 54 }, IMG.w, IMG.h);
assert.ok(cancel.y > 1500, `Cancel button should sit near the bottom, got y=${cancel.y}`);

// Safety net: a provider that answered in real pixels overflows 1000, so leave it alone.
const pixels = { x: 40, y: 1500, w: 600, h: 90 };
assert.deepEqual(toPixels(pixels, IMG.w, IMG.h), pixels, 'real pixel boxes must pass through');

console.log('bbox conversion: 4 checks passed');
