# tileset-d7077052 — index reference

Sheet: `assets/generated/tileset-d7077052/sheet.png`
Tile size: 16x16px, 7 columns.
Index = row * 7 + col. 16 tiles. Any index not listed below
is an empty slot and renders as nothing.

## What the terrains mean

This is an **elevation set**, not two flat terrains side by side.

- `lower` — ground level
- `upper` — a raised plateau standing above it
- `transition` — the cliff face where the plateau drops to ground level

A plateau is drawn as an area of `upper` tiles, outlined by `transition`
tiles forming its cliff wall, sitting in a field of `lower` tiles. A straight
horizontal line dividing the map in two is not what this set is for.

## Tiles

Corners read NW, NE, SW, SE. U = upper, L = lower, T = transition.

| index | corners | terrains |
| --- | --- | --- |
| 8 | LLLU | lower, lower, lower, upper |
| 9 | LLUU | lower, lower, upper, upper |
| 10 | LLUL | lower, lower, upper, lower |
| 15 | LULU | lower, upper, lower, upper |
| 16 | UUUU | upper, upper, upper, upper |
| 17 | ULUU | upper, lower, upper, upper |
| 18 | LUUU | lower, upper, upper, upper |
| 20 | ULUL | upper, lower, upper, lower |
| 25 | UUUL | upper, upper, upper, lower |
| 26 | UULL | upper, upper, lower, lower |
| 27 | ULLL | upper, lower, lower, lower |
| 29 | LULL | lower, upper, lower, lower |
| 30 | UULU | upper, upper, lower, upper |
| 32 | ULLU | upper, lower, lower, upper |
| 37 | LUUL | lower, upper, upper, lower |
| 45 | LLLL | lower, lower, lower, lower |

## Placement rule

Two tiles may sit side by side only when the left tile's NE and SE corners
match the right tile's NW and SW corners. Vertically, the upper tile's SW and
SE must match the lower tile's NW and NE.

This is checkable from the table alone, without looking at the art. Every
placement in a correct scene satisfies it.
