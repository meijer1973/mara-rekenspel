import Phaser from 'phaser';

export class Coin extends Phaser.Physics.Arcade.Sprite {
    private animFrame = 0;
    private animTimer = 0;
    private collected = false;
    private bobY: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'coin_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.45); // 64 * 0.45 = ~29px
        this.bobY = y;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setSize(28, 48);
        body.setOffset(18, 8);
    }

    update(_time: number, delta: number): void {
        if (this.collected) return;

        // Spin animation
        this.animTimer += delta;
        if (this.animTimer > 120) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
            this.setTexture(`coin_${this.animFrame}`);
        }

        // Gentle bob
        this.y = this.bobY + Math.sin(Date.now() * 0.003) * 3;
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;

        // Pop up animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 30,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => this.destroy(),
        });
    }
}
