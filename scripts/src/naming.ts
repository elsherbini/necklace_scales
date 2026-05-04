import { ScaleType, ChordType, Interval } from 'tonal';
import { pitchClassesFromBitmask } from './bitmask.js';
import { customChords, customScales } from './custom-scales.js';

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface ScaleName {
  root: string;
  name: string;
}

/**
 * Register custom chord/scale types with tonal.
 */
export function registerCustomScales(): void {
  for (const chord of customChords) {
    ChordType.add(chord.intervals, chord.aliases, chord.name);
  }

  for (const scale of customScales) {
    ScaleType.add(scale.intervals, scale.name, scale.aliases);
  }
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
