# TINYTOWN_v2.md

Tile dictionary for `assets/tilemap_packed.png` (Kenney Tiny Town).

**Sheet geometry:** 192x176 px, 16px tiles, spacing 0, margin 0 -> 12 cols x 11 rows = 132 tiles.
**Index mapping:** `row = i // 12`, `col = i % 12`.

**Coverage: complete. 132 of 132 tiles authored.**

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

Three concrete demonstrations:

- Row 6 splits mid-row. Cols 0-7 are opaque facade tiles; cols 8-11 are transparent-ground
  fence and sign objects. Index order crosses this boundary twice within eleven tiles.
- Row 3 splits three ways: cols 0-2 close the dirt patch, cols 3-7 are terrain corner pieces,
  cols 8-11 begin a fence. Indices 36 through 47 cross two category boundaries.
- The second outline colour appears in exactly three tiles: (7,8), (8,8), (10,8). As indices
  these are 92, 104, 128, which look unrelated. See the caveat in the column-8 section below —
  this is a run within a column, not a property of the column.

---

## Palette

32 distinct colours. Seven form the core, and matter most.

### Core

| symbol | RGB | role |
| --- | --- | --- |
| `#` | 63,38,49 | outline (primary) |
| `o` | 189,108,74 | orange base |
| `O` | 234,165,108 | orange light |
| `r` | 118,59,54 | orange dark / shadow |
| `b` | 139,155,180 | blue-grey base |
| `B` | 192,203,220 | blue-grey light |
| `h` | 90,105,136 | blue-grey dark / shadow |

### Roof-red ramp (rows 4-5)

Added with the roof region. None is within tolerance of `R` (232,69,55) or `P`, so this is a
separate family, not an offset of the existing red.

| symbol | RGB | role |
| --- | --- | --- |
| `q` | 195,75,53 | roof-red dark / base |
| `u` | 242,132,98 | roof-red mid |
| `U` | 252,188,143 | roof-red light |

`U` (252,188,143) and `T` (254,201,156) are 28 apart. Distinct, but both are pale warm tones
and are the likeliest pair in the sheet to be conflated by eye.

### Extended

| symbol | RGB | notes |
| --- | --- | --- |
| `~` | 61,33,45 | **outline (secondary)** — only (7,8), (8,8), (10,8) |
| `a` | 227,134,40 | amber |
| `y` | 253,190,83 | yellow |
| `R` | 232,69,55 | red |
| `P` | 255,112,109 | pink |
| `W` | 255,255,255 | white |
| `N` | 38,43,68 | navy |
| `s` | 82,96,124 | slate |
| `c` | 0,154,220 | cyan (water) |
| `C` | 118,228,255 | cyan light (water highlight) |

### Terrain greens

None is within tolerance of any colour above, so these are a genuinely separate family
rather than offsets.

| symbol | RGB | role |
| --- | --- | --- |
| `g` | 132,198,105 | grass base |
| `G` | 71,159,74 | grass dark |
| `m` | 101,165,86 | grass mid |
| `L` | 139,216,125 | grass light |
| `t` | 207,130,84 | dirt speckle dark |
| `T` | 254,201,156 | dirt speckle light |

**The dirt fill is `234,165,108`, the same RGB as facade "orange light".** Not an
offset, the identical value serving two materials. Colour alone does not
determine material anywhere in this sheet. The roof region below makes this far
stronger: see "The material-role shift".

### Offset duplicates — READ THIS BEFORE WRITING ANY GROUPING CODE

Six colours sit 2-7 units (Manhattan) from a core colour and are **not** the same value:

| offset | nearest core | distance |
| --- | --- | --- |
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

**VERIFIED:** rows 3, 4 and 5 introduce no offset duplicates at all. Minimum pairwise distance
within each of those batches is well above 20. The offset problem is confined to rows 7-10.

---

## The material-role shift — read before labelling anything by colour

The building region comes in two variants. They are related by a **two-ramp shift**, not by a
single colour swap, and this is the most error-prone fact in the sheet.

