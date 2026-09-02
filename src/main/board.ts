import { LAYER_LABEL, severityOf, toRGB } from '../shared/severity';
import { placeRightOf } from './annotate';

export interface BoardFinding {
  id: string;
  layer: string;
  lens: string;
  ref: string;
  ref_meaning: string;
  headline: string;
  severity: number;
  element: string;
  observation: string;
  why_it_matters: string;
  recommendation: string;
  effort: string;
  also_touches: string[];
  tags: { key: string; value: string }[];
  estimated?: boolean;
  cropBytes?: Uint8Array;
  cropW?: number;
  cropH?: number;
}

export interface BoardData {
  screen_name: string;
  screen_type: string;
  platform: string;
  source: string;
  lenses_applied: string[];
  assumptions: string[];
  whats_working: string[];
  findings: BoardFinding[];
  prioritised: string[];
  open_questions: string[];
}

const WIDTH = 760;
const PAD = 40;
const GAP = 100;
const MAX_ON_BOARD = 40;
const BOARD_NAME = 'Scout report';

const INK = toRGB('#1E1E1E');
const MUTED = toRGB('#6B6B6B');
const LINE = toRGB('#E4E4E7');
const PAPER = toRGB('#FFFFFF');
const CANVAS = toRGB('#F4F4F5');

let REG: FontName = { family: 'Inter', style: 'Regular' };
let MED: FontName = { family: 'Inter', style: 'Medium' };
let BOLD: FontName = { family: 'Inter', style: 'Bold' };

async function loadFonts() {
  for (const family of ['Inter', 'Roboto', 'Helvetica']) {
    const reg = { family, style: 'Regular' };
    const med = { family, style: 'Medium' };
    const bold = { family, style: 'Bold' };
    try {
      await Promise.all([figma.loadFontAsync(reg), figma.loadFontAsync(med), figma.loadFontAsync(bold)]);
      REG = reg;
      MED = med;
      BOLD = bold;
      return;
    } catch {
      /* try the next family */
    }
  }
  throw new Error('No usable font is installed. Install Inter and try again.');
}

/**
 * Append, then set the child to fill. Figma only honours layoutSizing once the
 * node is inside an auto-layout parent, and only when that parent's counter
 * axis is FIXED. Getting this order wrong is what collapses text into a column
 * one character wide.
 */
function add<T extends SceneNode>(parent: FrameNode, child: T, fill = true): T {
  parent.appendChild(child);
  if (fill && 'layoutSizingHorizontal' in child) {
    try {
      (child as unknown as { layoutSizingHorizontal: string }).layoutSizingHorizontal = 'FILL';
    } catch {
      /* a parent that hugs cannot host a filling child; leave it hugging */
    }
  }
  return child;
}

/**
 * Vertical auto-layout that hugs its height and takes its width from the parent.
 *
 * resize() on an auto-layout frame flips BOTH sizing modes to FIXED, so it has to
 * happen before the modes are set. Doing it the other way round pins every
 * container to the height passed in, and the whole board collapses into a stack.
 */
function column(name: string, gap: number, padding = 0) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(WIDTH, 1);
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = gap;
  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = padding;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.layoutAlign = 'STRETCH';
  frame.fills = [];
  frame.clipsContent = false;
  return frame;
}

/** Horizontal auto-layout that hugs both axes, for chips and inline runs. */
function row(name: string, gap: number) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = 'HORIZONTAL';
  frame.itemSpacing = gap;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.counterAxisAlignItems = 'CENTER';
  frame.layoutWrap = 'WRAP';
  frame.fills = [];
  return frame;
}

function text(content: string, opts: { size?: number; font?: FontName; color?: RGB } = {}) {
  const node = figma.createText();
  node.fontName = opts.font ?? REG;
  node.fontSize = opts.size ?? 13;
  node.characters = content && content.trim() ? content : ' ';
  node.fills = [{ type: 'SOLID', color: opts.color ?? INK }];
  node.lineHeight = { unit: 'PERCENT', value: 150 };
  node.textAutoResize = 'HEIGHT';
  return node;
}

