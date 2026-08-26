export default class ViewerScene extends Phaser.Scene {
  constructor() {
    super('ViewerScene');
  }

  preload() {
    // Kenney is always available as the default. A level that names its own
    // tileset gets it loaded in create(), once the JSON is actually readable.
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

    // A level may name its own sheet, e.g. a PixelLab-generated tileset:
    //   "tileset": "assets/generated/tileset-136a6986/sheet.png"
    // Levels with no tileset field keep using Kenney, so nothing older breaks.
    if (!level.tileset) {
      this.build(level, 'tinytown');
      return;
    }

    // The sheet was not known at preload time, so run a second load pass and
    // build once it lands. Keying the texture on the path means two levels
    // sharing a sheet reuse one texture.
    const key = level.tileset;
    if (this.textures.exists(key)) {
      this.build(level, key);
      return;
    }
    this.load.image(key, level.tileset);
    this.load.once('complete', () => {
      if (!this.textures.exists(key)) {
        console.error(`Tileset failed to load: ${level.tileset}`);
        return;
      }
      this.build(level, key);
    });
    this.load.start();
  }

  build(level, textureKey) {
    const size = level.tileSize || 16;

    // Layer 0 is terrain, layer 1 and up are objects drawn over it.
    level.layers.forEach((layer, i) => {
      const map = this.make.tilemap({
        data: layer.data,
        tileWidth: size,
        tileHeight: size
      });
      // spacing is ZERO despite Tilesheet.txt claiming 1px
      const tiles = map.addTilesetImage(textureKey, textureKey, size, size, 0, 0);
      map.createLayer(0, tiles, 0, 0).setDepth(i);
      console.log(`layer ${i} "${layer.name || '(unnamed)'}" ${layer.data[0].length}x${layer.data.length}`);
    });

    const tex = this.textures.get(textureKey).getSourceImage();
    console.log(`tileset ${textureKey} ${tex.width}x${tex.height} @ ${size}px = ${Math.floor(tex.width / size)} cols`);

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
    if (!this.cursors) return;
    if (this.cursors.left.isDown) this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown) this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown) this.cameras.main.scrollY += speed;
  }
}