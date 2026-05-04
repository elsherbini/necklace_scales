import type { ScaleLengthData } from '$lib/types';

import k2 from './k2.json';
import k3 from './k3.json';
import k4 from './k4.json';
import k5 from './k5.json';
import k6 from './k6.json';
import k7 from './k7.json';
import k8 from './k8.json';
import k9 from './k9.json';
import k10 from './k10.json';

const dataByK: Record<number, ScaleLengthData> = {
  2: k2 as unknown as ScaleLengthData,
  3: k3 as unknown as ScaleLengthData,
  4: k4 as unknown as ScaleLengthData,
  5: k5 as unknown as ScaleLengthData,
  6: k6 as unknown as ScaleLengthData,
  7: k7 as unknown as ScaleLengthData,
  8: k8 as unknown as ScaleLengthData,
  9: k9 as unknown as ScaleLengthData,
  10: k10 as unknown as ScaleLengthData,
};

export function getScaleLengthData(k: number): ScaleLengthData {
  return dataByK[k];
}

export const AVAILABLE_K_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
