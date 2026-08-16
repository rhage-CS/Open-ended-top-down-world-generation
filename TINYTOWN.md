# Tiny Town Tileset Reference

Source: `screenshots/screenshot_002.png` — Kenney's Tiny Town tilemap_packed.png, 16×16 tiles on a 17px grid (spacing: 0 in Phaser).

## Tile Index Catalog

### Terrain (ground)

| Index | Description | Category |
|-------|-------------|----------|
| 0 | Solid green grass | terrain |
| 1 | Green grass with lighter patch (upper-left) | terrain |
| 2 | Green grass with small yellow flower (upper-right) | terrain |
| 3 | Orange/brown dirt path, straight vertical | terrain |
| 4 | Orange/brown dirt path, T-junction pointing down | terrain |
| 5 | Orange/brown dirt path, cross/four-way intersection | terrain |
| 6 | Orange/brown dirt path, corner (bottom-left to top-right) | terrain |
| 7 | Orange/brown dirt path, corner (top-left to bottom-right) | terrain |
| 8 | Orange/brown dirt path, T-junction pointing right | terrain |
| 9 | Orange/brown dirt path, T-junction pointing left | terrain |
| 10 | Orange/brown dirt path, T-junction pointing up | terrain |
| 11 | Orange/brown dirt path, end cap (dead-end, open at top) | terrain |
| 12 | Green grass with orange dirt edge (bottom) | terrain |
| 13 | Green grass with orange dirt edge (left side) | terrain |
| 14 | Green grass with orange dirt edge (right side) | terrain |
| 24 | Green grass with orange dirt edge (top) | terrain |
| 25 | Green grass with orange dirt edge (top-left corner) | terrain |
| 26 | Green grass with orange dirt edge (top-right corner) | terrain |
| 36 | Green grass with orange dirt edge (bottom-left corner) | terrain |
| 37 | Green grass with orange dirt edge (bottom-right corner) | terrain |
| 38 | Green grass with orange dirt edge (bottom and left) | terrain |
| 39 | Green grass with orange dirt edge (bottom and right) | terrain |
| 40 | Green grass with orange dirt edge (top and left) | terrain |
| 41 | Green grass with orange dirt edge (top and right) | terrain |
| 42 | Green grass with orange dirt edge (all sides — surrounded by dirt) | terrain |

**Uncertain:** Tiles 3–11 appear to be path variants but the exact direction each represents is hard to confirm from the screenshot alone. The colors suggest orange/brown = dirt path, but I cannot verify which end is "open" vs "closed" without zooming further.

### Foliage / Trees

| Index | Description | Category |
|-------|-------------|----------|
| 15 | Small deciduous tree (orange/brown trunk, green canopy) | foliage |
| 16 | Conifer/pine tree (tall, pointed green top) | foliage |
| 17 | Small bush/shrub (low, rounded green) | foliage |
| 18 | Tall thin plant/reed (vertical green stalk) | foliage |
| 19 | Bush with darker center (possibly a berry bush) | foliage |
| 20 | Small sapling or young tree | foliage |
| 21 | Tree with orange autumn foliage | foliage |
| 22 | Dense round bush (dark green) | foliage |
| 23 | Tall grass tuft or reed cluster | foliage |
| 27 | Small orange-capped mushroom or flower | foliage |
| 28 | Another conifer variant (slightly different shape than 16) | foliage |
| 29 | Red-capped mushroom (small, ground-level) | foliage |
| 30 | Small green plant/sprout | foliage |
| 31 | Vine or hanging plant (green, draping) | foliage |
| 32 | Small leafy plant (wider than tall) | foliage |
| 33 | Another vine/hanging plant variant | foliage |
| 34 | Small orange flower or fruit on stem | foliage |
| 35 | Tall thin reed/grass (similar to 18, possibly different angle) | foliage |

**Uncertain:** Several foliage tiles (17, 20, 23, 30, 32, 35) are very small and similar — distinguishing "bush" from "grass tuft" from "sapling" is subjective at this resolution.

### Buildings — Walls (wooden/brown)

| Index | Description | Category |
|-------|-------------|----------|
| 48 | Wooden wall, plain brown (no features) | wall |
| 49 | Wooden wall with horizontal plank detail | wall |
| 50 | Wooden wall with vertical plank detail | wall |
| 51 | Wooden wall with window (blue glass, white frame) | wall |
| 52 | Wooden wall with window (different style — possibly shuttered) | wall |
| 53 | Wooden wall with red brick pattern | wall |
| 54 | Wooden wall with red brick pattern (variant) | wall |
| 55 | Wooden wall with red brick pattern (third variant) | wall |
| 56 | Wooden wall with blue-grey stone/brick pattern | wall |
| 57 | Wooden wall with blue-grey stone/brick pattern (variant) | wall |
| 58 | Wooden wall with blue-grey stone/brick pattern (third variant) | wall |
| 59 | Wooden wall with orange/red brick pattern | wall |
| 60 | Wooden wall with orange/red brick pattern (variant) | wall |
| 61 | Wooden wall with orange/red brick pattern (third variant) | wall |
| 62 | Wooden wall with grey stone/brick pattern | wall |
| 63 | Wooden wall with grey stone/brick pattern (variant) | wall |
| 64 | Wooden wall with grey stone/brick pattern (third variant) | wall |
| 65 | Wooden wall with red/orange brick pattern (dense) | wall |
| 66 | Wooden wall with red/orange brick pattern (variant) | wall |
| 67 | Wooden wall with red/orange brick pattern (third variant) | wall |

