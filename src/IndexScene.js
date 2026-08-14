export default class IndexScene extends Phaser.Scene {
  constructor() { super('IndexScene'); }

  preload() {
    this.load.spritesheet('tiles', 'assets/tilemap_packed.png',
  { frameWidth: 16, frameHeight: 16, spacing: 0 });
  }

  create() {
    const texture = this.textures.get('tiles');
    const totalTiles = texture.frameTotal;

    // Tiny Town sheet: 12 cols x 11 rows = 132 tiles
    const displayCols = 12;
    const startX = 50;
    const startY = 50;
    const cellSize = 48; // larger for legibility

    for (let i = 0; i < totalTiles; i++) {
      const displayCol = i % displayCols;
      const displayRow = Math.floor(i / displayCols);

      const x = startX + displayCol * cellSize + 8; // center tile in cell
      const y = startY + displayRow * cellSize + 8;

      this.add.image(x, y, 'tiles', i);

      // Draw index number below tile
      const text = this.add.text(x, y + 16, String(i), {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 3, y: 2 }
      }).setOrigin(0.5, 0);
    }

    // I key to toggle back to ViewerScene
    this.input.keyboard.on('keydown-I', () => {
      this.scene.start('ViewerScene');
    });
  }
}
