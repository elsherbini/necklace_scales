# Glyph Grid View Design

## Summary

Add a new "Grid" visualization mode alongside the existing force-directed "Graph" mode. In Grid mode, each scale/shape is rendered as a small glyph (chromatic circle or 12-cell binary strip) arranged in a vertical list. Clicking a scale redistributes glyphs into horizontal columns by BFS distance.

## Layout

### Orientation

Glyphs are stacked vertically. The vertical position of each glyph is fixed based on a sort order and never changes during interaction. Horizontal position changes based on selection state.

### Default State (No Selection)

All glyphs sit in a single column (column 0), sorted top-to-bottom by:

1. Max chromatic run (descending) — longest consecutive run of 1-bits in the circular 12-bit bitmask
2. Max off-run (descending) — longest consecutive run of 0-bits
3. Bitmask (ascending)

Group labels on the left indicate the max chromatic run value for each group (e.g., "8", "5", "3", "2").

### Selected State (Click a Glyph)

The selected glyph stays in column 0 with a highlight. All other glyphs slide horizontally to the column matching their BFS distance from the selected glyph (using the existing edge data). Column 0 = selected, column 1 = 1 move away, column 2 = 2 moves, etc.

Column headers appear at the top of each occupied column showing the distance number. These stay sticky when scrolling vertically.

Vertical positions do not change — only horizontal positions animate.

## Glyph Styles

Two glyph representations, toggleable by the user:

### 12-Cell Binary Strip

A horizontal row of 12 small cells. Each cell represents a pitch class (C through B). Filled = note in the scale, empty = not. Approximately 60px wide by 8px tall. Compact and scannable when stacked vertically.

### Chromatic Circle

A small circle (~30x30px) with 12 positions around the perimeter (C at top, clockwise). Active pitch classes are filled dots, inactive are hollow. More musically intuitive.

## Interaction

- **Click glyph:** Selects it. Other glyphs animate horizontally to their BFS distance column (~300ms ease-out transition). Sidebar shows selected node details (same as graph view).
- **Click selected glyph:** Deselects. All glyphs animate back to column 0.
- **Hover:** Tooltip with scale/shape name or bitmask. Border highlight.
- **Color:** Glyphs use the existing color scheme (B&W, Metaharmony, Elements). All glyphs stay full opacity since distance is encoded by column position.

## Sidebar Changes

New controls added to the sidebar:

- **Visualization toggle:** "Graph" / "Grid" — switches between the two views. Added near the existing View Mode controls.
- **Glyph style toggle:** "Strip" / "Circle" — appears when Grid mode is active.

Existing controls (scale length, shapes/scales mode, color scheme) remain unchanged and apply to both visualization modes.

## State

New state variables in `state.svelte.ts`:

- `visualizationMode: 'graph' | 'grid'` — which view is active
- `glyphStyle: 'strip' | 'circle'` — which glyph rendering to use

The GlyphGrid component consumes existing derived state: `selectedNodeIndex`, `nodes`, `nodeColors`, and the BFS distance computation. No duplication of logic.

## New Utility Functions

- `maxChromaticRun(bitmask: number): number` — longest consecutive run of 1-bits in the circular 12-bit bitmask
- `maxOffRun(bitmask: number): number` — longest consecutive run of 0-bits in the circular 12-bit bitmask

## Implementation

### New Files

- `app/src/lib/components/GlyphGrid.svelte` — the grid visualization component

### Modified Files

- `app/src/lib/state.svelte.ts` — add `visualizationMode` and `glyphStyle` state
- `app/src/lib/components/Sidebar.svelte` — add visualization and glyph style toggles
- `app/src/routes/+page.svelte` — conditionally render Graph or GlyphGrid

### Scope

Works in both Shapes and Scales modes. Scales mode will have many more glyphs (e.g., 495 for k=8) and may need iteration, but the initial implementation uses the same logic for both.

### Rendering

SVG-based, same as the graph view. Each glyph is an SVG `<g>` element positioned by CSS transform. Horizontal transitions use Svelte transitions or CSS transitions on the transform property.

### Scrolling

For large numbers of glyphs, the view scrolls vertically. Column headers (distance labels) stay sticky at the top.
