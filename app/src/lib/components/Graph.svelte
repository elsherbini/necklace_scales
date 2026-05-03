<script lang="ts">
  import { appState } from '$lib/state.svelte';
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

  // Focus mode: which nodes are highlighted
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
      {#if link.source && link.target}
        <line
          x1={link.source.x}
          y1={link.source.y}
          x2={link.target.x}
          y2={link.target.y}
          stroke-width="0.5"
          class={highlightedNodes === null
            ? 'stroke-neutral-300'
            : (highlightedNodes.has(link.source.id) && highlightedNodes.has(link.target.id))
              ? 'stroke-neutral-500'
              : 'stroke-neutral-100'}
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
          class="cursor-pointer {highlightedNodes === null
            ? 'fill-neutral-600 hover:fill-neutral-900'
            : highlightedNodes.has(node.id)
              ? 'fill-neutral-900'
              : 'fill-neutral-200'}"
          onclick={() => handleNodeClick(node.id)}
          onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(node.id); }}
        />
      {/if}
    {/each}
  </svg>
  {/key}
</div>
