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
      const tiles = map.addTilesetImage('tinytown', 'tinytown', 16, 16, 0, 1);
      map.createLayer(0, tiles, 0, 0).setDepth(i);
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 4;
    if (this.cursors.left.isDown)  this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown)    this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown)  this.cameras.main.scrollY += speed;
  }
}