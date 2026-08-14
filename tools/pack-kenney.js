const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const repoRoot = path.join(__dirname, '..');
  const tilesDir = path.join(repoRoot, 'kenney_tiny-town', 'Tiles');
  const outFile = path.join(repoRoot, 'assets', 'kenney_packed.png');

  if (!fs.existsSync(tilesDir)) {
    console.error('Kenney tiles directory not found:', tilesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(tilesDir).filter(f => f.toLowerCase().endsWith('.png'));
  if (files.length === 0) {
    console.error('No PNG files found in', tilesDir);
    process.exit(1);
  }

  // sort to keep indexes stable
  files.sort();

  const tileSize = 16;
  const spacing = 1;
  const cols = 12; // from Tilesheet.txt (12 x 11)
  const rows = Math.ceil(files.length / cols);
  const width = cols * tileSize + (cols - 1) * spacing;
  const height = rows * tileSize + (rows - 1) * spacing;

  const composites = files.map((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      input: path.join(tilesDir, name),
      left: col * (tileSize + spacing),
      top: row * (tileSize + spacing)
    };
  });

  if (!fs.existsSync(path.dirname(outFile))) fs.mkdirSync(path.dirname(outFile), { recursive: true });

  await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites)
    .png()
    .toFile(outFile);

  console.log('Wrote Kenney spritesheet:', outFile);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
