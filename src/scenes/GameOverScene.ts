import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/constants';

interface GameOverData {
    score: number;
    level: number;
}

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data: GameOverData): void {
        // Dark background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1A1A1A, 0.95);

        // Game Over text
        const title = this.add.text(GAME_WIDTH / 2, 120, 'Game Over', {
            fontSize: '48px',
            color: '#E53935',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: title,
            alpha: 1,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            ease: 'Back.easeOut',
        });

        // Score
        this.add.text(GAME_WIDTH / 2, 200, `Score: ${data.score || 0}`, {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Sad Mara
        const mara = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'mara_hurt').setScale(4);

        // Retry actions
        const retry = () => {
            if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
            this.scene.start('GameScene', { level: data.level || 0 });
        };
        const menu = () => {
            if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
            this.scene.start('TitleScene');
        };

        // Show buttons after delay
        this.time.delayedCall(1000, () => {
            // Visual buttons
            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'button_wood').setScale(2, 1.2);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Opnieuw (Enter)', {
                fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold', stroke: '#5D4037', strokeThickness: 3,
            }).setOrigin(0.5);

            this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'button_wood').setScale(2, 1.2);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Hoofdmenu (Esc)', {
                fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold', stroke: '#5D4037', strokeThickness: 3,
            }).setOrigin(0.5);

            // Click anywhere = retry, Esc = menu
            this.input.once('pointerdown', retry);
            if (this.input.keyboard) {
                this.input.keyboard.once('keydown-ENTER', retry);
                this.input.keyboard.once('keydown-SPACE', retry);
                this.input.keyboard.once('keydown-ESC', menu);
            }
        });
    }
}