function chip(label: string, colour: RGB) {
  const frame = figma.createFrame();
  frame.name = 'chip';
  frame.layoutMode = 'HORIZONTAL';
  frame.paddingLeft = frame.paddingRight = 8;
  frame.paddingTop = frame.paddingBottom = 3;
  frame.cornerRadius = 10;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.fills = [{ type: 'SOLID', color: colour }];
  const label_ = text(label, { size: 11, font: MED, color: { r: 1, g: 1, b: 1 } });
  label_.textAutoResize = 'WIDTH_AND_HEIGHT';
  frame.appendChild(label_);
  return frame;
}

function section(parent: FrameNode, title: string, count?: number) {
  const wrap = add(parent, column(title, 14));
  const head = add(wrap, row('head', 8), false);
  head.layoutAlign = 'STRETCH';
  const t = text(title, { size: 18, font: BOLD });
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  head.appendChild(t);
  if (count !== undefined) {
    const c = text(String(count), { size: 13, color: MUTED });
    c.textAutoResize = 'WIDTH_AND_HEIGHT';
    head.appendChild(c);
  }
  return wrap;
}

function bullets(parent: FrameNode, items: string[], ordered: boolean) {
  const list = add(parent, column('list', 8));
  items.forEach((item, i) => {
    add(list, text(`${ordered ? `${i + 1}.` : '•'}  ${item}`));
  });
  return list;
}

function field(parent: FrameNode, label: string, value: string) {
  const wrap = add(parent, column(label, 2));
  add(wrap, text(label, { size: 11, font: MED, color: MUTED }));
  add(wrap, text(value, { size: 13 }));
  return wrap;
}

function card(parent: FrameNode, finding: BoardFinding, index: number) {
  const sev = severityOf(finding.severity);
  const frame = add(parent, column(`${index}. [Sev ${finding.severity}] ${finding.headline}`, 12, 20));
  frame.fills = [{ type: 'SOLID', color: PAPER }];
  frame.cornerRadius = 8;
  frame.strokes = [{ type: 'SOLID', color: LINE }];
  frame.strokeWeight = 1;

  const head = add(frame, row('head', 8), false);
  head.layoutAlign = 'STRETCH';
  head.appendChild(chip(String(index), toRGB(sev.hex)));
  head.appendChild(chip(`Sev ${finding.severity}`, toRGB(sev.hex)));
  const ref = text(finding.ref, { size: 12, color: MUTED });
  ref.textAutoResize = 'WIDTH_AND_HEIGHT';
  head.appendChild(ref);
  if (finding.estimated) {
    const est = text('estimated position', { size: 11, color: MUTED });
    est.textAutoResize = 'WIDTH_AND_HEIGHT';
    head.appendChild(est);
  }

  add(frame, text(finding.headline, { size: 16, font: BOLD }));
  add(frame, text(finding.ref_meaning, { size: 13, color: MUTED }));

  if (finding.cropBytes && finding.cropBytes.length > 0) {
    try {
      const image = figma.createImage(finding.cropBytes);
      const rect = figma.createRectangle();
      rect.name = 'crop';
      const srcW = Math.max(1, finding.cropW || 320);
      const srcH = Math.max(1, finding.cropH || 120);
      const w = Math.min(WIDTH - 2 * PAD - 44, srcW);
      const h = Math.min(420, Math.max(24, Math.round((srcH / srcW) * w)));
      rect.resize(w, h);
      rect.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FIT' }];
      rect.cornerRadius = 4;
      rect.strokes = [{ type: 'SOLID', color: LINE }];
      rect.strokeWeight = 1;
      // Fixed aspect: do not stretch this one to fill.
      add(frame, rect, false);
    } catch {
      /* a bad crop must not lose the finding */
    }
  }

  field(frame, 'Element', finding.element);
  field(frame, 'What was seen', finding.observation);
  field(frame, 'Why it matters', finding.why_it_matters);
  field(frame, 'Fix', finding.recommendation);
  field(frame, 'Effort', finding.effort === 'S' ? 'Hours' : finding.effort === 'M' ? 'Days' : 'Weeks');
  if (finding.also_touches.length > 0) field(frame, 'Also touches', finding.also_touches.join('\n'));
  if (finding.tags.length > 0) {
    field(frame, 'Tags', finding.tags.map((t) => `${t.key}: ${t.value}`).join(', '));
  }
  return frame;
}