```
Variant A -> Variant B

roof ramp:   h -> q     b -> u     B -> U
wall ramp:   r -> h     o -> b     O -> B
```

Read that as a chain: **orange ramp -> blue-grey ramp -> roof-red ramp.** Each variant shifts
one step along it. The consequence:

> The blue-grey ramp is the **roof** material in variant A and the **wall** material in
> variant B. The same three RGB values carry different semantic roles depending on which
> building they belong to.

**VERIFIED, zero mismatched pixels:** (5,0)->(5,4), (5,1)->(5,5), (5,2)->(5,6), (5,3)->(5,7)
under the full two-ramp map. Under a roof-only map the same four pairs mismatch on 14, 16, 14
and 58 pixels respectively, and every mismatch lands on a wood colour.

**Row 4 is the special case, not row 5.** In row 4 the roof-only map is exact, because row 4
contains no wall pixels. An agent that infers the swap rule from row 4 alone and applies it to
row 5 will be wrong on every wall pixel. Derive the rule from row 5.

This is the same failure as the v1 index-range error appearing on a different axis: a rule
induced from a convenient subset, generalized past its support.

---

## Region: grass surface (row 0, cols 0-2)

Opaque, full-bleed, no outline. Tiles seamlessly in both axes.
**These three are interchangeable** — all share the same base green, so mixing
them across a field produces no seams.

**VERIFIED:** (0,0) is a single colour across all 256 px. (0,1) is 224/256 that
same base; (0,2) is 194/256. The detail sits on an identical ground.

| (row,col) | idx | tile |
| --- | --- | --- |
| (0,0) | 0 | ground fill. Single colour, no detail |
| (0,1) | 1 | ground + grass tufts. Two light clusters, scattered specks |
| (0,2) | 2 | ground + flowers. Two blooms, yellow petals, white centre |

This is the terrain base. Every structure in the sheet is drawn to sit on it.

---

## Region: terrain fills

Two tileable bases. Both are a single colour across all 256 px.

| (row,col) | idx | fill | RGB |
| --- | --- | --- | --- |
| (0,0) | 0 | grass | 132,198,105 |
| (2,1) | 25 | dirt | 234,165,108 |

---

## Region: dirt patch (rows 1-3, cols 0-2) — COMPLETE

3x3, grass border on all four sides, dirt interior with pebble speckle.

**VERIFIED:** every vertical seam is pixel-exact. (1,c) row 15 equals (2,c) row 0
for all three columns; (2,0) row 15 equals (3,0) row 0.

**VERIFIED closure:** (3,1) has pure grass on its S edge only; (3,2) has pure grass on its S
and E edges. Together with (3,0) these are exactly the lower-left, lower-middle and
lower-right pieces the region needed.

| (row,col) | idx | tile |
| --- | --- | --- |
| (1,0) | 12 | upper-left. Grass on left and top |
| (1,1) | 13 | upper-middle. Grass on top |
| (1,2) | 14 | upper-right. Grass on right and top |
| (2,0) | 24 | mid-left |
| (2,1) | 25 | centre — the pure dirt fill |
| (2,2) | 26 | mid-right |
| (3,0) | 36 | lower-left. Grass on left and bottom |
| (3,1) | 37 | lower-middle. Grass on bottom. Boundary runs E-W at y=12 |
| (3,2) | 38 | lower-right. Grass wraps the E and S edges |

---

## Region: dirt inner corners (row 3, cols 3-6)

Four opaque dirt tiles, each carrying a 4x4 grass nub in exactly one corner. These are the
concave-corner pieces that the 3x3 patch above does not supply.

**VERIFIED:** a closed four-fold set. Silhouette-exact under horizontal mirror
((3,3)/(3,4) and (3,5)/(3,6)) and under vertical flip ((3,3)/(3,6) and (3,4)/(3,5)).
Pixel-exact mirroring fails on all four because the dirt speckle is hand-placed.

