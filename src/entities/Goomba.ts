import Phaser from 'phaser';
import { ENEMY_SPEED, TILE_SIZE } from '../data/constants';

export class Goomba extends Phaser.Physics.Arcade.Sprite {
    private direction = 1;
    private isDead = false;
    private animFrame = 0;
    private animTimer = 0;
    private patrolDistance: number;
    private startX: number;

    constructor(scene: Phaser.Scene, x: number, y: number, patrolDist = 100) {
        super(scene, x, y, 'goomba_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.45); // 96 * 0.45 = ~43px
        this.setBounce(0);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(60, 60);
        body.setOffset(18, 24);

        this.patrolDistance = patrolDist;
        this.startX = x;
    }

    get dead(): boolean { return this.isDead; }

    update(_time: number, delta: number): void {
        if (this.isDead) return;

        const body = this.body as Phaser.Physics.Arcade.Body;

        // Patrol movement
        this.setVelocityX(ENEMY_SPEED * this.direction);

        // Turn around at patrol limits or walls
        if (body.blocked.left || this.x < this.startX - this.patrolDistance) {
            this.direction = 1;
            this.setFlipX(false);
        }
        if (body.blocked.right || this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
            this.setFlipX(true);
        }

        // Walking animation
        this.animTimer += delta;
        if (this.animTimer > 250) {
            this.animTimer = 0;
            this.animFrame = 1 - this.animFrame;
            this.setTexture(`goomba_${this.animFrame}`);
        }
    }

    stomp(): void {
        if (this.isDead) return;
        this.isDead = true;

        this.setTexture('goomba_squish');
        this.setVelocity(0, 0);
        (this.body as Phaser.Physics.Arcade.Body).enable = false;

        this.scene.tweens.add({
            targets: this,
            scaleY: 0.5,
            duration: 200,
        });

        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
    }

    defeat(): void {
        if (this.isDead) return;
        this.isDead = true;

        // Flip and fall off screen
        this.setFlipY(true);
        this.setVelocityY(-300);
        (this.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;

        this.scene.time.delayedCall(2000, () => {
            this.destroy();
        });
    }
}
