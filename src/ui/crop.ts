import type { Capture } from '../shared/messages';
import type { Finding } from './api';

const PAD = 12;

/** The scale models actually answer boxes on, whatever units the prompt asks for. */
const BOX_SPACE = 1000;

/**
 * Gemini returns boxes on its own 0 to 1000 scale no matter what the prompt says,
 * so that is what the contract now asks every provider for. Convert once, here, and
 * everything downstream keeps reading plain image pixels.
 *
 * Safety net: a provider that answered in real pixels would run past 1000 on any
 * screen bigger than that, so take those as pixels already.
 */
export function toPixels(
  b: { x: number; y: number; w: number; h: number },
  imgW: number,
  imgH: number,
): { x: number; y: number; w: number; h: number } {
  if (Math.max(b.x + b.w, b.y + b.h) > BOX_SPACE) return b;
  return {
    x: (b.x / BOX_SPACE) * imgW,
    y: (b.y / BOX_SPACE) * imgH,
    w: (b.w / BOX_SPACE) * imgW,
    h: (b.h / BOX_SPACE) * imgH,
  };
}

/** node_id first, bbox second. Returns image-pixel coordinates. */
function rectFor(finding: Finding, capture: Capture): { rect: DOMRect | null; estimated: boolean } {
  if (finding.node_id) {
    const node = capture.nodes.find((n) => n.id === finding.node_id);
    if (node) {
      const s = capture.scale;
      return { rect: new DOMRect(node.x * s, node.y * s, node.w * s, node.h * s), estimated: false };
    }
  }
  if (finding.bbox) {
    const b = finding.bbox;
    return { rect: new DOMRect(b.x, b.y, b.w, b.h), estimated: true };
  }
  return { rect: null, estimated: false };
}

/**
 * One rectangle per finding, cropped out of the exported PNG. The same
 * rectangle is what gets drawn on the canvas, so the two always agree.
 */
export async function addCrops(findings: Finding[], capture: Capture): Promise<Finding[]> {
  const img = new Image();
  img.src = `data:image/png;base64,${capture.pngBase64}`;
  await img.decode();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return findings;

  return findings.map((raw) => {
    // Only an estimated box needs converting. A finding carrying a node_id is
    // resolved from the real layer tree and must not be touched.
    const finding =
      !raw.node_id && raw.bbox
        ? { ...raw, bbox: toPixels(raw.bbox, img.width, img.height) }
        : raw;

    const { rect, estimated } = rectFor(finding, capture);
    if (!rect) return { ...finding, estimated: false };

    const sx = Math.max(0, Math.round(rect.x - PAD));
    const sy = Math.max(0, Math.round(rect.y - PAD));
    const sw = Math.min(img.width - sx, Math.round(rect.width + PAD * 2));
    const sh = Math.min(img.height - sy, Math.round(rect.height + PAD * 2));
    if (sw <= 0 || sh <= 0) return { ...finding, estimated };

    canvas.width = sw;
    canvas.height = sh;
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    return { ...finding, crop: canvas.toDataURL('image/png'), estimated };
  });
}

/** Figma needs raw bytes, not a data URI. */
export function dataUriToBytes(uri: string): Uint8Array {
  const b64 = uri.slice(uri.indexOf(',') + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Pixel size of a crop, read back from its data URI. */
export async function cropSize(uri: string): Promise<{ w: number; h: number }> {
  const img = new Image();
  img.src = uri;
  await img.decode();
  return { w: img.naturalWidth, h: img.naturalHeight };
}
