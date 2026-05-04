# Glyph Grid View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Grid" visualization mode alongside the existing "Graph" mode, showing scales/shapes as small glyphs stacked vertically, with horizontal BFS distance columns on selection.

**Architecture:** New `GlyphGrid.svelte` component renders an SVG grid of glyphs. New state fields (`visualizationMode`, `glyphStyle`) control which view and glyph style is active. The sidebar gets new toggle buttons. The main page conditionally renders Graph or GlyphGrid. The `maxChromaticRun` function already exists in `Graph.svelte` and gets extracted to a shared utility.

**Tech Stack:** SvelteKit, Svelte 5 (runes), Tailwind v4, SVG rendering

**Design doc:** `docs/plans/2026-05-04-glyph-grid-view-design.md`

---

### Task 1: Add state and types for visualization mode

**Files:**
- Modify: `app/src/lib/types.ts`
- Modify: `app/src/lib/state.svelte.ts`

**Step 1: Add types**

In `app/src/lib/types.ts`, add at the end of the file:

```typescript
export type VisualizationMode = 'graph' | 'grid';
export type GlyphStyle = 'strip' | 'circle';
```

**Step 2: Add state variables**

In `app/src/lib/state.svelte.ts`, add two new state variables inside `createAppState()` after the `selectedNodeIndex` declaration:

```typescript
let visualizationMode = $state<VisualizationMode>('graph');
let glyphStyle = $state<GlyphStyle>('strip');
```

Add the import of the new types at the top:

```typescript
import type { ViewMode, ColorScheme, VisualizationMode, GlyphStyle } from '$lib/types';
```

Add getters/setters in the return object (after the `edges` getter):

```typescript
get visualizationMode() { return visualizationMode; },
set visualizationMode(v: VisualizationMode) { visualizationMode = v; },
get glyphStyle() { return glyphStyle; },
set glyphStyle(v: GlyphStyle) { glyphStyle = v; },
```

**Step 3: Extract BFS distances to shared state**

The BFS distance computation currently lives in `Graph.svelte` (lines 120-145). Move it into `state.svelte.ts` as a derived value so both Graph and GlyphGrid can use it.

Add inside `createAppState()` after the `edges` derived:

```typescript
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
```

Expose it in the return object:

```typescript
get distances() { return distances; },
```

**Step 4: Update Graph.svelte to use shared distances**

In `app/src/lib/components/Graph.svelte`, remove the local `distances` derived (lines 120-145) and the local `maxDist` derived (lines 147-149). Replace with references to `appState.distances`:

Replace all occurrences of `distances` in the template and functions with `appState.distances`. Specifically update:
- `nodeOpacity`: use `appState.distances` instead of `distances`
- `edgeDepth`: use `appState.distances` instead of `distances`
- Template: `{#each (distances` becomes `{#each (appState.distances`
- Template: `{@const depth = edgeDepth(` stays the same (it calls the function)
- Template: `{distances === null` becomes `{appState.distances === null`

Remove the local `maxDist` derived and compute it inline in `nodeOpacity`:

```typescript
function nodeOpacity(id: number): number {
  const dists = appState.distances;
  if (!dists) return 1;
  const d = dists.get(id);
  if (d === undefined) return 0.05;
  if (d === 0) return 1;
  const md = Math.max(...dists.values());
  return Math.max(0.1, 1 - (d - 1) / Math.max(1, md - 1) * 0.9);
}
```

Update `edgeDepth` similarly:

```typescript
function edgeDepth(sourceId: number, targetId: number): number | null {
  const dists = appState.distances;
  if (!dists) return null;
  const ds = dists.get(sourceId);
  const dt = dists.get(targetId);
  if (ds === undefined || dt === undefined) return null;
  return Math.min(ds, dt);
}
```

**Step 5: Verify the app builds**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run check`
Expected: No errors

**Step 6: Commit**

```bash
git add app/src/lib/types.ts app/src/lib/state.svelte.ts app/src/lib/components/Graph.svelte
git commit -m "feat: add visualization mode state and extract BFS distances to shared state"
```

---

### Task 2: Extract maxChromaticRun and add maxOffRun utilities

**Files:**
- Create: `app/src/lib/utils.ts`
- Modify: `app/src/lib/components/Graph.svelte`

**Step 1: Create utility module**

Create `app/src/lib/utils.ts`:

```typescript
/**
 * Longest consecutive run of set bits in a 12-bit cyclic bitmask.
 */
export function maxChromaticRun(bitmask: number): number {
  if (bitmask === 0) return 0;
  let max = 0;
  let run = 0;
  for (let i = 0; i < 24; i++) {
    if ((bitmask >> (i % 12)) & 1) {
      run++;
      if (run > max) max = run;
    } else {
      run = 0;
    }
  }
  return max;
}

/**
 * Longest consecutive run of unset bits in a 12-bit cyclic bitmask.
 */
export function maxOffRun(bitmask: number): number {
  if (bitmask === 0xFFF) return 0;
  return maxChromaticRun(~bitmask & 0xFFF);
}
```

**Step 2: Update Graph.svelte to import from utils**

In `app/src/lib/components/Graph.svelte`, remove the local `maxChromaticRun` function (lines 75-89) and add an import:

```typescript
import { maxChromaticRun } from '$lib/utils';
```

**Step 3: Verify the app builds**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/src/lib/utils.ts app/src/lib/components/Graph.svelte
git commit -m "refactor: extract maxChromaticRun to shared utils, add maxOffRun"
```

---

### Task 3: Create GlyphGrid component with strip glyphs and sorting

