const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const repoRoot = path.join(__dirname, '..');
  const srcDir = path.join(repoRoot, 'assets', 'custom');
  const outFile = path.join(repoRoot, 'assets', 'custom_packed.png');

  if (!fs.existsSync(srcDir)) {
    console.error('Source directory does not exist:', srcDir);
    process.exit(1);
  }

  const files = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.png'));
  if (files.length === 0) {
    console.error('No PNG files found in', srcDir);
    process.exit(1);
  }

  const tileSize = 16;
  const spacing = 1; // match Kenney spacing
  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  const width = cols * tileSize + (cols - 1) * spacing;
  const height = rows * tileSize + (rows - 1) * spacing;

  const composites = files.map((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      input: path.join(srcDir, name),
      left: col * (tileSize + spacing),
      top: row * (tileSize + spacing)
    };
  });

  await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites)
    .png()
    .toFile(outFile);

  console.log('Wrote spritesheet:', outFile);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
