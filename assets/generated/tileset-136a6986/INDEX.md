# tileset-136a6986 — index reference

Sheet: `assets/generated/tileset-136a6986/sheet.png`
Tile size: 16x16px, 7 columns.
Index = row * 7 + col. 25 tiles. Any index not listed below
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
| 7 | LLLL | lower, lower, lower, lower |
| 15 | LLLU | lower, lower, lower, upper |
| 16 | LLUU | lower, lower, upper, upper |
| 17 | LLUL | lower, lower, upper, lower |
| 22 | LULU | lower, upper, lower, upper |
| 27 | ULUL | upper, lower, upper, lower |
| 29 | LULU | lower, upper, lower, upper |
| 31 | ULUU | upper, lower, upper, upper |
| 32 | LUUU | lower, upper, upper, upper |
| 34 | ULUL | upper, lower, upper, lower |
| 37 | UUUU | upper, upper, upper, upper |
| 46 | UUUT | upper, upper, upper, transition |
| 47 | UUTT | upper, upper, transition, transition |
| 48 | ULTL | upper, lower, transition, lower |
| 53 | UTUL | upper, transition, upper, lower |
| 54 | TTLL | transition, transition, lower, lower |
| 55 | TLLL | transition, lower, lower, lower |
| 57 | LULT | lower, upper, lower, transition |
| 58 | UUTU | upper, upper, transition, upper |
| 60 | ULTU | upper, lower, transition, upper |
| 64 | LTLL | lower, transition, lower, lower |
| 65 | TULU | transition, upper, lower, upper |
| 67 | TULU | transition, upper, lower, upper |
| 72 | LUUT | lower, upper, upper, transition |
| 79 | UTUL | upper, transition, upper, lower |

## Placement rule

Two tiles may sit side by side only when the left tile's NE and SE corners
match the right tile's NW and SW corners. Vertically, the upper tile's SW and
SE must match the lower tile's NW and NE.

This is checkable from the table alone, without looking at the art. Every
placement in a correct scene satisfies it.
