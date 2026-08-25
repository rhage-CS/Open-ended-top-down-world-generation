#!/usr/bin/env node
/**
 * pixellab_fetch.js — pull PixelLab assets to disk via the v2 REST API.
 *
 * The MCP server returns images as inline media with no agent-accessible path
 * to disk. The v2 REST API exposes a `preview_url` per asset, so the loop that
 * is uncloseable through MCP closes here.
 *
 * Usage:
 *   node tools/pixellab_fetch.js list [objects|tilesets|tiles-pro|characters]
 *   node tools/pixellab_fetch.js pull <asset-id> [--kind objects]
 *   node tools/pixellab_fetch.js pull-all [--kind objects]
 *
 * Requires PIXELLAB_API_KEY in the environment. Node 18+ (global fetch).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = 'https://api.pixellab.ai/v2';
const OUT_DIR = path.join(process.cwd(), 'assets', 'generated');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

const KEY = process.env.PIXELLAB_API_KEY;
if (!KEY) {
  console.error('PIXELLAB_API_KEY is not set. Export it and retry.');
  process.exit(1);
}

// The list endpoints wrap their results in differently named arrays.
const COLLECTIONS = {
  objects: 'objects',
  tilesets: 'tilesets',
  'tiles-pro': 'tiles',
  characters: 'characters',
  'isometric-tiles': 'tiles',
};

async function api(endpoint) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`GET /${endpoint} -> ${res.status}: ${body}`);
  }
  return JSON.parse(body);
}

async function listAssets(kind) {
  const field = COLLECTIONS[kind];
  if (!field) throw new Error(`Unknown kind: ${kind}`);
  const data = await api(kind);
  return data[field] || [];
}

function slug(text, fallback) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return s || fallback;
}

function readManifest() {
  if (!fs.existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    console.error(`Manifest at ${MANIFEST} is unreadable. Move it aside.`);
    process.exit(1);
  }
}

function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // A truncated or HTML error page would silently become a broken asset.
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error(`Not a PNG (${buf.length} bytes): ${url}`);
  }
  fs.writeFileSync(dest, buf);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function pull(asset, kind) {
  if (!asset.preview_url) {
    console.error(`  skip ${asset.id} — no preview_url (status: ${asset.status})`);
    return null;
  }
  const name = `${slug(asset.name || asset.prompt, kind)}-${asset.id.slice(0, 8)}.png`;
  const dest = path.join(OUT_DIR, name);
  const sha256 = await download(asset.preview_url, dest);

  const manifest = readManifest();
  manifest[asset.id] = {
    file: path.relative(process.cwd(), dest),
    kind,
    name: asset.name || null,
    prompt: asset.prompt || null,
    size: asset.size || null,
    view: asset.view || null,
    created_at: asset.created_at || null,
    source_url: asset.preview_url,
    sha256,
    fetched_at: new Date().toISOString(),
  };
  writeManifest(manifest);

  const dims = asset.size ? `${asset.size.width}x${asset.size.height}` : '?';
  console.log(`  ${name}  ${dims}  ${sha256.slice(0, 12)}`);
  return dest;
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const kindFlag = process.argv.indexOf('--kind');
  const kind = kindFlag !== -1 ? process.argv[kindFlag + 1] : 'objects';

  if (cmd === 'list') {
    const which = arg && !arg.startsWith('--') ? arg : kind;
    const assets = await listAssets(which);
    if (!assets.length) return console.log(`No ${which}.`);
    for (const a of assets) {
      const dims = a.size ? `${a.size.width}x${a.size.height}` : '?';
      console.log(`${a.id}  ${dims}  ${a.status}  ${a.name || a.prompt || ''}`);
    }
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (cmd === 'pull') {
    if (!arg) throw new Error('pull requires an asset id');
    const assets = await listAssets(kind);
    const asset = assets.find((a) => a.id === arg);
    if (!asset) throw new Error(`${arg} not found in ${kind}`);
    console.log(`Pulling ${arg}:`);
    await pull(asset, kind);
    return;
  }

  if (cmd === 'pull-all') {
    const assets = await listAssets(kind);
    console.log(`Pulling ${assets.length} ${kind}:`);
    for (const a of assets) {
      try {
        await pull(a, kind);
      } catch (err) {
        console.error(`  FAIL ${a.id}: ${err.message}`);
      }
    }
    return;
  }

  console.log('Usage: pixellab_fetch.js list|pull <id>|pull-all [--kind objects]');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
