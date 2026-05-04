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

  const themes = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
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

<aside class="w-64 h-full border-r border-neutral-200 dark:border-neutral-700 p-4 flex flex-col gap-6 overflow-y-auto bg-white dark:bg-neutral-900">
  <div>
    <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Theme</h2>
    <div class="flex gap-1">
      {#each themes as t}
        <button
          class="px-3 py-1 text-sm rounded {appState.resolvedTheme === t.value ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
          onclick={() => appState.theme = t.value}
        >
          {t.label}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Scale Length</h2>
    <div class="flex gap-1">
      {#each AVAILABLE_K_VALUES as k}
        <button
          class="px-1.5 py-1 text-sm rounded {appState.selectedK === k ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
          onclick={() => appState.selectedK = k}
        >
          {k}
        </button>
      {/each}
    </div>
    <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
      {appState.data.shapes.length} shapes, {appState.data.scales.length} scales
    </p>
  </div>

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">View</h2>
    <div class="flex gap-1">
      {#each viewModes as mode}
        <button
          class="px-3 py-1 text-sm rounded {appState.viewMode === mode.value ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
          onclick={() => appState.viewMode = mode.value}
        >
          {mode.label}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Display</h2>
    <div class="flex gap-1">
      {#each [{ value: 'graph' as const, label: 'Graph' }, { value: 'grid' as const, label: 'Grid' }] as mode}
        <button
          class="px-3 py-1 text-sm rounded {appState.visualizationMode === mode.value ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
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
            class="px-2 py-0.5 text-xs rounded {appState.glyphStyle === style.value ? 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
            onclick={() => appState.glyphStyle = style.value}
          >
            {style.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if appState.visualizationMode === 'grid'}
    <div>
      <button
        class="w-full flex items-center justify-between text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2"
        onclick={() => shapeFilterOpen = !shapeFilterOpen}
      >
        Filter by Shape
        <span class="text-xs">{shapeFilterOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {#if shapeFilterOpen}
        <div class="flex gap-1 mb-2">
          <button
            class="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            onclick={selectAllShapes}
          >Select All</button>
          <button
            class="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            onclick={deselectAllShapes}
          >Deselect All</button>
        </div>
        <div class="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          {#each appState.sortedShapes as shape, i}
            {#if i === 0 || shape.chromaticRun !== appState.sortedShapes[i - 1].chromaticRun}
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1 first:mt-0">Run {shape.chromaticRun}</p>
            {/if}
            <label class="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 px-1 rounded">
              <input
                type="checkbox"
                checked={appState.selectedShapeSet.has(shape.index)}
                onchange={() => toggleShape(shape.index)}
              />
              <span class="text-neutral-400 dark:text-neutral-500">{shape.index}</span>
              {#if shape.name}
                <span>{shape.name}</span>
              {/if}
            </label>
          {/each}
        </div>
        <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          {appState.selectedShapeIndices.length} of {appState.data.shapes.length} shapes
        </p>
      {/if}
    </div>
  {/if}

  <div>
    <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Colors</h2>
    <div class="flex gap-1">
      {#each colorSchemes as scheme}
        <button
          class="px-3 py-1 text-sm rounded {appState.colorScheme === scheme.value ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
          onclick={() => appState.colorScheme = scheme.value}
        >
          {scheme.label}
        </button>
      {/each}
    </div>
  </div>

  {#if appState.selectedNodeIndex !== null}
    <div class="border-t border-neutral-200 dark:border-neutral-700 pt-4">
      <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Selected</h2>
      {#if appState.viewMode === 'shapes'}
        {@const shape = appState.data.shapes[appState.selectedNodeIndex]}
        {@const allNames = shape.modes.flatMap(m => m.names)}
        {@const sorted = sortNames(allNames)}
        <p class="text-sm font-medium dark:text-neutral-200">{sorted.primary[0] ?? `Shape ${appState.selectedNodeIndex}`}</p>
        {#if sorted.primary.length > 1}
          <p class="text-xs text-neutral-500 dark:text-neutral-400">{sorted.primary.slice(1).join(', ')}</p>
        {/if}
        {#if sorted.secondary.length > 0}
          <p class="text-xs text-neutral-400 dark:text-neutral-500 italic">{sorted.secondary.join(', ')}</p>
        {/if}
        <p class="text-xs text-neutral-500 dark:text-neutral-400">Symmetry: {shape.symmetryOrder}-fold</p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">Modes: {shape.modes.length}</p>
      {:else}
        {@const scale = appState.data.scales[appState.selectedNodeIndex]}
        {@const bestName = scale.names.find(n => PRIORITY_NAMES.has(n.name)) ?? scale.names[0]}
        <p class="text-sm font-medium dark:text-neutral-200">
          {bestName ? `${bestName.root} ${bestName.name}` : `Scale ${appState.selectedNodeIndex}`}
        </p>
        {#if scale.names.length > 1}
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {scale.names.filter(n => n !== bestName).map(n => `${n.root} ${n.name}`).join(', ')}
          </p>
        {/if}
        <p class="text-xs text-neutral-500 dark:text-neutral-400">Pitch classes: {scale.pitchClasses.join(', ')}</p>
      {/if}
    </div>
  {/if}

  <div class="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
    <a
      href="https://github.com/elsherbini/necklace_scales"
      target="_blank"
      rel="noopener noreferrer"
      class="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
      aria-label="View source on GitHub"
    >
      <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    </a>
  </div>
</aside>
