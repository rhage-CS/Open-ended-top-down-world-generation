# PROBE_CONDITIONS.md

Experimental protocol for the scene-composition probe.

## Research question

What does an agent need to know about a tileset before it can compose coherent
world scenes with it, and how much of that knowledge can it acquire on its own?

This file operationalises that as: **hold the task constant, vary the prompt
structure, count constraint violations.**

---

## Protocol version

**v2.1 — full-sheet.** Supersedes the 71-131 restricted protocol.

The earlier spec restricted the agent to indices 71-131 because rows 0-5 were
unauthored and no ground tile existed. Both are now false: `TINYTOWN_v2.md`
covers 132 of 132 tiles, and the validator carries rules 11-15 governing the
roof and fence regions in tileset rows 3-5.

**Runs made under the restricted protocol are not comparable to runs made under
this one.** Under 71-131 every tile governed by rules 11-15 is out of scope, so
five rules could not fire and scores were computed against ten rules, not
fifteen. Do not pool the two sets. If you want the old numbers, re-run them
under this spec rather than reusing them.

### Changes from v2

- Rule count and reachability denominator reconciled (see "Rule count" below).
- No-dictionary arm given an output path, an isolation procedure, and a
  mandatory void check. The first attempt at this arm was void because the
  agent copied an existing level file; that is now a checked failure mode
  rather than something caught by luck.
- The structural-inference decision is closed rather than left open.
- Six-run minimum stated as a valid reduced design.

### Note on "rows"

Throughout this file, **"rows" means rows of the tileset sheet**, not rows of
the output grid. Tileset row = `index // 12`. The output grid is always
referred to as "the grid" or by explicit coordinates. This distinction has
caused misreads; keep it.

---

## Rule count

`validate.js` encodes **15 rules**. `census.js` reports reachability over the
subset of rules that a scene can be constructed to exercise.

**Resolve the denominator before the first run.** Run both:

```bash
node tools/validate.js --selftest
node tools/census.js levels/full_map.json --zero=tile
```

If the census reports `14/14`, one rule is not reachability-testable. Name it
here, say why, and keep 14 as the threshold. If it reports `15/15`, change every
threshold in this file to 15/15.

Do not run the conditions until this line reads a single consistent number. A
scoring rule that disagrees with the instrument is worse than no scoring rule.

**Current threshold: 14/14 — pending confirmation above.**

---

## Setup the agent needs

Before any condition runs, the agent must have:

1. `TINYTOWN_v2.md` readable in context. This is the tile dictionary.
   **Except in the fourth arm**, where it is withheld — see below.
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
> - the sheet has two distinct fence systems, the enclosure at tileset rows 3-5
>   and the posts-and-rails at tileset row 6. A single run must draw from one
>   system only
>
> Write levels/gen_styled_{run}.json and run the validator once, at the end,
> with --zero=tile.

**Note on what this condition now tests.** The added constraints are the ones
an agent is least likely to derive unaided, because they contradict what colour
similarity suggests. If condition 3 pulls away from conditions 1 and 2, the
material-role constraint is the most likely reason, and the per-rule breakdown
will show it directly.

---

## Fourth arm — no dictionary

Not optional. This is the arm that answers the research question. Conditions 1-3
measure prompting strategy with knowledge held constant. This one measures what
the knowledge is worth.

Same task spec, same output format. **`TINYTOWN_v2.md` is withheld.** The agent
gets only the tileset image.

Output path: `levels/gen_nodict_{run}.json`.

Expect this arm to fail the element list, not just the rules. Score it anyway
and record which elements were absent, since "could not find the roof tiles"
is a different failure from "found them and placed them wrongly".

### Isolation procedure — run this before every no-dictionary run

The first attempt at this arm was void: the agent emitted a byte-identical copy
of `gen_planned_3.json` rather than composing a scene. It scored zero violations
and would have been recorded as a clean result. It was caught only because the
file contents were noticed to be identical.

An agent denied the information it needs will look for it elsewhere in the
working tree. Assume this rather than hoping otherwise.

Before each no-dictionary run:

1. Move every prior output out of the tree the agent can read:
   `mv levels/gen_*.json levels/_done/`
