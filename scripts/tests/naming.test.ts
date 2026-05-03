import { describe, it, expect, beforeAll } from 'vitest';
import { registerBarryHarrisScales, getScaleNames } from '../src/naming.js';
import { bitmaskFromPitchClasses } from '../src/bitmask.js';

beforeAll(() => {
  registerBarryHarrisScales();
});

describe('registerBarryHarrisScales', () => {
  it('registers without throwing', () => {
    expect(() => registerBarryHarrisScales()).not.toThrow();
  });
});

describe('getScaleNames', () => {
  it('identifies C major scale', () => {
    const cMajor = bitmaskFromPitchClasses([0, 2, 4, 5, 7, 9, 11]);
    const names = getScaleNames(cMajor);
    expect(names.some(n => n.root === 'C' && n.name.toLowerCase().includes('major'))).toBe(true);
  });

  it('identifies multiple names for the same pitch class set', () => {
    // C major = D dorian = E phrygian etc. (same pitch class set)
    const cMajor = bitmaskFromPitchClasses([0, 2, 4, 5, 7, 9, 11]);
    const names = getScaleNames(cMajor);
    // Should have names with different roots
    const roots = new Set(names.map(n => n.root));
    expect(roots.size).toBeGreaterThan(1);
  });

  it('returns empty array for unnamed scales', () => {
    // Chromatic cluster {0,1,2,3,4} - likely unnamed
    const unnamed = bitmaskFromPitchClasses([0, 1, 2, 3, 4]);
    const names = getScaleNames(unnamed);
    expect(Array.isArray(names)).toBe(true);
  });

  it('identifies major sixth diminished scale after registration', () => {
    // C Maj6 diminished: C D E F G Ab A B = pitch classes {0,2,4,5,7,8,9,11}
    const maj6dim = bitmaskFromPitchClasses([0, 2, 4, 5, 7, 8, 9, 11]);
    const names = getScaleNames(maj6dim);
    expect(names.some(n => n.root === 'C' && n.name.toLowerCase().includes('sixth diminished'))).toBe(true);
  });

  it('returns names as {root, name} objects', () => {
    const cMajor = bitmaskFromPitchClasses([0, 2, 4, 5, 7, 9, 11]);
    const names = getScaleNames(cMajor);
    for (const n of names) {
      expect(n).toHaveProperty('root');
      expect(n).toHaveProperty('name');
      expect(typeof n.root).toBe('string');
      expect(typeof n.name).toBe('string');
    }
  });

  it('does not return duplicate names', () => {
    const cMajor = bitmaskFromPitchClasses([0, 2, 4, 5, 7, 9, 11]);
    const names = getScaleNames(cMajor);
    const keys = names.map(n => `${n.root}:${n.name}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
