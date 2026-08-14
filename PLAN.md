# Design Probe: Top-Down World Generation with Phaser + PixelLab

## Research question

What does an agent need to know about a tileset before it can compose coherent
world scenes with it, and how much of that knowledge can it acquire on its own?

Pewter's contribution is not its UI. It is that someone encoded what each Tiny
Town tile means and which pieces legally combine. Remove the tool and that
knowledge has to live somewhere. This probe determines where.

## Secondary questions

1. Does step-by-step prompting, plan-then-execute, or style-guided iteration
   produce better levels? Same measure across all three.
2. Can a self-improvement loop with vision feedback reach Kenney-preview quality,
   and how many iterations does it take?
3. When Tiny Town lacks a tile, is generating one with PixelLab actually faster
   than working around the gap?

## Scope

In scope: static single-screen or small-scroll levels, terrain and buildings and
props, one custom asset family (water) generated via PixelLab.

Out of scope: entities, gameplay, animation, multi-room worlds, save/load,
Tiled round-tripping.

Two weeks. If Wang autotiling for water eats more than three days, cut water and
generate a non-tiling prop family instead (market stalls, signage, a fountain).

## Architecture

```
phaser-worldgen/
  index.html
  src/
    main.js            Phaser bootstrap
    ViewerScene.js     loads level.json, renders, free camera, no gameplay
    IndexScene.js      tile index viewer, every tile with its number drawn on it
    tilesets.js        tileset registry and firstgid assignment
  assets/
    tilemap_packed.png     Kenney Tiny Town, 16px tiles, 1px spacing
    custom_packed.png      PixelLab output, firstgid 1000
  levels/
    level.json         the generated level, plain 2D arrays
  screenshots/         numbered captures with JSON sidecars
  TINYTOWN.md          tile dictionary, see Phase 1
  STYLE.md             design guidance, experimental variable
  AGENTS.md            rules of engagement
  PLAN.md              this file
```

### Level format

Do not write Tiled JSON. The agent corrupts it silently and it is hard to read.
Use this instead and convert in the viewer:

```json
{
  "width": 40,
  "height": 30,
  "tileSize": 16,
  "layers": [
    { "name": "ground",  "data": [[...], [...]] },
    { "name": "objects", "data": [[...], [...]] }
  ]
}
```

`-1` means empty. Load with `this.make.tilemap({ data, tileWidth: 16, tileHeight: 16 })`.

### Tileset registration

Kenney sheets use a 17px grid holding 16px tiles. This must be right or the
level renders as a sliced mess that looks like an index bug:

```js
map.addTilesetImage('tinytown', 'tinytown', 16, 16, 0, 1);  // margin 0, spacing 1
```

Custom tiles go in a separate image with `firstgid` 1000, never appended to the
Kenney sheet. Regenerating a sheet on every asset addition is not worth it, and
separate ranges make "which tiles were AI-generated" answerable by inspection.

## Phases

### Phase 0: Plumbing

1. Shell Phaser project, Tiny Town in `assets/`, viewer renders a hand-made
   5x5 test level correctly. Verify spacing before going further.
2. Screenshot capability. Reuse the Monster Builder approach: numbered captures
   into `screenshots/` with JSON sidecars recording prompt, iteration, and level
   file hash. Derive numbering from the filesystem, not an in-memory counter,
   or a Crush restart resets it.
3. PixelLab MCP registered in `crush.json`. Token from https://api.pixellab.ai/mcp.
   Keep the token out of the project file if the global Crush config already
   holds provider credentials.
4. Vision model confirmed. `supports_attachments: true` on the model entry, then
   `/status` to verify which model actually won. Crush reads three config paths
   and the project one does not always take precedence.

Exit criteria: agent can edit `level.json`, see the result, and describe what it
sees without being told.

### Phase 1: Tile dictionary bootstrap

Build `IndexScene.js`, screenshot it, hand it to the vision model, ask it to
write `TINYTOWN.md`. Then correct it by hand and **log every correction**.

The correction log is a primary result. The prediction is that terrain and props
come out accurate and roof pieces do not, because left/mid/right roof variants
are only distinguishable in context. If that holds, the answer to "does the agent
need an external file" is a specific partially rather than a yes.

`TINYTOWN.md` should end up with:

- Index to name mapping for every tile.
- Category tags: terrain, roof, wall, door, window, fence, foliage, prop.
- Adjacency constraints: what may sit above, below, and beside each piece.
- Recipes: the exact index stacks that form a 2x3 house, a 3x4 house, a fence
  run with correct end caps.

### Phase 2: Level generation, three conditions

Same target brief for all three so results are comparable. Suggested brief:
a village of four to six buildings, a path network connecting them, a treeline
boundary, and a central open space.

- **A, step-by-step.** One instruction per turn. No plan file, no style file.
- **B, plan-then-execute.** Agent writes `level-plan.md` first, you approve it,
  then it executes without further guidance.
- **C, style-guided.** Condition B plus `STYLE.md` in context.

Record for each: wall-clock time, turn count, number of corrections you had to
issue, and the final screenshot.

### Phase 3: PixelLab gap-filling

Pick one thing Tiny Town cannot do. Water is the honest choice because it is the
gap the probe names, but note the cost: PixelLab's tileset tool produces Wang
tilesets keyed on corner configuration, so consuming it requires autotiling
logic in the generator, not just index placement. Budget for the agent writing a
`wangFill(layer, region, tilesetId)` helper.

Generation is asynchronous. Tools return job IDs immediately and process in the
background, typically 2 to 5 minutes. Batch all asset generation into one pass
rather than interleaving it with level iteration, or the loop stalls.

Judge style match on the composited screenshot, never on the isolated asset. A
generated tile can look fine alone and read as broken in place.

### Phase 4: Self-improvement loop

Fifteen iterations, same structure as the Neon Cryptid run. Each iteration:
screenshot, critique against `STYLE.md` and the Kenney preview, one targeted
change, `remember` the lesson. Consolidate at iteration 8 and 15.

Watch specifically for the agent writing composition helpers into the generator
rather than placing indices one at a time. That is the tilemap analogue of
`add_single_arm` and it is the most interesting thing that could happen.

Then run the reproduction test: hand the final `STYLE.md` and consolidated notes
to a fresh session and have it build a second village. Whether the knowledge
transfers is the real measure of whether the loop learned anything.

## Evaluation

Screenshot comparison against the Kenney Tiny Town preview image, scored on:

- **Structural validity.** Are buildings composed of legal tile stacks? Binary
  per building.
- **Spatial coherence.** Do paths connect things? Do buildings face the path?
  Is there negative space?
- **Style consistency.** Do generated tiles read as part of the same set?
- **Interest.** Does it look authored or does it look like noise with a grid?

Get a second person to score blind if you can. You will not be able to unsee
which condition produced which image.

## Known risks

| Risk | Mitigation |
|---|---|
| Wang autotiling consumes the schedule | Cut water, generate props instead |
| Generated tiles never match Kenney style | Report as a finding, it is a real limit |
| PixelLab credits run out | Check pricing before Phase 3, batch generation |
| Vision model too coarse to critique layout | Fall back to human-in-loop critique, note it |
| Agent thrashes without converging | Cap iterations, keep every screenshot |

## Deliverables

- The repo, with all screenshots and level files retained per iteration.
- `TINYTOWN.md` plus the correction log from Phase 1.
- Three level screenshots from Phase 3 conditions A, B, C.
- The iteration-by-iteration gallery from Phase 4.
- A short writeup: what the agent could infer, what it needed told, and whether
  this approach is worth building further tooling around.
