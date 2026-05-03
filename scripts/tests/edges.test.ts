import { describe, it, expect } from 'vitest';
import { computeScaleEdges, computeShapeEdges } from '../src/edges.js';
import { enumerateScales, groupByShape } from '../src/enumerate.js';

describe('computeScaleEdges', () => {
  it('every edge connects scales with Hamming distance exactly 2', () => {
    const scales = enumerateScales(2);
    const edges = computeScaleEdges(scales);
    for (const [a, b] of edges) {
      const xor = a ^ b;
      let bits = 0;
      let n = xor;
      while (n) { bits += n & 1; n >>= 1; }
      expect(bits).toBe(2);
    }
  });

  it('k=2 scales: each has 2*(12-2)=20 neighbors, total edges = 66*20/2 = 660', () => {
    const scales = enumerateScales(2);
    const edges = computeScaleEdges(scales);
    expect(edges).toHaveLength(660);
  });

  it('edges are undirected (no duplicate pairs)', () => {
    const scales = enumerateScales(3);
    const edges = computeScaleEdges(scales);
    const seen = new Set<string>();
    for (const [a, b] of edges) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('k=3 has 220*27/2 = 2970 edges', () => {
    const scales = enumerateScales(3);
    const edges = computeScaleEdges(scales);
    expect(edges).toHaveLength(2970);
  });
});

describe('computeShapeEdges', () => {
  it('connects shapes at necklace Hamming distance 2', () => {
    const scales = enumerateScales(3);
    const shapes = groupByShape(scales);
    const canonicals = [...shapes.keys()];
    const edges = computeShapeEdges(canonicals);

    for (const [a, b] of edges) {
      let minDist = Infinity;
      for (let j = 0; j < 12; j++) {
        const rotated = ((b << j) | (b >> (12 - j))) & 0xFFF;
        const xor = a ^ rotated;
        let bits = 0;
        let n = xor;
        while (n) { bits += n & 1; n >>= 1; }
        if (bits < minDist) minDist = bits;
      }
      expect(minDist).toBe(2);
    }
  });

  it('shape edges are undirected (no duplicates)', () => {
    const scales = enumerateScales(4);
    const shapes = groupByShape(scales);
    const canonicals = [...shapes.keys()];
    const edges = computeShapeEdges(canonicals);
    const seen = new Set<string>();
    for (const [a, b] of edges) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
