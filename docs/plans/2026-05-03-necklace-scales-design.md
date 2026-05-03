# Necklace Scales — Design Document

## Overview

A network-based visualization of musical scales and scale shapes, treating scales as binary necklaces of length 12. Two stages: a precomputation script that generates graph data as JSON, and a SvelteKit static app that visualizes the networks.

## Stage 1: Precomputation Script

**Language:** TypeScript (run with `tsx`)
**Dependencies:** tonal.js for pitch-class naming

### What it computes

For each k in {2, 3, 4, 5, 6, 7, 8}:

1. All pitch-class sets of size k (absolute scales)
2. Canonical forms via smallest-bitmask rotation (shapes)
3. Edges between absolute scales at Hamming distance 2 (one note swap)
4. Edges between shapes at necklace Hamming distance 2
5. Names via tonal.js + custom Barry Harris scale registrations

Complements (k=10,9,8,7,6,5,4) are derivable by bit-flipping. k=4 and k=8 are both explicitly precomputed since both have rich naming (4-note chords, 8-note Barry Harris scales).

### Barry Harris scales to register

- Maj6-diminished
- Min6-diminished
- Dom7-diminished
- Dom7b5-diminished
- Octatonic

### Output format

One JSON file per k (e.g., `k7.json`):

```json
{
  "k": 7,
  "shapes": [
    {
      "canonical": 1234,
      "symmetryOrder": 1,
      "modes": [{ "rotation": 0, "names": ["Ionian", "Major"] }]
    }
  ],
  "scales": [
    {
      "bitmask": 2741,
      "pitchClasses": [0, 2, 4, 5, 7, 9, 11],
      "shapeIndex": 0,
      "rotation": 0,
      "names": [{ "root": "C", "name": "major" }]
    }
  ],
  "shapeEdges": [[0, 1], [0, 3]],
  "scaleEdges": [[0, 5], [0, 12]]
}
```

Layout positions (x, y per node) are stored separately after Cytoscape manual arrangement.

## Stage 2: SvelteKit App

### Tech stack

- SvelteKit with `adapter-static` (GitHub Pages deployment)
- Svelte 5 (runes: `$state`, `$derived`, `$props`)
- Tailwind v4 for styling
- bits-ui for UI primitives (sliders, radio groups, tabs)
- tonal.js for note names
- Layerchart v2 + d3-force for graph rendering

### App structure

```
src/
  routes/
    +page.svelte              — single-page app
    +layout.svelte            — loads data
  lib/
    components/
      Sidebar.svelte          — controls + detail panel
      Graph.svelte            — network visualization
      ChromaticCircle.svelte  — SVG circle representation
      NoteGrid.svelte         — 12x1 horizontal grid
      ScalePopover.svelte     — floating card on node focus
    data/
      k2.json ... k8.json     — precomputed data
      k2-layout.json ...      — Cytoscape-exported positions
    stores/
      app.svelte.ts           — global state
    utils/
      scale.ts                — complement derivation, bitmask helpers
      color.ts                — dim-type color mapping
```

### Global state

```ts
let selectedK = $state(7)
let viewMode = $state<'shapes' | 'scales'>('shapes')
let colorScheme = $state<'bw' | 'metaharmony' | 'elements'>('bw')
let selectedNode = $state<number | null>(null)
let forceSimEnabled = $state(false)
```

### Layout: Sidebar + Graph

- **Persistent sidebar** (left): controls at top, selected-node details below
- **Graph** fills remaining viewport

### Sidebar contents

**Controls:**
- Scale length selector (k=2 through k=10, where k>8 are complement-derived)
- Shapes / Absolute scales toggle
- Color scheme picker (B&W, metaharmony, elements)

**Detail panel (when a node is selected):**

For a shape node:
- Chromatic circle (display rotation: largest chromatic run first)
- 12x1 note grid (same display rotation)
- Shape name(s)
- Symmetry order
- Number of distinct modes
- List of named modes
- Clickable neighbor list

For an absolute scale node:
- Chromatic circle (starting from C / pitch class 0)
- 12x1 note grid (starting from C)
- All applicable names (e.g., "C min6 / A m7b5")
- Parent shape (clickable)
- Clickable neighbor list

### Graph behavior

- **Initial render:** nodes at precomputed Cytoscape positions (no physics)
- **Force sim toggle:** optionally enable d3-force for dragging/exploration
- **Focus mode:** clicking a node highlights it + immediate neighbors, dims the rest
- **Popover:** compact card near the focused node showing circle + grid + name
- **Edge visibility:** shape graphs show all edges; absolute scale graphs (up to ~16K edges at k=6) show only focused neighborhood edges by default

### Switching views

Toggling between shapes and absolute scales swaps the entire graph (different nodes, edges, layout positions). No animated transition between views.

## Representations

### Display rotation (for shapes)

Separate from the internal canonical form (smallest bitmask). Display rotation sorting rule:

1. Rotate so the longest consecutive run of "on" notes starts at position 0
2. Tie-break: longest consecutive run of "off" notes at the end
3. Final tie-break: numerically smallest bitmask

### Color schemes

Applied to individual notes in the chromatic circle and note grid only. Graph nodes are uncolored.

| Dim Type | Pitch Classes | Metaharmony           | Elements              |
|----------|---------------|-----------------------|-----------------------|
| cDim     | 0, 3, 6, 9   | rgb(215, 204, 59) yellow | rgb(59, 179, 75) green |
| bbDim    | 1, 4, 7, 10  | rgb(216, 37, 84) red/pink | rgb(77, 162, 210) blue |
| bDim     | 2, 5, 8, 11  | rgb(77, 162, 210) blue | rgb(216, 37, 84) red/pink |

Only "on" notes receive color. "Off" notes are transparent / background.

## Implementation Phases

### Phase 1: Precomputation script
- Bitmask utilities (rotation, canonical form, Hamming distance, complement)
- Enumerate all scales and shapes for k=2,3,4,5,6,7,8
- Compute edges (shape-level and absolute-scale-level)
- Name lookup via tonal.js + Barry Harris registrations
- Output JSON files

### Phase 2: SvelteKit app scaffold
- SvelteKit + adapter-static + Tailwind v4 + bits-ui setup
- Load JSON data, wire up global state with runes
- Sidebar with controls

### Phase 3: Graph visualization
- Render graph from precomputed positions
- Focus mode (click to highlight neighborhood)
- Optional force simulation toggle

### Phase 4: Representations + detail panel
- ChromaticCircle SVG component
- NoteGrid component
- Popover on graph node click
- Sidebar detail panel

### Phase 5: Cytoscape layout pass
- Export JSON to Cytoscape-compatible format
- Manually arrange each graph
- Import positions back into app data

### Phase 6: Polish
- Color schemes applied to note representations
- Complement-derived views (k=9,10)
- Edge visibility optimization for large graphs