**Uncertain:** The brick/stone wall tiles (53–67) are difficult to distinguish precisely. They appear to be three material families (red brick, blue-grey stone, orange brick) each with three sub-variants, but the exact differences between variants within a family are not clear from the screenshot.

### Buildings — Doors

| Index | Description | Category |
|-------|-------------|----------|
| 72 | Wooden door (brown, closed, no handle visible) | door |
| 73 | Wooden door with handle/knob (right side) | door |
| 74 | Arched doorway (open, no door panel — just the arch) | door |
| 75 | Wooden door with panels/detail | door |
| 76 | Grey/blue door (different material — possibly metal or painted wood) | door |
| 77 | Arched doorway (open, grey/blue frame) | door |
| 78 | Grey/blue door with panels | door |
| 79 | Small wooden door or hatch (narrower than full door) | door |
| 80 | Wooden door with horizontal planks | door |
| 81 | Wooden door with vertical planks | door |
| 82 | Wooden door with cross-brace/X pattern | door |
| 83 | Wooden door with window inset | door |

### Buildings — Roofs

| Index | Description | Category |
|-------|-------------|----------|
| 84 | Roof peak/cap (triangular top, brown/orange) | roof |
| 85 | Roof peak/cap (variant — possibly different angle) | roof |
| 86 | Roof peak/cap (third variant) | roof |
| 87 | Roof peak/cap (fourth variant — possibly grey/different material) | roof |
| 88 | Roof peak/cap (fifth variant) | roof |
| 89 | Roof peak/cap (sixth variant) | roof |
| 90 | Roof peak/cap (seventh variant — possibly with chimney) | roof |
| 91 | Roof section (flat top, brown/orange tiles) | roof |
| 92 | Roof section (variant — possibly different tile pattern) | roof |
| 93 | Roof section with circular element (possibly a dome or turret top) | roof |
| 94 | Roof section with orange accent (possibly a flag or finial) | roof |
| 95 | Roof section with red/orange detail (possibly a chimney or vent) | roof |

**Uncertain:** Roof tiles 84–95 are all small and similar. Distinguishing "peak" from "section" from "cap" is interpretive. Some may be roof corners rather than peaks. The circular element on 93 could be a dome, a clock face, or decorative medallion — unclear.

### Fences / Barriers

| Index | Description | Category |
|-------|-------------|----------|
| 96 | Fence post (single vertical post, brown) | fence |
| 97 | Fence section (horizontal rail between posts) | fence |
| 98 | Fence post with rail (corner or end piece) | fence |
| 99 | Stone wall section (grey, solid) | fence |
| 100 | Stone wall section (variant — possibly with moss or weathering) | fence |
| 101 | Stone wall corner piece | fence |
| 102 | Stone wall corner piece (opposite orientation) | fence |
| 103 | Stone wall end cap | fence |
| 104 | Wooden fence gate (open or closed — unclear) | fence |
| 105 | Wooden fence gate (variant) | fence |
| 106 | Low hedge or shrub barrier (green, ground-level) | fence |
| 107 | Low hedge or shrub barrier (variant) | fence |

**Uncertain:** Tiles 96–107 mix fence types (wooden post-and-rail, stone wall, hedge). The exact connectivity rules (which pieces connect to which) cannot be determined from static images alone.

### Props / Objects

| Index | Description | Category |
|-------|-------------|----------|
| 108 | Barrel (brown, cylindrical) | prop |
| 109 | Crate/box (square, brown) | prop |
| 110 | Barrel (variant — possibly different size or color) | prop |
| 111 | Well or fountain (circular stone structure) | prop |
| 112 | Well or fountain (variant) | prop |
| 113 | Well or fountain (third variant — possibly with bucket) | prop |
| 114 | Well or fountain (fourth variant) | prop |
| 115 | Signpost (wooden pole with sign board) | prop |
| 116 | Signpost (variant — possibly different sign shape) | prop |
| 117 | Bench or table (low, flat surface) | prop |
| 118 | Bench or table (variant) | prop |
| 119 | Cart/wagon (wheeled vehicle, brown) | prop |
| 120 | Cart/wagon (variant — possibly different angle) | prop |
| 121 | Cart/wagon (third variant) | prop |
| 122 | Street lamp or torch (tall, thin, with light source) | prop |
| 123 | Street lamp or torch (variant) | prop |
| 124 | Street lamp or torch (third variant) | prop |
| 125 | Flag or banner (pole with cloth) | prop |
| 126 | Flag or banner (variant — different color or shape) | prop |
| 127 | Flag or banner (third variant) | prop |
| 128 | Small object (unclear — possibly a rock, stump, or planter) | prop |
| 129 | Small object (variant of 128) | prop |
| 130 | Small object (third variant of 128) | prop |
| 131 | Small object (fourth variant of 128 — possibly a pot or urn) | prop |
| 132 | Solid green square (same as index 0 — possibly a duplicate or padding tile) | terrain |

