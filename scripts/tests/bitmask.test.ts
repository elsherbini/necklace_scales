import { describe, it, expect } from 'vitest';
import {
  rotate,
  canonical,
  popcount,
  hammingDistance,
  complement,
  pitchClassesFromBitmask,
  bitmaskFromPitchClasses,
} from '../src/bitmask.js';

describe('rotate', () => {
  it('rotates a bitmask left by j semitones', () => {
    // C major triad: {0,4,7} = 0b000010010001 = 145
    // Rotate by 1: {1,5,8} = 0b000100100010 = 290
    expect(rotate(0b000010010001, 1)).toBe(0b000100100010);
  });

  it('wraps around at 12 bits', () => {
    // {11} = 0b100000000000 = 2048
    // Rotate by 1: {0} = 0b000000000001 = 1
    expect(rotate(0b100000000000, 1)).toBe(0b000000000001);
  });

  it('rotate by 0 is identity', () => {
    expect(rotate(0b101010101010, 0)).toBe(0b101010101010);
  });

  it('rotate by 12 is identity', () => {
    expect(rotate(0b101010101010, 12)).toBe(0b101010101010);
  });
});

describe('canonical', () => {
  it('returns the smallest rotation of a bitmask', () => {
    // All rotations of C major triad should produce the same canonical form
    const cMajor = 0b000010010001; // {0,4,7}
    const dMajor = rotate(cMajor, 2); // {2,6,9}
    expect(canonical(cMajor)).toBe(canonical(dMajor));
  });

  it('canonical of a single note is always 1', () => {
    expect(canonical(0b000000000001)).toBe(0b000000000001);
    expect(canonical(0b000000100000)).toBe(0b000000000001);
    expect(canonical(0b100000000000)).toBe(0b000000000001);
  });

  it('canonical of chromatic scale is 0xFFF', () => {
    expect(canonical(0xFFF)).toBe(0xFFF);
  });
});

describe('popcount', () => {
  it('counts set bits', () => {
    expect(popcount(0b000010010001)).toBe(3); // C major triad
    expect(popcount(0xFFF)).toBe(12);
    expect(popcount(0)).toBe(0);
    expect(popcount(0b101010101010)).toBe(6); // whole tone
  });
});

describe('hammingDistance', () => {
  it('computes symmetric difference size between two bitmasks', () => {
    // One note different
    const a = 0b000010010001; // {0,4,7}
    const b = 0b000010010010; // {1,4,7}
    expect(hammingDistance(a, b)).toBe(2); // removed 0, added 1
  });

  it('identical scales have distance 0', () => {
    expect(hammingDistance(0b101, 0b101)).toBe(0);
  });
});

describe('complement', () => {
  it('flips all 12 bits', () => {
    expect(complement(0b000010010001)).toBe(0b111101101110);
  });

  it('complement of complement is identity', () => {
    const x = 0b101010101010;
    expect(complement(complement(x))).toBe(x);
  });

  it('complement of empty set is chromatic', () => {
    expect(complement(0)).toBe(0xFFF);
  });
});

describe('pitchClassesFromBitmask', () => {
  it('extracts pitch classes from bitmask', () => {
    expect(pitchClassesFromBitmask(0b000010010001)).toEqual([0, 4, 7]);
  });

  it('empty bitmask gives empty array', () => {
    expect(pitchClassesFromBitmask(0)).toEqual([]);
  });
});

describe('bitmaskFromPitchClasses', () => {
  it('creates bitmask from pitch class array', () => {
    expect(bitmaskFromPitchClasses([0, 4, 7])).toBe(0b000010010001);
  });

  it('order does not matter', () => {
    expect(bitmaskFromPitchClasses([7, 0, 4])).toBe(0b000010010001);
  });

  it('empty array gives 0', () => {
    expect(bitmaskFromPitchClasses([])).toBe(0);
  });
});
