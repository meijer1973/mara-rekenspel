import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './data/constants';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { MathPopupScene } from './scenes/MathPopupScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameCompleteScene } from './scenes/GameCompleteScene';
import { LoadNextScene } from './scenes/LoadNextScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    transparent: false,
    pixelArt: false,
    roundPixels: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: GRAVITY },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        activePointers: 2,
    },
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        HUDScene,
        MathPopupScene,
        LevelCompleteScene,
        GameOverScene,
        GameCompleteScene,
        LoadNextScene,
    ],
};

const game = new Phaser.Game(config);
(window as any).game = game;
