<script lang="ts">
  import { appState } from '$lib/state.svelte';
  import { maxChromaticRun } from '$lib/utils';
  import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
  import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

  interface GraphNode extends SimulationNodeDatum {
    id: number;
  }

  interface GraphLink {
    source: number;
    target: number;
  }

  let width = $state(800);
  let height = $state(600);
  let container: HTMLDivElement | undefined = $state(undefined);
  let simulationNodes = $state<GraphNode[]>([]);
  let simulationLinks = $state<{ source: GraphNode; target: GraphNode }[]>([]);
  let tick = $state(0);

  // Track what data the simulation was built from
  let lastKey = '';

  $effect(() => {
    const key = `${appState.selectedK}-${appState.viewMode}`;
    if (key === lastKey) return;
    lastKey = key;

    const nodeCount = appState.nodes.length;
    const nodes: GraphNode[] = appState.nodes.map((_, i) => ({ id: i }));
    const links: GraphLink[] = appState.edges.map(([s, t]) => ({ source: s, target: t }));

    // Adjust forces based on graph size
    const strength = nodeCount > 200 ? -30 : nodeCount > 50 ? -100 : -300;
    const distance = nodeCount > 200 ? 15 : nodeCount > 50 ? 30 : 60;

    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).id((d: any) => d.id).distance(distance).strength(0.3))
      .force('charge', forceManyBody().strength(strength))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(nodeCount > 200 ? 3 : nodeCount > 50 ? 5 : 8));

    // Run simulation synchronously
    simulation.stop();
    const iterations = nodeCount > 200 ? 200 : 300;
    for (let i = 0; i < iterations; i++) simulation.tick();

    simulationNodes = nodes;
    // After simulation runs, d3 mutates the link objects to replace source/target indices with node references
    simulationLinks = links as unknown as { source: GraphNode; target: GraphNode }[];
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

  // Precompute max chromatic run per node (only meaningful for k=8)
  const nodeColors = $derived.by(() => {
    if (appState.selectedK !== 8) return null;
    if (appState.viewMode === 'shapes') {
      return appState.data.shapes.map(s => maxChromaticRun(s.canonical));
    } else {
      return appState.data.scales.map(s => maxChromaticRun(s.bitmask));
    }
  });

  const RUN_COLORS = [
    '', // 0 - unused
    '', // 1 - unused for k=8
    '#3b82f6', // 2 - blue
    '#22c55e', // 3 - green
    '#eab308', // 4 - yellow
    '#f97316', // 5 - orange
    '#ef4444', // 6 - red
    '#a855f7', // 7 - purple
    '#ec4899', // 8 - pink
  ];

  function nodeColor(index: number): string | null {
    if (!nodeColors) return null;
    const run = nodeColors[index];
    return run != null ? RUN_COLORS[run] ?? '#6b7280' : null;
  }

  function nodeOpacity(id: number): number {
    const dists = appState.distances;
    if (!dists) return 1;
    const d = dists.get(id);
    if (d === undefined) return 0.05;
    if (d === 0) return 1;
    const md = Math.max(...dists.values());
    return Math.max(0.1, 1 - (d - 1) / Math.max(1, md - 1) * 0.9);
  }

  function edgeDepth(sourceId: number, targetId: number): number | null {
    const dists = appState.distances;
    if (!dists) return null;
    const ds = dists.get(sourceId);
    const dt = dists.get(targetId);
    if (ds === undefined || dt === undefined) return null;
    return Math.min(ds, dt);
  }
</script>

<div bind:this={container} class="w-full h-full relative">
  {#key tick}
  <svg {width} {height} class="absolute inset-0">
    <!-- Edges: render higher depth (farther) first so closer edges paint on top -->
    {#each (appState.distances
      ? [...simulationLinks].sort((a, b) => {
          const da = edgeDepth(a.source.id, a.target.id) ?? Infinity;
          const db = edgeDepth(b.source.id, b.target.id) ?? Infinity;
          return db - da;
        })
      : simulationLinks) as link}
      {#if link.source && link.target}
        {@const depth = edgeDepth(link.source.id, link.target.id)}
        <line
          x1={link.source.x}
          y1={link.source.y}
          x2={link.target.x}
          y2={link.target.y}
          stroke-width="0.5"
          stroke-opacity={depth === null ? 1 : depth === 0 ? 1 : depth === 1 ? 0.8 : depth === 2 ? 0.5 : 0.15}
          class={depth === null
            ? 'stroke-neutral-300 dark:stroke-neutral-600'
            : depth === 0
              ? 'stroke-blue-600'
              : depth === 1
                ? 'stroke-blue-400'
                : depth === 2
                  ? 'stroke-neutral-400 dark:stroke-neutral-500'
                  : 'stroke-neutral-200 dark:stroke-neutral-700'}
        />
      {/if}
    {/each}

    <!-- Nodes -->
    {#each simulationNodes as node}
      {#if node.x != null && node.y != null}
        <circle
          cx={node.x}
          cy={node.y}
          r={simulationNodes.length > 200 ? 3 : simulationNodes.length > 50 ? 5 : 8}
          role="button"
          tabindex="0"
          aria-label="Node {node.id}"
          fill={nodeColor(node.id) ?? ''}
          opacity={nodeOpacity(node.id)}
          class="cursor-pointer {nodeColor(node.id)
            ? 'hover:brightness-125'
            : (appState.distances === null
              ? 'fill-neutral-600 hover:fill-neutral-900 dark:fill-neutral-400 dark:hover:fill-neutral-200'
              : 'fill-neutral-900 dark:fill-neutral-100')}"
          onclick={() => handleNodeClick(node.id)}
          onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(node.id); }}
        />
      {/if}
    {/each}
  </svg>
  {/key}

  {#if appState.selectedK === 8}
    <div class="absolute bottom-4 right-4 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2 text-xs">
      <p class="font-medium text-neutral-600 dark:text-neutral-400 mb-1">Max chromatic run</p>
      {#each [2, 3, 4, 5, 6, 7, 8] as run}
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-full" style="background:{RUN_COLORS[run]}"></span>
          <span class="text-neutral-700 dark:text-neutral-300">{run}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
