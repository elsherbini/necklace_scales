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
