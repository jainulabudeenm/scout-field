import type { Capture, IndexedNode, SelectionInfo } from '../shared/messages';

const MAX_NODES = 250;
const MAX_DEPTH = 12;
const MIN_SIZE = 8;
const MAX_TEXT = 100;
/** Re-export at 1x above this, so the request body stays sane. */
const MAX_BYTES = 4_000_000;

type Parent = SceneNode & ChildrenMixin;

const hasChildren = (n: SceneNode): n is Parent => 'children' in n;
const boxOf = (n: SceneNode) => ('absoluteBoundingBox' in n ? n.absoluteBoundingBox : null);

export function describeSelection(): SelectionInfo {
  const sel = figma.currentPage.selection;
  const node = sel[0];
  if (!node) return { count: 0, name: null, supported: false, flat: false };

  const exportable = 'exportAsync' in node && boxOf(node) !== null;
  const childCount = hasChildren(node) ? node.children.length : 0;
  return {
    count: sel.length,
    name: node.name,
    supported: exportable,
    flat: childCount === 0,
  };
}

/**
 * Flat index of the selection's descendants, breadth-first so the top-level
 * structure always survives the cap. Coordinates are relative to the selection
 * origin, which is what the model is told to reason in.
 */
export function buildNodeIndex(root: SceneNode): { nodes: IndexedNode[]; truncated: boolean } {
  const origin = boxOf(root);
  if (!origin || !hasChildren(root)) return { nodes: [], truncated: false };

  const nodes: IndexedNode[] = [];
  let queue: { node: SceneNode; depth: number }[] = root.children.map((node) => ({ node, depth: 0 }));
  let skipped = false;

  while (queue.length > 0) {
    const next: typeof queue = [];
    for (const { node, depth } of queue) {
      if (nodes.length >= MAX_NODES) {
        skipped = true;
        break;
      }
      if (!node.visible) continue;

      const box = boxOf(node);
      if (!box || box.width < MIN_SIZE || box.height < MIN_SIZE) continue;

      const entry: IndexedNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: Math.round(box.x - origin.x),
        y: Math.round(box.y - origin.y),
        w: Math.round(box.width),
        h: Math.round(box.height),
      };
      if (node.type === 'TEXT') {
        const chars = node.characters.replace(/\s+/g, ' ').trim();
        if (chars) entry.text = chars.length > MAX_TEXT ? `${chars.slice(0, MAX_TEXT)}…` : chars;
      }
      nodes.push(entry);

      if (depth + 1 < MAX_DEPTH && hasChildren(node)) {
        for (const child of node.children) next.push({ node: child, depth: depth + 1 });
      } else if (hasChildren(node) && node.children.length > 0) {
        skipped = true;
      }
    }
    if (nodes.length >= MAX_NODES) {
      skipped = skipped || next.length > 0;
      break;
    }
    queue = next;
  }

  return { nodes, truncated: skipped };
}

export async function capture(): Promise<Capture> {
  const node = figma.currentPage.selection[0];
  if (!node) throw new Error('Select a frame first.');
  if (!('exportAsync' in node)) throw new Error('That selection cannot be exported. Pick a frame, group, or image.');

  const box = boxOf(node);
  if (!box) throw new Error('That selection has no size on the canvas.');

  let scale = 2;
  let bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
  if (bytes.length > MAX_BYTES) {
    scale = 1;
    bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
  }

  const { nodes, truncated } = buildNodeIndex(node);

  return {
    pngBase64: figma.base64Encode(bytes),
    width: Math.round(box.width * scale),
    height: Math.round(box.height * scale),
    scale,
    nodes,
    screenName: node.name,
    truncated,
  };
}

/** Resolve a finding's node_id back to a rectangle in Figma units, relative to the selection. */
export async function resolveNode(id: string, root: SceneNode): Promise<{ x: number; y: number; w: number; h: number } | null> {
  const origin = boxOf(root);
  if (!origin) return null;
  const node = await figma.getNodeByIdAsync(id);
  if (!node || !('absoluteBoundingBox' in node)) return null;
  const box = (node as SceneNode & { absoluteBoundingBox: Rect | null }).absoluteBoundingBox;
  if (!box) return null;
  return { x: box.x - origin.x, y: box.y - origin.y, w: box.width, h: box.height };
}
