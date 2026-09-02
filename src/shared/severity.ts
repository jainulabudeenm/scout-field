// One source of truth for the 0-4 scale. Used by the panel, the canvas boxes,
// and the report board.

export const SEVERITY = [
  { level: 0, label: 'Not a problem', hex: '#8E8C99', draw: false },
  { level: 1, label: 'Cosmetic', hex: '#8E8C99', draw: true },
  { level: 2, label: 'Minor', hex: '#FFB224', draw: true },
  { level: 3, label: 'Major', hex: '#F76B15', draw: true },
  { level: 4, label: 'Catastrophic', hex: '#E5484D', draw: true },
] as const;

export const severityOf = (level: number) => SEVERITY[Math.max(0, Math.min(4, Math.round(level)))];

/** Figma wants 0-1 floats, not hex. */
export function toRGB(hex: string): RGB {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

export const LAYER_LABEL: Record<string, string> = {
  nielsen: "Nielsen's 10 Heuristics",
  wcag: 'WCAG 2.1 AA',
  platform: 'Platform Guidelines',
  lens: 'Lens',
};
