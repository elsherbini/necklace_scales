# Dark Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dark/light/system theme support across the entire app with a toggle in the sidebar.

**Architecture:** Tailwind v4 class-based dark mode via `@custom-variant dark`. Theme state managed in `appState` with localStorage persistence. Inline script in `app.html` prevents flash of wrong theme.

**Tech Stack:** SvelteKit, Svelte 5, Tailwind CSS v4, localStorage

**Design doc:** `docs/plans/2026-05-04-dark-mode-design.md`

---

### Task 1: Tailwind dark mode infrastructure

**Files:**
- Modify: `app/src/app.css`
- Modify: `app/src/app.html`

**Step 1: Enable class-based dark mode in CSS**

In `app/src/app.css`, add the custom variant after the import:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**Step 2: Add flash-prevention script to HTML**

In `app/src/app.html`, add this inline script inside `<head>` before `%sveltekit.head%`:

```html
<script>
  if (localStorage.theme === 'dark' || (!localStorage.theme && matchMedia('(prefers-color-scheme: dark)').matches))
    document.documentElement.classList.add('dark');
</script>
```

**Step 3: Commit**

```bash
git add app/src/app.css app/src/app.html
git commit -m "feat: add Tailwind v4 dark mode infrastructure"
```

---

### Task 2: Theme type and state management

**Files:**
- Modify: `app/src/lib/types.ts`
- Modify: `app/src/lib/state.svelte.ts`

**Step 1: Add Theme type**

In `app/src/lib/types.ts`, add at the end:

```ts
export type Theme = 'light' | 'dark' | 'system';
```

**Step 2: Add theme state to appState**

In `app/src/lib/state.svelte.ts`:

1. Import the Theme type:
```ts
import type { ViewMode, ColorScheme, VisualizationMode, GlyphStyle, Theme } from '$lib/types';
```

2. Inside `createAppState()`, add these state variables after the existing ones:

```ts
let theme = $state<Theme>(
  (typeof localStorage !== 'undefined' && localStorage.theme as Theme) || 'system'
);
```

3. Add a helper function inside `createAppState()` to apply the theme to the DOM:

```ts
function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const isDark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}
```

4. Add a `resolvedTheme` derived:

```ts
const resolvedTheme = $derived.by(() => {
  if (theme === 'system') {
    // This won't reactively track media query changes, but the flash-prevention
    // script handles initial load and users can toggle explicitly
    if (typeof matchMedia !== 'undefined') {
      return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return theme;
});
```

5. Add to the returned object:

```ts
get theme() { return theme; },
set theme(v: Theme) {
  theme = v;
  if (typeof localStorage !== 'undefined') {
    if (v === 'system') localStorage.removeItem('theme');
    else localStorage.theme = v;
  }
  applyTheme(v);
},
get resolvedTheme() { return resolvedTheme; },
```

**Step 3: Commit**

```bash
git add app/src/lib/types.ts app/src/lib/state.svelte.ts
git commit -m "feat: add theme state with localStorage persistence"
```

---

### Task 3: Sidebar — add theme toggle and dark mode classes

**Files:**
- Modify: `app/src/lib/components/Sidebar.svelte`

**Step 1: Add theme toggle section**

Add a `themes` array constant in the `<script>` block:

```ts
const themes = [
  { value: 'light' as const, label: 'Light' },
  { value: 'system' as const, label: 'System' },
  { value: 'dark' as const, label: 'Dark' },
];
```

Add a new section as the FIRST child of `<aside>`, before the Scale Length section:

```svelte
<div>
  <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Theme</h2>
  <div class="flex gap-1">
    {#each themes as t}
      <button
        class="px-3 py-1 text-sm rounded {appState.theme === t.value ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
        onclick={() => appState.theme = t.value}
      >
        {t.label}
      </button>
    {/each}
  </div>
</div>
```

**Step 2: Add dark mode classes to all existing elements**

Apply the color mapping from the design doc to every element. Here is the full list of changes:

The `<aside>` tag:
```
bg-white → bg-white dark:bg-neutral-900
border-neutral-200 → border-neutral-200 dark:border-neutral-700
```

All `<h2>` section headers:
```
text-neutral-500 → text-neutral-500 dark:text-neutral-400
```

Active buttons (Scale Length, View, Display, Colors):
```
bg-neutral-900 text-white → bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
```

Inactive buttons:
```
bg-neutral-100 text-neutral-700 hover:bg-neutral-200 → bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700
```

Active sub-buttons (Strip/Circle):
```
bg-neutral-700 text-white → bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900
```

Inactive sub-buttons:
```
bg-neutral-100 text-neutral-600 hover:bg-neutral-200 → bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700
```

Muted `<p>` text (counts, etc.):
```
text-neutral-400 → text-neutral-400 dark:text-neutral-500
```

