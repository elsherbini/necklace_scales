
## Goal

build a network-based visualization of scales and scale shapes of different lengths.

## Theory
see docs/theory.md

## Plan
Stage 1: build a data structure holding all scales and scale shapes,
compute edges between scales that are 1 "move apart" meaning turning off one note and turning on one note makes the scale. Also between scale shapes that are 1 "move" apart. In this case only care about distances between scales of the same length. this can be done in a script separate from the app. The output of stage 1 is json that can be ingested by the app.

Stage2: build a sveltekit adapter static app to show these relationships. There'd be a network visualization of the selected scale length, and a way to swap between viewing "scale shapes" and absolute scales.

## representations
A scale and scale shape has two main representations in the UI:
1. a 12x1 grid going horizontally, where squares are filled in if the note is included or transparent if the note is excluded
2. a chromatic circle, with circles representing the notes on the outside.
3. when viewing a scale shape rather than an absolute scale, always sort it so the largest chromatic run comes first. if there is a tie, sort it so the largest chromatic run of "off notes" comes last. if there is still a tie, just pick a way that makes sure the rotation shown is deterministic.
4. when viewing an absolute scale, it'd be a rotation of the scale-shape. I.e. a maj6-diminished 8 note scale shape is 111011010110 . This starts with the beginning of the largest chromatic run (G,Ab,A). but the absolute verstion needs to know C is the root and show it starting with C. We'll have to decide what the "root" is for the 43 8 note scales. 


Notes have three main color schemes:
1. black and white. if a note is selected, it is black-ish (or white-ish in dark mode). unselected notes are transparent / same color as background.

  Summary of the color schemes:
  ┌──────────┬─────────────────────────────┬─────────────────────────────┐
  │ Dim Type │         metaharmony         │          elements           │
  ├──────────┼─────────────────────────────┼─────────────────────────────┤
  │ cDim     │ rgb(215, 204, 59) (yellow)  │ rgb(59, 179, 75) (green)    │
  ├──────────┼─────────────────────────────┼─────────────────────────────┤
  │ bbDim    │ rgb(216, 37, 84) (red/pink) │ rgb(77, 162, 210) (blue)    │
  ├──────────┼─────────────────────────────┼─────────────────────────────┤
  │ bDim     │ rgb(77, 162, 210) (blue)    │ rgb(216, 37, 84) (red/pink) │
  └──────────┴─────────────────────────────┴─────────────────────────────┘

where cdim is the pitch classes 1,4,7,10, bbdim is the pitchclasses 2,5,8,11 and b dim is the pitchclasses 3,6,9,12.

## App Tech Stack

- SvelteKit with `adapter-static` (GitHub Pages deployment)
- Svelte 5 (runes: $state, $derived, $props)
- Tailwind v4 for styling
- bits-ui for UI primitives (sliders, radio groups, tabs)
- tonal.js note names, scale collections
- Layerchart v2 and d3js for layout
  - graph representation -> https://next.layerchart.com/docs/components/Dagre/llms.txt
