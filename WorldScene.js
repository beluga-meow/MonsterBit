export class WorldScene extends Phaser.Scene {
  constructor(onPracticeBattle) {
    super('WorldScene');
    this.onPracticeBattle = onPracticeBattle;
    this.keys = null;
    this.player = null;
    this.guide = null;
    this.battleTriggered = false;
  }
  create() {
    const g = this.add.graphics();
    // Simple procedural starter map: grass, path, pond and trees.
    g.fillStyle(0x9fc98f, 1); g.fillRect(0, 0, 960, 540);
    g.fillStyle(0xd7c69a, 1); g.fillEllipse(485, 290, 650, 130);
    g.fillStyle(0x79b9c2, 1); g.fillEllipse(780, 110, 220, 115);
    g.fillStyle(0x6d9b67, 1);
    for (let y=45; y<520; y+=95) for (let x=45; x<930; x+=105) {
      if ((x>330 && x<650 && y>220 && y<360) || (x>670 && y<180)) continue;
      this.add.circle(x, y, 18, 0x477d52);
      this.add.circle(x-5, y-7, 12, 0x60945f);
      this.add.rectangle(x, y+17, 7, 15, 0x76543b);
    }
    this.add.text(28, 22, 'VERDANTIA OUTSKIRTS', { fontFamily:'Arial', fontSize:'18px', color:'#25452d', fontStyle:'bold' });
    this.add.text(28, 48, 'Find the guide on the path', { fontFamily:'Arial', fontSize:'13px', color:'#31583a' });
    this.guide = this.add.container(565, 285, [
      this.add.circle(0, 0, 15, 0x294b72),
      this.add.circle(0, -17, 10, 0xf0c9a2),
      this.add.text(-25, 25, 'GUIDE  !', { fontSize:'12px', color:'#213a2b', fontStyle:'bold' })
    ]);
    this.player = this.add.container(360, 300, [
      this.add.ellipse(0, 19, 25, 9, 0x54734c, 0.35),
      this.add.rectangle(0, 4, 19, 24, 0x365e9b, 1).setStrokeStyle(2,0xffffff),
      this.add.circle(0, -12, 10, 0xf0c9a2, 1).setStrokeStyle(1,0x7c5945),
      this.add.arc(0, -16, 11, Math.PI, Math.PI*2, false, 0x24384e).setStrokeStyle(5,0x24384e),
      this.add.rectangle(0, 28, 18, 5, 0x3b3b45)
    ]);
    this.physics.world.setBounds(12, 12, 936, 516);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(13, -13, -12);
    this.player.body.setCollideWorldBounds(true);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.add.text(28, 500, 'Move with WASD or arrow keys', { fontSize:'13px', color:'#29452d', backgroundColor:'#ffffffaa', padding:{x:8,y:5} });
  }
  update() {
    if (!this.player?.body) return;
    const b = this.player.body, k = this.keys, speed = 175;
    let x = 0, y = 0;
    if (k.A.isDown || k.LEFT.isDown) x--;
    if (k.D.isDown || k.RIGHT.isDown) x++;
    if (k.W.isDown || k.UP.isDown) y--;
    if (k.S.isDown || k.DOWN.isDown) y++;
    const length = Math.hypot(x,y) || 1;
    b.setVelocity(x/length*speed, y/length*speed);
    if (!this.battleTriggered && Phaser.Math.Distance.Between(this.player.x,this.player.y,this.guide.x,this.guide.y)<48) {
      this.battleTriggered = true;
      b.setVelocity(0,0);
      this.time.delayedCall(250, () => {
        this.onPracticeBattle?.();
        this.battleTriggered = false;
      });
    }
  }
}