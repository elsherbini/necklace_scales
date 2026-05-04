<script lang="ts">
  import { appState } from '$lib/state.svelte';
  import { AVAILABLE_K_VALUES } from '$lib/data/index';
  import { sortShapeNames, PRIORITY_NAMES } from '$lib/utils';

  const viewModes = [
    { value: 'shapes' as const, label: 'Shapes' },
    { value: 'scales' as const, label: 'Scales' },
  ];

  const colorSchemes = [
    { value: 'bw' as const, label: 'B&W' },
    { value: 'metaharmony' as const, label: 'Metaharmony' },
    { value: 'elements' as const, label: 'Elements' },
  ];

  let shapeFilterOpen = $state(false);

  function toggleShape(index: number) {
    const set = new Set(appState.selectedShapeIndices);
    if (set.has(index)) set.delete(index);
    else set.add(index);
    appState.selectedShapeIndices = [...set];
  }

  function selectAllShapes() {
    appState.selectedShapeIndices = appState.data.shapes.map((_, i) => i);
  }

  function deselectAllShapes() {
    appState.selectedShapeIndices = [];
  }

  const sortNames = sortShapeNames;
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

  {#if appState.viewMode === 'scales' && appState.visualizationMode === 'grid'}
    <div>
      <button
        class="w-full flex items-center justify-between text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2"
        onclick={() => shapeFilterOpen = !shapeFilterOpen}
      >
        Filter by Shape
        <span class="text-xs">{shapeFilterOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {#if shapeFilterOpen}
        <div class="flex gap-1 mb-2">
          <button
            class="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            onclick={selectAllShapes}
          >Select All</button>
          <button
            class="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            onclick={deselectAllShapes}
          >Deselect All</button>
        </div>
        <div class="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          {#each appState.sortedShapes as shape, i}
            {#if i === 0 || shape.chromaticRun !== appState.sortedShapes[i - 1].chromaticRun}
              <p class="text-xs text-neutral-400 mt-1 first:mt-0">Run {shape.chromaticRun}</p>
            {/if}
            <label class="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer hover:bg-neutral-50 px-1 rounded">
              <input
                type="checkbox"
                checked={appState.selectedShapeSet.has(shape.index)}
                onchange={() => toggleShape(shape.index)}
              />
              <span class="text-neutral-400">{shape.index}</span>
              {#if shape.name}
                <span>{shape.name}</span>
              {/if}
            </label>
          {/each}
        </div>
        <p class="text-xs text-neutral-400 mt-1">
          {appState.selectedShapeIndices.length} of {appState.data.shapes.length} shapes
        </p>
      {/if}
    </div>
  {/if}

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
        {@const allNames = shape.modes.flatMap(m => m.names)}
        {@const sorted = sortNames(allNames)}
        <p class="text-sm font-medium">{sorted.primary[0] ?? `Shape ${appState.selectedNodeIndex}`}</p>
        {#if sorted.primary.length > 1}
          <p class="text-xs text-neutral-500">{sorted.primary.slice(1).join(', ')}</p>
        {/if}
        {#if sorted.secondary.length > 0}
          <p class="text-xs text-neutral-400 italic">{sorted.secondary.join(', ')}</p>
        {/if}
        <p class="text-xs text-neutral-500">Symmetry: {shape.symmetryOrder}-fold</p>
        <p class="text-xs text-neutral-500">Modes: {shape.modes.length}</p>
      {:else}
        {@const scale = appState.data.scales[appState.selectedNodeIndex]}
        {@const bestName = scale.names.find(n => PRIORITY_NAMES.has(n.name)) ?? scale.names[0]}
        <p class="text-sm font-medium">
          {bestName ? `${bestName.root} ${bestName.name}` : `Scale ${appState.selectedNodeIndex}`}
        </p>
        {#if scale.names.length > 1}
          <p class="text-xs text-neutral-500">
            {scale.names.filter(n => n !== bestName).map(n => `${n.root} ${n.name}`).join(', ')}
          </p>
        {/if}
        <p class="text-xs text-neutral-500">Pitch classes: {scale.pitchClasses.join(', ')}</p>
      {/if}
    </div>
  {/if}
</aside>
