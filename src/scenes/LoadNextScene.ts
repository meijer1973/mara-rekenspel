import Phaser from 'phaser';

export class LoadNextScene extends Phaser.Scene {
    private nextLevel = 0;

    constructor() {
        super({ key: 'LoadNextScene' });
    }

    init(data: { level: number }): void {
        this.nextLevel = data.level;
    }

    create(): void {
        // Immediately start GameScene with the next level
        this.scene.start('GameScene', { level: this.nextLevel });
    }
}
