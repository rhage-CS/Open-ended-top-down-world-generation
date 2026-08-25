# runs/checklist.md

Hand-read pass for every scored scene. Written before the first run.

The validator does local adjacency only. This checklist covers what it cannot
see: whether the parts assemble into things, and whether relationships exist
between regions that were never in the sheet.

Score each item Y / N / NA. Report the total separately from the validator
count. **Never fold these into the violation number.**

---

## How to run it

Open the scene in the viewer at 1x. Do not read the JSON — read the picture.
Reading indices primes you to check what the rules already check.

One pass per scene, five minutes. If you find yourself deliberating for more
than about thirty seconds on an item, mark it N and note why; the hesitation is
the finding.

---

## A. Assembly — do the parts form objects?

1. Does every roof run sit on top of something that could be a building?
   A roof run floating on grass is adjacency-clean and architecturally absurd.
2. Does every facade have a roof, or is it deliberately a roofless wall?
3. Is each building a rectangle, or does it have ragged edges where the agent
   ran out of the right tile?
4. Do doors open onto walkable ground, or into a wall, a fence, or the map edge?
5. Is the fence enclosure actually closed — can you trace its perimeter without
   leaving the fence system?
6. Does the rail fence run between two things, or does it start and stop in
   open grass?

## B. Structural inference — invented relationships

This is the class the seam test falsified. Rows 4-5 and rows 6-7 are separate
idioms; a scene that caps a rows 6-7 facade with a rows 4-5 roof has invented a
building that the sheet does not contain.

7. Is a rows 4-5 roof placed directly on a rows 6-7 facade? **This is the known
   false inference.** Record it every time it appears.
8. Are the two roof idioms (rows 4-5 and rows 8-10) mixed within one structure?
9. Are the two fence systems used as if interchangeable — not adjacent, which
   the validator catches, but serving the same role in the same enclosure?
10. Any other case where two correctly-labelled regions have been joined into
    one object. Describe it in a sentence. **These are the interesting ones**,
    because they are new inferences rather than the one already falsified.

## C. Scene coherence

11. Is there anything a person would read as a town, or is it a parts catalogue
    laid out on grass?
12. Do buildings sit in plausible relation to each other, or overlap, abut, or
    scatter at random?
13. Does the dirt path go anywhere — connecting doors, gates, or map edges — or
    is it a stripe?
14. Are terrain transition tiles used where dirt meets grass, or does the path
    have hard edges?
15. Are objects (well, sign, props) placed where they would be used, or dropped
    in gaps?

## D. Density and effort

16. Estimate the fraction of the objects layer that is actually built. A scene
    at 51 placed tiles and one at 82 both score zero.
17. Is any region of the grid conspicuously empty?
18. Did the agent use both colourways, or default to one?

---

## Recording

For each run, in `runs/{condition}_{n}.md`:

```
scene:            levels/gen_{cond}_{n}.json
validator:        N violations
census:           N/14 reachable
placed tiles:     N
checklist:        N of 18 marked N
known inference:  item 7 present? Y/N
novel inference:  (item 10, one line each)
notes:
```

The novel-inference lines are the ones to read again at the end. If the same
invented relationship shows up across conditions, that is a finding about what
agents assume, not about this tileset.

---

## A note on item 7

If a reviewer asks why a roof on a facade is wrong when it renders correctly:
the seam test gave 14-16 mismatches out of 16 on every column, so the two
regions do not share an edge. For a game artifact, "looks right" may be the
operative standard, and if so this item is measuring the wrong thing. That is
an open question rather than a settled one. Record it either way and let the
count decide how much it matters.
