/**
 * Longest consecutive run of set bits in a 12-bit cyclic bitmask.
 */
export function maxChromaticRun(bitmask: number): number {
  if (bitmask === 0) return 0;
  let max = 0;
  let run = 0;
  for (let i = 0; i < 24; i++) {
    if ((bitmask >> (i % 12)) & 1) {
      run++;
      if (run > max) max = run;
    } else {
      run = 0;
    }
  }
  return max;
}

/**
 * Longest consecutive run of unset bits in a 12-bit cyclic bitmask.
 */
export function maxOffRun(bitmask: number): number {
  if (bitmask === 0xFFF) return 0;
  return maxChromaticRun(~bitmask & 0xFFF);
}
