import { rotate, canonical, pitchClassesFromBitmask } from './bitmask.js';
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
  // For each shape, look at its modes (rotation values). For each mode,
  // the scale at that rotation from the canonical has names we can use.
  for (const shape of shapes) {
    for (const mode of shape.modes) {
      const modeBitmask = rotate(shape.canonical, mode.rotation);
      const scaleEntry = scales.find(s => s.bitmask === modeBitmask);
      if (scaleEntry && scaleEntry.names.length > 0) {
        mode.names = scaleEntry.names.map(n => `${n.root} ${n.name}`);
      }
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
