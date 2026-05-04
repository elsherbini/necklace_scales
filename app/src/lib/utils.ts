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

/**
 * Count of consecutive unset bits from bit 11 downward in a 12-bit bitmask.
 * For displayBitmasks (where the chromatic run starts at bit 0), this gives
 * the length of the off-note run at the end of the strip.
 */
export function trailingOffRun(bitmask: number): number {
  let count = 0;
  for (let i = 11; i >= 0; i--) {
    if ((bitmask >> i) & 1) break;
    count++;
  }
  return count;
}
