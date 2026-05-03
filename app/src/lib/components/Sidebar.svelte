<script lang="ts">
  import { appState } from '$lib/state.svelte';
  import { AVAILABLE_K_VALUES } from '$lib/data/index';

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
