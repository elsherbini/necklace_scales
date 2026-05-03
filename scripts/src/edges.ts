import { rotate, hammingDistance } from './bitmask.js';

/**
 * Compute all edges between absolute scales at Hamming distance 2 (one note swap).
 * Returns array of [bitmaskA, bitmaskB] pairs where A < B.
 */
export function computeScaleEdges(scales: number[]): [number, number][] {
  const scaleSet = new Set(scales);
  const edges: [number, number][] = [];
  const seen = new Set<string>();

  for (const scale of scales) {
    for (let off = 0; off < 12; off++) {
      if (!(scale & (1 << off))) continue;
      for (let on = 0; on < 12; on++) {
        if (scale & (1 << on)) continue;
        const neighbor = (scale ^ (1 << off)) | (1 << on);
        if (scaleSet.has(neighbor)) {
          const a = Math.min(scale, neighbor);
          const b = Math.max(scale, neighbor);
          const key = `${a}-${b}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([a, b]);
          }
        }
      }
    }
  }

  return edges;
}

/**
 * Compute necklace Hamming distance between two shapes (canonical bitmasks).
 */
export function necklaceDistance(a: number, b: number): number {
  let min = Infinity;
  for (let j = 0; j < 12; j++) {
    const dist = hammingDistance(a, rotate(b, j));
    if (dist < min) min = dist;
  }
  return min;
}

/**
 * Compute all edges between shapes at necklace Hamming distance 2.
 * Returns array of [canonicalA, canonicalB] pairs where A < B.
 */
export function computeShapeEdges(canonicals: number[]): [number, number][] {
  const edges: [number, number][] = [];

  for (let i = 0; i < canonicals.length; i++) {
    for (let j = i + 1; j < canonicals.length; j++) {
      if (necklaceDistance(canonicals[i], canonicals[j]) === 2) {
        edges.push([canonicals[i], canonicals[j]]);
      }
    }
  }

  return edges;
}
