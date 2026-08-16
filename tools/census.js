#!/usr/bin/env node
/**
 * census.js — reports which rules a scene can actually exercise.
 *
 *   node tools/census.js levels/full_map.json
 *
 * A zero from validate.js means one of two very different things: the scene
 * satisfies every rule, or the scene contains no tiles the rule governs. This
 * tells you which. A rule marked UNREACHABLE scored zero for free.
 */

'use strict';
const { loadGrid } = require('./validate.js');

const FAMILIES = [
  { rule: 'door-not-grounded',       tiles: [74, 78, 85, 86, 87, 89, 90, 91], label: 'doors' },
  { rule: 'double-door-unpaired',    tiles: [86, 87, 90, 91],                 label: 'double doors' },
  { rule: 'colourway-mixed',         tiles: [72,73,74,75,84,85,86,87,76,77,78,79,88,89,90,91], label: 'facade' },
  { rule: 'wall-end-interior',       tiles: [72, 75, 76, 79],                 label: 'facade ends' },
  { rule: 'rock-unpaired',           tiles: [111, 112, 113, 114],             label: 'arch halves' },
  { rule: 'rail-unanchored',         tiles: [80, 81, 82],                     label: 'rail fence' },
  { rule: 'sign-unmounted',          tiles: [71, 83],                         label: 'sign + post' },
  { rule: 'well-split',              tiles: [92, 104],                        label: 'well' },
  { rule: 'assembly-edge-interior',  tiles: [96,97,98,99,100,101,108,109,110,120,121,122], label: 'assembly' },
  { rule: 'roof-colourway-mixed',    tiles: [48,49,50,51,60,61,62,63,52,53,54,55,64,65,66,67], label: 'roof' },
  { rule: 'roof-run-order',          tiles: [48,50,52,54,60,62,64,66,51,55,63,67], label: 'roof edges + dormers' },
  { rule: 'roof-variant-stacked',    tiles: [48,49,50,51,60,61,62,63,52,53,54,55,64,65,66,67], label: 'roof' },
  { rule: 'fence-connection-dangling', tiles: [44,45,46,47,56,58,59,68,69,70], label: 'fence enclosure' },
  { rule: 'fence-system-mixed',      requiresAll: [[44,45,46,47,56,58,59,68,69,70],[80,81,82]],
    tiles: [44,45,46,47,56,58,59,68,69,70,80,81,82], label: 'tiles from BOTH fence systems' },
];

function main() {
  const args = process.argv.slice(2);
  const path = args.find(a => !a.startsWith('--'));
  if (!path) { console.error('usage: node tools/census.js <level.json> [--offset=-1] [--zero=tile]'); process.exit(2); }
  const offArg = args.find(a => a.startsWith('--offset='));
  const grid = loadGrid(path, offArg ? parseInt(offArg.split('=')[1], 10) : 0,
                        args.includes('--zero=tile'));

  const present = new Map();
  let placed = 0;
  for (const row of grid) for (const t of row) {
    if (t === -1) continue;
    placed++;
    present.set(t, (present.get(t) || 0) + 1);
  }

  const idx = [...present.keys()].sort((a, b) => a - b);
  console.log(`${path}: ${grid[0].length}x${grid.length}, ${placed} placed tiles, ${idx.length} distinct`);
  console.log(`index range: ${idx[0]}..${idx[idx.length - 1]}`);
  console.log(`below 71: ${idx.filter(i => i < 71).length} distinct | 71+: ${idx.filter(i => i >= 71).length} distinct\n`);

  let unreachable = 0;
  console.log('rule                          status        tiles present');
  console.log('-'.repeat(70));
  for (const f of FAMILIES) {
    const hit = f.tiles.filter(t => present.has(t));
    // Some rules only fire when two disjoint groups are both present.
    const ok = f.requiresAll
      ? f.requiresAll.every(g => g.some(t => present.has(t)))
      : hit.length > 0;
    if (!ok) unreachable++;
    console.log(
      `${f.rule.padEnd(29)} ${(ok ? 'reachable' : 'UNREACHABLE').padEnd(13)} ` +
      `${ok ? hit.join(',') : (hit.length ? `only ${hit.join(',')} — needs ${f.label}` : `no ${f.label}`)}`
    );
  }
  console.log('-'.repeat(70));
  console.log(`${FAMILIES.length - unreachable}/${FAMILIES.length} rules reachable.`);
  if (unreachable) {
    console.log(`\n${unreachable} rule(s) scored zero for free. A scene that violated them`);
    console.log('would be indistinguishable from this baseline.');
  }
}

if (require.main === module) main();