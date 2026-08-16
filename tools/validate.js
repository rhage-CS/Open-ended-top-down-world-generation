#!/usr/bin/env node
/**
 * validate.js — scene validator for the Tiny Town composition rules.
 *
 * Encodes the rules from TINYTOWN_v2.md as checks over a tile grid and emits
 * a violation list.
 *
 *   node tools/validate.js levels/scene.json
 *   node tools/validate.js levels/scene.json --json           machine-readable
 *   node tools/validate.js levels/scene.json --scope=71-131   restrict range
 *   node tools/validate.js levels/scene.json --zero=tile      0 means grass, not empty
 *   node tools/validate.js --selftest                         check the checker
 *
 * ZERO WARNING: the grass fill is index 0 and Tiled uses 0 for "empty". By
 * default 0 is read as empty. If your scene uses raw indices and has grass
 * ground, pass --zero=tile or every ground tile is dropped before validation.
 *
 * SCOPE: the dictionary now covers 0-131, so the default scope is the full
 * sheet. Earlier probe runs were restricted to 71-131 because rows 0-5 were
 * unlabelled and no ground tile existed. Pass --scope=71-131 to reproduce those
 * runs. Note that under that restriction rules 11-15 are unreachable, since
 * every tile they govern is below index 71.
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

// Fence system B: posts and rails, row 6 cols 8-11.
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

// --- Roof, rows 4-5 cols 0-7 -----------------------------------------------
// Variant A: blue-grey roof over wood wall.  Variant B: roof-red over blue-grey
// wall. Related by the two-ramp shift, so the SAME blue-grey RGB values are the
// roof in A and the wall in B. That is what rule 13 exists to catch.

const ROOF_A = new Set([48, 49, 50, 51, 60, 61, 62, 63]);
const ROOF_B = new Set([52, 53, 54, 55, 64, 65, 66, 67]);
const ROOF   = new Set([...ROOF_A, ...ROOF_B]);

const ROOF_UPPER = new Set([48, 49, 50, 51, 52, 53, 54, 55]);  // row 4
const ROOF_LOWER = new Set([60, 61, 62, 63, 64, 65, 66, 67]);  // row 5

const ROOF_LEFT_EDGE  = new Set([48, 52, 60, 64]);
const ROOF_RIGHT_EDGE = new Set([50, 54, 62, 66]);
const ROOF_FILL       = new Set([49, 53, 61, 65]);
const ROOF_DORMER     = new Set([51, 55, 63, 67]);   // dormer (row 4), gable (row 5)

const roofVariant = t => (ROOF_A.has(t) ? 'A' : ROOF_B.has(t) ? 'B' : null);

// --- Fence system A: enclosure, rows 3-5 cols 8-10 + col 11 vertical run ----
// Connections are derived from non-transparent pixels per edge, not appearance.
// 57 (4,9) is the cart that sits inside the pen: an object, not a fence piece.
// 71 (5,11) is deliberately absent — see the note on R7 below.

const FENCE_CONN = new Map([
  [44, 'ES'], [45, 'EW'], [46, 'SW'], [47, 'S'],
  [56, 'NS'],             [58, 'NS'], [59, 'NS'],
  [68, 'NE'], [69, 'EW'], [70, 'NW'],
]);
const ENCLOSURE = new Set(FENCE_CONN.keys());
const RAIL_SYSTEM = new Set([POST_RAIL_RIGHT, RAIL, POST_RAIL_LEFT]);
const CART = 57;

// Vertical fence pieces that may legitimately sit above 71 if the col-11 run
// reading is correct. Used only to avoid a false positive in R7.
const VFENCE_COL11 = new Set([47, 59]);

const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };
const DELTA    = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

const DEFAULT_SCOPE = [0, 131];

// Tiled writes 0 for "no tile", but the grass fill is genuinely index 0. Which
// one 0 means depends on the file, so it is a flag rather than a guess.
//   default        0 = empty  (Tiled-safe, and what every pre-0-131 scene meant)
//   --zero=tile    0 = grass fill, index 0
// Get this wrong on a scene with ground and every ground tile silently
// disappears before any rule sees it.
const EMPTY_BASE = new Set([-1, null, undefined]);

// ---------------------------------------------------------------------------
// Grid loading
// ---------------------------------------------------------------------------

function loadGrid(path, offset, zeroIsTile = false) {
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  let data, width, height;

  if (Array.isArray(raw) && Array.isArray(raw[0])) {
    return raw.map(r => r.map(v => applyOffset(v, offset, zeroIsTile)));
  }
  if (raw.layers && raw.layers.length) {
    const layer = raw.layers.find(l => Array.isArray(l.data)) || raw.layers[0];
    // A layer's data may be a nested 2D array or a flat row-major array.
    if (Array.isArray(layer.data[0])) {
      return layer.data.map(r => r.map(v => applyOffset(v, offset, zeroIsTile)));
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
    grid.push(data.slice(y * width, (y + 1) * width).map(v => applyOffset(v, offset, zeroIsTile)));
  }
  return grid;
}

function applyOffset(v, offset, zeroIsTile) {
  if (EMPTY_BASE.has(v)) return -1;
  if (v === 0 && !zeroIsTile) return -1;
  return v + offset;
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

function validate(grid, scope = DEFAULT_SCOPE) {
  const [SCOPE_MIN, SCOPE_MAX] = scope;
  const V = [];
  const H = grid.length, W = H ? grid[0].length : 0;
  const at = (x, y) => (y < 0 || y >= H || x < 0 || x >= W) ? -1 : grid[y][x];
  const add = (rule, x, y, message) => V.push({ rule, x, y, message });
  const show = v => (v === -1 ? 'empty' : v);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = at(x, y);
      if (t === -1) continue;

      // R0 — scope
      if (t < SCOPE_MIN || t > SCOPE_MAX) {
        add('scope', x, y, `tile ${t} is outside the scope ${SCOPE_MIN}-${SCOPE_MAX}`);
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
            `left leaf ${t} needs right leaf ${want} at x+1, found ${show(R)}`);
        }
      }
      if (DOUBLE_RIGHT_LEAVES.has(t)) {
        const wantLeft = t - 1;
        if (L !== wantLeft) {
          add('double-door-unpaired', x, y,
            `right leaf ${t} needs left leaf ${wantLeft} at x-1, found ${show(L)}`);
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
            `left half ${t} needs right half ${want} at x+1, found ${show(R)}` +
            (ROCK_RIGHT_HALVES.has(R) ? ' — cut-outs mismatched' : ''));
        }
      }
      if (ROCK_RIGHT_HALVES.has(t)) {
        const wantLeft = t - 1;
        if (L !== wantLeft) {
          add('rock-unpaired', x, y,
            `right half ${t} needs left half ${wantLeft} at x-1, found ${show(L)}`);
        }
      }

      // R6 — rails must terminate in posts. 80 opens right, 82 opens left.
      if (t === RAIL) {
        if (L !== POST_RAIL_RIGHT && L !== RAIL) {
          add('rail-unanchored', x, y,
            `rail ${RAIL} needs ${POST_RAIL_RIGHT} or another rail to its left, found ${show(L)}`);
        }
        if (R !== POST_RAIL_LEFT && R !== RAIL) {
          add('rail-unanchored', x, y,
            `rail ${RAIL} needs ${POST_RAIL_LEFT} or another rail to its right, found ${show(R)}`);
        }
      }

      // R7 — sign mounts above the post (placement inverts index order)
      //
      // CONFLICT, UNRESOLVED. v2 records 71 (5,11) two ways: as the post the
      // sign mounts on, and as the bottom of the col-11 vertical fence run
      // 47/59/71. Both cannot be the primary reading. The post->sign direction
      // therefore fires only when 71 is NOT sitting under a vertical fence
      // piece, so a legitimate fence run does not score a false violation.
      // Resolve by diffing 71's top edge against 59's bottom edge and against
      // 83's bottom edge, then delete whichever branch loses.
      if (t === SIGN && D !== POST_STEM) {
        add('sign-unmounted', x, y,
          `sign ${SIGN} needs post ${POST_STEM} directly below, found ${show(D)}`);
      }
      if (t === POST_STEM && U !== SIGN && !VFENCE_COL11.has(U)) {
        add('sign-unmounted', x, y,
          `post ${POST_STEM} has a rising stem and needs sign ${SIGN} above ` +
          `(or a col-11 fence piece), found ${show(U)}`);
      }

      // R8 — well halves form one object
      if (t === WELL_TOP && D !== WELL_BOTTOM) {
        add('well-split', x, y, `well top ${WELL_TOP} needs ${WELL_BOTTOM} below, found ${show(D)}`);
      }
      if (t === WELL_BOTTOM && U !== WELL_TOP) {
        add('well-split', x, y, `well bottom ${WELL_BOTTOM} needs ${WELL_TOP} above, found ${show(U)}`);
      }

      // R9 — assembly edge pieces belong on edges
      if (ASM_LEFT.has(t) && ASSEMBLY.has(L)) {
        add('assembly-edge-interior', x, y, `left-edge tile ${t} has assembly tile ${L} to its left`);
      }
      if (ASM_RIGHT.has(t) && ASSEMBLY.has(R)) {
        add('assembly-edge-interior', x, y, `right-edge tile ${t} has assembly tile ${R} to its right`);
      }

      // R11 — roof colourway purity (v2 rule 11)
      if (ROOF.has(t)) {
        const mine = roofVariant(t);
        for (const [nx, ny, n] of [[x + 1, y, R], [x, y + 1, D]]) {
          if (!ROOF.has(n)) continue;
          const theirs = roofVariant(n);
          if (mine !== theirs) {
            add('roof-colourway-mixed', x, y,
              `roof ${t} (variant ${mine}) is adjacent to ${n} (variant ${theirs}) at ${nx},${ny}`);
          }
        }
      }

      // R12 — roof run ordering (v2 rule 12)
      // left-edge, then zero or more fill/dormer, then right-edge.
      if (ROOF_LEFT_EDGE.has(t) && ROOF.has(L)) {
        add('roof-run-order', x, y, `left-edge roof ${t} has roof tile ${L} to its left`);
      }
      if (ROOF_RIGHT_EDGE.has(t) && ROOF.has(R)) {
        add('roof-run-order', x, y, `right-edge roof ${t} has roof tile ${R} to its right`);
      }
      if (ROOF_DORMER.has(t)) {
        if (!ROOF.has(L)) {
          add('roof-run-order', x, y,
            `dormer/gable ${t} is in a terminal position; needs roof to its left, found ${show(L)}`);
        }
        if (!ROOF.has(R)) {
          add('roof-run-order', x, y,
            `dormer/gable ${t} is in a terminal position; needs roof to its right, found ${show(R)}`);
        }
      }

      // R13 — material-role consistency (v2 rule 13)
      // The blue-grey ramp is roof in variant A and wall in variant B. An agent
      // matching on colour will stack an A roof over a B roof and build a
      // house made of two roofs. Vertical roof runs must hold one variant.
      if (ROOF.has(t) && ROOF.has(D) && roofVariant(t) !== roofVariant(D)) {
        add('roof-variant-stacked', x, y,
          `roof ${t} (variant ${roofVariant(t)}) sits directly above ${D} (variant ${roofVariant(D)}); ` +
          `the shared blue-grey ramp is roof in A and wall in B, so this is two roofs, not a roof and a wall`);
      }

      // R14 — fence enclosure integrity (v2 rule 14)
      if (FENCE_CONN.has(t)) {
        for (const d of FENCE_CONN.get(t)) {
          const [dx, dy] = DELTA[d];
          const n = at(x + dx, y + dy);
          const nConn = FENCE_CONN.get(n);
          if (!nConn || !nConn.includes(OPPOSITE[d])) {
            add('fence-connection-dangling', x, y,
              `fence ${t} declares a ${d} connection but ${show(n)} at ${x + dx},${y + dy} ` +
              `does not connect back ${OPPOSITE[d]}`);
          }
        }
      }

      // R15 — fence system purity (v2 rule 15)
      // Two orange-ramp fence systems, verified distinct by pixel diff at
      // 37/62/37 out of 256. Similar silhouettes, not interchangeable.
      if (ENCLOSURE.has(t) || RAIL_SYSTEM.has(t)) {
        const mineEnc = ENCLOSURE.has(t);
        for (const [nx, ny, n] of [[x + 1, y, R], [x - 1, y, L], [x, y + 1, D], [x, y - 1, U]]) {
          const theirsEnc = ENCLOSURE.has(n), theirsRail = RAIL_SYSTEM.has(n);
          if (!theirsEnc && !theirsRail) continue;
          if (mineEnc !== theirsEnc) {
            add('fence-system-mixed', x, y,
              `${t} (${mineEnc ? 'enclosure' : 'rail'} system) is adjacent to ` +
              `${n} (${theirsEnc ? 'enclosure' : 'rail'} system) at ${nx},${ny}`);
          }
        }
      }
    }
  }
  return V;
}

// ---------------------------------------------------------------------------
// Self-test: one clean scene, one deliberately broken.
// A clean run here is the only thing that lets you trust a zero score. Every
// rule must appear in the BAD scene, or a rule that never fires is
// indistinguishable from a compliant agent.
// ---------------------------------------------------------------------------

const E = -1;
const GOOD = [
  [ 72,  73,  84,  73,  75,   E,  83,   E,  48,  49,  51,  50],
  [ 72,  86,  87,  85,  75,   E,  71,   E,  60,  61,  63,  62],
  [  E,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E],
  [ 96,  97,  98,   E,  80,  81,  81,  82,   E, 111, 112,   E],
  [108, 109, 110,   E,   E,   E,   E,   E,   E, 113, 114,   E],
  [  E,   E,   E,   E,  44,  45,  46,   E,  52,  53,  55,  54],
  [ 92,   E,   E,   E,  56,  57,  58,   E,  64,  65,  67,  66],
  [104,   E,   E,   E,  68,  69,  70,   E,   E,   E,   E,   E],
];

const BAD = [
  // 77 blue inside an orange run; 48 beside 53 mixes roof variants
  [ 72,  73,  84,  77,  75,   E,  83,   E,  48,  53,   E,   E],
  // 86 unpaired; sign has no post below; 48 stacked over 64 across variants
  [ 72,  86,  85,  85,  75,   E,   E,   E,  64,   E,   E,   E],
  // facade sits under the doors on row 1
  [ 73,  73,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E],
  // rail unanchored both ends; 48 left-edge with roof 49 to its left
  [ 96,  97,  98,   E,  81,  81,   E,   E,  49,  48,   E,   E],
  // 44 abuts rail 81: system mix and a dangling E connection; 51 dormer terminal
  [  E,   E,   E,   E,  44,  81,   E,   E,  51,   E,   E,   E],
  // rock cut-outs mismatched
  [111, 114,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E],
  // well split
  [ 92,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E,   E],
];

const EXPECTED_RULES = [
  'colourway-mixed', 'double-door-unpaired', 'door-not-grounded',
  'rail-unanchored', 'rock-unpaired', 'sign-unmounted', 'well-split',
  'roof-colourway-mixed', 'roof-run-order', 'roof-variant-stacked',
  'fence-connection-dangling', 'fence-system-mixed',
];

function selftest() {
  const good = validate(GOOD);
  const bad  = validate(BAD);

  const goodOk = good.length === 0;
  console.log(`GOOD scene: ${good.length} violation(s)  ${goodOk ? 'PASS' : 'FAIL'}`);
  good.forEach(v => console.log(`   unexpected: [${v.rule}] ${v.x},${v.y} ${v.message}`));

  const fired = new Set(bad.map(v => v.rule));
  const missing = EXPECTED_RULES.filter(r => !fired.has(r));
  const badOk = missing.length === 0;
  console.log(`BAD scene:  ${bad.length} violation(s) across ${fired.size} rule(s)  ${badOk ? 'PASS' : 'FAIL'}`);
  if (missing.length) console.log(`   rules that failed to fire: ${missing.join(', ')}`);
  bad.forEach(v => console.log(`   [${v.rule}] ${v.x},${v.y} ${v.message}`));

  console.log(`\nrules covered: ${fired.size}/${EXPECTED_RULES.length}`);
  return goodOk && badOk ? 0 : 1;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseScope(args) {
  const a = args.find(s => s.startsWith('--scope='));
  if (!a) return DEFAULT_SCOPE;
  const m = a.split('=')[1].match(/^(\d+)-(\d+)$/);
  if (!m) throw new Error('--scope expects MIN-MAX, e.g. --scope=71-131');
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) process.exit(selftest());

  const path = args.find(a => !a.startsWith('--'));
  if (!path) {
    console.error('usage: node validate.js <level.json> [--json] [--offset=-1] [--scope=MIN-MAX] [--zero=tile]');
    process.exit(2);
  }
  const offsetArg = args.find(a => a.startsWith('--offset='));
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0;
  const scope = parseScope(args);
  const zeroIsTile = args.includes('--zero=tile');

  const grid = loadGrid(path, offset, zeroIsTile);
  const violations = validate(grid, scope);

  if (args.includes('--json')) {
    const byRule = {};
    violations.forEach(v => { byRule[v.rule] = (byRule[v.rule] || 0) + 1; });
    console.log(JSON.stringify({
      scene: path,
      scope: `${scope[0]}-${scope[1]}`,
      width: grid[0].length, height: grid.length,
      total: violations.length, byRule, violations,
    }, null, 2));
  } else {
    if (!violations.length) {
      console.log(`${path}: 0 violations (scope ${scope[0]}-${scope[1]})`);
    } else {
      const byRule = {};
      violations.forEach(v => { byRule[v.rule] = (byRule[v.rule] || 0) + 1; });
      console.log(`${path}: ${violations.length} violation(s) (scope ${scope[0]}-${scope[1]})\n`);
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