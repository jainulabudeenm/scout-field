import nielsen from '../../reference/core/nielsen-heuristics.md';
import wcag from '../../reference/core/wcag-aa.md';
import rubric from '../../reference/core/severity-rubric.md';
import discipline from '../../reference/core/eval-discipline.md';

import mobileA11y from '../../reference/platform/mobile-a11y.md';
import webA11y from '../../reference/platform/web-a11y.md';
import material3 from '../../reference/platform/material3.md';
import iosHig from '../../reference/platform/ios-hig.md';

import reportTemplate from '../../reference/output/report-template.md';
import findingContract from '../../reference/output/finding-contract.md';

export type Platform = 'android' | 'ios' | 'web';

// Generated from whatever lens files this checkout actually has.
export { LENS_CATALOGUE, type LensInfo } from './lenses.generated';
import { LENS_TEXT } from './lenses.generated';

export const BUILTIN_LENSES = LENS_TEXT;

const INTRO = `You are Scout, a heuristic and accessibility evaluator for product screens.

You produce findings that are specific, evidence-based, and actionable. Your audience is
designers, product managers, and user researchers. Assume the reader does not know the
frameworks by name, which is why every finding must carry a plain-language definition of
whatever it cites.

Run the layers in order. Be exhaustive within each. Never pad a clean layer.`;

const PLATFORM_FILES: Record<Platform, string[]> = {
  android: [mobileA11y, material3],
  ios: [mobileA11y, iosHig],
  web: [webA11y],
};

export interface SystemBlock {
  text: string;
  cache: boolean;
}

/**
 * Four cache breakpoints, most stable first. Anything after a changed byte is
 * invalidated, so ordering here is load-bearing.
 *   1 core        every user, every call
 *   2 platform    everyone on that platform
 *   3 lens        that user
 *   4 output      everything after it varies
 */
export function buildSystem(opts: { platform: Platform; lensText?: string }): SystemBlock[] {
  const blocks: SystemBlock[] = [
    { text: [INTRO, discipline, rubric, nielsen, wcag].join('\n\n---\n\n'), cache: true },
    { text: PLATFORM_FILES[opts.platform].join('\n\n---\n\n'), cache: true },
  ];

  if (opts.lensText) {
    blocks.push({ text: `# Active lens\n\n${opts.lensText}`, cache: true });
  }

  blocks.push({ text: [findingContract, reportTemplate].join('\n\n---\n\n'), cache: true });
  return blocks;
}

export const DETECT_SYSTEM: SystemBlock[] = [
  {
    text: `Identify a product screen from a single image. Return only what you can see.

platform: "android", "ios", or "web". Judge from status bar, navigation pattern,
component style, and aspect ratio. A tall narrow image with a mobile status bar is not web.

screen_type: entry, list, detail, form, confirmation, error, empty, modal, bottom sheet,
offline, or other.

screen_name: what a designer would call this screen. Short.

confidence: "high" when the platform is unmistakable, "low" when it is a guess.`,
    cache: true,
  },
];