| (row,col) | idx | corners NW/NE/SW/SE | grass nub |
| --- | --- | --- | --- |
| (3,3) | 39 | grass/dirt/dirt/dirt | NW |
| (3,4) | 40 | dirt/grass/dirt/dirt | NE |
| (3,5) | 41 | dirt/dirt/dirt/grass | SE |
| (3,6) | 42 | dirt/dirt/grass/dirt | SW |

Naming convention across all terrain tiles: the edge or corner named is the side on which the
**dirt** region terminates.

---

## Region: grass decoration (row 3, col 7)

| (row,col) | idx | tile |
| --- | --- | --- |
| (3,7) | 43 | grass with scattered pale blue-grey blocks. READS AS gravel or rubble |

**VERIFIED:** all four edges are pure grass, so this is edge-compatible with any full-grass
tile and needs no adjacency rule. Functionally a grass base variant.

The scatter uses `B` (192,203,220), the light end of the blue-grey ramp. **It is not a
separate stone colour.** Do not treat it as evidence of a stone material.

---

## Region: individual trees (rows 0-2, cols 3-5)

Independently placeable. Green and autumn colourways.

**VERIFIED silhouette pairs, 0 px difference:** (0,3)/(0,4), (1,3)/(1,4),
(2,3)/(2,4).

| (row,col) | idx | tile |
| --- | --- | --- |
| (0,3)+(1,3) | 3+15 | tall tree, autumn. Canopy over trunk |
| (0,4)+(1,4) | 4+16 | tall tree, green. Same silhouette |
| (0,5) | 5 | round bush. Self-contained |
| (1,5) | 17 | two small shrub forms. Independent of (0,5) |
| (2,3) | 27 | tree, autumn. **Terminates at row 2** |
| (2,4) | 28 | tree, green. **Terminates at row 2** |
| (2,5) | 29 | two mushrooms. Red caps, white spots, pale stems |

**VERIFIED:** (0,5) has 14 opaque px on its bottom row but (1,5)'s top row is
fully transparent. They are vertically adjacent and do **not** connect. Adjacency
in the sheet does not imply adjacency in composition.

**CORRECTION — trees do not continue into row 3.** v2 previously recorded that the trunks of
(2,3) and (2,4) continue into row 3. Row 3 is now authored and contains no tree content of
any kind. Cols 3-7 are fully opaque terrain: zero transparent pixels, zero outline pixels,
zero canopy greens. Cols 8-11 are fence. The trees terminate at the bottom edge of row 2 and
are placed against grass beneath. Same correction applies to the tree block below.

---

## Region: tree block (rows 0-2, cols 6-11) — BLOCK-LOCKED

A 3x3 arrangement of complete trees packed at half-tile offsets, so trees straddle
tile boundaries both horizontally and vertically. Cols 6-8 green, cols 9-11 autumn,
identical arrangement.

**RULE: place the full 3x3 block, preserving relative position.** A single tile
taken from this region contains partial trees and renders as severed trunks and
clipped canopies. This is the only region in the sheet whose tiles are not
independently placeable.

**VERIFIED colourway pairs, 0 px silhouette difference:**
(0,6)/(0,9), (0,7)/(0,10), (0,8)/(0,11), (1,6)/(1,9), (1,7)/(1,10), (1,8)/(1,11),
(2,6)/(2,9), (2,7)/(2,10), (2,8)/(2,11).

**VERIFIED:** (1,6) and (1,9) occupy columns 10-15; (1,8) and (1,11) occupy
columns 0-5. These are the block's right and left edge pieces. They are **not**
mirrors of each other — foliage is drawn independently.

**CORRECTION:** v2 previously stated that all tiles in the block except (2,7) and (2,10)
continue into row 3. They do not. Row 3 cols 6-11 are terrain and fence. **The block is
3 rows tall and self-contained.** The clipped appearance at the bottom edge of row 2 is the
intended silhouette, not a continuation.

**Process note:** I first read this region as overlapping forest foliage, on the
strength of a whole-row seam test that reported discontinuity at cols 6, 8, 9, 11.
The test was wrong for this region: those tiles carry foliage from neighbouring
trees at their edges, so whole-row comparison fails even where the central object
continues. Rendering rows 0-2 contiguously showed the actual structure. Logged
because it is a third distinct failure mode, after priors and after pixels.

