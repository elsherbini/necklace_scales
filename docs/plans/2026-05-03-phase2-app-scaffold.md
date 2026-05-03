# Phase 2: SvelteKit App Scaffold — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the SvelteKit static app with sidebar controls, load precomputed JSON data, and render a force-directed graph.

**Architecture:** Single-page SvelteKit app with adapter-static. Sidebar (left) with controls for scale length, view mode, and color scheme. Main area renders an SVG force-directed graph using d3-force. No precomputed layouts yet — force-directed is the fallback.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), adapter-static, Tailwind v4, bits-ui, d3-force, tonal

---

### Task 1: SvelteKit Project Initialization

**Files:**
- Create: `app/package.json`
- Create: `app/svelte.config.js`
- Create: `app/vite.config.ts`
- Create: `app/tsconfig.json`
- Create: `app/src/app.html`
- Create: `app/src/app.css`
- Create: `app/src/routes/+layout.svelte`
- Create: `app/src/routes/+layout.ts`
- Create: `app/src/routes/+page.svelte`

**Step 1: Create app directory and package.json**

Create `app/package.json`:
```json
{
  "name": "necklace-scales",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.57.0",
    "@sveltejs/vite-plugin-svelte": "^7.0.0",
    "@tailwindcss/vite": "^4.2.4",
    "svelte": "^5.55.2",
    "svelte-check": "^4.4.6",
    "tailwindcss": "^4.2.4",
    "typescript": "^6.0.2",
    "vite": "^8.0.7"
  },
  "dependencies": {
    "bits-ui": "^2.9.0",
    "d3-force": "^3.0.0",
    "tonal": "^6.3.0"
  }
}
```

**Step 2: Create svelte.config.js**

Create `app/svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/necklace_scales' : ''
		}
	}
};

export default config;
```

**Step 3: Create vite.config.ts**

Create `app/vite.config.ts`:
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

**Step 4: Create tsconfig.json**

Create `app/tsconfig.json`:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

**Step 5: Create src/app.html**

Create `app/src/app.html`:
```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

**Step 6: Create src/app.css**

Create `app/src/app.css`:
```css
@import "tailwindcss";
```

**Step 7: Create layout files**

Create `app/src/routes/+layout.ts`:
```ts
export const prerender = true;
```

Create `app/src/routes/+layout.svelte`:
```svelte
<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
```

**Step 8: Create initial page**

Create `app/src/routes/+page.svelte`:
```svelte
<h1 class="text-2xl p-4">Necklace Scales</h1>
```

**Step 9: Install dependencies and verify**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm install
```

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm run dev -- --port 5173 &
sleep 3 && curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML response with SvelteKit content.

**Step 10: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add app/
git commit -m "feat: initialize SvelteKit app with adapter-static and Tailwind v4"
```

---

### Task 2: Copy JSON Data and Create Type Definitions

**Files:**
- Create: `app/src/lib/data/` (copy JSON files)
- Create: `app/src/lib/types.ts`

**Step 1: Copy precomputed JSON into app**

```bash
mkdir -p /Users/jelsherbini/dev/necklace_scales/app/src/lib/data
cp /Users/jelsherbini/dev/necklace_scales/scripts/output/k*.json /Users/jelsherbini/dev/necklace_scales/app/src/lib/data/
```

**Step 2: Create shared type definitions**

Create `app/src/lib/types.ts`:
```ts
export interface ModeInfo {
  rotation: number;
  names: string[];
}

export interface ShapeData {
  canonical: number;
  symmetryOrder: number;
  modes: ModeInfo[];
  displayBitmask: number;
}

export interface ScaleData {
  bitmask: number;
  pitchClasses: number[];
  shapeIndex: number;
  rotation: number;
  names: { root: string; name: string }[];
}

export interface ScaleLengthData {
  k: number;
  shapes: ShapeData[];
  scales: ScaleData[];
  shapeEdges: [number, number][];
  scaleEdges: [number, number][];
}

export type ViewMode = 'shapes' | 'scales';
export type ColorScheme = 'bw' | 'metaharmony' | 'elements';
```

**Step 3: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add app/src/lib/data/ app/src/lib/types.ts
git commit -m "feat: add precomputed JSON data and shared type definitions"
```

---

### Task 3: App State and Data Loading

**Files:**
- Create: `app/src/lib/state.svelte.ts`
- Create: `app/src/lib/data/index.ts`

**Step 1: Create data loading module**

Create `app/src/lib/data/index.ts`:
```ts
import type { ScaleLengthData } from '$lib/types.ts';

import k2 from './k2.json';
import k3 from './k3.json';
import k4 from './k4.json';
import k5 from './k5.json';
import k6 from './k6.json';
import k7 from './k7.json';
import k8 from './k8.json';

const dataByK: Record<number, ScaleLengthData> = {
  2: k2 as ScaleLengthData,
  3: k3 as ScaleLengthData,
  4: k4 as ScaleLengthData,
  5: k5 as ScaleLengthData,
  6: k6 as ScaleLengthData,
  7: k7 as ScaleLengthData,
  8: k8 as ScaleLengthData,
};

export function getScaleLengthData(k: number): ScaleLengthData {
  return dataByK[k];
}

export const AVAILABLE_K_VALUES = [2, 3, 4, 5, 6, 7, 8] as const;
```

