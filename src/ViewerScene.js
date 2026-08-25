export default class ViewerScene extends Phaser.Scene {
  constructor() {
    super('ViewerScene');
  }

  preload() {
    this.load.image('tinytown', 'assets/tilemap_packed.png');
    const levelPath = new URLSearchParams(window.location.search).get('level')
      || 'levels/test.json';
    this.load.json('level', levelPath);
  }

  create() {
    const level = this.cache.json.get('level');
    if (!level) {
      console.error('Level failed to load. Check the ?level= path and the console for a 404.');
      return;
    }

    // Layer 0 is terrain, layer 1 and up are objects drawn over it.
    level.layers.forEach((layer, i) => {
      const map = this.make.tilemap({
        data: layer.data,
        tileWidth: level.tileSize,
        tileHeight: level.tileSize
      });
      // spacing is ZERO despite Tilesheet.txt claiming 1px
      const tiles = map.addTilesetImage('tinytown', 'tinytown', 16, 16, 0, 0);
      map.createLayer(0, tiles, 0, 0).setDepth(i);
      console.log(`layer ${i} "${layer.name || '(unnamed)'}" ${layer.data[0].length}x${layer.data.length}`);
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown-S', () => this.capture());
    this.input.keyboard.on('keydown-I', () => this.scene.start('IndexScene'));
  }

  capture() {
    this.game.renderer.snapshot((image) => {
      const base64 = image.src.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const name = (new URLSearchParams(window.location.search).get('level') || 'test')
        .split('/').pop().replace('.json', '');
      fetch(`/capture?name=${encodeURIComponent(name)}`, { method: 'POST', body: bytes })
        .then((r) => r.text())
        .then((n) => console.log('saved screenshot', n))
        .catch((e) => console.error('capture failed', e));
    });
  }

  update() {
    const speed = 4;
    if (this.cursors.left.isDown) this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown) this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown) this.cameras.main.scrollY += speed;
  }
}