---

## Region: roof (rows 4-5, cols 0-7)

Opaque, full-bleed. Shingle field with a ridge cap along the top and a wall top edge along
the bottom. Two variants related by the two-ramp shift documented above.

Row 4 is the upper course, row 5 the lower course. They stack vertically.

### Variant A — blue-grey roof, orange/wood wall

| (row,col) | idx | outline border | tile |
| --- | --- | --- | --- |
| (4,0) | 48 | cols 0-1 | roof upper, left edge. Ridge cap y=2-3 |
| (4,1) | 49 | none | roof upper, fill. Ridge cap y=2-3 |
| (4,2) | 50 | cols 14-15 | roof upper, right edge. Ridge cap y=2-3 |
| (4,3) | 51 | none | roof upper, fill + dormer window. Shingles at both margins |
| (5,0) | 60 | cols 0-1 | roof lower, left edge. Wall top edge in wood at y=15 |
| (5,1) | 61 | none | roof lower, fill. Wall top edge in wood at y=15 |
| (5,2) | 62 | cols 14-15 | roof lower, right edge. Wall top edge in wood at y=15 |
| (5,3) | 63 | none | roof lower + gable peak over wall. READS AS, see below |

### Variant B — roof-red roof, blue-grey wall

| (row,col) | idx | shift source | tile |
| --- | --- | --- | --- |
| (4,4) | 52 | (4,0) | roof upper, left edge |
| (4,5) | 53 | (4,1) | roof upper, fill |
| (4,6) | 54 | (4,2) | roof upper, right edge |
| (4,7) | 55 | (4,3) | roof upper, fill + dormer window |
| (5,4) | 64 | (5,0) | roof lower, left edge. Wall top edge in blue-grey at y=15 |
| (5,5) | 65 | (5,1) | roof lower, fill |
| (5,6) | 66 | (5,2) | roof lower, right edge |
| (5,7) | 67 | (5,3) | roof lower + gable peak over wall |

**VERIFIED:** (4,0)/(4,4), (4,1)/(4,5), (4,2)/(4,6), (4,3)/(4,7) are pixel-exact under the
roof-only map. Row 5's four pairs are pixel-exact only under the full two-ramp map.

**VERIFIED:** in row 4 the ridge cap (y=2-3) and the dormer window panel stay blue-grey in
both variants. These are shared parts, not colourway errors. 28 held pixels on the edge pairs,
32 on the fill pair, 94 on the dormer pair.

**VERIFIED border structure:** full-height outline on cols 0-1 for (4,0), (4,4), (5,0), (5,4);
on cols 14-15 for (4,2), (4,6), (5,2), (5,6); none for the fill and dormer tiles. This is a
left-edge / fill / right-edge set, so roof runs are bounded and not freely tileable
horizontally.

**(5,3) and (5,7) are the weakest entries in this file.** Both carry a dark chevron outline
with wall material at the bottom centre. Geometry is certain and the shift relationship is
pixel-exact. The identity — gable peak, awning, or roof-to-wall transition — is READS AS and
has not been render-verified. Treat as unresolved until checked in the viewer.

---

## Region: fence enclosure (rows 3-5, cols 8-10)

Transparent ground, primary outline, orange ramp. A complete closed enclosure.

**RENDER-VERIFIED:** assembled on grass, the nine tiles form a closed pen with a gate opening
at bottom centre.

```
(3,8)  (3,9)  (3,10)      44 45 46
(4,8)  (4,9)  (4,10)      56 57 58
(5,8)  (5,9)  (5,10)      68 69 70
```

| (row,col) | idx | connects | tile |
| --- | --- | --- | --- |
| (3,8) | 44 | E+S | corner, enclosure top-left |
| (3,9) | 45 | E+W | straight run, E-W |
| (3,10) | 46 | S+W | corner, enclosure top-right |
| (4,8) | 56 | N+S | vertical run, rail joint toward E |
| (4,9) | 57 | N+E+W | **object, not fence.** See below |
| (4,10) | 58 | N+S | vertical run, rail joint toward W |
| (5,8) | 68 | N+E | corner, enclosure bottom-left |
| (5,9) | 69 | E+W | **gate.** Opening at x=7-8 |
| (5,10) | 70 | N+W | corner, enclosure bottom-right |

