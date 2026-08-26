# tileset-d7077052

Generated Wang tileset from PixelLab. Tile size 16x16.
Terrains: lower / upper.

Corner signature reads NW NE SW SE. U = upper terrain, L = lower terrain.

Unlike the hand-authored Tiny Town dictionary, every claim here comes from
the generator's own metadata rather than from pixel inspection. That is the
difference between a tileset you were given and one you asked for: the
adjacency semantics arrive with the art.

| id | row | col | corners | reading | file |
| --- | --- | --- | --- | --- | --- |
| 13 | 4 | 2 | UULU | upper with one lower corner — inner corner | tile_13.png |
| 10 | 2 | 6 | ULUL | upper left, lower right — vertical edge | tile_10.png |
| 4 | 4 | 1 | LULL | lower with one upper corner — outer corner | tile_04.png |
| 12 | 3 | 5 | UULL | upper above, lower below — horizontal edge | tile_12.png |
| 6 | 5 | 2 | LUUL | diagonal split | tile_06.png |
| 8 | 3 | 6 | ULLL | lower with one upper corner — outer corner | tile_08.png |
| d72e5809-d8f2-4c2a-a4d4-0eb399e9f780 | 6 | 3 | LLLL | solid lower terrain — interior fill | tile_d72e5809-d8f2-4c2a-a4d4-0eb399e9f780.png |
| 1 | 1 | 1 | LLLU | lower with one upper corner — outer corner | tile_01.png |
| 11 | 2 | 3 | ULUU | upper with one lower corner — inner corner | tile_11.png |
| 3 | 1 | 2 | LLUU | lower above, upper below — horizontal edge | tile_03.png |
| 2 | 1 | 3 | LLUL | lower with one upper corner — outer corner | tile_02.png |
| 5 | 2 | 1 | LULU | lower left, upper right — vertical edge | tile_05.png |
| 2a9f299b-334c-48f6-8bb1-477292963d3f | 2 | 2 | UUUU | solid upper terrain — interior fill | tile_2a9f299b-334c-48f6-8bb1-477292963d3f.png |
| 14 | 3 | 4 | UUUL | upper with one lower corner — inner corner | tile_14.png |
| 9 | 4 | 4 | ULLU | diagonal split | tile_09.png |
| 7 | 2 | 4 | LUUU | upper with one lower corner — inner corner | tile_07.png |

## Placement rule

Two tiles may sit side by side when their facing corners agree: the east
corners (NE, SE) of the left tile must match the west corners (NW, SW) of the
right tile. Same vertically for south against north. This is checkable without
looking at a single pixel.
