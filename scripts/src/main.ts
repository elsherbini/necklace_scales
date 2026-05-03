import { rotate, canonical, pitchClassesFromBitmask, bitmaskFromPitchClasses } from './bitmask.js';
import { enumerateScales, groupByShape } from './enumerate.js';
import { symmetryOrder, distinctModes, displayRotation } from './shape.js';
import { computeScaleEdges, computeShapeEdges } from './edges.js';
import { registerBarryHarrisScales, getScaleNames } from './naming.js';
import type { ModeInfo, ShapeData, ScaleData, ScaleLengthData } from './types.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Determine the rotation r such that rotate(canon, r) === scale.
 */
function findRotation(canon: number, scale: number): number {
  for (let r = 0; r < 12; r++) {
    if (rotate(canon, r) === scale) return r;
  }
  return 0; // should never happen for valid inputs
}

/**
 * Compute all data for scales of length k.
 */
export function computeScaleLengthData(k: number): ScaleLengthData {
  // Step 1: Enumerate all scales and group by shape
  const allScales = enumerateScales(k);
  const shapeGroups = groupByShape(allScales);

  // Step 2: Sort canonical bitmasks numerically for deterministic output
  const canonicals = [...shapeGroups.keys()].sort((a, b) => a - b);

  // Step 3: Build a map from canonical bitmask to shape index
  const canonToIndex = new Map<number, number>();
  canonicals.forEach((c, i) => canonToIndex.set(c, i));

  // Step 4: Build shapes array
  const shapes: ShapeData[] = canonicals.map(canon => {
    const modes = distinctModes(canon);
    return {
      canonical: canon,
      symmetryOrder: symmetryOrder(canon),
      modes: modes.map(r => ({ rotation: r, names: [] as string[] })),
      displayBitmask: displayRotation(canon),
    };
  });

  // Step 5: Build scales array sorted by bitmask
  const allScalesSorted = [...allScales].sort((a, b) => a - b);
  const scales: ScaleData[] = allScalesSorted.map(bitmask => {
    const canon = canonical(bitmask);
    const shapeIndex = canonToIndex.get(canon)!;
    const rotation = findRotation(canon, bitmask);
    const names = getScaleNames(bitmask);
    return {
      bitmask,
      pitchClasses: pitchClassesFromBitmask(bitmask),
      shapeIndex,
      rotation,
      names,
    };
  });

  // Step 6: Fill in shape mode names from scale names
  // Mode names are root-independent (just the quality/type name).
  // For each mode, collect the unique type names from all transpositions of that specific mode.
  for (const shape of shapes) {
    for (const mode of shape.modes) {
      const nameSet = new Set<string>();
      const modeBitmask = rotate(shape.canonical, mode.rotation);
      // Check all 12 transpositions of this mode's bitmask
      for (let t = 0; t < 12; t++) {
        const transposed = rotate(modeBitmask, t);
        const scaleEntry = scales.find(s => s.bitmask === transposed);
        if (scaleEntry) {
          for (const n of scaleEntry.names) {
            // The mode bitmask always has bit 0 set (root at position 0).
            // After transposing by t, the root moves to pitch class t.
            const rootName = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][t];
            if (n.root === rootName) {
              nameSet.add(n.name);
            }
          }
        }
      }
      mode.names = [...nameSet];
    }
  }

  // Step 7: Build a bitmask-to-index map for scales
  const bitmaskToScaleIndex = new Map<number, number>();
  scales.forEach((s, i) => bitmaskToScaleIndex.set(s.bitmask, i));

  // Step 8: Compute scale edges and convert to index pairs
  const scaleEdgeBitmasks = computeScaleEdges(allScales);
  const scaleEdges: [number, number][] = scaleEdgeBitmasks.map(([a, b]) => [
    bitmaskToScaleIndex.get(a)!,
    bitmaskToScaleIndex.get(b)!,
  ]);

  // Step 9: Compute shape edges and convert to index pairs
  const shapeEdgeBitmasks = computeShapeEdges(canonicals);
  const shapeEdges: [number, number][] = shapeEdgeBitmasks.map(([a, b]) => [
    canonToIndex.get(a)!,
    canonToIndex.get(b)!,
  ]);

  return {
    k,
    shapes,
    scales,
    shapeEdges,
    scaleEdges,
  };
}

/**
 * CLI entry point: precompute data for k=2..8 and write JSON files.
 */
function main() {
  registerBarryHarrisScales();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputDir = join(__dirname, '..', 'output');
  mkdirSync(outputDir, { recursive: true });

  for (const k of [2, 3, 4, 5, 6, 7, 8]) {
    console.log(`Computing k=${k}...`);
    const data = computeScaleLengthData(k);
    const outPath = join(outputDir, `k${k}.json`);
    writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`  Wrote ${outPath} (${data.shapes.length} shapes, ${data.scales.length} scales)`);
  }

  console.log('Done.');
}

if (process.argv[1] && (process.argv[1].endsWith('main.ts') || process.argv[1].endsWith('main.js'))) {
  main();
}
