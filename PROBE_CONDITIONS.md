# PROBE_CONDITIONS.md

Experimental protocol for the scene-composition probe.

## Research question

What does an agent need to know about a tileset before it can compose coherent
world scenes with it, and how much of that knowledge can it acquire on its own?

This file operationalises that as: **hold the task constant, vary the prompt
structure, count constraint violations.**

---

## Setup the agent needs

Before any condition runs, the agent must have:

1. `TINYTOWN_v2.md` readable in context. This is the tile dictionary.
2. Write access to `levels/`. Output goes to `levels/gen_{condition}_{run}.json`.
3. Ability to run `node tools/validate.js <path> --json`.
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

---

## Frozen task spec

Identical text in every condition. Do not reword it between runs.

> Compose a top-down town scene on a 24x16 grid using the Kenney Tiny Town
> tileset. The scene must contain:
>
> - two buildings in different colourways, each with a roof and a ground-level door
> - one building with an open archway rather than a door
> - a well
> - a fenced boundary at least four tiles long
> - a signpost
> - at least six props
>
> Use only tile indices 71-131. Write the result to the path given.

---

## Condition 1 — step-by-step

Agent places one region at a time and validates after each.

> You are composing a tilemap scene. Read TINYTOWN_v2.md first.
>
> [TASK SPEC]
>
> Work one element at a time. After placing each element, write the current
> grid to levels/gen_stepwise_{run}.json and run
> `node tools/validate.js levels/gen_stepwise_{run}.json --json`.
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
> Run the validator once, at the end.

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
> - rock formation halves must be placed as a matched pair
>
> Write levels/gen_styled_{run}.json and run the validator once, at the end.

---

## Optional fourth arm — no dictionary

Strongly worth running. Same task spec, same output format, but
**TINYTOWN_v2.md is withheld.** The agent gets only the tileset image.

This is the arm that actually answers the research question. Conditions 1-3
measure prompting strategy with knowledge held constant. This one measures
what the knowledge is worth.

---

## Run protocol

- 3 runs per condition, fresh context each time. Prompt variance is large;
  a single run per condition tells you nothing.
- Same model, same settings, across all runs.
- Do not hand-edit the agent's output before scoring.
- Record for each run: total violations, per-rule counts, wall-clock time,
  number of tool calls.

## Measures

**Primary:** total violations from `validate.js`.

**Secondary:**

- violations by rule — shows *which* knowledge failed to transfer, not just
  how much
- whether the agent used the validator unprompted in conditions 2 and 3
- tile diversity: how many distinct indices appear. A scene with zero
  violations built from four tile types is technically clean and useless.

## Known limits of the measure

State these in the writeup rather than letting a reader assume otherwise.

- The validator does local adjacency only. A building floating in space
  violates nothing. Global structure is not measured.
- Rules only cover what v2 could state. Tiles marked READS AS or left
  unlabelled have no rule behind them.
- Indices 0-70 are unauthored, so no ground tiles exist. Every scene will
  float on empty background in all conditions.
- Zero violations means "no rule fired", not "the scene is good".

## Baseline

`levels/full_map.json` is hand-authored and scores 0. It is the existence
proof that the task spec is satisfiable, and any condition scoring above 0
is failing a task known to be achievable rather than an impossible one.
