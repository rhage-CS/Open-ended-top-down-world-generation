#!/usr/bin/env node
/**
 * tileset_index.js — write INDEX.md for a fetched PixelLab tileset.
 *
 * pixellab_tileset.js records each tile's row and col. A level file addresses
 * tiles by a single index, so the two have to be reconciled:
 *
 *     index = row * columns + col
 *
 * where columns comes from the packed sheet's width. Without this file an
 * agent has no way to name a tile and will invent numbers.
 *
 * Usage:
 *   node tools/tileset_index.js assets/generated/tileset-136a6986
 */

const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node tools/tileset_index.js <tileset-dir>');
  process.exit(1);
}

const metaPath = path.join(dir, 'meta.json');
if (!fs.existsSync(metaPath)) {
  console.error(`No meta.json in ${dir}`);
  process.exit(1);
}
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

// Columns must come from the sheet itself, not from the tile list — the sheet
// is what the viewer slices, and a mismatch here silently renders blanks.
const sheetPath = path.join(dir, 'sheet.png');
let cols;
if (fs.existsSync(sheetPath)) {
  const buf = fs.readFileSync(sheetPath);
  const width = buf.readUInt32BE(16);   // PNG IHDR width
  const height = buf.readUInt32BE(20);
  cols = Math.floor(width / meta.tile_size.width);
  console.log(`sheet ${width}x${height} -> ${cols} columns of ${meta.tile_size.width}px`);
} else {
  cols = Math.max(...meta.tiles.map((t) => t.col ?? 0)) + 1;
  console.log(`no sheet.png; inferring ${cols} columns from tile positions`);
}

const SHORT = { upper: 'U', lower: 'L', transition: 'T' };
const sig = (t) =>
  ['NW', 'NE', 'SW', 'SE'].map((k) => SHORT[t.corners?.[k]] || '?').join('');

const placed = meta.tiles
  .filter((t) => Number.isInteger(t.row) && Number.isInteger(t.col))
  .map((t) => ({ ...t, index: t.row * cols + t.col }))
  .sort((a, b) => a.index - b.index);

const corners = (t) =>
  ['NW', 'NE', 'SW', 'SE'].map((k) => t.corners?.[k] ?? '?').join(', ');

const lines = placed.map(
  (t) => `| ${t.index} | ${sig(t)} | ${corners(t)} |`
);

const md = `# ${path.basename(dir)} — index reference

Sheet: \`${path.join(dir, 'sheet.png')}\`
Tile size: ${meta.tile_size.width}x${meta.tile_size.height}px, ${cols} columns.
Index = row * ${cols} + col. ${placed.length} tiles. Any index not listed below
is an empty slot and renders as nothing.

## What the terrains mean

This is an **elevation set**, not two flat terrains side by side.

- \`lower\` — ground level
- \`upper\` — a raised plateau standing above it
- \`transition\` — the cliff face where the plateau drops to ground level

A plateau is drawn as an area of \`upper\` tiles, outlined by \`transition\`
tiles forming its cliff wall, sitting in a field of \`lower\` tiles. A straight
horizontal line dividing the map in two is not what this set is for.

## Tiles

Corners read NW, NE, SW, SE. U = upper, L = lower, T = transition.

| index | corners | terrains |
| --- | --- | --- |
${lines.join('\n')}

## Placement rule

Two tiles may sit side by side only when the left tile's NE and SE corners
match the right tile's NW and SW corners. Vertically, the upper tile's SW and
SE must match the lower tile's NW and NE.

This is checkable from the table alone, without looking at the art. Every
placement in a correct scene satisfies it.
`;

fs.writeFileSync(path.join(dir, 'INDEX.md'), md);

const bySig = {};
placed.forEach((t) => {
  bySig[sig(t)] = (bySig[sig(t)] || 0) + 1;
});
console.log(`wrote ${path.join(dir, 'INDEX.md')} — ${placed.length} tiles, indices ${placed[0].index}..${placed[placed.length - 1].index}`);
console.log('signatures:', Object.entries(bySig).map(([s, n]) => `${s}${n > 1 ? '×' + n : ''}`).join(' '));
