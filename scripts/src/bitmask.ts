/**
 * Rotate a 12-bit bitmask left by j semitones (transposition).
 */
export function rotate(bitmask: number, j: number): number {
  j = ((j % 12) + 12) % 12;
  return ((bitmask << j) | (bitmask >> (12 - j))) & 0xFFF;
}

/**
 * Return the canonical form: the smallest rotation of the bitmask.
 */
export function canonical(bitmask: number): number {
  let min = bitmask;
  for (let j = 1; j < 12; j++) {
    const rotated = rotate(bitmask, j);
    if (rotated < min) min = rotated;
  }
  return min;
}

/**
 * Count set bits in a 12-bit number.
 */
export function popcount(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

/**
 * Hamming distance: size of symmetric difference between two bitmasks.
 */
export function hammingDistance(a: number, b: number): number {
  return popcount(a ^ b);
}

/**
 * Complement: flip all 12 bits.
 */
export function complement(bitmask: number): number {
  return (~bitmask) & 0xFFF;
}

/**
 * Extract sorted array of pitch classes from a bitmask.
 */
export function pitchClassesFromBitmask(bitmask: number): number[] {
  const pcs: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (bitmask & (1 << i)) pcs.push(i);
  }
  return pcs;
}

/**
 * Create a bitmask from an array of pitch classes.
 */
export function bitmaskFromPitchClasses(pcs: number[]): number {
  let bitmask = 0;
  for (const pc of pcs) {
    bitmask |= 1 << pc;
  }
  return bitmask;
}
