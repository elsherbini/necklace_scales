import type { ViewMode, ColorScheme } from '$lib/types';
import { getScaleLengthData } from '$lib/data/index';

export const appState = createAppState();

function createAppState() {
  let selectedK = $state(7);
  let viewMode = $state<ViewMode>('shapes');
  let colorScheme = $state<ColorScheme>('bw');
  let selectedNodeIndex = $state<number | null>(null);

  const data = $derived(getScaleLengthData(selectedK));

  const nodes = $derived(
    viewMode === 'shapes'
      ? data.shapes.map((s, i) => ({ index: i, label: s.modes[0]?.names[0] ?? '' }))
      : data.scales.map((s, i) => ({ index: i, label: s.names[0]?.name ?? '' }))
  );

  const edges = $derived(
    viewMode === 'shapes' ? data.shapeEdges : data.scaleEdges
  );

  return {
    get selectedK() { return selectedK; },
    set selectedK(v: number) { selectedK = v; selectedNodeIndex = null; },
    get viewMode() { return viewMode; },
    set viewMode(v: ViewMode) { viewMode = v; selectedNodeIndex = null; },
    get colorScheme() { return colorScheme; },
    set colorScheme(v: ColorScheme) { colorScheme = v; },
    get selectedNodeIndex() { return selectedNodeIndex; },
    set selectedNodeIndex(v: number | null) { selectedNodeIndex = v; },
    get data() { return data; },
    get nodes() { return nodes; },
    get edges() { return edges; },
  };
}
