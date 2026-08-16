#!/usr/bin/env node
/**
 * validate.js — scene validator for the Tiny Town composition rules.
 *
 * Encodes the rules from TINYTOWN_v2.md as checks over a tile grid and emits
 * a violation list. Scope is restricted to indices 71-131, the verified range.
 *
 *   node tools/validate.js levels/scene.json
 *   node tools/validate.js levels/scene.json --json      machine-readable
 *   node tools/validate.js --selftest                    check the checker
 *
 * TILED GID WARNING: Tiled writes 1-based gids with 0 meaning empty, so a tile
 * with index 85 is stored as 86. Pass --offset=-1 to correct. If your first run
 * reports every tile as out-of-scope by exactly one, this is why.
 */

'use strict';
const fs = require('fs');

// ---------------------------------------------------------------------------
// Tile tables. Keyed by index; (row, col) noted for cross-reference with v2.
// ---------------------------------------------------------------------------

const FACADE_ORANGE = new Set([72, 73, 74, 75, 84, 85, 86, 87]);
const FACADE_BLUE   = new Set([76, 77, 78, 79, 88, 89, 90, 91]);
const FACADE        = new Set([...FACADE_ORANGE, ...FACADE_BLUE]);

// Doors: frame runs off the bottom tile edge, so nothing may sit below them.
// Includes the two open doorways, 74 (6,2) and 78 (6,6).
const DOORS   = new Set([74, 78, 85, 86, 87, 89, 90, 91]);
const WINDOWS = new Set([84, 88]);

// Double doors are an ordered pair: left leaf then right leaf.
const DOUBLE_PAIR = new Map([[86, 87], [90, 91]]);
const DOUBLE_RIGHT_LEAVES = new Set([87, 91]);

// Wall run terminators.
const FACADE_LEFT_END  = new Set([72, 76]);
const FACADE_RIGHT_END = new Set([75, 79]);

// Rock formation halves. Cut-outs must not be mixed across a pair.
const ROCK_PAIR = new Map([[111, 112], [113, 114]]);
const ROCK_RIGHT_HALVES = new Set([112, 114]);

// Fence system.
const POST_RAIL_RIGHT = 80;   // (6,8)  rail extends right
const RAIL            = 81;   // (6,9)  horizontal rail
const POST_RAIL_LEFT  = 82;   // (6,10) rail extends left
const POST_STEM       = 71;   // (5,11) post with stem rising
const SIGN            = 83;   // (6,11) sign board, mounts above the post

// Well: one 16x32 object, verified seam.
const WELL_TOP = 92, WELL_BOTTOM = 104;

// Large assembly edge roles.
const ASM_LEFT  = new Set([96, 99, 108, 120]);
const ASM_RIGHT = new Set([98, 101, 110, 122]);
const ASM_MID   = new Set([97, 100, 109, 121]);
const ASSEMBLY  = new Set([...ASM_LEFT, ...ASM_RIGHT, ...ASM_MID]);

const SCOPE_MIN = 71, SCOPE_MAX = 131;
const EMPTY = new Set([-1, 0, null, undefined]);

// ---------------------------------------------------------------------------
// Grid loading
// ---------------------------------------------------------------------------

function loadGrid(path, offset) {
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  let data, width, height;

  if (Array.isArray(raw) && Array.isArray(raw[0])) {
    return raw.map(r => r.map(v => applyOffset(v, offset)));
  }
  if (raw.layers && raw.layers.length) {
    const layer = raw.layers.find(l => Array.isArray(l.data)) || raw.layers[0];
    // A layer's data may be a nested 2D array or a flat row-major array.
    if (Array.isArray(layer.data[0])) {
      return layer.data.map(r => r.map(v => applyOffset(v, offset)));
    }
    ({ data } = layer);
    width  = layer.width  || raw.width;
    height = layer.height || raw.height;
  } else if (Array.isArray(raw.data)) {
    ({ data, width, height } = raw);
  } else {
    throw new Error('Unrecognised level format. Expect a 2D array, {data,width,height}, or Tiled {layers}.');
  }

  if (!width) throw new Error('Level has no width.');
  height = height || data.length / width;

  const grid = [];
  for (let y = 0; y < height; y++) {
    grid.push(data.slice(y * width, (y + 1) * width).map(v => applyOffset(v, offset)));
  }
  return grid;
}

