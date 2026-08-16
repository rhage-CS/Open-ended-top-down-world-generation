# TINYTOWN_v2.md

Tile dictionary for `assets/tilemap_packed.png` (Kenney Tiny Town).

**Sheet geometry:** 192x176 px, 16px tiles, spacing 0, margin 0 -> 12 cols x 11 rows = 132 tiles.
**Index mapping:** `row = i // 12`, `col = i % 12`.

**Coverage:** rows 5 (col 11) through 10 complete. Indices 71-131, 61 of 132 tiles.
Indices 0-70 (rows 0-5) are **not yet authored**.

---

## Method and why v2 replaces v1

v1 was authored from a single index-strip screenshot and keyed on index ranges. It was
systematically wrong: labels tracked category priors rather than pixel evidence, and its
uncertainty was calibrated at the wrong taxonomy level (hedging on which variant of a
category a tile was, while being wrong about the category itself).

v2 is authored from per-tile pixel dumps with programmatic verification. Every claim marked
VERIFIED below was checked by comparing pixel arrays, not by looking at the art. Claims that
rest on visual interpretation are marked READS AS and are explicitly demotable.

**Key structural fact driving the format:** the sheet is authored as 2D spatial regions.
Region boundaries fall mid-row, and related tiles form columns. Any dictionary organized by
index range will fragment these groups. This file is keyed on `(row, col)`.

Two concrete demonstrations:
- Row 6 splits mid-row. Cols 0-7 are opaque facade tiles; cols 8-11 are transparent-ground
  fence and sign objects. Index order crosses this boundary twice within eleven tiles.
- The second outline colour appears in exactly three tiles: (7,8), (8,8), (10,8). A column.
  As indices these are 92, 104, 128, which look unrelated.

---

## Palette

23 distinct colours. Seven form the core, and matter most.

### Core
| symbol | RGB | role |
|---|---|---|
| `#` | 63,38,49 | outline (primary) |
| `o` | 189,108,74 | orange base |
| `O` | 234,165,108 | orange light |
| `r` | 118,59,54 | orange dark / shadow |
| `b` | 139,155,180 | blue-grey base |
| `B` | 192,203,220 | blue-grey light |
| `h` | 90,105,136 | blue-grey dark / shadow |

### Extended
| symbol | RGB | notes |
|---|---|---|
| `~` | 61,33,45 | **outline (secondary)** — only col 8, rows 7/8/10 |
| `a` | 227,134,40 | amber |
| `y` | 253,190,83 | yellow |
| `R` | 232,69,55 | red |
| `P` | 255,112,109 | pink |
| `W` | 255,255,255 | white |
| `N` | 38,43,68 | navy |
| `s` | 82,96,124 | slate |
| `c` | 0,154,220 | cyan (water) |
| `C` | 118,228,255 | cyan light (water highlight) |

### Offset duplicates — READ THIS BEFORE WRITING ANY GROUPING CODE

Six colours sit 2-7 units (Manhattan) from a core colour and are **not** the same value:

| offset | nearest core | distance |
|---|---|---|
| 140,156,181 | 139,155,180 `b` | 3 |
| 193,204,221 | 192,203,220 `B` | 3 |
| 235,166,108 | 234,165,108 `O` | 2 |
| 190,108,73 | 189,108,74 `o` | 2 |
| 81,96,125 | 82,96,124 `s` | 2 |
| 119,56,51 | 118,59,54 `r` | 7 |
| 233,67,52 | 232,69,55 `R` | 6 |

**Exact palette match is not a safe key for grouping tiles.** An agent clustering by identical
colour sets will split tiles that belong together and will treat the well at col 8 as unrelated
to everything else. Use a tolerance of ~8 Manhattan distance.

Offsets concentrate in (8,8) which carries four of them, but (8,9), (8,11) and (10,8) each carry
one, so this is not cleanly confined to a single object. Treat it as sheet-wide.

---

## Region: building facade (rows 6-7, cols 0-7)

Opaque surface tiles. Two colourways: cols 0-3 orange, cols 4-7 blue.
No top or bottom outline on any wall piece, so the surface tiles seamlessly in both axes.
Light horizontal band at y=11-12 repeats on every wall piece.

