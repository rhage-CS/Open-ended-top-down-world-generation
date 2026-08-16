## What this project is

A Phaser tilemap viewer used to author top-down RPG world scenes with Kenney's
Tiny Town tileset, plus custom tiles generated through the PixelLab MCP server.
There is no gameplay. The viewer exists so you can see what you are building.

## Hard constraints

- `tilemap_packed.png` has **zero spacing**. Register with `margin: 0,
  spacing: 0`. Kenney's `Tilesheet.txt` claims 1px spacing and is wrong for this
  sheet. A wrong spacing value still renders plausible-looking output, so verify
  frame count against image dimensions rather than trusting the render:
  192x176 px at 16px = 12 cols x 11 rows = 132 tiles.
- If the level renders sliced or offset, check spacing first before assuming a
  tile index is wrong.
- Never append generated tiles to `tilemap_packed.png`. Custom tiles go in
  `custom_packed.png` with `firstgid` 1000.
- Never write Tiled-format JSON. Levels use the plain 2D array format below.
- Do not add gameplay, entities, physics, or input handling beyond free camera
  movement. If a task seems to require it, stop and ask.

## Tile reference

`TINYTOWN_v2.md` is the **only** authoritative tile dictionary. Read it before
placing any tile. It is keyed on `(row, col)`, not index ranges, because the
sheet is authored as 2D spatial regions and index-range grouping fragments them.

The following are archived experimental conditions. They contain labels known to
be incorrect and must **not** be used as a source of tile facts:

- `TINYTOWN_v0_unlooked.md` — authored from priors, no pixel access
- `TINYTOWN.md` — authored from an index screenshot, systematically wrong
- `TINYTOWN_corrections.md` — diagnosis of the above

If a tile you want to use is not in `TINYTOWN_v2.md`, add it there first with
your reasoning, then use it. If you are guessing, mark the entry READS AS.

## Tile scope

Only indices **71-131** are authored. Indices 0-70 are unlabelled. Do not place
them. There is currently no ground or terrain tile, so scenes will render on an
empty background. That is expected, not a bug to work around.

## Level format

Write levels to `levels/` as:

```json
{
  "width": 24,
  "height": 16,
  "tileSize": 16,
  "layers": [ { "name": "ground", "data": [[ ... ], [ ... ]] } ]
}
```

`data` is a nested 2D array, row-major, `-1` for empty.

## Validation

After writing any level, run:

```sh
node tools/validate.js <path> --json
```

Fix every reported violation before continuing. `levels/full_map.json` is a
hand-authored baseline that scores 0 and renders correctly; use it as a
reference for what a valid composition looks like.

Zero violations means no rule fired. It does not mean the scene is good. The
validator checks local adjacency only and cannot see global structure.

## Working loop

1. Make one change.
2. Run the validator.
3. Take a screenshot.
4. Look at the screenshot before claiming the change worked.
5. If it did not work, say what you actually see, not what you intended.

Do not batch five changes and screenshot once. The point of the loop is
attribution.

Rendering catches errors that pixel inspection does not. Two tile categories in
`TINYTOWN_v2.md` had correct geometry and wrong identity until they were placed
in a scene and looked at. Step 4 is not optional.

## Memory

Use `remember` to record composition lessons under the active style slug. Record
things that were true and non-obvious, not restatements of the instruction. Good:
"roof index N only tiles correctly when the wall row below starts at index M."
Bad: "the user wanted a house here."

Consolidate when asked. Archive rather than delete.

## Generated assets

PixelLab tools are asynchronous and return job IDs. Poll rather than assuming
completion. When a generated tile arrives, place it in the level and screenshot
the composite before judging whether the style matches. A tile that looks correct
in isolation can read as broken in place.

## When you get stuck

Say so. Do not place random tiles to produce visible progress. An empty region
with an explanation is more useful than a filled region that is wrong.

## Self-authored helpers

If placing indices one at a time becomes tedious, you may write composition
helpers into the generator. Document any helper you add in this file under a
"Helpers" heading, with what it does and why you needed it.