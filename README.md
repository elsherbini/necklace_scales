# Necklace Scales

Enumerates all possible musical scales of a given length (k notes out of 12), groups them by necklace equivalence (transposition classes), and names them using known scale/chord databases.

## Structure

- **`scripts/`** — Precomputes scale data into JSON. Uses [Tonal.js](https://github.com/tonaljs/tonal) to match pitch class sets against known scale and chord names.
- **`app/`** — SvelteKit frontend that visualizes the precomputed data.

## Adding scale names

Edit `scripts/src/custom-scales.ts`. Add entries to `customScales` or `customChords` using Tonal interval notation:

```
Semitone:  0    1    2    3    4    5    6    7    8    9    10   11
Interval:  1P   2m   2M   3m   3M   4P   4A   5P   5A   6M   7m   7M
```

Then regenerate the JSON:

```sh
cd scripts && npm run build && node dist/main.js
```

## Setup

Install [Node.js](https://nodejs.org/) (includes `npm` and `npx`).

Install dependencies for both directories:

```sh
cd scripts && npm install
cd ../app && npm install
```

Generate scale data:

```sh
cd scripts && npm run build && node dist/main.js
```

Run the app locally:

```sh
cd app && npm run dev
```