**VERIFIED:** (6,0)/(6,4), (6,1)/(6,5), (6,2)/(6,6), (6,3)/(6,7) are pixel-identical under a
full palette swap.

**VERIFIED:** (7,0)/(7,4), (7,1)/(7,5), (7,2)/(7,6), (7,3)/(7,7) are **not**. A naive full swap
leaves 24 mismatches on the window pair and 4 on each door pair. Only base<->base and
light<->light vary between colourways. **Glass and door-handle accents stay blue in the orange
building.** The dark tone 118,59,54 is shared by both colourways.

| (row,col) | idx | tile |
|---|---|---|
| (6,0) | 72 | wall, left end. Outline x=0-1 only, light trim x=2-3 |
| (6,1) | 73 | wall, plain fill. No outline any edge. Tileable both axes |
| (6,2) | 74 | wall, **open** doorway. Transparent opening x=4-11, y=5-15 |
| (6,3) | 75 | wall, right end. Outline x=14-15 only, light trim x=11-13 |
| (6,4) | 76 | as (6,0), blue |
| (6,5) | 77 | as (6,1), blue |
| (6,6) | 78 | as (6,2), blue |
| (6,7) | 79 | as (6,3), blue |
| (7,0) | 84 | wall + window, two panes, fixed blue glass |
| (7,1) | 85 | wall + single door. Handle x=6-7, left of leaf centre |
| (7,2) | 86 | wall + double door, LEFT leaf. Handle x=11-12 |
| (7,3) | 87 | wall + double door, RIGHT leaf. Handle x=3-4 |
| (7,4) | 88 | as (7,0), blue background |
| (7,5) | 89 | as (7,1), blue background |
| (7,6) | 90 | as (7,2), blue background |
| (7,7) | 91 | as (7,3), blue background |

**VERIFIED:** (6,2) and (7,1) share an identical frame — zero mismatched pixels across every
pixel where (6,2) is opaque. (6,2) is the open state of the door at (7,1), not a generic hole.

**VERIFIED:** (7,2) col 15 and (7,3) col 0 carry identical per-row outline patterns, forming a
continuous 2px mullion. Handles sit symmetric about the seam. This is what identifies the blue
accent as a handle rather than a small pane.

### Placement rules
- **Windows are self-contained.** Frame closes at y=13-15.
- **Doors are not.** The frame on (6,2), (7,1), (7,2), (7,3) runs off the bottom tile edge.
  Door tiles must sit on the bottom row of a facade or the frame terminates against wall
  texture instead of ground. Doors and windows are **not** interchangeable inserts.
- Double doors must be placed as an adjacent pair, left leaf then right leaf.

---

## Region: posts, rails, sign (row 5 col 11, row 6 cols 8-11)

Transparent ground, outlined on all exposed edges, orange ramp only.
Post cross-section is `##oooo##` at x=4-11 in all post pieces.

| (row,col) | idx | tile |
|---|---|---|
| (5,11) | 71 | post with stem rising from top. Neck x=5-10 at y=0-2 |
| (6,8) | 80 | post + rail extending RIGHT. Rail at y=5-12, x=10-15 |
| (6,9) | 81 | horizontal rail, full width, y=5-12 |
| (6,10) | 82 | post + rail extending LEFT |
| (6,11) | 83 | sign board on stem. Board x=1-14 y=1-12, two rows of dark marks |

**VERIFIED:** (6,10) is the exact horizontal mirror of (6,8).
**VERIFIED:** (6,8) rail occupies y=5-12 and (6,9) rail occupies y=5-12 — they connect seamlessly.
**VERIFIED:** (6,11) bottom stem and (5,11) top neck both occupy columns 5-10 with an identical
`##ff##` pattern. **(6,11) mounts on top of (5,11)**, i.e. the sign sits above the post despite
appearing after it in index order.

---

## Region: large assembly (rows 8-10, cols 0-2 + row 8 cols 3-5)

Blue-grey only. A modular multi-tile structure with a repeating course band, corner trim
strips, and plain interior fill. Distinct from the facade above and the brick below.