**Step 2: Create app state module**

Create `app/src/lib/state.svelte.ts`:
```ts
import type { ViewMode, ColorScheme, ScaleLengthData, ShapeData, ScaleData } from '$lib/types.ts';
import { getScaleLengthData } from '$lib/data/index.ts';

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
```

**Step 3: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add app/src/lib/state.svelte.ts app/src/lib/data/index.ts
git commit -m "feat: add app state management and data loading"
```

---

### Task 4: Sidebar Component with Controls

**Files:**
- Create: `app/src/lib/components/Sidebar.svelte`
- Modify: `app/src/routes/+page.svelte`

**Step 1: Create Sidebar component**

Create `app/src/lib/components/Sidebar.svelte`:
```svelte
<script lang="ts">
  import { appState } from '$lib/state.svelte.ts';
  import { AVAILABLE_K_VALUES } from '$lib/data/index.ts';

  const viewModes = [
    { value: 'shapes' as const, label: 'Shapes' },
    { value: 'scales' as const, label: 'Scales' },
  ];

  const colorSchemes = [
    { value: 'bw' as const, label: 'B&W' },
    { value: 'metaharmony' as const, label: 'Metaharmony' },
    { value: 'elements' as const, label: 'Elements' },
  ];
</script>

<aside class="w-64 h-full border-r border-neutral-200 p-4 flex flex-col gap-6 overflow-y-auto bg-white">
  <div>
    <h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Scale Length</h2>
    <div class="flex flex-wrap gap-1">
      {#each AVAILABLE_K_VALUES as k}
        <button
          class="px-3 py-1 text-sm rounded {appState.selectedK === k ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}"
          onclick={() => appState.selectedK = k}
        >
          {k}
        </button>
      {/each}
    </div>
    <p class="text-xs text-neutral-400 mt-1">
      {appState.data.shapes.length} shapes, {appState.data.scales.length} scales
    </p>
  </div>

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">View</h2>
    <div class="flex gap-1">
      {#each viewModes as mode}
        <button
          class="px-3 py-1 text-sm rounded {appState.viewMode === mode.value ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}"
          onclick={() => appState.viewMode = mode.value}
        >
          {mode.label}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Colors</h2>
    <div class="flex gap-1">
      {#each colorSchemes as scheme}
        <button
          class="px-3 py-1 text-sm rounded {appState.colorScheme === scheme.value ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}"
          onclick={() => appState.colorScheme = scheme.value}
        >
          {scheme.label}
        </button>
      {/each}
    </div>
  </div>

  {#if appState.selectedNodeIndex !== null}
    <div class="border-t border-neutral-200 pt-4">
      <h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Selected</h2>
      {#if appState.viewMode === 'shapes'}
        {@const shape = appState.data.shapes[appState.selectedNodeIndex]}
        <p class="text-sm font-medium">{shape.modes[0]?.names[0] ?? `Shape ${appState.selectedNodeIndex}`}</p>
        <p class="text-xs text-neutral-500">Symmetry: {shape.symmetryOrder}-fold</p>
        <p class="text-xs text-neutral-500">Modes: {shape.modes.length}</p>
      {:else}
        {@const scale = appState.data.scales[appState.selectedNodeIndex]}
        <p class="text-sm font-medium">
          {scale.names[0] ? `${scale.names[0].root} ${scale.names[0].name}` : `Scale ${appState.selectedNodeIndex}`}
        </p>
        <p class="text-xs text-neutral-500">Pitch classes: {scale.pitchClasses.join(', ')}</p>
      {/if}
    </div>
  {/if}
</aside>
```

**Step 2: Update +page.svelte with layout**

Update `app/src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="h-screen flex">
  <Sidebar />
  <main class="flex-1 bg-neutral-50">
    <p class="p-4 text-neutral-400">Graph will go here</p>
  </main>
</div>
```

**Step 3: Verify dev server shows sidebar**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm run dev -- --port 5173 &
sleep 3 && curl -s http://localhost:5173 | grep -c "Scale Length"
kill %1
```

Expected: At least 1 match.

**Step 4: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add app/src/lib/components/Sidebar.svelte app/src/routes/+page.svelte
git commit -m "feat: add sidebar with scale length, view mode, and color scheme controls"
```

---

### Task 5: Force-Directed Graph Component

**Files:**
- Create: `app/src/lib/components/Graph.svelte`
- Modify: `app/src/routes/+page.svelte`

**Step 1: Install d3-force types**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm install -D @types/d3-force
```

**Step 2: Create Graph component**

Create `app/src/lib/components/Graph.svelte`:
```svelte
<script lang="ts">
  import { appState } from '$lib/state.svelte.ts';
  import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
  import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

  interface GraphNode extends SimulationNodeDatum {
    index: number;
  }

  interface GraphLink extends SimulationLinkDatum<GraphNode> {
    source: number;
    target: number;
  }

  let width = $state(800);
  let height = $state(600);
  let container: HTMLDivElement;
  let simulationNodes = $state<GraphNode[]>([]);
  let simulationLinks = $state<GraphLink[]>([]);
  let tick = $state(0);

  // Track what data we last built the simulation from
  let lastKey = $state('');

  $effect(() => {
    const key = `${appState.selectedK}-${appState.viewMode}`;
    if (key === lastKey) return;
    lastKey = key;

    const nodes: GraphNode[] = appState.nodes.map((n, i) => ({ index: i, x: undefined, y: undefined }));
    const links: GraphLink[] = appState.edges.map(([s, t]) => ({ source: s, target: t }));

    const nodeCount = nodes.length;
    const strength = nodeCount > 200 ? -50 : nodeCount > 50 ? -150 : -300;
    const distance = nodeCount > 200 ? 20 : nodeCount > 50 ? 40 : 60;

    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).distance(distance).strength(0.3))
      .force('charge', forceManyBody().strength(strength))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(nodeCount > 200 ? 4 : 8));

    // Run simulation synchronously for initial layout
    simulation.stop();
    for (let i = 0; i < 300; i++) simulation.tick();

    simulationNodes = nodes;
    simulationLinks = links;
    tick++;
  });

  // Resize observer
  $effect(() => {
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  });

  function handleNodeClick(index: number) {
    appState.selectedNodeIndex = appState.selectedNodeIndex === index ? null : index;
  }

  // Focus mode: determine which nodes/edges to highlight
  const highlightedNodes = $derived.by(() => {
    if (appState.selectedNodeIndex === null) return null;
    const neighbors = new Set<number>([appState.selectedNodeIndex]);
    for (const [s, t] of appState.edges) {
      if (s === appState.selectedNodeIndex) neighbors.add(t);
      if (t === appState.selectedNodeIndex) neighbors.add(s);
    }
    return neighbors;
  });
</script>

<div bind:this={container} class="w-full h-full relative">
  {#key tick}
  <svg {width} {height} class="absolute inset-0">
    <!-- Edges -->
    {#each simulationLinks as link}
      {@const source = simulationNodes[link.source as number]}
      {@const target = simulationNodes[link.target as number]}
      {#if source && target}
        <line
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          stroke="currentColor"
          stroke-width="0.5"
          class={highlightedNodes === null
            ? 'text-neutral-300'
            : (highlightedNodes.has(link.source as number) && highlightedNodes.has(link.target as number))
              ? 'text-neutral-400'
              : 'text-neutral-100'}
        />
      {/if}
    {/each}

    <!-- Nodes -->
    {#each simulationNodes as node, i}
      {#if node.x != null && node.y != null}
        <circle
          cx={node.x}
          cy={node.y}
          r={simulationNodes.length > 200 ? 3 : simulationNodes.length > 50 ? 5 : 8}
          class={highlightedNodes === null
            ? 'fill-neutral-700 cursor-pointer hover:fill-neutral-900'
            : highlightedNodes.has(i)
              ? 'fill-neutral-900 cursor-pointer'
              : 'fill-neutral-200 cursor-pointer'}
          onclick={() => handleNodeClick(i)}
        />
      {/if}
    {/each}
  </svg>
  {/key}
</div>
```

**Step 3: Update +page.svelte to include Graph**

Update `app/src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Graph from '$lib/components/Graph.svelte';
</script>

<div class="h-screen flex">
  <Sidebar />
  <main class="flex-1 bg-neutral-50">
    <Graph />
  </main>
</div>
```

**Step 4: Verify the graph renders**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm run dev -- --port 5173 &
sleep 5 && curl -s http://localhost:5173 | grep -c "svg"
kill %1
```

Expected: SVG element present in output.

**Step 5: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add app/src/lib/components/Graph.svelte app/src/routes/+page.svelte app/package.json app/package-lock.json
git commit -m "feat: add force-directed graph visualization with focus mode"
```

---

### Task 6: Build Verification

**Step 1: Run static build**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm run build
```

Expected: Build completes with no errors, outputs to `build/` directory.

**Step 2: Preview the build**

```bash
cd /Users/jelsherbini/dev/necklace_scales/app && npm run preview -- --port 4173 &
sleep 3 && curl -s http://localhost:4173 | grep -c "Necklace"
kill %1
```

Expected: At least 1 match — the built static site is serving.

**Step 3: Add app build output to .gitignore**

Modify `/Users/jelsherbini/dev/necklace_scales/.gitignore` to add:
```
node_modules/
scripts/output/
app/build/
app/.svelte-kit/
```

**Step 4: Commit**

```bash
cd /Users/jelsherbini/dev/necklace_scales
git add .gitignore
git commit -m "chore: add app build artifacts to .gitignore"
```

---

## Summary

After completing all 6 tasks, you'll have:
- A working SvelteKit static app at `app/`
- Sidebar with scale length selector (k=2-8), shapes/scales toggle, color scheme picker
- Force-directed graph rendering for both shape and absolute scale views
- Focus mode: click a node to highlight it and its neighbors
- Selected node details in the sidebar
- Static build working for GitHub Pages deployment
