const fs = require('fs');

const outputPath = process.argv[2];
if (!outputPath) {
  console.error('Usage: node save_b64.js <output-path>');
  process.exit(1);
}

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const buffer = Buffer.from(data.trim(), 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved ${buffer.length} bytes to ${outputPath}`);
});
