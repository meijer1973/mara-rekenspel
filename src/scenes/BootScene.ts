import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../data/constants';
import { SpriteGenerator } from '../systems/SpriteGenerator';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        // Create loading bar in preload
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
        console.log('[Boot] create() - generating sprites');

        // Generate all textures using off-screen canvas
        SpriteGenerator.generateAll(this);

        console.log('[Boot] sprites done, going to TitleScene');
        this.scene.start('TitleScene');
    }
}
