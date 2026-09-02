import type { RunRecord } from './stats';
import type { BoardData } from '../main/board';

// Payloads crossing the sandbox <-> iframe boundary. Imported by both sides.

export interface IndexedNode {
  id: string;
  name: string;
  type: string;
  /** Relative to the selection's top-left, in Figma units (not image pixels). */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
}

export interface Capture {
  pngBase64: string;
  /** Image pixels. Figma units multiplied by scale. */
  width: number;
  height: number;
  scale: number;
  nodes: IndexedNode[];
  screenName: string;
  /** True when the node cap trimmed the index. */
  truncated: boolean;
}

export interface CustomLens {
  id: string;
  name: string;
  text: string;
}

export type Settings = {
  accessCode: string;
  workerUrl: string;
  ownKey: string;
  provider: string;
  customLenses: CustomLens[];
};

export type MainToUI =
  | { type: 'ready'; settings: Settings; selection: SelectionInfo }
  | { type: 'selection-changed'; selection: SelectionInfo }
  | { type: 'capture'; capture: Capture }
  | { type: 'settings-saved' }
  | { type: 'annotated'; count: number; note?: string }
  | { type: 'runs'; runs: RunRecord[] }
  | { type: 'board-built'; total: number; shown: number; note?: string }
  | { type: 'error'; message: string };

export interface SelectionInfo {
  count: number;
  name: string | null;
  /** Exportable and has children worth indexing. */
  supported: boolean;
  /** A flat image or a node with no children: no layer data available. */
  flat: boolean;
}

export interface AnnotationInput {
  id: string;
  severity: number;
  headline: string;
  node_id: string;
  bbox?: { x: number; y: number; w: number; h: number };
}

export type UIToMain =
  | { type: 'ui-ready' }
  | { type: 'capture' }
  | { type: 'annotate'; findings: AnnotationInput[]; scale: number; replace?: boolean }
  | { type: 'board'; data: BoardData }
  | { type: 'save-settings'; settings: Partial<Settings> }
  | { type: 'record-run'; run: RunRecord }
  | { type: 'clear-runs' }
  | { type: 'close' };
