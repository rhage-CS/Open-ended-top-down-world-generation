export default class ViewerScene extends Phaser.Scene {
  constructor() { super('ViewerScene'); }

  preload() {
    this.load.image('tiles', 'assets/TopDownFantasy-Forest/Tiles/Tileset1xPadding.png');
    this.load.json('level', 'levels/test.json');
  }

  create() {
    const level = this.cache.json.get('level');

    level.layers.forEach(layer => {
      const map = this.make.tilemap({
        data: layer.data,
        tileWidth: level.tileSize,
        tileHeight: level.tileSize
      });
      // margin 0, spacing 1 — Kenney packs tiles on a 17px grid
      const tiles = map.addTilesetImage('tiles', 'tiles', 16, 16, 0, 1);
      map.createLayer(0, tiles, 0, 0);
    });

    // free camera, no gameplay
    const cursors = this.input.keyboard.createCursorKeys();
    this.cursors = cursors;
  }

  update() {
    const speed = 4;
    if (this.cursors.left.isDown)  this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown)    this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown)  this.cameras.main.scrollY += speed;
  }
}