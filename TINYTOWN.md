TinyTown tileset guidance
=========================

Essentials:

- Tile size: 16×16px
- Kenney sheets use a 17px grid: `margin: 0`, `spacing: 1` when loading in Phaser
- When packing new, generated tiles keep the same tile size and spacing

Indexing notes:

- The project's simple JSON tilemap uses numeric IDs in each cell.
- Keep convention: base Kenney tiles remain low IDs (0..N). Generated custom tiles should use a high `firstgid` (e.g. start at 1000) so they don't conflict.
- When loading multiple tilesets into Phaser, include both tilesets in the layer: `map.createLayer(0, [baseTiles, customTiles], 0,0)`

Composition & house building rules (suggested):

- Use a small recipe description for common structures (house, fence, water): record which tile indexes form which parts.
- Example (informal):
  - house-floor: contiguous rectangle of floor tiles
  - house-walls: use wall tiles aligned to floor edges
  - roof: placed above walls; roof tiles can overlap wall corner tiles when composed visually

Practical tips for LLM-driven composition:

- Provide the LLM a short mapping of the most-used tile indexes (0..50) and their semantic meaning.
- If unknown, instruct the LLM to place placeholder IDs and request generation for missing visuals via Pixel Lab.

Helpers

- When adding generated tiles, pack them into `assets/custom_packed.png` and use an index offset (firstgid) >= 1000. Update level data to reference those IDs.
