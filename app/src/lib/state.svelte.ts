import type { ViewMode, ColorScheme, VisualizationMode, GlyphStyle, Theme } from '$lib/types';
import { getScaleLengthData } from '$lib/data/index';
import { maxChromaticRun, trailingOffRun, sortShapeNames, PRIORITY_NAMES } from '$lib/utils';

export const appState = createAppState();

function createAppState() {
  let selectedK = $state(8);
  let viewMode = $state<ViewMode>('shapes');
  let colorScheme = $state<ColorScheme>('bw');
  let selectedNodeIndex = $state<number | null>(null);
  let visualizationMode = $state<VisualizationMode>('grid');
  let glyphStyle = $state<GlyphStyle>('strip');
  let selectedShapeIndices = $state<number[]>(
    Array.from({ length: getScaleLengthData(8).shapes.length }, (_, i) => i)
  );
  let theme = $state<Theme>(
    (typeof localStorage !== 'undefined' && localStorage.theme as Theme) || 'system'
  );

  const data = $derived(getScaleLengthData(selectedK));

  const selectedShapeSet = $derived(new Set(selectedShapeIndices));

  const sortedShapes = $derived.by(() => {
    return data.shapes.map((s, i) => ({
      index: i,
      displayBitmask: s.displayBitmask,
      chromaticRun: maxChromaticRun(s.displayBitmask),
      offRun: trailingOffRun(s.displayBitmask),
      name: sortShapeNames(s.modes.flatMap(m => m.names)).primary[0] ?? '',
    })).sort((a, b) =>
      a.chromaticRun - b.chromaticRun
      || a.offRun - b.offRun
      || b.displayBitmask - a.displayBitmask
    );
  });

  const nodes = $derived(
    viewMode === 'shapes'
      ? data.shapes.map((s, i) => ({
          index: i,
          label: sortShapeNames(s.modes.flatMap(m => m.names)).primary[0] ?? `Shape ${i}`,
        }))
      : data.scales.map((s, i) => {
          const bestName = s.names.find(n => PRIORITY_NAMES.has(n.name)) ?? s.names[0];
          const label = bestName
            ? `${bestName.root} ${bestName.name}`
            : `Shape ${s.shapeIndex} rotation ${s.rotation}`;
          return { index: i, label };
        })
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

  function applyTheme(t: Theme) {
    if (typeof document === 'undefined') return;
    const isDark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }

  const resolvedTheme = $derived.by(() => {
    if (theme === 'system') {
      if (typeof matchMedia !== 'undefined') {
        return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return theme;
  });

  return {
    get selectedK() { return selectedK; },
    set selectedK(v: number) {
      selectedK = v;
      selectedNodeIndex = null;
      selectedShapeIndices = getScaleLengthData(v).shapes.map((_, i) => i);
    },
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
    get selectedShapeIndices() { return selectedShapeIndices; },
    set selectedShapeIndices(v: number[]) { selectedShapeIndices = v; },
    get selectedShapeSet() { return selectedShapeSet; },
    get sortedShapes() { return sortedShapes; },
    get theme() { return theme; },
    set theme(v: Theme) {
      theme = v;
      if (typeof localStorage !== 'undefined') {
        if (v === 'system') localStorage.removeItem('theme');
        else localStorage.theme = v;
      }
      applyTheme(v);
    },
    get resolvedTheme() { return resolvedTheme; },
  };
}