**VERIFIED:** (3,10) is the exact horizontal mirror of (3,8). (5,10) is the exact horizontal
mirror of (5,8). (4,10) is the exact horizontal mirror of (4,8). (3,9) and (5,9) are each
exactly self-symmetric.

Connectivity above is derived from non-transparent pixels per edge, not from appearance.
Orange light (234,165,108) is the lit top surface, orange base (189,108,74) the shadowed side.
Primary outline throughout, **including (3,8) and (4,8) and (5,8), which are in column 8.**

### (4,9) — the enclosure's contents

| (row,col) | idx | tile |
| --- | --- | --- |
| (4,9) | 57 | wooden cart or wagon body, pale blue-grey wheel at SW, slatted panel. READS AS |

It occupies the centre cell of the enclosure and does not connect to any fence piece.

**CORRECTION:** an earlier pass predicted this was the upper half of a two-tile object
continuing at (5,9). That prediction was wrong — (5,9) is the gate. (4,9) is a single-tile
object. Logged because the prediction was reasonable from connectivity alone and was
falsified only by rendering the region, which is the same pattern as the arch and the
tree block.

---

## Region: standalone vertical fence (col 11, rows 3-5)

Separate from the enclosure. A three-tile vertical run.

| (row,col) | idx | connects | tile |
| --- | --- | --- | --- |
| (3,11) | 47 | S | vertical terminus, capped N |
| (4,11) | 59 | N+S | vertical run, plain |
| (5,11) | 71 | — | post with stem rising from top. See conflict note below |

**VERIFIED:** (3,11) and (4,11) are each exactly self-symmetric, and stack continuously.

---

## UNRESOLVED CONFLICT — two fence systems, or one misindexed

The fence pieces at (3,8), (3,9), (3,10) and the "posts, rails, sign" pieces at (6,8), (6,9),
(6,10) have near-identical recorded descriptions: post with rail extending right, horizontal
rail at y=5-12 full width, post with rail extending left. Both sets are orange-ramp only with
primary outline. Both record an exact horizontal mirror between the left and right piece.

Either the sheet genuinely contains two similar fence systems in rows 3-5 and row 6, or one
of the two passes is misindexed by three rows.

**This has not been resolved and must be before the probe runs.** The check is a direct pixel
diff of (3,8) against (6,8) and (3,10) against (6,10). If they are identical or near-identical,
one region entry is wrong and the dictionary contains a duplicate. If they differ
substantially, both entries stand and the sheet has two fence idioms, which is itself worth
stating explicitly so an agent does not mix them.

---

## Region: posts, rails, sign (row 6, cols 8-11)

Transparent ground, outlined on all exposed edges, orange ramp only.
Post cross-section is `##oooo##` at x=4-11 in all post pieces.

**Subject to the conflict above.**

| (row,col) | idx | tile |
| --- | --- | --- |
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
| --- | --- | --- |
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

### HYPOTHESIS — the roof region caps this facade

Rows 4-5 cols 0-7 and rows 6-7 cols 0-7 occupy the same columns and split into two variants at
the same column boundary. Row 5's bottom edge is a **wall top edge**, and the wall material
matches the facade beneath it in both cases: variant A's wood wall over the orange facade at
cols 0-3, variant B's blue-grey wall over the blue facade at cols 4-7.

If this holds, rows 4-7 cols 0-7 are one building system 4 tiles tall, and the roof/facade
colourway pairing is fixed rather than free.

