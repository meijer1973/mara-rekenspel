import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/constants';
import { SaveManager } from '../systems/SaveManager';

interface GameCompleteData {
    score: number;
    coins: number;
}

export class GameCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameCompleteScene' });
    }

    create(data: GameCompleteData): void {
        // Epic background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0D47A1, 0.95);

        // Stars
        for (let i = 0; i < 50; i++) {
            const star = this.add.image(
                Math.random() * GAME_WIDTH,
                Math.random() * GAME_HEIGHT,
                'particle_star'
            ).setScale(0.3 + Math.random() * 1.5).setAlpha(0.5 + Math.random() * 0.5);
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 300 + Math.random() * 700,
                yoyo: true,
                repeat: -1,
            });
        }

        // Title
        this.add.text(GAME_WIDTH / 2, 80, 'Gefeliciteerd!', {
            fontSize: '48px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 130, 'Je hebt alle levels gehaald!', {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Stats
        const save = SaveManager.load();
        const statsY = 200;
        const stats = [
            `Eindscore: ${data.score}`,
            `Totale munten: ${save.totalCoins + data.coins}`,
            `Sommen goed: ${save.mathCorrect} / ${save.mathTotal}`,
        ];

        stats.forEach((stat, i) => {
            this.add.text(GAME_WIDTH / 2, statsY + i * 35, stat, {
                fontSize: '20px',
                color: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
            }).setOrigin(0.5);
        });

        // Happy Mara
        const mara = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'mara_3').setScale(5);
        this.tweens.add({
            targets: mara,
            y: mara.y - 20,
            angle: 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Massive confetti
        this.add.particles(GAME_WIDTH / 2, -20, 'particle_star', {
            x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
            speed: { min: 80, max: 300 },
            angle: { min: 60, max: 120 },
            scale: { start: 1.5, end: 0.2 },
            lifespan: 4000,
            frequency: 50,
            tint: [0xFFD700, 0xFF4081, 0x7C4DFF, 0x00E676, 0x40C4FF, 0xFFAB40],
        });

        // Back to menu button
        this.time.delayedCall(2000, () => {
            const bg = this.add.image(0, 0, 'button_wood').setScale(2.5, 1.3);
            const label = this.add.text(0, 0, 'Terug naar menu', {
                fontSize: '20px',
                color: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#5D4037',
                strokeThickness: 3,
            }).setOrigin(0.5);

            const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 60, [bg, label]);
            container.setSize(250, 58);
            container.setInteractive({ useHandCursor: true });
            container.on('pointerdown', () => {
                SaveManager.save({ currentLevel: 0 });
                this.scene.start('TitleScene');
            });
        });
    }
}