export async function buildBoard(data: BoardData): Promise<{ total: number; shown: number }> {
  await loadFonts();

  const anchor = figma.currentPage.selection[0] ?? figma.currentPage.children[0];
  const box = anchor && 'absoluteBoundingBox' in anchor ? anchor.absoluteBoundingBox : null;

  const board = figma.createFrame();
  board.name = `${BOARD_NAME}: ${data.screen_name || 'screen'} ${new Date().toTimeString().slice(0, 5)}`;
  // Width first, sizing modes second. See the note on column().
  board.resize(WIDTH, 100);
  board.layoutMode = 'VERTICAL';
  board.itemSpacing = 32;
  board.paddingTop = board.paddingBottom = board.paddingLeft = board.paddingRight = PAD;
  board.primaryAxisSizingMode = 'AUTO';
  board.counterAxisSizingMode = 'FIXED';
  board.fills = [{ type: 'SOLID', color: CANVAS }];
  board.cornerRadius = 12;
  board.clipsContent = false;
  // Must be on the page before children can size against it.
  figma.currentPage.appendChild(board);

  const header = add(board, column('header', 6));
  add(header, text(data.screen_name || 'Screen evaluation', { size: 28, font: BOLD }));
  const meta = [data.screen_type, data.platform, data.source, ...data.lenses_applied].filter(Boolean).join('   ');
  add(header, text(meta, { size: 12, color: MUTED }));

  const counts = [4, 3, 2, 1].map((level) => ({
    level,
    n: data.findings.filter((f) => f.severity === level).length,
  }));
  const summary = add(board, row('summary', 8), false);
  summary.layoutAlign = 'STRETCH';
  let any = false;
  for (const { level, n } of counts) {
    if (n === 0) continue;
    any = true;
    summary.appendChild(chip(`${n} x Sev ${level}`, toRGB(severityOf(level).hex)));
  }
  if (!any) summary.remove();

  if (data.assumptions.length > 0) bullets(section(board, 'Assumptions'), data.assumptions, false);
  if (data.whats_working.length > 0) bullets(section(board, "What's working"), data.whats_working, false);

  // Grouped by layer, severity descending inside each. The locked format.
  const order = ['nielsen', 'wcag', 'platform', 'lens'];
  let shown = 0;
  for (const layer of order) {
    const group = data.findings.filter((f) => f.layer === layer).sort((a, b) => b.severity - a.severity);
    if (group.length === 0) continue;
    const heading = layer === 'lens' && group[0].lens ? group[0].lens : LAYER_LABEL[layer] ?? layer;
    const s = section(board, heading, group.length);
    for (const finding of group) {
      if (shown >= MAX_ON_BOARD) break;
      shown += 1;
      card(s, finding, data.findings.indexOf(finding) + 1);
    }
  }

  if (shown < data.findings.length) {
    add(board, text(`${data.findings.length - shown} more findings are in the plugin panel.`, { size: 12, color: MUTED }));
  }

  if (data.prioritised.length > 0) bullets(section(board, 'Fix these first'), data.prioritised, true);
  if (data.open_questions.length > 0) bullets(section(board, 'Open questions'), data.open_questions, true);

  // Boards stack to the right, so every run is kept and comparable.
  if (box) {
    board.x = placeRightOf(box, GAP);
    board.y = box.y;
  }
  return { total: data.findings.length, shown };
}
