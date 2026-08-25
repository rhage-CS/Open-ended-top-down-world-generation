# PROBE_CONDITIONS.md

Experimental protocol for the scene-composition probe.

## Research question

What does an agent need to know about a tileset before it can compose coherent
world scenes with it, and how much of that knowledge can it acquire on its own?

This file operationalises that as: **hold the task constant, vary the prompt
structure, count constraint violations.**

---

## Protocol version

**v2 — full-sheet.** Supersedes the 71-131 restricted protocol.

The earlier spec restricted the agent to indices 71-131 because rows 0-5 were
unauthored and no ground tile existed. Both are now false: `TINYTOWN_v2.md`
covers 132 of 132 tiles, and the validator carries rules 11-15 governing the
roof and fence regions in rows 3-5.

**Runs made under the restricted protocol are not comparable to runs made under
this one.** Under 71-131 every tile governed by rules 11-15 is out of scope, so
five rules could not fire and scores were computed against ten rules, not
fifteen. Do not pool the two sets. If you want the old numbers, re-run them
under this spec rather than reusing them.

---

## Setup the agent needs

Before any condition runs, the agent must have:

1. `TINYTOWN_v2.md` readable in context. This is the tile dictionary.
2. Write access to `levels/`. Output goes to `levels/gen_{condition}_{run}.json`.
3. Ability to run `node tools/validate.js <path> --json --zero=tile`.
4. Ability to run the screenshot capture so it can see its own output.

Output format the agent must emit (matches `src/ViewerScene.js`):

```json
{
  "width": 24,
  "height": 16,
  "tileSize": 16,
  "layers": [ { "name": "ground", "data": [[...], [...]] } ]
}
```

`data` is a nested 2D array, row-major, `-1` for empty.

### Zero convention — get this right or every score is wrong

**Empty is `-1`. Zero is a real tile: the grass fill at index 0.**

Tiled writes `0` for "no tile", so the validator defaults to reading `0` as
empty. This project does not use that convention, so **every scoring command
must pass `--zero=tile`.** Without it, every grass tile the agent places is
dropped before a single rule sees it, and the scene is scored with holes in it.

State the convention in the agent's prompt as well. An agent that assumes the
Tiled convention will write `0` meaning empty, and its ground will be read as
grass.

---

## Frozen task spec

> Compose a top-down town scene on a 24x16 grid using the Kenney Tiny Town
> tileset.
>
> Ground first. Every cell of the 24x16 grid that is not occupied by a
> structure or object must contain a terrain tile. Grass fill is index 0,
> dirt fill is index 25. No cell may be left as -1.
>
> The scene must then contain:
>
> - two buildings in different colourways, each with a ground-level door,
>   one of which uses the double-door pair
> - at least one complete roof run using tile indices 48-67, running from a
>   left-edge tile through to a right-edge tile
> - one stone arch, placed as a matched pair
> - a closed fence enclosure
> - one rail fence section, terminating in posts at both ends
> - one structure using the large assembly tiles
> - a well
> - a signpost
> - at least one tree group from the block-locked 3x3 tree region
> - a dirt path of at least six tiles, using the terrain transition tiles
>   where dirt meets grass
>
> Use any tile index from 0 to 131. Write the result to the path given.

### Why the element list is what it is

The required elements are not arbitrary. Each one makes a rule family reachable.
Drop the roof run and rules 11, 12 and 13 cannot fire; drop the enclosure and
rules 14 and 15 cannot. A condition that scores zero on a scene containing no
roof has not demonstrated anything about roof knowledge.

The list is held constant across all conditions, so it does not advantage any
one of them. It is a floor on what the measure can see, not a hint.

---

## Condition 1 — step-by-step

Agent places one region at a time and validates after each.

> You are composing a tilemap scene. Read TINYTOWN_v2.md first.
>
> [TASK SPEC]
>
> Work one element at a time. After placing each element, write the current
> grid to levels/gen_stepwise_{run}.json and run
> `node tools/validate.js levels/gen_stepwise_{run}.json --json --zero=tile`.
> Fix any violations before moving to the next element.
> Report the violation count after each step.

## Condition 2 — plan-then-execute

Agent commits to a layout in prose before emitting any tiles.

> You are composing a tilemap scene. Read TINYTOWN_v2.md first.
>
> [TASK SPEC]
>
> Before writing any tiles, produce a written plan: list each element, its
> bounding box in grid coordinates, and which tile indices you will use.
> Do not write the JSON until the plan is complete.
> Then execute the plan in a single pass and write
> levels/gen_planned_{run}.json.
> Run the validator once, at the end, with --zero=tile.

## Condition 3 — style-guided

Agent is given the composition rules explicitly rather than left to derive
them from the dictionary.

> You are composing a tilemap scene. Read TINYTOWN_v2.md first, paying
> particular attention to the "Composition rules summary" section.
>
> [TASK SPEC]
>
> These constraints are binding:
>
> - doors must sit on the bottom row of a facade; nothing may be below them
> - double doors are an ordered adjacent pair, left leaf then right leaf
> - a facade must not mix orange and blue tiles
> - rail pieces must terminate in posts at both ends
> - the sign mounts directly above its post
> - the well is one object spanning two vertically adjacent tiles
> - stone arch halves must be placed as a matched pair
> - a roof run must not mix variant A (blue-grey roof) with variant B (red roof)
> - a roof run reads left edge, then fill or dormer tiles, then right edge; a
>   dormer may not sit at either end
> - the blue-grey ramp is the roof in variant A and the wall in variant B. A
>   variant A roof stacked on a variant B roof is two roofs, not a roof and a
>   wall. Any vertical roof-to-wall transition must hold one variant throughout
> - a fence piece's declared connections must be met by the neighbouring tile
> - the sheet has two distinct fence systems, the enclosure at rows 3-5 and the
>   posts-and-rails at row 6. A single run must draw from one system only
>
> Write levels/gen_styled_{run}.json and run the validator once, at the end,
> with --zero=tile.

