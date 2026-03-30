import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';

export class QuestionBlock extends Phaser.Physics.Arcade.Sprite {
    private isUsed = false;
    private isBumping = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'question_block');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Static body

        this.setScale(0.5); // 64 * 0.5 = 32px = 1 tile
    }

    get used(): boolean { return this.isUsed; }

    bump(): boolean {
        if (this.isUsed || this.isBumping) return false;
        this.isBumping = true;

        AudioManager.play('block');

        // Bump animation
        const origY = this.y;
        this.scene.tweens.add({
            targets: this,
            y: origY - 12,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Extended cooldown to prevent double trigger when walking into block
                this.scene.time.delayedCall(500, () => {
                    this.isBumping = false;
                });
            },
        });

        return true;
    }

    markUsed(): void {
        this.isUsed = true;
        this.setTexture('question_block_used');
        // Disable collider so player can walk through the used block
        (this.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    }

    resetBlock(): void {
        this.isUsed = false;
        this.isBumping = false;
        this.setTexture('question_block');
    }
}
