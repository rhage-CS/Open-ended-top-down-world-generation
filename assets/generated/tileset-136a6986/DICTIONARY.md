# tileset-136a6986

Generated Wang tileset from PixelLab. Tile size 16x16.
Terrains: lower / upper.

Corner signature reads NW NE SW SE. U = upper terrain, L = lower terrain.

Unlike the hand-authored Tiny Town dictionary, every claim here comes from
the generator's own metadata rather than from pixel inspection. That is the
difference between a tileset you were given and one you asked for: the
adjacency semantics arrive with the art.

| id | row | col | corners | reading | file |
| --- | --- | --- | --- | --- | --- |
| 96037133-227b-4c6c-9eb1-552806cc08f1 | 1 | 0 | LLLL | solid lower terrain — interior fill | tile_96037133-227b-4c6c-9eb1-552806cc08f1.png |
| 1 | 2 | 1 | LLLU | lower with one upper corner — outer corner | tile_01.png |
| 2 | 2 | 2 | LLUU | lower above, upper below — horizontal edge | tile_02.png |
| 3 | 2 | 3 | LLUL | lower with one upper corner — outer corner | tile_03.png |
| 10 | 3 | 1 | LULU | lower left, upper right — vertical edge | tile_10.png |
| 4 | 4 | 1 | LULU | lower left, upper right — vertical edge | tile_04.png |
| 8b87fa1d-373f-4280-9010-7b007206d9bb | 5 | 2 | UUUU | solid upper terrain — interior fill | tile_8b87fa1d-373f-4280-9010-7b007206d9bb.png |
| 6 | 3 | 6 | ULUL | upper left, lower right — vertical edge | tile_06.png |
| 14 | 4 | 6 | ULUL | upper left, lower right — vertical edge | tile_14.png |
| 8 | 4 | 3 | ULUU | upper with one lower corner — inner corner | tile_08.png |
| 9 | 4 | 4 | LUUU | upper with one lower corner — inner corner | tile_09.png |
| 16 | 6 | 4 | UUU? | upper with one lower corner — inner corner | tile_16.png |
| 17 | 6 | 5 | UU?? | diagonal split | tile_17.png |
| 18 | 6 | 6 | UL?L | lower with one upper corner — outer corner | tile_18.png |
| 19 | 7 | 4 | U?UL | diagonal split | tile_19.png |
| 20 | 7 | 5 | ??LL | diagonal split | tile_20.png |
| 21 | 7 | 6 | ?LLL | diagonal split | tile_21.png |
| 22 | 8 | 1 | LUL? | lower with one upper corner — outer corner | tile_22.png |
| 23 | 8 | 2 | UU?U | upper with one lower corner — inner corner | tile_23.png |
| 24 | 8 | 4 | UL?U | diagonal split | tile_24.png |
| 25 | 9 | 1 | L?LL | diagonal split | tile_25.png |
| 26 | 9 | 2 | ?ULU | diagonal split | tile_26.png |
| 27 | 9 | 4 | ?ULU | diagonal split | tile_27.png |
| 28 | 10 | 2 | LUU? | diagonal split | tile_28.png |
| 30 | 11 | 2 | U?UL | diagonal split | tile_30.png |

## Placement rule

Two tiles may sit side by side when their facing corners agree: the east
corners (NE, SE) of the left tile must match the west corners (NW, SW) of the
right tile. Same vertically for south against north. This is checkable without
looking at a single pixel.