Filter shape labels:
```
text-neutral-700 → text-neutral-700 dark:text-neutral-300
```

Shape index span:
```
text-neutral-400 → text-neutral-400 dark:text-neutral-500
```

Run group labels:
```
text-neutral-400 → text-neutral-400 dark:text-neutral-500
```

Checkbox row hover:
```
hover:bg-neutral-50 → hover:bg-neutral-50 dark:hover:bg-neutral-800
```

Selected node border:
```
border-neutral-200 → border-neutral-200 dark:border-neutral-700
```

Selected node info text:
```
text-neutral-500 → text-neutral-500 dark:text-neutral-400
text-neutral-400 italic → text-neutral-400 dark:text-neutral-500 italic
```

**Step 3: Commit**

```bash
git add app/src/lib/components/Sidebar.svelte
git commit -m "feat: add theme toggle and dark mode to sidebar"
```

---

### Task 4: Page layout dark mode

**Files:**
- Modify: `app/src/routes/+page.svelte`

**Step 1: Add dark background to main area**

Change the `<main>` tag class:
```
bg-neutral-50 → bg-neutral-50 dark:bg-neutral-950
```

**Step 2: Commit**

```bash
git add app/src/routes/+page.svelte
git commit -m "feat: add dark mode to page layout"
```

---

### Task 5: Graph component dark mode

**Files:**
- Modify: `app/src/lib/components/Graph.svelte`

**Step 1: Add dark mode classes to SVG elements**

Edge strokes — update the class attribute on `<line>` elements. Each stroke class needs a dark variant:
```
stroke-neutral-300 → stroke-neutral-300 dark:stroke-neutral-600
stroke-neutral-200 → stroke-neutral-200 dark:stroke-neutral-700
stroke-neutral-400 → stroke-neutral-400 dark:stroke-neutral-500
```
(Blue strokes stay the same — they work on both backgrounds.)

Node fills:
```
fill-neutral-600 hover:fill-neutral-900 → fill-neutral-600 hover:fill-neutral-900 dark:fill-neutral-400 dark:hover:fill-neutral-200
fill-neutral-900 → fill-neutral-900 dark:fill-neutral-100
```

Legend overlay:
```
bg-white/90 border border-neutral-200 → bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700
text-neutral-600 → text-neutral-600 dark:text-neutral-400
text-neutral-700 → text-neutral-700 dark:text-neutral-300
```

**Step 2: Commit**

```bash
git add app/src/lib/components/Graph.svelte
git commit -m "feat: add dark mode to graph component"
```

---

### Task 6: GlyphGrid component dark mode

**Files:**
- Modify: `app/src/lib/components/GlyphGrid.svelte`

**Step 1: Update noteFill function**

The `noteFill` function needs to return a dark-appropriate "off" color. Since SVG `fill` attributes don't support Tailwind's `dark:` prefix, use `appState.resolvedTheme`:

```ts
function noteFill(bit: number, isOn: boolean): string {
  if (!isOn) return appState.resolvedTheme === 'dark' ? '#404040' : '#e5e5e5';
  if (appState.viewMode !== 'scales') return appState.resolvedTheme === 'dark' ? '#d4d4d4' : '#404040';
  const group = bit % 3;
  return DIM_COLORS[appState.colorScheme]?.[group] ?? '#404040';
}
```

Note: The "on" color for shapes mode also needs to flip — `#404040` in light becomes `#d4d4d4` in dark for visibility.

**Step 2: Add dark classes to SVG text elements**

Column header text:
```
fill-neutral-400 → fill-neutral-400 dark:fill-neutral-500
```

Group label text:
```
fill-neutral-400 → fill-neutral-400 dark:fill-neutral-500
```

Circle glyph outline:
```
stroke-neutral-300 → stroke-neutral-300 dark:stroke-neutral-600
```

**Step 3: Commit**

```bash
git add app/src/lib/components/GlyphGrid.svelte
git commit -m "feat: add dark mode to glyph grid component"
```

---

### Task 7: Visual verification

**Step 1: Run the dev server**

```bash
cd app && npm run dev
```

**Step 2: Verify in browser**

Check the following in both light and dark modes:
- [ ] Theme toggle works (Light/System/Dark buttons)
- [ ] Sidebar colors correct in both modes
- [ ] Main content background changes
- [ ] Graph nodes and edges visible in dark mode
- [ ] GlyphGrid strips visible in dark mode
- [ ] GlyphGrid circles visible in dark mode
- [ ] Legend overlay readable in dark mode
- [ ] Theme persists across page reload
- [ ] No flash of wrong theme on reload
- [ ] Selected node info section readable in dark mode

**Step 3: Fix any issues found**

**Step 4: Final commit if any fixes**

```bash
git add -A && git commit -m "fix: dark mode visual adjustments"
```
