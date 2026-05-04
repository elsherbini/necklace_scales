<script lang="ts">
  import { appState } from '$lib/state.svelte';
  import { maxChromaticRun, trailingOffRun } from '$lib/utils';

  const CELL_W = 5;
  const CELL_H = 5;
  const STRIP_W = CELL_W * 12;
  const GLYPH_GAP = 3;
  const ROW_HEIGHT = CELL_H + GLYPH_GAP;
  const LEFT_MARGIN = 30;
  const TOP_MARGIN = 30;
  const COL_WIDTH = STRIP_W + 20;

  // Circle glyph constants
  const CIRCLE_R = 12;
  const DOT_R = 2.5;
  const CIRCLE_GLYPH_SIZE = CIRCLE_R * 2 + 4;

  // Diminished 7th color groups (0-indexed pitch classes)
  // cDim: C,Eb,Gb,A = {0,3,6,9}, bbDim: Db,E,G,Bb = {1,4,7,10}, bDim: D,F,Ab,B = {2,5,8,11}
  const DIM_COLORS: Record<string, [string, string, string]> = {
    bw:          ['#404040', '#404040', '#404040'],
    metaharmony: ['rgb(215,204,59)', 'rgb(216,37,84)', 'rgb(77,162,210)'],
    elements:    ['rgb(59,179,75)', 'rgb(77,162,210)', 'rgb(216,37,84)'],
  };

  function noteFill(bit: number, isOn: boolean): string {
    if (!isOn) return '#e5e5e5';
    if (appState.viewMode !== 'scales') return '#404040';
    const group = bit % 3; // 0=cDim, 1=bbDim, 2=bDim
    return DIM_COLORS[appState.colorScheme]?.[group] ?? '#404040';
  }

  let container: HTMLDivElement | undefined = $state(undefined);
  let width = $state(800);

  $effect(() => {
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  });

  interface GlyphNode {
    index: number;
    bitmask: number;
    label: string;
    chromaticRun: number;
    offRun: number;
  }

  const sortedNodes = $derived.by(() => {
    let items: GlyphNode[] = appState.viewMode === 'shapes'
      ? appState.data.shapes.map((s, i) => ({
          index: i,
          bitmask: s.displayBitmask,
          label: appState.nodes[i]?.label ?? '',
          chromaticRun: maxChromaticRun(s.displayBitmask),
          offRun: trailingOffRun(s.displayBitmask),
        }))
      : appState.data.scales.map((s, i) => ({
          index: i,
          bitmask: s.bitmask,
          label: appState.nodes[i]?.label ?? '',
          chromaticRun: maxChromaticRun(s.bitmask),
          offRun: trailingOffRun(s.bitmask),
        }));

    if (appState.viewMode === 'scales') {
      const shapeSet = appState.selectedShapeSet;
      items = items.filter(item =>
        shapeSet.has(appState.data.scales[item.index].shapeIndex)
      );
    }

    items.sort((a, b) =>
      a.chromaticRun - b.chromaticRun
      || a.offRun - b.offRun
      || b.bitmask - a.bitmask
    );
    return items;
  });

  // Group labels: runs where chromaticRun changes
  const groupLabels = $derived.by(() => {
    const labels: { run: number; yIndex: number }[] = [];
    let lastRun = -1;
    for (let i = 0; i < sortedNodes.length; i++) {
      if (sortedNodes[i].chromaticRun !== lastRun) {
        lastRun = sortedNodes[i].chromaticRun;
        labels.push({ run: lastRun, yIndex: i });
      }
    }
    return labels;
  });

  // Column headers when selected
  const maxDist = $derived(
    appState.distances ? Math.max(...appState.distances.values()) : 0
  );

  function glyphX(node: GlyphNode): number {
    if (appState.distances === null) return LEFT_MARGIN;
    const d = appState.distances.get(node.index);
    if (d === undefined) return LEFT_MARGIN;
    return LEFT_MARGIN + d * COL_WIDTH;
  }

  function handleClick(index: number) {
    appState.selectedNodeIndex = appState.selectedNodeIndex === index ? null : index;
  }

  const glyphSize = $derived(
    appState.glyphStyle === 'strip'
      ? { w: STRIP_W, h: CELL_H }
      : { w: CIRCLE_GLYPH_SIZE, h: CIRCLE_GLYPH_SIZE }
  );

  const effectiveRowHeight = $derived(
    appState.glyphStyle === 'strip' ? ROW_HEIGHT : CIRCLE_GLYPH_SIZE + GLYPH_GAP
  );

  const svgHeight = $derived(TOP_MARGIN + sortedNodes.length * effectiveRowHeight + 20);
