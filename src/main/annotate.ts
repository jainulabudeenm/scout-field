import { severityOf, toRGB } from '../shared/severity';

export interface AnnotationInput {
  id: string;
  severity: number;
  headline: string;
  node_id: string;
  bbox?: { x: number; y: number; w: number; h: number };
}

const GAP = 100;
const GROUP_NAME = 'Scout annotations';

/**
 * Every run leaves its output on the canvas, so a designer can compare passes.
 * Find a clear spot to the right of anything already sitting in this row.
 */
export function placeRightOf(box: Rect, gap: number): number {
  let x = box.x + box.width + gap;
  for (const node of figma.currentPage.children) {
    if (!('absoluteBoundingBox' in node)) continue;
    const b = (node as SceneNode).absoluteBoundingBox;
    if (!b) continue;
    // Only things in the same horizontal band can collide.
    if (b.y + b.height < box.y - 60 || b.y > box.y + box.height + 60) continue;
    if (b.x + b.width + gap > x) x = b.x + b.width + gap;
  }
  return x;
}

/** Rectangle in units relative to the original selection's top-left. */
async function rectFor(
  finding: AnnotationInput,
  origin: Rect,
  scale: number,
): Promise<{ x: number; y: number; w: number; h: number } | null> {
  if (finding.node_id) {
    const node = await figma.getNodeByIdAsync(finding.node_id);
    const box = node && 'absoluteBoundingBox' in node ? (node as SceneNode).absoluteBoundingBox : null;
    if (box) return { x: box.x - origin.x, y: box.y - origin.y, w: box.width, h: box.height };
  }
  // bbox arrives in image pixels, which are scale times the Figma units.
  if (finding.bbox) {
    const b = finding.bbox;
    return { x: b.x / scale, y: b.y / scale, w: b.w / scale, h: b.h / scale };
  }
  return null;
}

export async function annotate(findings: AnnotationInput[], scale: number, replace = false): Promise<number> {
  const source = figma.currentPage.selection[0];
  if (!source) throw new Error('Select the frame you evaluated, then try again.');
  const origin = 'absoluteBoundingBox' in source ? source.absoluteBoundingBox : null;
  if (!origin) throw new Error('That selection has no size on the canvas.');

  // Inter is not guaranteed to be installed. Fall back rather than throwing on stage.
  let badgeFont: FontName = { family: 'Inter', style: 'Bold' };
  try {
    await figma.loadFontAsync(badgeFont);
  } catch {
    badgeFont = { family: 'Roboto', style: 'Bold' };
    try {
      await figma.loadFontAsync(badgeFont);
    } catch {
      badgeFont = { family: 'Inter', style: 'Regular' };
      await figma.loadFontAsync(badgeFont);
    }
  }

  // Only Redraw replaces. A fresh run leaves every previous pass on the canvas.
  if (replace) {
    const groups = figma.currentPage.findChildren((n) => n.name.indexOf(GROUP_NAME) === 0);
    const clones = figma.currentPage.findChildren((n) => n.name.indexOf(`${source.name}, evaluated`) === 0);
    groups[groups.length - 1]?.remove();
    clones[clones.length - 1]?.remove();
  }

  const clone = source.clone();
  clone.name = `${source.name}, evaluated`;
  clone.x = placeRightOf(origin, GAP);
  clone.y = origin.y;

  const marks: SceneNode[] = [];
  let drawn = 0;

  for (const finding of findings) {
    const sev = severityOf(finding.severity);
    if (!sev.draw) continue;
    let rect: { x: number; y: number; w: number; h: number } | null = null;
    try {
      rect = await rectFor(finding, origin, scale);
    } catch {
      rect = null;
    }
    if (!rect || rect.w <= 0 || rect.h <= 0) continue;

    drawn += 1;
    const colour = toRGB(sev.hex);

    const box = figma.createRectangle();
    box.name = `${drawn}. [Sev ${finding.severity}] ${finding.headline}`;
    box.x = clone.x + rect.x;
    box.y = clone.y + rect.y;
    box.resize(Math.max(1, rect.w), Math.max(1, rect.h));
    box.fills = [];
    box.strokes = [{ type: 'SOLID', color: colour }];
    box.strokeWeight = 2;
    box.strokeAlign = 'OUTSIDE';
    box.cornerRadius = 2;
    marks.push(box);

    // Numbered badge, pinned to the top-left corner and nudged outside the box.
    const badge = figma.createEllipse();
    badge.name = `Marker ${drawn}`;
    badge.resize(20, 20);
    badge.x = box.x - 10;
    badge.y = box.y - 10;
    badge.fills = [{ type: 'SOLID', color: colour }];
    marks.push(badge);

    const label = figma.createText();
    label.fontName = badgeFont;
    label.fontSize = 11;
    label.characters = String(drawn);
    label.textAlignHorizontal = 'CENTER';
    label.textAlignVertical = 'CENTER';
    label.resize(20, 20);
    label.x = badge.x;
    label.y = badge.y;
    label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    marks.push(label);
  }

  if (marks.length > 0) {
    const group = figma.group(marks, figma.currentPage);
    const stamp = new Date().toTimeString().slice(0, 5);
    group.name = `${GROUP_NAME} ${stamp}`;
  }

  figma.currentPage.selection = [clone];
  figma.viewport.scrollAndZoomIntoView([source, clone]);
  return drawn;
}
