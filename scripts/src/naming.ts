import { ScaleType, ChordType, Interval } from 'tonal';
import { pitchClassesFromBitmask } from './bitmask.js';

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface ScaleName {
  root: string;
  name: string;
}

/**
 * Register Barry Harris scales with tonal's ScaleType.
 */
export function registerBarryHarrisScales(): void {
  // Maj6 diminished: C D E F G Ab A B
  // Semitones from root: 0,2,4,5,7,8,9,11
  ScaleType.add(
    ['1P', '2M', '3M', '4P', '5P', '5A', '6M', '7M'],
    'major sixth diminished',
    ['maj6 diminished']
  );

  // Min6 diminished: C D Eb F G Ab A B
  // Semitones from root: 0,2,3,5,7,8,9,11
  ScaleType.add(
    ['1P', '2M', '3m', '4P', '5P', '5A', '6M', '7M'],
    'minor sixth diminished',
    ['min6 diminished']
  );

  // Dom7 diminished: C D E F G Ab Bb B
  // Semitones from root: 0,2,4,5,7,8,10,11
  ScaleType.add(
    ['1P', '2M', '3M', '4P', '5P', '5A', '7m', '7M'],
    'dominant seventh diminished',
    ['dom7 diminished']
  );

  // Dom7b5 diminished: C D E F Gb Ab Bb B
  // Semitones from root: 0,2,4,5,6,8,10,11
  ScaleType.add(
    ['1P', '2M', '3M', '4P', '4A', '5A', '7m', '7M'],
    'dominant seventh flat five diminished',
    ['dom7b5 diminished']
  );
}

/**
 * Convert a scale type's intervals to semitone offsets from root.
 */
function intervalsToSemitones(intervals: string[]): number[] {
  return intervals.map(i => Interval.get(i).semitones ?? 0);
}

/**
 * Get all scale/chord names for an absolute scale (bitmask).
 * Checks both ScaleType and ChordType registries for matches.
 */
export function getScaleNames(bitmask: number): ScaleName[] {
  const targetPcs = pitchClassesFromBitmask(bitmask);
  const targetSet = new Set(targetPcs);
  const names: ScaleName[] = [];
  const seen = new Set<string>();

  // Collect all type registries (scales and chords)
  const allTypes: { intervals: string[]; name: string; aliases?: string[] }[] = [
    ...ScaleType.all(),
    ...ChordType.all(),
  ];

  for (const type of allTypes) {
    if (!type.intervals || type.intervals.length === 0) continue;

    const semitones = intervalsToSemitones(type.intervals);

    // Skip if cardinality doesn't match
    if (semitones.length !== targetPcs.length) continue;

    // Use name, or first alias if name is empty
    const displayName = type.name || (type.aliases && type.aliases[0]) || '';
    if (!displayName) continue;

    // Try each pitch class as root
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      if (!targetSet.has(rootPc)) continue;

      const pcs = new Set(semitones.map(s => (rootPc + s) % 12));

      if (pcs.size === targetSet.size) {
        let match = true;
        for (const pc of targetSet) {
          if (!pcs.has(pc)) {
            match = false;
            break;
          }
        }

        if (match) {
          const rootName = NOTE_NAMES[rootPc];
          const key = `${rootName}:${displayName}`;
          if (!seen.has(key)) {
            seen.add(key);
            names.push({ root: rootName, name: displayName });
          }
        }
      }
    }
  }

  return names;
}
