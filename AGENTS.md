# Rules of Engagement

## What this project is

A Phaser tilemap viewer used to author top-down RPG world scenes with Kenney's
Tiny Town tileset, plus custom tiles generated through the PixelLab MCP server.
There is no gameplay. The viewer exists so you can see what you are building.

## Hard constraints

- Kenney sheets use a 17px grid holding 16px tiles. Always register with
  `margin: 0, spacing: 1`. If the level renders sliced or offset, check this
  first before assuming a tile index is wrong.
- Never append generated tiles to `tilemap_packed.png`. Custom tiles go in
  `custom_packed.png` with `firstgid` 1000.
- Never write Tiled-format JSON. Levels use the plain 2D array format documented
  in PLAN.md.
- Do not add gameplay, entities, physics, or input handling beyond free camera
  movement. If a task seems to require it, stop and ask.

## Before placing tiles

Read `TINYTOWN.md`. It contains the index-to-meaning mapping, adjacency rules,
and building recipes. If a tile you want to use is not in that file, add it to
the file first with your reasoning, then use it. If you are guessing, say so in
the entry.

## Working loop

1. Make one change.
2. Take a screenshot.
3. Look at the screenshot before claiming the change worked.
4. If it did not work, say what you actually see, not what you intended.

Do not batch five changes and screenshot once. The point of the loop is
attribution.

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
