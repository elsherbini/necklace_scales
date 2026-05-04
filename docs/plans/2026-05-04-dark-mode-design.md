# Dark Mode / Light Mode Design

## Overview

Add dark/light/system theme support to the entire app, with the toggle in the sidebar.

## Requirements

- Theme applies to the whole app (sidebar + main content)
- User preference persisted in localStorage
- System preference used as default when no explicit choice
- Three options: Light, System, Dark
- Visualization colors (B&W, Metaharmony, Elements) stay unchanged
- No flash of wrong theme on page load

## Approach: Tailwind v4 `dark:` class variants

### Infrastructure Changes

**`app/src/app.css`** — Enable class-based dark mode:
```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

**`app/src/app.html`** — Inline script in `<head>` to set `.dark` class before render:
```html
<script>
  if (localStorage.theme === 'dark' || (!localStorage.theme && matchMedia('(prefers-color-scheme: dark)').matches))
    document.documentElement.classList.add('dark');
</script>
```

**`app/src/lib/types.ts`** — Add type:
```ts
export type Theme = 'light' | 'dark' | 'system';
```

**`app/src/lib/state.svelte.ts`** — Add `theme` property:
- Reads initial value from `localStorage.theme` (defaults to `'system'`)
- Setter writes to localStorage and updates `document.documentElement.classList`
- Exposes `resolvedTheme` (derived: 'light' or 'dark') for components that need the actual value

### Color Mapping

| Light | Dark | Usage |
|-------|------|-------|
| `bg-white` | `dark:bg-neutral-900` | Sidebar background |
| `bg-neutral-50` | `dark:bg-neutral-950` | Main content area |
| `bg-neutral-100` | `dark:bg-neutral-800` | Inactive buttons |
| `bg-neutral-900 text-white` | `dark:bg-white dark:text-neutral-900` | Active buttons |
| `bg-neutral-700 text-white` | `dark:bg-neutral-300 dark:text-neutral-900` | Active sub-buttons |
| `text-neutral-500` | `dark:text-neutral-400` | Section headers |
| `text-neutral-700` | `dark:text-neutral-300` | Body text, labels |
| `text-neutral-400` | `dark:text-neutral-500` | Muted text |
| `text-neutral-600` | `dark:text-neutral-400` | Button text |
| `border-neutral-200` | `dark:border-neutral-700` | Borders |
| `hover:bg-neutral-200` | `dark:hover:bg-neutral-700` | Button hovers |
| `hover:bg-neutral-50` | `dark:hover:bg-neutral-800` | Checkbox row hovers |
| `stroke-neutral-300` | `dark:stroke-neutral-600` | Graph edges, circle outlines |
| `fill-neutral-600` | `dark:fill-neutral-400` | Graph nodes |
| `fill-neutral-400` | `dark:fill-neutral-500` | SVG text labels |
| `bg-white/90` | `dark:bg-neutral-900/90` | Graph legend overlay |
| `text-neutral-600` (legend) | `dark:text-neutral-400` | Legend text |
| `text-neutral-700` (legend) | `dark:text-neutral-300` | Legend values |

### GlyphGrid `noteFill` adjustment

The "off" note fill (`#e5e5e5`) needs to be darker in dark mode so it's still visible but muted against the dark background. Use `#404040` for off-notes in dark mode. This requires passing the resolved theme into the `noteFill` function.

### Component Changes

**Sidebar.svelte:**
- Add theme toggle as the first section (Light / System / Dark buttons)
- Add `dark:` variants to all hardcoded color classes

**+page.svelte:**
- Add `dark:bg-neutral-950` to main content area

**Graph.svelte:**
- Add `dark:` variants to stroke/fill classes on edges and nodes
- Update legend overlay colors

**GlyphGrid.svelte:**
- Update `noteFill()` to accept theme and return appropriate off-color
- Add `dark:` variants to text labels

### Toggle Placement

First section in the sidebar (above Scale Length). Three-way toggle using the same button styling pattern as existing toggles: Light / System / Dark.

## Files Modified

1. `app/src/app.css`
2. `app/src/app.html`
3. `app/src/lib/types.ts`
4. `app/src/lib/state.svelte.ts`
5. `app/src/lib/components/Sidebar.svelte`
6. `app/src/routes/+page.svelte`
7. `app/src/lib/components/Graph.svelte`
8. `app/src/lib/components/GlyphGrid.svelte`
