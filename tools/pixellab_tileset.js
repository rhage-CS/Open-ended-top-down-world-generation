#!/usr/bin/env node
/**
 * pixellab_tileset.js — pull a PixelLab Wang tileset to disk.
 *
 * Tilesets return differently from objects: 16 individual 16x16 PNGs as
 * base64, each carrying a `corners` map and its position on the 4x4 Wang
 * grid. No preview_url, so pixellab_fetch.js does not handle these.
 *
 * Writes:
 *   assets/generated/<slug>/tile_NN.png     individual tiles
 *   assets/generated/<slug>/sheet.png       4x4 packed sheet (64x64)
 *   assets/generated/<slug>/DICTIONARY.md   corner semantics per tile
 *   assets/generated/<slug>/meta.json       raw metadata + hashes
 *
 * Usage:
 *   node tools/pixellab_tileset.js list
 *   node tools/pixellab_tileset.js pull <tileset-id>
 *
 * Requires PIXELLAB_API_KEY. Node 18+. Packing needs sharp; if it is not
 * installed the individual tiles and dictionary are still written.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = 'https://api.pixellab.ai/v2';
const OUT_ROOT = path.join(process.cwd(), 'assets', 'generated');

const KEY = process.env.PIXELLAB_API_KEY;
if (!KEY) {
  console.error('PIXELLAB_API_KEY is not set.');
  process.exit(1);
}

async function api(endpoint) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`GET /${endpoint} -> ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body);
}

function slug(text, fallback) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return s || fallback;
}

/**
 * The corner map is the whole point: it states which terrain occupies each
 * quadrant of the tile. Two tiles with the same corner signature are
 * interchangeable; a tile whose east corners are `upper` may only sit left of
 * a tile whose west corners are also `upper`. That is a placement rule derived
 * from metadata rather than from pixels.
 */
function cornerSignature(c) {
  if (!c) return '????';
  const short = (v) => (v === 'upper' ? 'U' : v === 'lower' ? 'L' : '?');
  return `${short(c.NW)}${short(c.NE)}${short(c.SW)}${short(c.SE)}`;
}

function describe(sig) {
  if (sig === 'UUUU') return 'solid upper terrain — interior fill';
  if (sig === 'LLLL') return 'solid lower terrain — interior fill';
  const n = (sig.match(/U/g) || []).length;
  if (n === 3) return 'upper with one lower corner — inner corner';
  if (n === 1) return 'lower with one upper corner — outer corner';
  if (sig === 'UULL') return 'upper above, lower below — horizontal edge';
  if (sig === 'LLUU') return 'lower above, upper below — horizontal edge';
  if (sig === 'ULUL') return 'upper left, lower right — vertical edge';
  if (sig === 'LULU') return 'lower left, upper right — vertical edge';
  return 'diagonal split';
}

async function listTilesets() {
  const data = await api('tilesets');
  return data.tilesets || [];
}

async function pull(id) {
  const data = await api(`tilesets/${id}`);
  const ts = data.tileset;
  if (!ts) throw new Error('No tileset in response.');

  const name = slug(ts.name || ts.description || ts.tileset_description, `tileset-${id.slice(0, 8)}`);
  const dir = path.join(OUT_ROOT, name);
  fs.mkdirSync(dir, { recursive: true });

  const size = ts.tile_size || { width: 16, height: 16 };
  console.log(`${ts.total_tiles} tiles at ${size.width}x${size.height} -> ${path.relative(process.cwd(), dir)}`);

  const rows = [];
  const tiles = [];

  for (const t of ts.tiles) {
    const b64 = t.image && t.image.base64;
    if (!b64) {
      console.error(`  skip ${t.id} — no base64 image`);
      continue;
    }
    const buf = Buffer.from(b64, 'base64');
    if (buf.readUInt32BE(0) !== 0x89504e47) {
      console.error(`  skip ${t.id} — not a PNG`);
      continue;
    }
    const file = `tile_${String(t.id).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(dir, file), buf);

    const sig = cornerSignature(t.corners);
    const pos = t.original_position || {};
    tiles.push({
      id: t.id,
      name: t.name,
      file,
      corners: t.corners,
      signature: sig,
      reading: describe(sig),
      row: pos.row,
      col: pos.col,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    });
    rows.push(`| ${t.id} | ${pos.row ?? '?'} | ${pos.col ?? '?'} | ${sig} | ${describe(sig)} | ${file} |`);
    console.log(`  ${file}  ${sig}  ${describe(sig)}`);
  }

  fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify(
      {
        tileset_id: id,
        source: `${BASE}/tilesets/${id}`,
        fetched_at: new Date().toISOString(),
        tile_size: size,
        total_tiles: ts.total_tiles,
        terrain_types: ts.terrain_types,
        tiles,
      },
      null,
      2
    ) + '\n'
  );

  const dict = `# ${name}

Generated Wang tileset from PixelLab. Tile size ${size.width}x${size.height}.
Terrains: ${(ts.terrain_types || []).join(' / ')}.

Corner signature reads NW NE SW SE. U = upper terrain, L = lower terrain.

Unlike the hand-authored Tiny Town dictionary, every claim here comes from
the generator's own metadata rather than from pixel inspection. That is the
difference between a tileset you were given and one you asked for: the
adjacency semantics arrive with the art.

| id | row | col | corners | reading | file |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Placement rule

Two tiles may sit side by side when their facing corners agree: the east
corners (NE, SE) of the left tile must match the west corners (NW, SW) of the
right tile. Same vertically for south against north. This is checkable without
looking at a single pixel.
`;
  fs.writeFileSync(path.join(dir, 'DICTIONARY.md'), dict);

  await packSheet(dir, tiles, size);
  console.log(`\nWrote DICTIONARY.md and meta.json to ${path.relative(process.cwd(), dir)}`);
}

/** Pack the tiles into one 4x4 sheet so the set can be viewed and diffed as a unit. */
async function packSheet(dir, tiles, size) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('  (sharp not installed — skipping packed sheet; individual tiles are written)');
    return;
  }
  const placed = tiles.filter((t) => Number.isInteger(t.row) && Number.isInteger(t.col));
  if (!placed.length) return;
  const cols = Math.max(...placed.map((t) => t.col)) + 1;
  const rows = Math.max(...placed.map((t) => t.row)) + 1;
  const composites = placed.map((t) => ({
    input: path.join(dir, t.file),
    left: t.col * size.width,
    top: t.row * size.height,
  }));
  await sharp({
    create: {
      width: cols * size.width,
      height: rows * size.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(dir, 'sheet.png'));
  console.log(`  sheet.png  ${cols * size.width}x${rows * size.height}`);
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'list') {
    const list = await listTilesets();
    if (!list.length) return console.log('No completed tilesets.');
    for (const t of list) {
      console.log(`${t.id}  ${t.status || ''}  ${t.name || t.description || ''}`);
    }
    return;
  }
  if (cmd === 'pull') {
    if (!arg) throw new Error('pull requires a tileset id');
    await pull(arg);
    return;
  }
  console.log('Usage: pixellab_tileset.js list | pull <tileset-id>');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
