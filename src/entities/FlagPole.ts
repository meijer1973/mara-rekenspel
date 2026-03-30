import Phaser from 'phaser';

export class FlagPole extends Phaser.Physics.Arcade.Sprite {
    private reached = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'flag');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Static

        this.setScale(0.5); // 128x256 * 0.5 = 64x128 display
        this.setOrigin(0.5, 1);

        // Gentle wave animation
        scene.tweens.add({
            targets: this,
            angle: 3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    get isReached(): boolean { return this.reached; }

    reach(): void {
        if (this.reached) return;
        this.reached = true;

        // Celebration tween
        this.scene.tweens.add({
            targets: this,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: 300,
            yoyo: true,
            ease: 'Back.easeOut',
        });
    }
}
