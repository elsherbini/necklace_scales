/**
 * Custom scale and chord definitions registered with Tonal.js.
 *
 * Contributors: add new scales or chords by appending to the arrays below.
 * Each entry uses Tonal interval notation:
 *
 *   Semitone:  0    1    2    3    4    5    6    7    8    9    10   11
 *   Interval:  1P   2m   2M   3m   3M   4P   4A   5P   5A   6M   7m   7M
 *
 * Scales use ScaleType.add() — for sets of notes (modes, scales).
 * Chords use ChordType.add() — for named chord voicings/intervals.
 */

export interface CustomScaleEntry {
  /** Tonal interval names from the root */
  intervals: string[];
  /** Full display name */
  name: string;
  /** Short aliases for lookup */
  aliases: string[];
}

export interface CustomChordEntry {
  /** Tonal interval names from the root */
  intervals: string[];
  /** Full display name */
  name: string;
  /** Short aliases for lookup */
  aliases: string[];
}

/**
 * Custom chord types (dyads, voicings, etc.)
 */
export const customChords: CustomChordEntry[] = [
  // Dyad intervals and their inversions
  { intervals: ['1P', '2m'], name: 'minor second', aliases: ['m2'] },       // semitones: 0, 1
  { intervals: ['1P', '7M'], name: 'major seventh', aliases: ['M7'] },      // semitones: 0, 11
  { intervals: ['1P', '2M'], name: 'major second', aliases: ['M2'] },       // semitones: 0, 2
  { intervals: ['1P', '7m'], name: 'minor seventh', aliases: ['m7'] },      // semitones: 0, 10
  { intervals: ['1P', '3m'], name: 'minor third', aliases: ['m3'] },        // semitones: 0, 3
  { intervals: ['1P', '6M'], name: 'major sixth', aliases: ['M6'] },        // semitones: 0, 9
  { intervals: ['1P', '3M'], name: 'major third', aliases: ['M3'] },        // semitones: 0, 4
  { intervals: ['1P', '6m'], name: 'minor sixth', aliases: ['m6'] },        // semitones: 0, 8
  { intervals: ['1P', '4P'], name: 'perfect fourth', aliases: ['P4'] },     // semitones: 0, 5
  { intervals: ['1P', '4A'], name: 'tritone', aliases: ['TT'] },            // semitones: 0, 6
];

/**
 * Custom scale types (Barry Harris diminished scales, etc.)
 */
export const customScales: CustomScaleEntry[] = [
  {
    intervals: ['1P', '2M', '3M', '4P', '5P', '5A', '6M', '7M'], // semitones: 0, 2, 4, 5, 7, 8, 9, 11
    name: 'major sixth diminished',
    aliases: ['maj6 diminished'],
  },
  {
    intervals: ['1P', '2M', '3m', '4P', '5P', '5A', '6M', '7M'], // semitones: 0, 2, 3, 5, 7, 8, 9, 11
    name: 'minor sixth diminished',
    aliases: ['min6 diminished'],
  },
  {
    intervals: ['1P', '2M', '3M', '4P', '5P', '5A', '7m', '7M'], // semitones: 0, 2, 4, 5, 7, 8, 10, 11
    name: 'dominant seventh diminished',
    aliases: ['dom7 diminished'],
  },
  {
    intervals: ['1P', '2M', '3M', '4P', '4A', '5A', '7m', '7M'], // semitones: 0, 2, 4, 5, 6, 8, 10, 11
    name: 'dominant seventh flat five diminished',
    aliases: ['dom7b5 diminished'],
  },
  {
    intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7m', '7M'], // semitones: 0, 2, 3, 5, 7, 9, 10, 11
    name: 'dorian bebop',
    aliases: ['lydian bebop'],
  },
  {
    intervals: ['1P', '2m', '3m', '4P', '5P', '6m', '7m', '7M'], // semitones: 0, 1, 3, 5, 7, 8, 10, 11
    name: 'phrygian bebop',
    aliases: ['lydian dominant bebop'],
  },
];
