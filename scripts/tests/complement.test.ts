import { describe, it, expect, beforeAll } from 'vitest';
import { computeScaleLengthData, deriveComplementData } from '../src/main.js';
import { registerCustomScales } from '../src/naming.js';
import { canonical, complement, popcount, rotate } from '../src/bitmask.js';

beforeAll(() => {
  registerCustomScales();
});

describe('deriveComplementData', () => {
  it('k=9 has the same number of shapes as k=3', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    expect(k9.shapes).toHaveLength(k3.shapes.length);
  });

  it('k=10 has the same number of shapes as k=2', () => {
    const k2 = computeScaleLengthData(2);
    const k10 = deriveComplementData(k2, 10);
    expect(k10.shapes).toHaveLength(k2.shapes.length);
  });

  it('sets k to the new value', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    expect(k9.k).toBe(9);
  });

  it('all scale bitmasks have exactly newK bits set', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (const scale of k9.scales) {
      expect(popcount(scale.bitmask)).toBe(9);
    }
  });

  it('scale bitmasks are complements of source bitmasks', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (let i = 0; i < k3.scales.length; i++) {
      expect(k9.scales[i].bitmask).toBe(complement(k3.scales[i].bitmask));
    }
  });

  it('shape canonical bitmasks are canonical forms of complemented source canonicals', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (let i = 0; i < k3.shapes.length; i++) {
      const expectedCanon = canonical(complement(k3.shapes[i].canonical));
      expect(k9.shapes[i].canonical).toBe(expectedCanon);
    }
  });

  it('preserves shape edges identically', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    expect(k9.shapeEdges).toEqual(k3.shapeEdges);
  });

  it('preserves scale edges identically', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    expect(k9.scaleEdges).toEqual(k3.scaleEdges);
  });

  it('preserves symmetry order for each shape', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (let i = 0; i < k3.shapes.length; i++) {
      expect(k9.shapes[i].symmetryOrder).toBe(k3.shapes[i].symmetryOrder);
    }
  });

  it('rotation correctly maps complement canonical to complement scale', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (const scale of k9.scales) {
      const shape = k9.shapes[scale.shapeIndex];
      expect(rotate(shape.canonical, scale.rotation)).toBe(scale.bitmask);
    }
  });

  it('pitchClasses match the complemented bitmask', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (const scale of k9.scales) {
      expect(scale.pitchClasses).toHaveLength(9);
      for (const pc of scale.pitchClasses) {
        expect(scale.bitmask & (1 << pc)).not.toBe(0);
      }
    }
  });

  it('number of modes per shape equals newK / symmetryOrder', () => {
    const k3 = computeScaleLengthData(3);
    const k9 = deriveComplementData(k3, 9);
    for (const shape of k9.shapes) {
      expect(shape.modes).toHaveLength(9 / shape.symmetryOrder);
    }
  });
});
