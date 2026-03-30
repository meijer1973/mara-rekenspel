import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP, PLAYER_MAX_HEALTH, TILE_SIZE } from '../data/constants';
import { AudioManager } from '../systems/AudioManager';

type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'hurt';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; };
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private playerState: PlayerState = 'idle';
    private hp: number = PLAYER_MAX_HEALTH;
    private isInvincible = false;
    private invincibleTimer = 0;
    private animFrame = 0;
    private animTimer = 0;
    private canMove = true;
    private hasDoubleJumped = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'mara_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.4); // 128 * 0.4 = ~51px display size
        this.setCollideWorldBounds(false);
        this.setBounce(0);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(60, 100);
        body.setOffset(34, 20);
        body.setMaxVelocityY(600);

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.wasd = {
                up: scene.input.keyboard.addKey('W'),
                left: scene.input.keyboard.addKey('A'),
                right: scene.input.keyboard.addKey('D'),
            };
            this.spaceKey = scene.input.keyboard.addKey('SPACE');
        }
    }

    get health(): number { return this.hp; }
    get isDead(): boolean { return this.hp <= 0; }
    get currentState(): PlayerState { return this.playerState; }

    setCanMove(val: boolean): void {
        this.canMove = val;
        if (!val) {
            this.setVelocityX(0);
        }
    }

    update(_time: number, delta: number): void {
        if (!this.canMove) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const onGround = body.blocked.down || body.touching.down;

        // Invincibility timer
        if (this.isInvincible) {
            this.invincibleTimer -= delta;
            this.setAlpha(Math.sin(this.invincibleTimer * 0.01) > 0 ? 1 : 0.3);
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.setAlpha(1);
            }
        }

        // Movement
        const left = this.cursors?.left.isDown || this.wasd?.left.isDown;
        const right = this.cursors?.right.isDown || this.wasd?.right.isDown;
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors?.up) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.wasd?.up);

        if (left) {
            this.setVelocityX(-PLAYER_SPEED);
            this.setFlipX(true);
        } else if (right) {
            this.setVelocityX(PLAYER_SPEED);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // Reset double jump when on ground
        if (onGround) {
            this.hasDoubleJumped = false;
        }

        // Jump (single + double jump)
        if (jumpPressed) {
            if (onGround) {
                // Normal jump from ground
                this.setVelocityY(PLAYER_JUMP);
                AudioManager.play('jump');
                this.scene.events.emit('playerJump', this.x, this.y + 16);
            } else if (!this.hasDoubleJumped) {
                // Double jump in the air
                this.hasDoubleJumped = true;
                this.setVelocityY(PLAYER_JUMP);
                AudioManager.play('jump');
            }
        }

        // State management
        if (this.playerState === 'hurt') return;

        if (!onGround) {
            this.playerState = body.velocity.y < 0 ? 'jumping' : 'falling';
        } else if (Math.abs(body.velocity.x) > 10) {
            this.playerState = 'running';
        } else {
            this.playerState = 'idle';
        }

        // Animation
        this.animTimer += delta;
        if (this.animTimer > 150) {
            this.animTimer = 0;
            if (this.playerState === 'running') {
                this.animFrame = this.animFrame === 1 ? 2 : 1;
                this.setTexture(`mara_${this.animFrame}`);
            } else if (this.playerState === 'jumping' || this.playerState === 'falling') {
                this.setTexture('mara_3');
            } else {
                this.setTexture('mara_0');
            }
        }

        // Fall off world
        if (this.y > this.scene.physics.world.bounds.height + 100) {
            this.takeDamage(true);
        }
    }

    takeDamage(instant = false): boolean {
        if (this.isInvincible && !instant) return false;

        this.hp--;
        this.scene.events.emit('playerHurt');

        if (this.hp <= 0) {
            this.scene.events.emit('playerDied');
            return true;
        }

        // Invincibility
        this.isInvincible = true;
        this.invincibleTimer = 2000;
        AudioManager.play('hurt');

        // Hurt animation
        this.playerState = 'hurt';
        this.setTexture('mara_hurt');

        // Knockback
        this.setVelocityY(-200);

        // Screen shake
        this.scene.cameras.main.shake(100, 0.005);

        // Reset state after a moment
        this.scene.time.delayedCall(400, () => {
            this.playerState = 'idle';
        });

        return false;
    }

    heal(): void {
        if (this.hp < PLAYER_MAX_HEALTH) {
            this.hp++;
        }
    }

    resetHealth(): void {
        this.hp = PLAYER_MAX_HEALTH;
        this.isInvincible = false;
        this.setAlpha(1);
    }

    getInvincible(): boolean {
        return this.isInvincible;
    }
}
