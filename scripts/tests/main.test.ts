import { describe, it, expect, beforeAll } from 'vitest';
import { computeScaleLengthData } from '../src/main.js';
import { registerCustomScales } from '../src/naming.js';

beforeAll(() => {
  registerCustomScales();
});

describe('computeScaleLengthData', () => {
  it('produces correct structure for k=2', () => {
    const data = computeScaleLengthData(2);
    expect(data.k).toBe(2);
    expect(data.shapes).toHaveLength(6);
    expect(data.scales).toHaveLength(66);
    expect(data.shapeEdges.length).toBeGreaterThan(0);
    expect(data.scaleEdges).toHaveLength(660);
  });

  it('every scale references a valid shape index', () => {
    const data = computeScaleLengthData(3);
    for (const scale of data.scales) {
      expect(scale.shapeIndex).toBeGreaterThanOrEqual(0);
      expect(scale.shapeIndex).toBeLessThan(data.shapes.length);
    }
  });

  it('shape edges reference valid shape indices', () => {
    const data = computeScaleLengthData(3);
    for (const [a, b] of data.shapeEdges) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(data.shapes.length);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(data.shapes.length);
    }
  });

  it('scale edges reference valid scale indices', () => {
    const data = computeScaleLengthData(3);
    for (const [a, b] of data.scaleEdges) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(data.scales.length);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(data.scales.length);
    }
  });

  it('produces 43 shapes for k=4', () => {
    const data = computeScaleLengthData(4);
    expect(data.shapes).toHaveLength(43);
  });
});
