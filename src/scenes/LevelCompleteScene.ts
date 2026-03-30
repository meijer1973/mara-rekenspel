import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVEL_CONFIG } from '../data/constants';

interface LevelCompleteData {
    level: number;
    score: number;
    coins: number;
    nextLevel: number;
}

export class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    create(data: LevelCompleteData): void {
        const config = LEVEL_CONFIG[data.level] || LEVEL_CONFIG[0];
        const nextConfig = LEVEL_CONFIG[data.nextLevel];

        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1A237E, 0.9);

        // Stars background effect
        for (let i = 0; i < 30; i++) {
            const star = this.add.image(
                Math.random() * GAME_WIDTH,
                Math.random() * GAME_HEIGHT,
                'particle_star'
            ).setScale(0.5 + Math.random()).setAlpha(0.5 + Math.random() * 0.5);

            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: 500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
            });
        }

        // Title
        this.add.text(GAME_WIDTH / 2, 80, 'Level Gehaald!', {
            fontSize: '42px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // Level name
        this.add.text(GAME_WIDTH / 2, 130, `Wereld ${config.world}-${config.level}: ${config.name}`, {
            fontSize: '20px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Stats
        const statsY = 200;
        this.add.text(GAME_WIDTH / 2, statsY, `Score: ${data.score}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, statsY + 40, `Munten verzameld: ${data.coins}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
        }).setOrigin(0.5);

        // Mara celebration
        const mara = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'mara_3').setScale(4);
        this.tweens.add({
            targets: mara,
            y: mara.y - 15,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Confetti particles
        const particles = this.add.particles(GAME_WIDTH / 2, 0, 'particle_star', {
            x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
            speed: { min: 50, max: 200 },
            angle: { min: 60, max: 120 },
            scale: { start: 1, end: 0.3 },
            lifespan: 3000,
            frequency: 100,
            tint: [0xFFD700, 0xFF4081, 0x7C4DFF, 0x00E676, 0x40C4FF],
        });

        // Next level action
        const goNext = () => {
            if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
            this.scene.start('GameScene', { level: data.nextLevel });
        };

        if (nextConfig) {
            // Visual button
            const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'button_wood').setScale(2.5, 1.3);
            const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, `Volgende: ${nextConfig.name}`, {
                fontSize: '18px',
                color: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#5D4037',
                strokeThickness: 3,
            }).setOrigin(0.5);
        }

        // Click anywhere OR press Enter/Space to advance
        this.input.once('pointerdown', goNext);
        if (this.input.keyboard) {
            this.input.keyboard.once('keydown-ENTER', goNext);
            this.input.keyboard.once('keydown-SPACE', goNext);
        }

        // Hint text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Klik of druk Enter om door te gaan', {
            fontSize: '13px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setAlpha(0.7);
    }
}
