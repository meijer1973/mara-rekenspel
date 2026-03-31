import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/constants';
import { SpriteGenerator } from '../systems/SpriteGenerator';

export class BootScene extends Phaser.Scene {
    private ready = false;
    private timer = 0;

    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333);
        barBg.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2, 300, 20, 10);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Laden...', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
        }).setOrigin(0.5);
    }

    create(): void {
        SpriteGenerator.generateAll(this);
        this.ready = true;
        this.timer = 0;
    }

    update(_time: number, delta: number): void {
        if (!this.ready) return;

        this.timer += delta;
        if (this.timer < 100) return; // Wait 1 frame minimum

        this.ready = false; // Only run once

        // Check if there's a pending level transition
        const pendingLevel = localStorage.getItem('mara_next_level');
        if (pendingLevel !== null) {
            localStorage.removeItem('mara_next_level');
            this.scene.start('GameScene', { level: parseInt(pendingLevel, 10) });
        } else {
            this.scene.start('TitleScene');
        }
    }
}