function applyOffset(v, offset) {
  if (EMPTY.has(v)) return -1;
  return v + offset;
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

function validate(grid) {
  const V = [];
  const H = grid.length, W = H ? grid[0].length : 0;
  const at = (x, y) => (y < 0 || y >= H || x < 0 || x >= W) ? -1 : grid[y][x];
  const add = (rule, x, y, message) => V.push({ rule, x, y, message });

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = at(x, y);
      if (t === -1) continue;

      // R0 — scope
      if (t < SCOPE_MIN || t > SCOPE_MAX) {
        add('scope', x, y, `tile ${t} is outside the verified range ${SCOPE_MIN}-${SCOPE_MAX}`);
        continue;
      }

      const L = at(x - 1, y), R = at(x + 1, y);
      const U = at(x, y - 1), D = at(x, y + 1);

      // R1 — doors must sit on the bottom row of a facade
      if (DOORS.has(t) && FACADE.has(D)) {
        add('door-not-grounded', x, y,
          `door ${t} has facade tile ${D} below it; the frame runs off the bottom edge and needs ground there`);
      }

      // R2 — double doors are an ordered adjacent pair
      if (DOUBLE_PAIR.has(t)) {
        const want = DOUBLE_PAIR.get(t);
        if (R !== want) {
          add('double-door-unpaired', x, y,
            `left leaf ${t} needs right leaf ${want} at x+1, found ${R === -1 ? 'empty' : R}`);
        }
      }
      if (DOUBLE_RIGHT_LEAVES.has(t)) {
        const wantLeft = t - 1;
        if (L !== wantLeft) {
          add('double-door-unpaired', x, y,
            `right leaf ${t} needs left leaf ${wantLeft} at x-1, found ${L === -1 ? 'empty' : L}`);
        }
      }

      // R3 — colourways must not mix inside a contiguous facade
      if (FACADE.has(t)) {
        const mine = FACADE_ORANGE.has(t) ? 'orange' : 'blue';
        for (const [nx, ny, n] of [[x + 1, y, R], [x, y + 1, D]]) {
          if (!FACADE.has(n)) continue;
          const theirs = FACADE_ORANGE.has(n) ? 'orange' : 'blue';
          if (mine !== theirs) {
            add('colourway-mixed', x, y,
              `facade ${t} (${mine}) is adjacent to ${n} (${theirs}) at ${nx},${ny}`);
          }
        }
      }

      // R4 — wall run terminators must actually terminate
      if (FACADE_LEFT_END.has(t) && FACADE.has(L)) {
        add('wall-end-interior', x, y, `left-end tile ${t} has facade ${L} to its left`);
      }
      if (FACADE_RIGHT_END.has(t) && FACADE.has(R)) {
        add('wall-end-interior', x, y, `right-end tile ${t} has facade ${R} to its right`);
      }

      // R5 — rock formation halves must be a matched pair
      if (ROCK_PAIR.has(t)) {
        const want = ROCK_PAIR.get(t);
        if (R !== want) {
          add('rock-unpaired', x, y,
            `left half ${t} needs right half ${want} at x+1, found ${R === -1 ? 'empty' : R}` +
            (ROCK_RIGHT_HALVES.has(R) ? ' — cut-outs mismatched' : ''));
        }
      }
      if (ROCK_RIGHT_HALVES.has(t)) {
        const wantLeft = t - 1;
        if (L !== wantLeft) {
          add('rock-unpaired', x, y,
            `right half ${t} needs left half ${wantLeft} at x-1, found ${L === -1 ? 'empty' : L}`);
        }
      }

      // R6 — rails must terminate in posts. 80 opens right, 82 opens left.
      if (t === RAIL) {
        if (L !== POST_RAIL_RIGHT && L !== RAIL) {
          add('rail-unanchored', x, y,
            `rail ${RAIL} needs ${POST_RAIL_RIGHT} or another rail to its left, found ${L === -1 ? 'empty' : L}`);
        }
        if (R !== POST_RAIL_LEFT && R !== RAIL) {
          add('rail-unanchored', x, y,
            `rail ${RAIL} needs ${POST_RAIL_LEFT} or another rail to its right, found ${R === -1 ? 'empty' : R}`);
        }
      }

      // R7 — sign mounts above the post (placement inverts index order)
      if (t === SIGN && D !== POST_STEM) {
        add('sign-unmounted', x, y,
          `sign ${SIGN} needs post ${POST_STEM} directly below, found ${D === -1 ? 'empty' : D}`);
      }
      if (t === POST_STEM && U !== SIGN) {
        add('sign-unmounted', x, y,
          `post ${POST_STEM} has a rising stem and needs sign ${SIGN} above, found ${U === -1 ? 'empty' : U}`);
      }

      // R8 — well halves form one object
      if (t === WELL_TOP && D !== WELL_BOTTOM) {
        add('well-split', x, y, `well top ${WELL_TOP} needs ${WELL_BOTTOM} below, found ${D === -1 ? 'empty' : D}`);
      }
      if (t === WELL_BOTTOM && U !== WELL_TOP) {
        add('well-split', x, y, `well bottom ${WELL_BOTTOM} needs ${WELL_TOP} above, found ${U === -1 ? 'empty' : U}`);
      }

      // R9 — assembly edge pieces belong on edges
      if (ASM_LEFT.has(t) && ASSEMBLY.has(L)) {
        add('assembly-edge-interior', x, y, `left-edge tile ${t} has assembly tile ${L} to its left`);
      }
      if (ASM_RIGHT.has(t) && ASSEMBLY.has(R)) {
        add('assembly-edge-interior', x, y, `right-edge tile ${t} has assembly tile ${R} to its right`);
      }
    }
  }
  return V;
}

