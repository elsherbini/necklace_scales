import { describe, it, expect } from 'vitest';
import { enumerateScales, groupByShape } from '../src/enumerate.js';

describe('enumerateScales', () => {
  it('returns C(12,2) = 66 scales for k=2', () => {
    expect(enumerateScales(2)).toHaveLength(66);
  });

  it('returns C(12,7) = 792 scales for k=7', () => {
    expect(enumerateScales(7)).toHaveLength(792);
  });

  it('each scale has exactly k bits set', () => {
    const scales = enumerateScales(3);
    for (const s of scales) {
      let count = 0;
      let n = s;
      while (n) { count += n & 1; n >>= 1; }
      expect(count).toBe(3);
    }
  });

  it('all scales are unique', () => {
    const scales = enumerateScales(5);
    expect(new Set(scales).size).toBe(scales.length);
  });

  it('all scales fit in 12 bits', () => {
    const scales = enumerateScales(8);
    for (const s of scales) {
      expect(s).toBeLessThan(0x1000);
      expect(s).toBeGreaterThan(0);
    }
  });
});

describe('groupByShape', () => {
  it('produces 6 shapes for k=2', () => {
    const scales = enumerateScales(2);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(6);
  });

  it('produces 19 shapes for k=3', () => {
    const scales = enumerateScales(3);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(19);
  });

  it('produces 43 shapes for k=4', () => {
    const scales = enumerateScales(4);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(43);
  });

  it('produces 66 shapes for k=5', () => {
    const scales = enumerateScales(5);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(66);
  });

  it('produces 80 shapes for k=6', () => {
    const scales = enumerateScales(6);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(80);
  });

  it('produces 66 shapes for k=7', () => {
    const scales = enumerateScales(7);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(66);
  });

  it('produces 43 shapes for k=8', () => {
    const scales = enumerateScales(8);
    const shapes = groupByShape(scales);
    expect(shapes.size).toBe(43);
  });

  it('each shape key is the canonical bitmask', () => {
    const scales = enumerateScales(4);
    const shapes = groupByShape(scales);
    for (const [key, members] of shapes) {
      for (const member of members) {
        let min = member;
        for (let j = 1; j < 12; j++) {
          const rotated = ((member << j) | (member >> (12 - j))) & 0xFFF;
          if (rotated < min) min = rotated;
        }
        expect(min).toBe(key);
      }
    }
  });
});