**Uncertain:** Tiles 128–131 are too small to identify confidently. They could be rocks, stumps, planters, wells, or other ground-level props. Tile 132 appears identical to tile 0 (solid green grass) — may be a duplicate or intentional padding.

---

## Composition Rules

### Complete House Recipe

A minimal house requires:
1. **Walls**: At least one wall tile (48–67) for each side of the building footprint. Plain wooden walls (48–50) work for simple structures; brick/stone walls (53–67) for more detailed buildings.
2. **Door**: One door tile (72–83) placed in a wall, facing the path. Arched doorways (74, 77) read as entrances without a physical door panel.
3. **Roof**: One roof peak/cap tile (84–90) centered above the wall row, plus roof section tiles (91–95) extending left/right if the building is wider than one tile.
4. **Ground**: The building must sit on terrain (0–2, 12–14, 24–26, 36–42), not directly on path tiles. At least one tile of open ground should surround the structure on all sides.

**Example minimal house (1×1 footprint):**
- Row 0 (top): Roof peak (e.g., 84)
- Row 1 (middle): Wall with door (e.g., 72 or 75) or wall with window (e.g., 51)
- Row 2 (bottom): Ground terrain (e.g., 0 or 1)

**Uncertain:** The exact vertical stacking order (how many wall rows between ground and roof) is not specified by the tileset alone. Some buildings may need 2–3 wall rows for proper proportions. This must be determined empirically by placing tiles and observing the result.

### Fence Runs

Fence pieces (96–107) form linear barriers:
- **Straight runs**: Use fence sections (97) between fence posts (96) at intervals.
- **Corners**: Use corner pieces (101, 102) where the fence changes direction.
- **Ends**: Use end caps (103) or single posts (96) to terminate a run.
- **Gates**: Insert gate tiles (104, 105) where passage is needed.

**Uncertain:** The exact connection points (which edges of each tile connect to adjacent tiles) cannot be verified from static images. Testing in-engine is required to confirm seamless joins.

### Adjacency Guidelines

**What may sit adjacent to what:**
- **Terrain + Terrain**: Any ground tile (0–2, 12–14, 24–26, 36–42) can neighbor any other ground tile. Mix variants (0, 1, 2) to avoid uniformity.
- **Terrain + Path**: Path tiles (3–11) should border ground tiles (12–14, 24–26, 36–42) that have dirt edges, not pure grass (0–2). Pure grass next to dirt path creates a harsh boundary.
- **Path + Path**: Path tiles connect according to their junction type (straight, T, cross, corner, end). Mismatched directions create visual breaks.
- **Building + Ground**: Buildings should sit on ground tiles, not path tiles. At least one tile of ground should separate the building from any path.
- **Building + Building**: Buildings should NOT be placed directly adjacent. Leave at least one tile of ground between structures.
- **Foliage + Anything**: Foliage (15–35) can border terrain, paths, or buildings. Trees near buildings read as landscaping; trees in open fields read as forest.
- **Props + Ground/Path**: Props (108–131) should sit on ground or path tiles, not on buildings or fences. Place near doors, along paths, or at field edges — not in the middle of open space.

**What should NOT sit adjacent:**
- Building directly on path (no ground buffer)
- Two buildings touching (no gap)
- Pure grass (0–2) directly against dirt path (3–11) without transition tiles (12–14, 24–26, 36–42)
- Props floating in empty space with no contextual reason

**Uncertain:** The exact transition rules between terrain variants (e.g., whether tile 12 transitions smoothly from tile 0 to tile 3) require in-engine testing. The catalog above describes appearance, not verified adjacency behavior.

---

## Notes on Uncertainty

This document was authored solely from `screenshots/screenshot_002.png` at the resolution provided. Specific limitations:

1. **Tile directionality**: Path tiles (3–11) show orange/brown shapes but the exact compass direction each represents is ambiguous without animation or labeled reference.
2. **Wall material families**: Tiles 53–67 appear to be three material types × three variants each, but the distinguishing features between variants within a family are not resolvable.
3. **Roof taxonomy**: Tiles 84–95 are categorized as "peaks" vs "sections" based on shape, but some may be corners, ridges, or decorative elements rather than structural roof pieces.
4. **Prop identification**: Tiles 128–131 are too small to identify confidently. They are grouped as "small objects" pending closer inspection.
5. **Connectivity rules**: Fence and path adjacency rules are inferred from typical tileset conventions, not verified against this specific asset pack.
6. **Tile 132**: Appears identical to tile 0. May be intentional duplication, padding, or a subtle variant not visible at this resolution.

To resolve uncertainties: place tiles in-engine, screenshot the composite, and update this document with verified observations.
