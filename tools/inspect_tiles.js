#!/usr/bin/env node
const fs = require('fs');
const { PNG } = require('pngjs');

const img = PNG.sync.read(fs.readFileSync('assets/tilemap_packed.png'));
const W = 192, H = 176, TILE = 16;
const COLS = W / TILE, ROWS = H / TILE;

function getPixel(x, y) {
  const idx = (y * W + x) * 4;
  return [img.data[idx], img.data[idx+1], img.data[idx+2], img.data[idx+3]];
}

function tilePixels(row, col) {
  const pixels = [];
  for (let y = row * TILE; y < (row + 1) * TILE; y++) {
    for (let x = col * TILE; x < (col + 1) * TILE; x++) {
      pixels.push(getPixel(x, y));
    }
  }
  return pixels;
}

function hasTransparency(pixels) {
  return pixels.some(p => p[3] === 0);
}

function opaqueCount(pixels) {
  return pixels.filter(p => p[3] > 0).length;
}

function dominantColors(pixels, topN = 5) {
  const counts = {};
  pixels.forEach(p => {
    if (p[3] === 0) return;
    const key = `${p[0]},${p[1]},${p[2]}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([color, count]) => ({ color, count, pct: (count / 256 * 100).toFixed(1) }));
}

console.log('Tile analysis (row, col) -> index, opacity, dominant colors:\n');

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const idx = row * COLS + col;
    const pixels = tilePixels(row, col);
    const transparent = hasTransparency(pixels);
    const opaque = opaqueCount(pixels);
    const colors = dominantColors(pixels, 3);
    
    console.log(`(${row},${col}) idx=${idx.toString().padStart(3)} ${transparent ? 'trans' : 'opaque'} (${opaque}/256)`);
    colors.forEach(c => console.log(`  ${c.color.padEnd(18)} ${c.count.toString().padStart(4)}px (${c.pct}%)`));
  }
  console.log('');
}