// ---------------------------------------------------------------------------
// Self-test: one clean scene, one deliberately broken.
// A clean run here is the only thing that lets you trust a zero score.
// ---------------------------------------------------------------------------

const E = -1;
const GOOD = [
  [ 72, 73, 84, 73, 75,  E, 83,  E,  E, 92,  E],
  [ 72, 86, 87, 85, 75,  E, 71,  E,  E,104,  E],
  [  E,  E,  E,  E,  E,  E,  E,  E,  E,  E,  E],
  [ 96, 97, 98,  E, 80, 81, 81, 82,  E,111,112],
  [108,109,110,  E,  E,  E,  E,  E,  E,113,114],
];

const BAD = [
  [ 72, 73, 84, 77, 75,  E, 83,  E,  E, 92,  E],  // 77 blue inside orange run
  [ 72, 86, 85, 85, 75,  E,  E,  E,  E,  E,  E],  // 86 unpaired; sign unmounted; well split
  [ 73, 73,  E,  E,  E,  E,  E,  E,  E,  E,  E],  // facade under the doors on row 1
  [ 96, 97, 98,  E, 81, 81,  E,  E,  E,111,114],  // rail unanchored both ends; rock cut-outs mixed
];

function selftest() {
  const good = validate(GOOD);
  const bad  = validate(BAD);
  console.log(`GOOD scene: ${good.length} violation(s)  ${good.length === 0 ? 'PASS' : 'FAIL'}`);
  good.forEach(v => console.log(`   unexpected: [${v.rule}] ${v.x},${v.y} ${v.message}`));

  const rules = new Set(bad.map(v => v.rule));
  const expected = ['colourway-mixed', 'double-door-unpaired', 'door-not-grounded',
                    'rail-unanchored', 'rock-unpaired', 'sign-unmounted', 'well-split'];
  const missing = expected.filter(r => !rules.has(r));
  console.log(`BAD scene:  ${bad.length} violation(s) across ${rules.size} rule(s)  ${missing.length === 0 ? 'PASS' : 'FAIL'}`);
  if (missing.length) console.log(`   rules that failed to fire: ${missing.join(', ')}`);
  bad.forEach(v => console.log(`   [${v.rule}] ${v.x},${v.y} ${v.message}`));

  return good.length === 0 && missing.length === 0 ? 0 : 1;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) process.exit(selftest());

  const path = args.find(a => !a.startsWith('--'));
  if (!path) {
    console.error('usage: node validate.js <level.json> [--json] [--offset=-1]');
    process.exit(2);
  }
  const offsetArg = args.find(a => a.startsWith('--offset='));
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0;

  const grid = loadGrid(path, offset);
  const violations = validate(grid);

  if (args.includes('--json')) {
    const byRule = {};
    violations.forEach(v => { byRule[v.rule] = (byRule[v.rule] || 0) + 1; });
    console.log(JSON.stringify({
      scene: path,
      width: grid[0].length, height: grid.length,
      total: violations.length, byRule, violations,
    }, null, 2));
  } else {
    if (!violations.length) {
      console.log(`${path}: 0 violations`);
    } else {
      const byRule = {};
      violations.forEach(v => { byRule[v.rule] = (byRule[v.rule] || 0) + 1; });
      console.log(`${path}: ${violations.length} violation(s)\n`);
      violations.forEach(v => console.log(`  [${v.rule}] (${v.x},${v.y}) ${v.message}`));
      console.log('\nby rule:');
      Object.entries(byRule).sort((a, b) => b[1] - a[1])
        .forEach(([r, n]) => console.log(`  ${String(n).padStart(3)}  ${r}`));
    }
  }
  process.exit(violations.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { validate, loadGrid };
