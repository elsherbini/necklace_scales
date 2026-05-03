import { canonical, popcount } from './bitmask.js';

/**
 * Enumerate all 12-bit bitmasks with exactly k bits set.
 */
export function enumerateScales(k: number): number[] {
  const results: number[] = [];
  const max = 0xFFF;
  for (let mask = 1; mask <= max; mask++) {
    if (popcount(mask) === k) {
      results.push(mask);
    }
  }
  return results;
}

/**
 * Group scales by their canonical form (shape).
 * Returns a Map from canonical bitmask to array of member scales.
 */
export function groupByShape(scales: number[]): Map<number, number[]> {
  const groups = new Map<number, number[]>();
  for (const scale of scales) {
    const canon = canonical(scale);
    const group = groups.get(canon);
    if (group) {
      group.push(scale);
    } else {
      groups.set(canon, [scale]);
    }
  }
  return groups;
}
