# Style Guidance

This file is an experimental variable. Conditions A and B run without it.
Condition C and the self-improvement loop run with it.

## Reference

The Kenney Tiny Town preview image is the quality bar. Look at it before you
start and again when you critique your own work.

## Composition principles

**Buildings sit on ground, not in it.** Every structure needs a tile of open
terrain on all sides. Buildings flush against a treeline or against each other
read as a texture, not as a village.

**Paths connect, they do not decorate.** Every path segment should lead
somewhere. A path that dead-ends into grass is a mistake unless something is at
the end of it.

**Buildings face the path.** Doors point toward the nearest path. A door facing
a wall is the single most common tell that a layout was generated rather than
authored.

**Negative space is content.** Roughly a third of the map should be open
terrain with nothing on it. Filling every tile is the failure mode, not the goal.

**Cluster, then scatter.** Buildings group. Trees and props scatter with uneven
density. Uniform spacing of anything reads as machine-placed.

**Vary building footprints.** If all six buildings are the same size, the layout
looks like a parking lot. Mix small and large.

## Terrain

Vary ground tiles. Tiny Town includes multiple grass variants; using one index
for the whole ground layer produces a flat, obviously-tiled surface. Scatter
variants at low density, not in patterns.

Treelines should have ragged edges. A straight line of trees is a fence.

## Props

Props go where people would put them: near doors, along paths, at the edges of
open space. A barrel in the middle of a field is noise.

Two or three props per building is plenty. More reads as clutter.

## Generated tiles

Anything from PixelLab must match the Tiny Town look: 16x16, thick dark outline
on every shape, limited palette, flat shading with minimal gradients, three
quarter top-down perspective. If a generated tile has soft edges, more than a
few colors, or no outline, regenerate it rather than using it.

## Self-critique checklist

Before declaring a level done, look at the screenshot and answer:

1. Does every door face a path?
2. Is any building touching another building or the map edge?
3. Does any path dead-end for no reason?
4. Is there a region larger than a quarter of the map with nothing in it, and
   is that intentional?
5. Would this look out of place next to the Kenney preview image?

Answer honestly. If the answer to 5 is yes, say why specifically.