**Note on what this condition now tests.** The added constraints are the ones
an agent is least likely to derive unaided, because they contradict what colour
similarity suggests. If condition 3 pulls away from conditions 1 and 2, the
material-role constraint is the most likely reason, and the per-rule breakdown
will show it directly.

---

## Optional fourth arm — no dictionary

Strongly worth running. Same task spec, same output format, but
**TINYTOWN_v2.md is withheld.** The agent gets only the tileset image.

This is the arm that actually answers the research question. Conditions 1-3
measure prompting strategy with knowledge held constant. This one measures
what the knowledge is worth.

Expect this arm to fail the element list, not just the rules. Score it anyway
and record which elements were absent, since "could not find the roof tiles"
is a different failure from "found them and placed them wrongly".

---

## Run protocol

- 3 runs per condition, fresh context each time. Prompt variance is large;
  a single run per condition tells you nothing.
- Same model, same settings, across all runs.
- Do not hand-edit the agent's output before scoring.
- Score every run with **both** tools:

```bash
node tools/validate.js levels/gen_{cond}_{run}.json --json --zero=tile
node tools/census.js   levels/gen_{cond}_{run}.json --zero=tile
```

- Record for each run: total violations, per-rule counts, **rules reachable**,
  distinct tile count, wall-clock time, number of tool calls.

### The census is not optional

A run that scores zero because it satisfied fifteen rules and a run that scores
zero because it placed no roof are the same number. The census separates them.

**Scoring rule: a run with fewer than 14/14 rules reachable is reported as
incomplete, not as clean.** Its violation count goes in the table with the
reachability figure beside it, and it is not averaged in with complete runs.
Without this, the easiest way for an agent to score well is to build less,
and the measure rewards exactly the behaviour it should penalise.

---

## Measures

**Primary:** total violations from `validate.js`, reported alongside rules
reachable from `census.js`. Neither number means anything alone.

**Secondary:**

- violations by rule — shows *which* knowledge failed to transfer, not just
  how much
- whether the agent used the validator unprompted in conditions 2 and 3
- tile diversity: how many distinct indices appear. A scene with zero
  violations built from four tile types is technically clean and useless
- element completeness: which required elements are present at all

---

## Known limits of the measure

State these in the writeup rather than letting a reader assume otherwise.

- The validator does local adjacency only. A building floating in space
  violates nothing. Global structure is not measured.
- Rules only cover what v2 could state. Tiles marked READS AS or left
  unlabelled have no rule behind them. `(5,3)` and `(5,7)` are the largest
  such gap inside a region the task now requires.
- Zero violations means "no rule fired", not "the scene is good".
- **Structural inference is invisible to this measure.** This is the important
  one. See below.

### Structural inference

`TINYTOWN_v2.md` logs four inspection failure modes. Three of them (priors,
pixels, rendering) concern getting a single region wrong. The fourth is
different: **inventing a relationship between two regions that are each
correctly labelled.**

The worked example is in the dictionary. Rows 4-5 and rows 6-7 occupy the same
columns, split into variants at the same column boundary, and row 5's bottom
edge is a wall in a material matching the facade beneath. Every one of those
facts is true and independently verified. The inference that they form one
building is false, and a seam test falsified it at 14 to 16 mismatches out of 16
on every column.

Composing a scene is exactly this kind of inference. An agent handed a correct
dictionary will produce confident, well-formed structures resting on
relationships that were never in the sheet, and **those scenes are adjacency-clean
and will score zero.** Every rule in `validate.js` is a local adjacency check.
None of them can see this.

**Decide before running, not after.** Two options:

1. Encode the known-independent facts as rules. The rows 4-5 roof does not cap
   the rows 6-7 facade; the two fence systems are separate; the two roof idioms
   (rows 4-5 and rows 8-10) are separate. This catches the specific inferences
   already falsified, and nothing else.
2. Read every output scene by hand against a written checklist, and report the
   count separately from the validator score.

Option 1 is narrower than it looks, because it only catches inferences already
known to be wrong, and the interesting failures will be new ones. Option 2 scales
badly but is the only thing that catches novel cases. Doing both is defensible.
Doing neither, and then reading three conditions scoring near zero as success,
is the failure this section exists to prevent.

---

## Baseline

`levels/full_map.json` is hand-authored and scores **0 violations with 14/14
rules reachable**. Both halves matter:

- `--selftest` proves each rule *can* fire
- the baseline proves all fifteen can be satisfied *simultaneously*

Together they are what makes a zero from an agent meaningful. Any condition
scoring above 0 is failing a task known to be achievable rather than an
impossible one.

**The baseline is not shown to the agent.** Record this decision here because
it is easy to reverse by accident. Two reasons: it would leak composition
answers that conditions 1 and 2 are meant to require the agent to derive, and
its roof runs and fence enclosure were placed for rule coverage rather than
architectural sense, so as an exemplar it would model the floating-structure
error the measure already cannot see.

If you do decide to expose it, move the roof runs so they cap an actual facade
first, re-verify at 0 violations and 14/14, and note the change here.