import { describe, it, expect, beforeAll } from 'vitest';
import { computeScaleLengthData, deriveComplementData } from '../src/main.js';
import { registerBarryHarrisScales } from '../src/naming.js';
import type { ScaleLengthData } from '../src/types.js';

beforeAll(() => {
  registerBarryHarrisScales();
});

const EXPECTED: Record<number, { shapes: number; scales: number; scaleEdgesFormula: number }> = {
  2: { shapes: 6, scales: 66, scaleEdgesFormula: (66 * 20) / 2 },
  3: { shapes: 19, scales: 220, scaleEdgesFormula: (220 * 27) / 2 },
  4: { shapes: 43, scales: 495, scaleEdgesFormula: (495 * 32) / 2 },
  5: { shapes: 66, scales: 792, scaleEdgesFormula: (792 * 35) / 2 },
  6: { shapes: 80, scales: 924, scaleEdgesFormula: (924 * 36) / 2 },
  7: { shapes: 66, scales: 792, scaleEdgesFormula: (792 * 35) / 2 },
  8: { shapes: 43, scales: 495, scaleEdgesFormula: (495 * 32) / 2 },
  9: { shapes: 19, scales: 220, scaleEdgesFormula: (220 * 27) / 2 },
  10: { shapes: 6, scales: 66, scaleEdgesFormula: (66 * 20) / 2 },
};

describe('integration: all k values', () => {
  for (const [k, expected] of Object.entries(EXPECTED)) {
    const kNum = Number(k);

    describe(`k=${k}`, () => {
      let data: ScaleLengthData;

      beforeAll(() => {
        if (kNum === 9) {
          const k3 = computeScaleLengthData(3);
          data = deriveComplementData(k3, 9);
        } else if (kNum === 10) {
          const k2 = computeScaleLengthData(2);
          data = deriveComplementData(k2, 10);
        } else {
          data = computeScaleLengthData(kNum);
        }
      });

      it(`has ${expected.shapes} shapes`, () => {
        expect(data.shapes).toHaveLength(expected.shapes);
      });

      it(`has ${expected.scales} scales`, () => {
        expect(data.scales).toHaveLength(expected.scales);
      });

      it(`has ${expected.scaleEdgesFormula} scale edges`, () => {
        expect(data.scaleEdges).toHaveLength(expected.scaleEdgesFormula);
      });

      it('all shape symmetry orders divide 12', () => {
        for (const shape of data.shapes) {
          expect(12 % shape.symmetryOrder).toBe(0);
        }
      });

      it('number of modes per shape equals k / symmetryOrder', () => {
        for (const shape of data.shapes) {
          expect(shape.modes).toHaveLength(kNum / shape.symmetryOrder);
        }
      });

      it('total transpositions across all shapes equals total scales', () => {
        let total = 0;
        for (const shape of data.shapes) {
          total += 12 / shape.symmetryOrder;
        }
        expect(total).toBe(expected.scales);
      });
    });
  }
});
