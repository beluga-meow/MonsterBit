import { WorldScene } from './scenes/WorldScene.js';

export function startGame(Phaser, parent, onPracticeBattle) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#b7d7ad',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [new WorldScene(onPracticeBattle)]
  });
}