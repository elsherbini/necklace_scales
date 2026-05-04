export interface ModeInfo {
  rotation: number;
  names: string[];
}

export interface ShapeData {
  canonical: number;
  symmetryOrder: number;
  modes: ModeInfo[];
  displayBitmask: number;
}

export interface ScaleData {
  bitmask: number;
  pitchClasses: number[];
  shapeIndex: number;
  rotation: number;
  names: { root: string; name: string }[];
}

export interface ScaleLengthData {
  k: number;
  shapes: ShapeData[];
  scales: ScaleData[];
  shapeEdges: [number, number][];
  scaleEdges: [number, number][];
}

export type ViewMode = 'shapes' | 'scales';
export type ColorScheme = 'bw' | 'metaharmony' | 'elements';
export type VisualizationMode = 'graph' | 'grid';
export type GlyphStyle = 'strip' | 'circle';
