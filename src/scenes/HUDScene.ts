import Phaser from 'phaser';
import { GAME_WIDTH, PLAYER_MAX_HEALTH } from '../data/constants';

export class HUDScene extends Phaser.Scene {
    private hearts: Phaser.GameObjects.Image[] = [];
    private coinText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private coins = 0;
    private score = 0;
    private health = PLAYER_MAX_HEALTH;

    constructor() {
        super({ key: 'HUDScene' });
    }

    create(): void {
        // Hearts
        this.hearts = [];
        for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
            const heart = this.add.image(30 + i * 30, 25, 'heart_full').setScale(1.2);
            this.hearts.push(heart);
        }

        // Coin icon + text
        this.add.image(GAME_WIDTH - 140, 25, 'coin_icon').setScale(1.2);
        this.coinText = this.add.text(GAME_WIDTH - 120, 25, 'x 0', {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0, 0.5);

        // Score
        this.scoreText = this.add.text(GAME_WIDTH / 2, 25, 'Score: 0', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Level name
        this.levelText = this.add.text(GAME_WIDTH / 2, 50, '', {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateCoins', this.updateCoins, this);
        gameScene.events.on('updateScore', this.updateScore, this);
        gameScene.events.on('updateHealth', this.updateHealth, this);
        gameScene.events.on('setLevelName', this.setLevelName, this);
    }

    private updateCoins(amount: number): void {
        this.coins = amount;
        this.coinText.setText(`x ${this.coins}`);

        // Pop animation
        this.tweens.add({
            targets: this.coinText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
        });
    }

    private updateScore(amount: number): void {
        this.score = amount;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private updateHealth(hp: number): void {
        this.health = hp;
        for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
            this.hearts[i].setTexture(i < this.health ? 'heart_full' : 'heart_empty');
            if (i === this.health) {
                // Shake the lost heart
                this.tweens.add({
                    targets: this.hearts[i],
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 150,
                    yoyo: true,
                });
            }
        }
    }

    private setLevelName(name: string): void {
        this.levelText.setText(name);
        this.levelText.setAlpha(1);
        this.tweens.add({
            targets: this.levelText,
            alpha: 0,
            delay: 3000,
            duration: 1000,
        });
    }
}