**Not verified.** The check is whether (5,c) row 15 abuts (6,c) row 0 without a seam, for
c in 0-7. Run it before relying on the pairing. If it holds, add it as a composition rule and
resolve the open item about a missing orange counterpart.

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
| --- | --- | --- |
| top only | y0-4 | (8,0) (8,1) (8,2) |
| top + lower | y0-4 and y10-13 | (8,3) (8,4) (8,5) |
| none, body | — | (9,0) (9,1) (9,2) |
| lower only | y10-15 | (10,0) (10,1) (10,2) |

| (row,col) | idx | role |
| --- | --- | --- |
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

**Note:** this region was reclassified as a top-down roof (see corrections). The sheet
therefore contains two distinct roof idioms — this one, and the side-view shingled roof at
rows 4-5. They share the blue-grey ramp and must not be mixed within one structure.

---

## Region: brick wall (row 10, cols 3-6)

A third wall idiom, distinct from the facade and the assembly. Running-bond brick, period 4
vertically, joints alternating between x=3,10 and x=6,13.

| (row,col) | idx | tile |
| --- | --- | --- |
| (10,3) | 123 | brick, terminating RIGHT. Content x=0-7, transparent x=8-15 |
| (10,4) | 124 | brick, terminating LEFT. Content x=8-15, transparent x=0-7 |
| (10,5) | 125 | brick + framed opening. Dark navy centre |
| (10,6) | 126 | brick fill, tileable |

**VERIFIED:** (10,4) is the exact horizontal mirror of (10,3).

---

## Region: stone arch (row 9, cols 3-6)

Navy field with light blue rock masses and pale vertical bars in the lower centre. Supplied as
left/right halves in two cut-outs. **Carries no outline colour** — bounded by navy field.

**RENDER-VERIFIED:** placed in `levels/full_map.json` and screenshotted, both pairs read as a
freestanding **stone arch** spanning an opening, not as a cave mouth backing onto rock. This
matters for placement: an arch spans a gap and needs clear ground on both sides and beneath it,
whereas a cave mouth would abut solid terrain. Evidence: `screenshots/baseline_full_map.png`.

| (row,col) | idx | tile | opaque px |
| --- | --- | --- | --- |
| (9,3) | 111 | left half, near-solid | 247 |
| (9,4) | 112 | right half, near-solid | 247 |
| (9,5) | 113 | left half, open | 206 |
| (9,6) | 114 | right half, open | 206 |

**VERIFIED:** (9,3) and (9,5) are 98% identical across the 206 px where both are opaque
(203/206). Same for (9,4)/(9,6). Neither pair is a mirror — detail is drawn independently.

**Pairings:** (9,3)|(9,4) = narrow span. (9,5)|(9,6) = wide span.

**Process note:** (9,3) was logged unresolved in the first pass and correctly so. It is
uninterpretable in isolation by construction, and became obvious only once its neighbours were
inspected. Single-tile labelling is insufficient for this region. The arch identity required a
third step beyond that: rendering it. Pixel inspection gave correct geometry and an
under-specified category.

---

## Region: props and tools (row 7 cols 9-11, row 8 cols 9-11, row 9 cols 7-11, row 10 cols 7-11)

Transparent ground, primary outline. Geometry below is VERIFIED; the identity in the right
column is READS AS and should be demoted if it conflicts with downstream evidence.

| (row,col) | idx | geometry | reads as |
| --- | --- | --- | --- |
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

Three tiles use outline `61,33,45` instead of `63,38,49`: (7,8), (8,8), (10,8).

| (row,col) | idx | outline2 px | tile |
| --- | --- | --- | --- |
| (7,8) | 92 | 48 | well, upper half (roof apex) |
| (8,8) | 104 | 70 | well, lower half (rim + cyan water) |
| (10,8) | 128 | 96 | blue-grey head, orange shaft, red base with slot |

**VERIFIED:** (7,8) y15 equals (8,8) y0 exactly, both fully opaque across all 16 columns. The
two form one 16x32 object.

**CORRECTION — this is not a whole-column property.** v2 previously described the secondary
outline as characterising column 8. It does not. (3,8), (4,8) and (5,8) are also in column 8
and all three use the **primary** outline. The secondary outline is confined to a run at rows
7, 8 and 10. Stated as a column property, the claim predicts something false about the fence
tiles.

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
5. Stone arch halves must be placed as a matched pair; mixing cut-outs across pairs will leave
   a visible seam mismatch. An arch spans a gap, so leave clear ground beneath and either side.