**Files:**
- Create: `app/src/lib/components/GlyphGrid.svelte`

This is the core new component. It renders an SVG with vertically stacked glyphs, sorted by max chromatic run > max off-run > bitmask. Each glyph is a 12-cell binary strip.

**Step 1: Create the component**

Create `app/src/lib/components/GlyphGrid.svelte`:

```svelte
<script lang="ts">
  import { appState } from '$lib/state.svelte';
  import { maxChromaticRun, maxOffRun } from '$lib/utils';

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
    const items: GlyphNode[] = appState.viewMode === 'shapes'
      ? appState.data.shapes.map((s, i) => ({
          index: i,
          bitmask: s.canonical,
          label: appState.nodes[i]?.label ?? '',
          chromaticRun: maxChromaticRun(s.canonical),
          offRun: maxOffRun(s.canonical),
        }))
      : appState.data.scales.map((s, i) => ({
          index: i,
          bitmask: s.bitmask,
          label: appState.nodes[i]?.label ?? '',
          chromaticRun: maxChromaticRun(s.bitmask),
          offRun: maxOffRun(s.bitmask),
        }));

    items.sort((a, b) =>
      b.chromaticRun - a.chromaticRun
      || b.offRun - a.offRun
      || a.bitmask - b.bitmask
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
        onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleClick(node.index); }}
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
              class={(bitmask >> bit) & 1 ? 'fill-neutral-800' : 'fill-neutral-200'}
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
              class={(node.bitmask >> bit) & 1 ? 'fill-neutral-800' : 'fill-neutral-200'}
            />
          {/each}
        {/if}
        <title>{node.label || `Bitmask: ${node.bitmask}`}</title>
      </g>
    {/each}
  </svg>
</div>
```

Note: The strip glyph uses `(bitmask >> bit) & 1` but we need to reference `node.bitmask`. There's a bug in the template — the `{#each}` for strip bits references a bare `bitmask` variable. Fix: use `(node.bitmask >> bit) & 1` instead. The code above in the `{:else}` branch already does this correctly.

**Step 2: Verify the app builds**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run check`
Expected: No errors (component exists but isn't rendered yet)

**Step 3: Commit**

```bash
git add app/src/lib/components/GlyphGrid.svelte
git commit -m "feat: add GlyphGrid component with strip and circle glyph rendering"
```

---

### Task 4: Wire up sidebar toggles and page routing

**Files:**
- Modify: `app/src/lib/components/Sidebar.svelte`
- Modify: `app/src/routes/+page.svelte`

**Step 1: Add visualization mode and glyph style toggles to Sidebar**

In `app/src/lib/components/Sidebar.svelte`, add a new section after the "View" section (after line 65). Insert between the View and Colors sections:

```svelte
  <div>
    <h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Display</h2>
    <div class="flex gap-1">
      {#each [{ value: 'graph' as const, label: 'Graph' }, { value: 'grid' as const, label: 'Grid' }] as mode}
        <button
          class="px-3 py-1 text-sm rounded {appState.visualizationMode === mode.value ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}"
          onclick={() => appState.visualizationMode = mode.value}
        >
          {mode.label}
        </button>
      {/each}
    </div>
    {#if appState.visualizationMode === 'grid'}
      <div class="flex gap-1 mt-2">
        {#each [{ value: 'strip' as const, label: 'Strip' }, { value: 'circle' as const, label: 'Circle' }] as style}
          <button
            class="px-2 py-0.5 text-xs rounded {appState.glyphStyle === style.value ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}"
            onclick={() => appState.glyphStyle = style.value}
          >
            {style.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
```

**Step 2: Update +page.svelte to conditionally render**

Replace `app/src/routes/+page.svelte` contents:

```svelte
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Graph from '$lib/components/Graph.svelte';
  import GlyphGrid from '$lib/components/GlyphGrid.svelte';
  import { appState } from '$lib/state.svelte';
</script>

<div class="h-screen flex">
  <Sidebar />
  <main class="flex-1 bg-neutral-50">
    {#if appState.visualizationMode === 'graph'}
      <Graph />
    {:else}
      <GlyphGrid />
    {/if}
  </main>
</div>
```

**Step 3: Verify the app builds**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run check`
Expected: No errors

**Step 4: Manually verify in browser**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run dev`

Verify:
- Sidebar shows "Display" section with "Graph" / "Grid" toggle
- Clicking "Grid" shows the glyph grid view
- Clicking "Graph" returns to the network view
- Grid view: glyphs are stacked vertically, sorted by max chromatic run
- Grid view: group labels appear on the left
- Grid view: clicking a glyph selects it, others slide to distance columns
- Grid view: clicking selected glyph deselects, all return to column 0
- Grid view: strip/circle toggle switches glyph style
- Shapes/Scales mode toggle works in both views

**Step 5: Commit**

```bash
git add app/src/lib/components/Sidebar.svelte app/src/routes/+page.svelte
git commit -m "feat: wire up grid view toggle in sidebar and page routing"
```

---

### Task 5: Final build verification and cleanup

**Files:**
- Possibly: `app/src/lib/components/GlyphGrid.svelte` (fixes from manual testing)

**Step 1: Run full build**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run build`
Expected: Build succeeds with no errors

**Step 2: Run type check**

Run: `cd /Users/jelsherbini/dev/necklace_scales/app && npm run check`
Expected: No errors

**Step 3: Fix any issues found during manual testing or build**

Address any type errors, rendering issues, or interaction bugs discovered.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during grid view testing"
```
