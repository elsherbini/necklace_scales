# Scales as Necklaces: Context for App Development

## Domain

Pitch-class sets in 12-tet, treated as binary necklaces of length 12. Bead = pitch class; on/off = note included or excluded. Two scales are the **same shape** iff they're related by transposition (cyclic rotation of $\mathbb{Z}/12\mathbb{Z}$).

**Equivalence model: cyclic only ($C_{12}$).** Inversion equivalence ($D_{12}$, Forte set classes) is *not* used — major and minor triads are distinct shapes, as musicians hear them. This is the right mental model for any audience that thinks in terms of scales, modes, or chord qualities.

## The two counts that matter

For each scale length $k \in \{0, \ldots, 12\}$:

- **Raw scales**: $\binom{12}{k}$ — distinct pitch-class subsets of size $k$.
- **Shapes**: number of $C_{12}$-orbits among those subsets, computed via Burnside:
  $$N_k = \frac{1}{12} \sum_{\substack{d \mid 12 \\ (12/d) \mid k}} \varphi(12/d) \binom{d}{kd/12}$$

| $k$ | scales | shapes |
|----|--------|--------|
| 0  | 1      | 1      |
| 1  | 12     | 1      |
| 2  | 66     | 6      |
| 3  | 220    | 19     |
| 4  | 495    | 43     |
| 5  | 792    | 66     |
| 6  | 924    | 80     |
| 7  | 792    | 66     |
| 8  | 495    | 43     |
| 9  | 220    | 19     |
| 10 | 66     | 6      |
| 11 | 12     | 1      |
| 12 | 1      | 1      |

Total shapes across all $k$: **352** binary necklaces of length 12.

## Modes are rotations within a shape

A crucial UX point: **modes of a scale are not separate shapes** — they are rotations of the same necklace.

The seven diatonic modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) are seven different starting points within one and the same 7-note necklace. Under cyclic equivalence they collapse to a single shape. Likewise the modes of melodic minor, harmonic minor, harmonic major, etc. each correspond to one shape.

So a shape may have multiple musical *names* depending on which rotation you start from. The app should distinguish:

- **Shape**: the orbit (one canonical bitmask).
- **Mode / rotation**: a specific starting point within the shape, which is what gives a scale its "color" (Dorian vs. Phrygian vs. Lydian).

Symmetric shapes have fewer distinct modes than $k$ — e.g. the whole-tone scale has 6-fold rotational symmetry, so all six "modes" sound identical; the diminished scale has 2-fold symmetry, giving 4 distinct modes rather than 8.

## Representations

A scale can be represented as:
- **Subset**: `{0, 4, 7}` (C major triad)
- **Bitmask**: `0b000010010001` = `0x091` (12-bit int, LSB = pitch class 0)
- **Interval vector / step pattern**: `[4, 3, 5]` (gaps between consecutive notes, sums to 12)
- **Canonical form (prime form)**: lexicographically smallest rotation of the bitmask, useful as a shape key

Bitmask representation is fastest for set ops and rotation: rotating by $j$ semitones is `((x << j) | (x >> (12 - j))) & 0xFFF`.

Note: "prime form" here means smallest-rotation under $C_{12}$ only — *not* Forte/Rahn prime form, which also minimizes over inversion.

## Distances

**Necklace Hamming distance** between two shapes:
$$d(\mathcal{O}_A, \mathcal{O}_B) = \min_{j \in \mathbb{Z}/12} |A \triangle T_j B|$$

For $|A| = |B|$ this is the minimum number of single-note flips (under best transposition) to convert one shape to the other.

For $|A| \neq |B|$, same formula with symmetric difference; distance is at least $||A| - |B||$.

Brute force over 12 rotations is fine at this scale.

**Voice-leading distance** (Tymoczko) is a different metric — optimal-transport-style minimum total semitone displacement when notes are matched between chords. Lives on orbifold geometry. Use only if the app cares about voice leading specifically; otherwise stick with necklace Hamming.

## Useful structural facts

- Complement symmetry: $N_k = N_{12-k}$ (complementing a necklace is a $C_{12}$-equivariant bijection).
- Symmetric shapes (those fixed by some non-identity rotation) correspond to the non-identity terms in the Burnside sum. Examples: augmented triad (3-fold), diminished 7th (4-fold), whole-tone scale (6-fold), tritone (2-fold).
- The shape graph (nodes = shapes, edges = necklace distance 1) is a natural object for navigation/UI.

## Likely app primitives

- `canonical(scale: int) -> int`: smallest-rotation bitmask (the shape ID)
- `shape_id(scale) -> int`: index into the precomputed list of 352 shapes
- `rotations(scale) -> list[int]`: all 12 transpositions
- `modes(shape) -> list[int]`: distinct rotations of a shape (deduplicated for symmetric shapes)
- `necklace_distance(a, b) -> int`
- `neighbors(shape, distance=1) -> list[shape]`
- Precomputed table of all 352 shapes keyed by canonical bitmask, with metadata (size, rotational symmetry order, common names per rotation where applicable)

## Naming

Shapes have established names where they correspond to familiar scales/chords. The app should map **(shape, rotation) → name**, since the same shape gives different names at different rotations:

- Shape `{0,2,4,5,7,9,11}` (diatonic) at rotation 0 = Ionian (major); rotation 2 = Dorian; rotation 4 = Phrygian; etc.
- Shape `{0,4,7}` (major triad) at rotation 0 = major; this shape has no rotational symmetry, so all 12 transpositions are named C, C♯, D, ... B major.
- Shape `{0,3,7}` (minor triad) is a *different shape* and gets its own family of names.

A canonical-bitmask → list-of-(rotation, name) lookup table is worth building once. Sources for names:
- Standard scale/chord references (jazz theory texts, Persichetti, etc.)
- `music21` (Python) for a programmatic reference, though it leans toward Forte naming
- The "Ian Ring scale archive" (https://ianring.com/musictheory/scales/) catalogs all 352 shapes with names where they exist — useful as a starting dataset

Many of the 352 shapes have no common name; that's expected and fine.