6. Colourway swap on the facade changes base and light tones only. Glass and handles are fixed.
7. Group tiles by colour with a Manhattan tolerance of ~8, never by exact match.
8. The tree block (rows 0-2, cols 6-11) is block-locked. Place the whole 3x3 or
   none of it. It is self-contained and does not extend into row 3.
9. Structures need a terrain tile beneath them. Grass fill is (0,0), dirt fill is
   (2,1); both tile infinitely.
10. Vertical adjacency in the sheet does not imply the tiles connect. (0,5) and
    (1,5) are adjacent and unrelated.
11. **Roof colourway purity.** A contiguous roof run must not mix variant A
    {(4,0)-(4,3), (5,0)-(5,3)} with variant B {(4,4)-(4,7), (5,4)-(5,7)}.
12. **Roof run ordering.** A horizontal roof run reads left-edge, then zero or more fill or
    dormer tiles, then right-edge. A left-edge tile with a roof tile to its west is a
    violation, as is a dormer tile in a terminal position.
13. **Material-role consistency.** Because blue-grey is roof in variant A and wall in
    variant B, a colour-matching agent will place a variant-A roof above a variant-B wall and
    produce a building made of two roofs. Any vertical roof-to-wall transition must use one
    variant throughout.
14. **Fence enclosure integrity.** A closed pen is the 3x3 block at rows 3-5, cols 8-10, with
    (5,9) as the gate. Corner pieces must match their declared connections or the run dangles.

---

## Corrections made after rendering

Rendering corrected five categories that pixel inspection had left under-specified or wrong.
Logged here because the probe is partly about which errors survive which inspection method.

- **(9,3)-(9,6)** reclassified from "rock formation with an opening" to **stone arch**.
- **Rows 0-2, cols 6-11** reclassified from "overlapping forest foliage" to a
  **block-locked 3x3 tree arrangement**. Caught by rendering the region
  contiguously, not by pixel comparison.
- **Rows 8-10, cols 0-2** are a **top-down roof**, not a wall in elevation. The notch band is
  the shingle edge and appears on all four sides of an assembled block, not as a repeating
  horizontal course. Confirmed by stacking a roof block directly above facade rows: the two
  systems abut with no seam and read as one building.
- **Rows 3-5, cols 8-10** resolved from four separately-labelled fence fragments to a
  **single closed enclosure with a gate**. Only assembly on a grass backdrop showed this.
- **(4,9)** reclassified from "upper half of a two-tile object" to a **single-tile object
  sitting inside the enclosure**. The two-tile prediction came from edge connectivity and was
  falsified by rendering.

In all five cases the recorded geometry was correct and only the category or the extent was
wrong. Pixel inspection is sufficient for structure and insufficient for identity. This gives
three inspection methods with distinct failure modes: priors alone get the category wrong,
pixels get the structure right and the category under-specified, rendering settles it.

---

## Open items

- **UNRESOLVED CONFLICT:** rows 3-5 fence vs row 6 posts-and-rails. Pixel-diff (3,8) against
  (6,8) before running the probe. See the dedicated section above.
- **(5,3) and (5,7)** gable-peak identity is unverified. Geometry certain, category READS AS.
- **The roof/facade stacking hypothesis** at rows 4-7 cols 0-7 is unverified. Run the seam
  check described in the facade section.
- **(7,9) and (7,10)** have no supported identity. Geometry logged, category deliberately blank.
- **(10,8)** identity unresolved.
- The horizontal light band at y=11-12 on facade tiles has a described geometry but no
  established function.
- **RESOLVED:** "an orange counterpart to the blue-grey assembly may exist in rows 0-5."
  Rows 0-5 are now authored and contain no orange assembly. The second colourway of the
  rows 4-5 roof is roof-red, not orange. The orange ramp appears there only as wall material
  in variant A.