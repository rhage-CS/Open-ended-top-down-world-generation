import ViewerScene from './ViewerScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  pixelArt: true,
  zoom: 2,
  backgroundColor: '#1a1a1a',
  scene: [ViewerScene]
});