2. Move the dictionary and the corrections log out of reach:
   `mv TINYTOWN_v2.md TINYTOWN_corrections.md ../_withheld/`
   Also confirm `TINYTOWN.md` and `TINYTOWN_v0_unlooked.md` are out of reach —
   v1 is wrong, but it is still a dictionary.
3. Confirm `levels/full_map.json` and `levels/reference_scene.json` are out of
   reach. The baseline is a worked answer.
4. Record the tree state: `ls -R levels/ *.md > runs/nodict_{run}_tree.txt`

### Void check — run this on every output, every arm

```bash
shasum -a 256 levels/gen_*.json levels/_done/*.json
```

**Any output whose hash matches another level file is void.** Record it as void
with the matching filename, do not score it, and re-run. This applies to every
condition, not just the fourth arm — a condition 2 run that duplicates a
condition 1 run is the same failure.

Also check file mtimes. An output written implausibly fast relative to the tool
call log did not involve composition.

---

## Run protocol

- 3 runs per condition, fresh context each time. Prompt variance is large;
  a single run per condition tells you nothing.
- **Reduced design, if time is short: 3 runs of condition 2 and 3 runs of the
  no-dictionary arm.** Six runs, roughly 90 minutes. This answers the primary
  question — what the dictionary is worth — and drops the secondary question
  about prompting style. Prefer this over twelve rushed runs. Record which
  design was used.
- Same model, same settings, across all runs.
- Do not hand-edit the agent's output before scoring.
- Run the void check before scoring anything.
- Score every run with **both** tools:

```bash
node tools/validate.js levels/gen_{cond}_{run}.json --json --zero=tile
node tools/census.js   levels/gen_{cond}_{run}.json --zero=tile
```

- Record for each run: total violations, per-rule counts, **rules reachable**,
  distinct tile count, placed tile count, wall-clock time, number of tool calls.

### The census is not optional

A run that scores zero because it satisfied every rule and a run that scores
zero because it placed no roof are the same number. The census separates them.

**Scoring rule: a run below the reachability threshold is reported as
incomplete, not as clean.** Its violation count goes in the table with the
reachability figure beside it, and it is not averaged in with complete runs.
Without this, the easiest way for an agent to score well is to build less,
and the measure rewards exactly the behaviour it should penalise.

### Placed tile count is a required measure

The three planned runs scored zero violations each while placing 73, 53 and 51
tiles. The scores were identical and the scenes were not. Reachability caught
none of this because all three cleared the threshold. Record the placed count
on every run and report it beside the violation count.

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
- placed tile count
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

The worked example is in the dictionary. Tileset rows 4-5 and rows 6-7 occupy
the same columns, split into variants at the same column boundary, and row 5's
bottom edge is a wall in a material matching the facade beneath. Every one of
those facts is true and independently verified. The inference that they form one
building is false, and a seam test falsified it at 14 to 16 mismatches out of 16
on every column.

Composing a scene is exactly this kind of inference. An agent handed a correct
dictionary will produce confident, well-formed structures resting on
relationships that were never in the sheet, and **those scenes are
adjacency-clean and will score zero.** Every rule in `validate.js` is a local
adjacency check. None of them can see this.

**Decision: do both, and report them separately.**

1. Encode the three known-independent facts as rules: the rows 4-5 roof does not
   cap the rows 6-7 facade; the two fence systems are separate; the two roof
   idioms (rows 4-5 and rows 8-10) are separate. Narrow by design — it catches
   only inferences already falsified.
2. Read every output scene by hand against a written checklist. Report the count
   in its own column, never folded into the validator score.

Option 1 alone catches nothing new, and the interesting failures will be new
ones. Option 2 alone scales badly but is the only thing that sees novel cases.
Reading three conditions scoring near zero as success, without either, is the
failure this section exists to prevent.

The hand-read checklist lives in `runs/checklist.md` and is written before the
first run, not after seeing the outputs.

---

## Baseline

`levels/full_map.json` is hand-authored and scores **0 violations at the full
reachability threshold**. Both halves matter:

- `--selftest` proves each rule *can* fire
- the baseline proves all of them can be satisfied *simultaneously*

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
first, re-verify at 0 violations and full reachability, and note the change here.