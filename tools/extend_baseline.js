#!/usr/bin/env node
/**
 * extend_baseline.js — add the blocks that make rules 11-15 reachable.
 *
 *   node tools/extend_baseline.js levels/full_map.json --dry-run
 *   node tools/extend_baseline.js levels/full_map.json --write
 *
 * The baseline was hand-authored under the 71-131 restriction, so it contains
 * no roof and no fence enclosure and five rules can never fire against it. A
 * zero score there is free rather than earned. This stamps in one roof run per
 * variant and one closed fence enclosure, placed in clear space so the additions
 * do not interact with what is already there.
 *
 * Each block is padded by one empty cell on every side. Rules 11, 13 and 15 all
 * inspect neighbours, so a block flush against existing tiles could score a
 * violation that says nothing about the baseline's real quality.
 */

'use strict';
const fs = require('fs');

const BLOCKS = [
  { name: 'roof variant A', rows: [[48, 49, 51, 50], [60, 61, 63, 62]] },
  { name: 'roof variant B', rows: [[52, 53, 55, 54], [64, 65, 67, 66]] },
  { name: 'fence enclosure', rows: [[44, 45, 46], [56, 57, 58], [68, 69, 70]] },
];

function readLevel(path) {
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (Array.isArray(raw) && Array.isArray(raw[0])) return { raw, grid: raw, kind: 'array2d' };
  if (raw.layers && raw.layers.length) {
    const layer = raw.layers.find(l => Array.isArray(l.data)) || raw.layers[0];
    if (Array.isArray(layer.data[0])) return { raw, grid: layer.data, kind: 'layers2d', layer };
    const w = layer.width || raw.width, h = layer.height || raw.height || layer.data.length / w;
    const grid = [];
    for (let y = 0; y < h; y++) grid.push(layer.data.slice(y * w, (y + 1) * w));
    return { raw, grid, kind: 'layersFlat', layer, w, h };
  }
  throw new Error('Unrecognised level format.');
}

const isEmpty = v => v === 0 || v === -1 || v === null || v === undefined;

/** Free means the block area plus a one-cell border is entirely empty. */
function isFree(grid, x0, y0, w, h) {
  const H = grid.length, W = grid[0].length;
  if (x0 < 0 || y0 < 0 || x0 + w > W || y0 + h > H) return false;
  for (let y = y0 - 1; y <= y0 + h; y++) {
    for (let x = x0 - 1; x <= x0 + w; x++) {
      if (y < 0 || y >= H || x < 0 || x >= W) continue;
      if (!isEmpty(grid[y][x])) return false;
    }
  }
  return true;
}

function findSpot(grid, w, h) {
  for (let y = 0; y < grid.length; y++)
    for (let x = 0; x < grid[0].length; x++)
      if (isFree(grid, x, y, w, h)) return { x, y };
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const path = args.find(a => !a.startsWith('--'));
  const write = args.includes('--write');
  if (!path) {
    console.error('usage: node tools/extend_baseline.js <level.json> [--dry-run|--write]');
    process.exit(2);
  }

  const lvl = readLevel(path);
  const grid = lvl.grid;
  console.log(`${path}: ${grid[0].length}x${grid.length}, format ${lvl.kind}\n`);

  let failed = false;
  for (const b of BLOCKS) {
    const h = b.rows.length, w = b.rows[0].length;
    const spot = findSpot(grid, w, h);
    if (!spot) {
      console.log(`  ${b.name.padEnd(16)} NO SPACE for ${w}x${h} with a 1-cell buffer`);
      failed = true;
      continue;
    }
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        grid[spot.y + dy][spot.x + dx] = b.rows[dy][dx];
    console.log(`  ${b.name.padEnd(16)} placed ${w}x${h} at (${spot.x},${spot.y})`);
  }

  if (failed) {
    console.log('\nNot enough clear space. Enlarge the map or place the blocks by hand.');
    process.exit(1);
  }

  if (!write) {
    console.log('\nDry run. Re-run with --write to save.');
    return;
  }

  if (lvl.kind === 'layersFlat') lvl.layer.data = grid.flat();
  fs.writeFileSync(path, JSON.stringify(lvl.raw, null, 2));
  console.log(`\nWritten. Now re-run:\n  node tools/census.js ${path}\n  node tools/validate.js ${path}`);
}

if (require.main === module) main();