</script>

<div bind:this={container} class="w-full h-full overflow-y-auto overflow-x-auto relative">
  <svg width={Math.max(width, LEFT_MARGIN + (maxDist + 1) * COL_WIDTH + 20)} height={svgHeight}>
    <!-- Column headers (distance labels) when a node is selected -->
    {#if appState.distances !== null}
      {#each Array.from({ length: maxDist + 1 }, (_, i) => i) as d}
        <text
          x={LEFT_MARGIN + d * COL_WIDTH + glyphSize.w / 2}
          y={14}
          text-anchor="middle"
          class="fill-neutral-400 text-[10px]"
        >{d}</text>
      {/each}
    {/if}

    <!-- Group labels (max chromatic run) -->
    {#each groupLabels as g}
      <text
        x={4}
        y={TOP_MARGIN + g.yIndex * effectiveRowHeight + glyphSize.h / 2 + 3}
        class="fill-neutral-400 text-[9px]"
      >{g.run}</text>
    {/each}

    <!-- Glyphs -->
    {#each sortedNodes as node, yIndex}
      {@const x = glyphX(node)}
      {@const y = TOP_MARGIN + yIndex * effectiveRowHeight}
      {@const isSelected = appState.selectedNodeIndex === node.index}
      <g
        transform="translate({x},{y})"
        role="button"
        tabindex="0"
        aria-label={node.label || `Node ${node.index}`}
        class="cursor-pointer"
        onclick={() => handleClick(node.index)}
        onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(node.index); } }}
        style="transition: transform 300ms ease-out"
      >
        {#if appState.glyphStyle === 'strip'}
          <!-- Binary strip glyph -->
          {#each Array.from({ length: 12 }, (_, i) => i) as bit}
            <rect
              x={bit * CELL_W}
              y={0}
              width={CELL_W - 0.5}
              height={CELL_H}
              fill={noteFill(bit, !!((node.bitmask >> bit) & 1))}
              rx="0.5"
            />
          {/each}
          {#if isSelected}
            <rect
              x={-1}
              y={-1}
              width={STRIP_W + 2}
              height={CELL_H + 2}
              fill="none"
              class="stroke-blue-500"
              stroke-width="1.5"
              rx="1"
            />
          {/if}
        {:else}
          <!-- Chromatic circle glyph -->
          <circle
            cx={CIRCLE_R + 2}
            cy={CIRCLE_R + 2}
            r={CIRCLE_R}
            fill="none"
            class={isSelected ? 'stroke-blue-500' : 'stroke-neutral-300'}
            stroke-width={isSelected ? 1.5 : 0.5}
          />
          {#each Array.from({ length: 12 }, (_, i) => i) as bit}
            {@const angle = (bit * 30 - 90) * Math.PI / 180}
            {@const dotX = (CIRCLE_R + 2) + (CIRCLE_R - 3) * Math.cos(angle)}
            {@const dotY = (CIRCLE_R + 2) + (CIRCLE_R - 3) * Math.sin(angle)}
            <circle
              cx={dotX}
              cy={dotY}
              r={DOT_R}
              fill={noteFill(bit, !!((node.bitmask >> bit) & 1))}
            />
          {/each}
        {/if}
        <title>{node.label || `Bitmask: ${node.bitmask}`}</title>
      </g>
    {/each}
  </svg>
</div>
