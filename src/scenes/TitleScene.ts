import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, LEVEL_CONFIG } from '../data/constants';
import { SaveManager } from '../systems/SaveManager';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create(): void {
        // Check if we need to auto-start a specific level (set by level advance)
        const pendingLevel = localStorage.getItem('mara_next_level');
        if (pendingLevel !== null) {
            localStorage.removeItem('mara_next_level');
            this.scene.start('GameScene', { level: parseInt(pendingLevel, 10) });
            return;
        }

        // Full-screen sky blue rectangle as background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB);

        // Clouds as rectangles (not graphics with alpha)
        this.add.rectangle(140, 55, 120, 40, 0xFFFFFF).setAlpha(0.85);
        this.add.rectangle(135, 38, 70, 30, 0xFFFFFF).setAlpha(0.85);
        this.add.rectangle(575, 65, 150, 45, 0xFFFFFF).setAlpha(0.85);
        this.add.rectangle(580, 45, 80, 35, 0xFFFFFF).setAlpha(0.85);
        this.add.rectangle(345, 35, 90, 28, 0xFFFFFF).setAlpha(0.85);
        this.add.rectangle(900, 50, 100, 35, 0xFFFFFF).setAlpha(0.85);

        // Mountains as simple rectangles (triangles via graphics had color issues)
        // Use Phaser.GameObjects.Triangle instead
        this.add.triangle(200, GAME_HEIGHT - 60, 0, GAME_HEIGHT - 180, 200, 0, 400, GAME_HEIGHT - 180, 0xB8D4E8);
        this.add.triangle(490, GAME_HEIGHT - 60, 0, GAME_HEIGHT - 150, 220, 0, 420, GAME_HEIGHT - 150, 0xC8E0F0);
        this.add.triangle(800, GAME_HEIGHT - 60, 0, GAME_HEIGHT - 190, 220, 0, 424, GAME_HEIGHT - 190, 0xACC8DC);

        // Ground
        for (let x = 0; x < GAME_WIDTH; x += 32) {
            this.add.image(x + 16, GAME_HEIGHT - 16, 'tile_dirt');
            this.add.image(x + 16, GAME_HEIGHT - 48, 'tile_grass');
        }

        // Title banner
        this.add.image(GAME_WIDTH / 2, 90, 'wooden_banner').setScale(1.3);

        // Title text
        this.add.text(GAME_WIDTH / 2, 90, 'Mara Rekenspel', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#5D4037',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Controller icon emoji
        this.add.text(GAME_WIDTH / 2 - 160, 82, '🎮', {
            fontSize: '28px',
        }).setOrigin(0.5);

        // Mara character on the left
        const mara = this.add.image(180, GAME_HEIGHT - 100, 'mara_0').setScale(3);
        this.tweens.add({
            targets: mara,
            y: mara.y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Coins floating
        for (let i = 0; i < 5; i++) {
            const coin = this.add.image(500 + i * 60, 200, 'coin_0').setScale(2);
            this.tweens.add({
                targets: coin,
                y: coin.y - 10,
                duration: 800 + i * 100,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }

        // Question block
        const qBlock = this.add.image(700, 300, 'question_block').setScale(2);
        this.tweens.add({
            targets: qBlock,
            scaleX: 2.1,
            scaleY: 2.1,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        // Goomba walking
        const goomba = this.add.image(800, GAME_HEIGHT - 80, 'goomba_0').setScale(2);
        let goombaFrame = 0;
        this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => {
                goombaFrame = 1 - goombaFrame;
                goomba.setTexture(`goomba_${goombaFrame}`);
            },
        });
        this.tweens.add({
            targets: goomba,
            x: 850,
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Start button
        const startGame = () => {
            this.scene.start('GameScene', { level: SaveManager.load().currentLevel });
        };
        const startBtn = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Start Spel', startGame);

        // Also allow Enter/Space to start
        if (this.input.keyboard) {
            this.input.keyboard.once('keydown-ENTER', startGame);
            this.input.keyboard.once('keydown-SPACE', startGame);
        }

        // Global click anywhere on canvas starts game too (fallback)
        this.input.once('pointerdown', startGame);

        // High score
        const save = SaveManager.load();
        if (save.highScore > 0) {
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, `Hoogste score: ${save.highScore}`, {
                fontSize: '18px',
                color: '#FFD700',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5);
        }

        // Controls info
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'Pijltjestoetsen: bewegen  |  Spatie: springen', {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Fade in
        // No fade-in (was causing brightness issues)
    }

    private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const bg = this.add.image(0, 0, 'button_wood').setScale(2, 1.2);
        const label = this.add.text(0, 0, text, {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#5D4037',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const container = this.add.container(x, y, [bg, label]);
        container.setSize(220, 60);
        container.setInteractive(
            new Phaser.Geom.Rectangle(-110, -30, 220, 60),
            Phaser.Geom.Rectangle.Contains
        );

        container.on('pointerover', () => {
            bg.setTexture('button_wood_hover');
        });
        container.on('pointerout', () => {
            bg.setTexture('button_wood');
        });
        container.on('pointerdown', () => {
            console.log('[TitleScene] Button clicked!');
            callback();
        });

        return container;
    }
}