**Course band structure:** outline row(s) / 3 rows of 2px notches at 4px pitch / 2 rows base /
3 rows light. Trim strip runs x=2-3 (or x=12-13 mirrored) on a period-4 sequence `BB,BB,bb,hh`.

**VERIFIED — the assembly is modular, not tiled.** (8,4) rows y10-15 are pixel-identical to
(10,1) rows y10-15. (8,4) rows y0-9 match (8,1) with only 5 differing pixels, all speckle.
Tile (8,4) is literally (8,1)'s top composed with (10,1)'s bottom.

| variant | course position | tiles |
|---|---|---|
| top only | y0-4 | (8,0) (8,1) (8,2) |
| top + lower | y0-4 and y10-13 | (8,3) (8,4) (8,5) |
| none, body | — | (9,0) (9,1) (9,2) |
| lower only | y10-15 | (10,0) (10,1) (10,2) |

| (row,col) | idx | role |
|---|---|---|
| (8,0) | 96 | top-left. Rounded cut at top-left corner |
| (8,1) | 97 | top-middle |
| (8,2) | 98 | top-right |
| (8,3) | 99 | left, two courses |
| (8,4) | 100 | middle, two courses |
| (8,5) | 101 | right, two courses |
| (9,0) | 108 | body left edge |
| (9,1) | 109 | body interior fill |
| (9,2) | 110 | body right edge |
| (10,0) | 120 | left edge, lower course |
| (10,1) | 121 | interior, lower course |
| (10,2) | 122 | right edge, lower course |

**VERIFIED:** (9,2) is the exact mirror of (9,0). (8,5) is the exact mirror of (8,3).
**VERIFIED:** (8,2) vs mirror of (8,0) differs by 14 px, all base<->light swaps in the light
field at y>=7 — independent surface speckle, not a structural difference. Same for
(10,2) vs mirror of (10,0), 17 px, all above y10.
**VERIFIED:** (9,1) is a single flat colour (192,203,220) across all 256 px, no speckle at all.
**VERIFIED:** the trim strip's period-4 sequence runs continuously across the (8,0) -> (9,0)
boundary, so those tiles stack directly.

**Note:** the course band's 10-row spacing does not divide 16. This is not a tiling period, it
is a module offset. Body tiles carry no course at all and extend vertically without limit.

---

## Region: brick wall (row 10, cols 3-6)

A third wall idiom, distinct from the facade and the assembly. Running-bond brick, period 4
vertically, joints alternating between x=3,10 and x=6,13.

| (row,col) | idx | tile |
|---|---|---|
| (10,3) | 123 | brick, terminating RIGHT. Content x=0-7, transparent x=8-15 |
| (10,4) | 124 | brick, terminating LEFT. Content x=8-15, transparent x=0-7 |
| (10,5) | 125 | brick + framed opening. Dark navy centre |
| (10,6) | 126 | brick fill, tileable |

**VERIFIED:** (10,4) is the exact horizontal mirror of (10,3).

---

## Region: rock formation (row 9, cols 3-6)

Navy field with light blue rock masses and pale vertical bars in the lower centre. Supplied as
left/right halves in two cut-outs. **Carries no outline colour** — bounded by navy field.

| (row,col) | idx | tile | opaque px |
|---|---|---|---|
| (9,3) | 111 | left half, near-solid | 247 |
| (9,4) | 112 | right half, near-solid | 247 |
| (9,5) | 113 | left half, open | 206 |
| (9,6) | 114 | right half, open | 206 |

**VERIFIED:** (9,3) and (9,5) are 98% identical across the 206 px where both are opaque
(203/206). Same for (9,4)/(9,6). Neither pair is a mirror — detail is drawn independently.

**Pairings:** (9,3)|(9,4) = small bottom-centre opening. (9,5)|(9,6) = large opening.

**Process note:** (9,3) was logged unresolved in the first pass and correctly so. It is
uninterpretable in isolation by construction, and became obvious only once its neighbours were
inspected. Single-tile labelling is insufficient for this region.

---

## Region: props and tools (row 7 cols 9-11, row 8 cols 9-11, row 9 cols 7-11, row 10 cols 7-11)

