import type { ViewMode, ColorScheme, VisualizationMode, GlyphStyle } from '$lib/types';
import { getScaleLengthData } from '$lib/data/index';

export const appState = createAppState();

function createAppState() {
  let selectedK = $state(7);
  let viewMode = $state<ViewMode>('shapes');
  let colorScheme = $state<ColorScheme>('bw');
  let selectedNodeIndex = $state<number | null>(null);
  let visualizationMode = $state<VisualizationMode>('graph');
  let glyphStyle = $state<GlyphStyle>('strip');

  const data = $derived(getScaleLengthData(selectedK));

  const nodes = $derived(
    viewMode === 'shapes'
      ? data.shapes.map((s, i) => ({ index: i, label: s.modes[0]?.names[0] ?? '' }))
      : data.scales.map((s, i) => ({ index: i, label: s.names[0]?.name ?? '' }))
  );

  const edges = $derived(
    viewMode === 'shapes' ? data.shapeEdges : data.scaleEdges
  );

  const distances = $derived.by(() => {
    if (selectedNodeIndex === null) return null;
    const dist = new Map<number, number>();
    dist.set(selectedNodeIndex, 0);
    const queue = [selectedNodeIndex];
    const edgeList = viewMode === 'shapes' ? data.shapeEdges : data.scaleEdges;
    const adj = new Map<number, number[]>();
    for (const [s, t] of edgeList) {
      if (!adj.has(s)) adj.set(s, []);
      if (!adj.has(t)) adj.set(t, []);
      adj.get(s)!.push(t);
      adj.get(t)!.push(s);
    }
    let i = 0;
    while (i < queue.length) {
      const cur = queue[i++];
      const d = dist.get(cur)!;
      for (const neighbor of adj.get(cur) ?? []) {
        if (!dist.has(neighbor)) {
          dist.set(neighbor, d + 1);
          queue.push(neighbor);
        }
      }
    }
    return dist;
  });

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
    get visualizationMode() { return visualizationMode; },
    set visualizationMode(v: VisualizationMode) { visualizationMode = v; },
    get glyphStyle() { return glyphStyle; },
    set glyphStyle(v: GlyphStyle) { glyphStyle = v; },
    get distances() { return distances; },
  };
}
