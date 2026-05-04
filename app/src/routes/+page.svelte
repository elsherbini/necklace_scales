<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Graph from '$lib/components/Graph.svelte';
  import GlyphGrid from '$lib/components/GlyphGrid.svelte';
  import { appState } from '$lib/state.svelte';
</script>

<div class="h-screen flex">
  <Sidebar />
  <main class="flex-1 bg-neutral-50 dark:bg-neutral-950">
    {#if appState.visualizationMode === 'graph'}
      <Graph />
    {:else}
      <GlyphGrid />
    {/if}
  </main>
</div>