Transparent ground, primary outline. Geometry below is VERIFIED; the identity in the right
column is READS AS and should be demoted if it conflicts with downstream evidence.

| (row,col) | idx | geometry | reads as |
|---|---|---|---|
| (7,9) | 93 | 12px disc, amber speckle on yellow, no internal structure | — |
| (7,10) | 94 | dome, tonal banding, enclosed vertical slot x=7-8 y=10-14 | — |
| (7,11) | 95 | concentric alternating red/white rings on two wooden legs | target on stand |
| (8,7) | 103 | light frame, navy field, 2 vertical + 2 horizontal orange bars | window, dark interior |
| (8,9) | 105 | slate mass lower-left, thin orange shaft curving to a loop | tool, D-grip handle |
| (8,10) | 106 | horizontal oval, concentric lighter ring at x=8-13 | log, sawn end right |
| (8,11) | 107 | rounded container, dark aperture, light band at y=9 | barrel or pot |
| (9,7) | 115 | metal head x=2-13 y3-5, vertical orange handle x=7-8 | hammer |
| (9,8) | 116 | three-pronged head, orange handle | pitchfork / rake |
| (9,9) | 117 | ring bow x=2-7, shaft right, notches cut at x=10-13 y9-11 | key (high conf.) |
| (9,10) | 118 | vertical pale line x=5 full height, orange limb curving right | bow |
| (9,11) | 119 | diagonal, grey head top-right, orange shaft, flared tail | arrow |
| (10,7) | 127 | rounded blue head left x=2-6, vertical orange handle x=7-8 | axe |
| (10,9) | 129 | blade angling up-left, orange handle right x=10-11 | hoe / scythe |
| (10,10) | 130 | rounded vessel, handle over top, dark interior x=5-10 y6-8 | bucket, empty |
| (10,11) | 131 | as (10,10) with cyan fill | bucket, full |

**VERIFIED:** (10,10) and (10,11) differ by exactly 18 px, bounded to x=5-10 y=6-8, changing
from outline colour to the two cyans. Same object, empty and full.

**Mutual confirmation:** (9,10) and (9,11) are adjacent and neither read is strong alone. Bow
and arrow together are much better supported than either separately.

---

## Column 8: the secondary-outline objects

Three tiles use outline `61,33,45` instead of `63,38,49`, and all three are in column 8.

| (row,col) | idx | outline2 px | tile |
|---|---|---|---|
| (7,8) | 92 | 48 | well, upper half (roof apex) |
| (8,8) | 104 | 70 | well, lower half (rim + cyan water) |
| (10,8) | 128 | 96 | blue-grey head, orange shaft, red base with slot |

**VERIFIED:** (7,8) y15 equals (8,8) y0 exactly, both fully opaque across all 16 columns. The
two form one 16x32 object.

(8,8) additionally carries four offset-duplicate colours; (10,8) carries an offset red. These
objects appear to come from a different authoring pass than the rest of the sheet. **Do not
group them with anything by exact colour identity.**

(10,8) identity is unresolved. Geometry only.

---

## Composition rules summary

1. Facade walls tile in both axes. Assembly bodies tile vertically only. Brick tiles freely.
2. Doors must sit on the bottom row of a facade; windows may sit anywhere.
3. Double doors are an ordered adjacent pair.
4. The sign at (6,11) mounts above the post at (5,11), inverting index order.
5. Rock formation halves must be placed as a pair; mixing cut-outs across pairs will leave a
   visible seam mismatch.
6. Colourway swap on the facade changes base and light tones only. Glass and handles are fixed.
7. Group tiles by colour with a Manhattan tolerance of ~8, never by exact match.

---

## Open items

- **Indices 0-70 (rows 0-5) not yet authored.** Row 5 col 11 is the only tile logged above row 6.
- Every wall system so far comes in two colourways. The assembly (rows 8-10) and the brick
  (row 10) have only been seen in blue-grey. An orange counterpart may exist in rows 0-5.
- (7,9) and (7,10) have no supported identity. Geometry logged, category deliberately blank.
- (10,8) identity unresolved.
- The horizontal light band at y=11-12 on facade tiles has a described geometry but no
  established function.
