export default class ViewerScene extends Phaser.Scene {
  constructor() { super('ViewerScene'); }

  preload() {
    this.load.image('tinytown', 'assets/tilemap_packed.png');
    // Phase 3: this.load.image('custom', 'assets/custom_packed.png');
    this.load.json('level', 'levels/test.json');
  }

  create() {
    const level = this.cache.json.get('level');

    level.layers.forEach((layer, i) => {
      const map = this.make.tilemap({
        data: layer.data,
        tileWidth: level.tileSize,
        tileHeight: level.tileSize
      });
      // margin 0, spacing 1 — Kenney packs tiles on a 17px grid
      const tiles = map.addTilesetImage('tinytown', 'tinytown', 16, 16, 0, 0);
      map.createLayer(0, tiles, 0, 0).setDepth(i);
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    
    // S key for screenshot capture
    this.input.keyboard.on('keydown-S', () => {
      this.captureScreenshot();
    });
    
    // I key to toggle to IndexScene
    this.input.keyboard.on('keydown-I', () => {
      this.scene.start('IndexScene');
    });
  }

  async captureScreenshot() {
    try {
      const canvas = this.game.canvas;
      const dataURL = canvas.toDataURL('image/png');
      const base64Data = dataURL.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const response = await fetch('/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: bytes.buffer
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Screenshot saved: ${result.filename}`);
      } else {
        console.error('Screenshot failed:', await response.text());
      }
    } catch (err) {
      console.error('Screenshot error:', err);
    }
  }

  update() {
    const speed = 4;
    if (this.cursors.left.isDown)  this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown)    this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown)  this.cameras.main.scrollY += speed;
  }
}