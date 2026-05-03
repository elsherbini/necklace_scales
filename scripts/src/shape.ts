import { rotate } from './bitmask.js';

/**
 * Compute the rotational symmetry order of a shape.
 * This is the number of rotations (0..11) that map the bitmask to itself.
 */
export function symmetryOrder(bitmask: number): number {
  let order = 0;
  for (let j = 0; j < 12; j++) {
    if (rotate(bitmask, j) === bitmask) {
      order++;
    }
  }
  return order;
}

/**
 * Return the distinct modes of a shape as rotation amounts from the canonical form.
 * Two rotations are "the same mode" if one maps to the other under the shape's symmetry.
 * Number of distinct modes = k / symmetryOrder.
 */
export function distinctModes(bitmask: number): number[] {
  const seen = new Set<number>();
  const modes: number[] = [];

  // Only consider rotations that bring a set member to position 0.
  // To bring note at position j to position 0, we rotate right by j,
  // which is equivalent to rotate(bitmask, 12 - j) for j > 0.
  for (let j = 0; j < 12; j++) {
    if (!(bitmask & (1 << j))) continue; // skip non-members

    const r = (12 - j) % 12;
    const rotated = rotate(bitmask, r);
    if (!seen.has(rotated)) {
      modes.push(r);
      // Mark all symmetry-equivalent rotations as seen
      for (let s = 0; s < 12; s++) {
        if (rotate(bitmask, s) === bitmask) {
          seen.add(rotate(rotated, s));
        }
      }
    }
  }

  return modes;
}

/**
 * Compute the display rotation of a bitmask.
 * Rules:
 * 1. Longest consecutive run of "on" bits starts at position 0
 * 2. Tie-break: longest consecutive run of "off" bits at the end (highest positions)
 * 3. Final tie-break: smallest bitmask value
 */
export function displayRotation(bitmask: number): number {
  if (bitmask === 0 || bitmask === 0xFFF) return bitmask;

  let bestRotated = bitmask;
  let bestScore = scoreRotation(bitmask);

  for (let j = 1; j < 12; j++) {
    const rotated = rotate(bitmask, j);
    const score = scoreRotation(rotated);
    if (compareScores(score, bestScore) < 0) {
      bestScore = score;
      bestRotated = rotated;
    }
  }

  return bestRotated;
}

type RotationScore = {
  onRunAtStart: number;
  longestOnRun: number;
  offRunAtEnd: number;
  value: number;
};

function scoreRotation(bitmask: number): RotationScore {
  // Length of consecutive on-bits starting at position 0
  let onRunAtStart = 0;
  for (let i = 0; i < 12; i++) {
    if (bitmask & (1 << i)) onRunAtStart++;
    else break;
  }

  // Find longest consecutive run of on-bits anywhere
  let longestOnRun = 0;
  let currentRun = 0;
  for (let i = 0; i < 12; i++) {
    if (bitmask & (1 << i)) {
      currentRun++;
      if (currentRun > longestOnRun) longestOnRun = currentRun;
    } else {
      currentRun = 0;
    }
  }

  // Length of consecutive off-bits ending at position 11
  let offRunAtEnd = 0;
  for (let i = 11; i >= 0; i--) {
    if (!(bitmask & (1 << i))) offRunAtEnd++;
    else break;
  }

  return { onRunAtStart, longestOnRun, offRunAtEnd, value: bitmask };
}

function compareScores(a: RotationScore, b: RotationScore): number {
  // Primary: the on-run at position 0 must equal the longest on-run
  // (i.e., we want the longest run to start at position 0)
  const aValid = a.onRunAtStart === a.longestOnRun;
  const bValid = b.onRunAtStart === b.longestOnRun;
  if (aValid && !bValid) return -1;
  if (!aValid && bValid) return 1;

  // Among valid rotations, prefer longer on-run at start
  if (a.onRunAtStart !== b.onRunAtStart) return b.onRunAtStart - a.onRunAtStart;

  // Tie-break: longer off-run at end
  if (a.offRunAtEnd !== b.offRunAtEnd) return b.offRunAtEnd - a.offRunAtEnd;

  // Final tie-break: smallest bitmask value
  return a.value - b.value;
}
