// Game dimensions
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;
export const TILE_SIZE = 32;
export const SPRITE_SIZE = 128; // Larger sprites for more detail

// Physics
export const GRAVITY = 900;
export const PLAYER_SPEED = 200;
export const PLAYER_JUMP = -420;
export const PLAYER_MAX_HEALTH = 3;
export const ENEMY_SPEED = 60;

// Colors
export const COLORS = {
    sky: 0x87CEEB,
    grass: 0x4CAF50,
    grassDark: 0x388E3C,
    dirt: 0x8B6914,
    dirtDark: 0x6B4F12,
    stone: 0x808080,
    stoneDark: 0x606060,
    gold: 0xFFD700,
    goldDark: 0xCC9900,
    purple: 0x7B1FA2,
    purpleLight: 0x9C27B0,
    purpleDark: 0x4A148C,
    pajama: 0xB0C4DE,
    pajamaLight: 0xC8D4E8,
    pajamaDark: 0x8FA0B8,
    rosyCheek: 0xFFAAAA,
    slipper: 0xDDCCBB,
    brown: 0x795548,
    brownHair: 0x5D4037,
    hairHighlight: 0x7B5B4B,
    brownEyes: 0x4E342E,
    skin: 0xFFCC99,
    red: 0xE53935,
    white: 0xFFFFFF,
    black: 0x000000,
    woodLight: 0xC4A265,
    woodDark: 0x8B6914,
    leafGreen: 0x2E7D32,
    waterBlue: 0x42A5F5,
    mountainGray: 0x78909C,
    enemyBrown: 0x8D6E63,
    enemyDark: 0x5D4037,
};

// 8 Worlds × 3 levels = 24 levels
export const LEVEL_CONFIG = [
    // World 1 — Rekenbos
    { world: 1, level: 1, name: 'Het Rekenbos', mathDifficulty: 1, categories: ['plus'] as const },
    { world: 1, level: 2, name: 'Bospaden', mathDifficulty: 1, categories: ['plus', 'min'] as const },
    { world: 1, level: 3, name: 'De Oude Eik', mathDifficulty: 1, categories: ['plus', 'min'] as const },
    // World 2 — Zonnestrand
    { world: 2, level: 1, name: 'Schelpenpad', mathDifficulty: 1, categories: ['plus', 'min'] as const },
    { world: 2, level: 2, name: 'Kokospalmen', mathDifficulty: 2, categories: ['plus', 'min'] as const },
    { world: 2, level: 3, name: 'Getijdenrots', mathDifficulty: 2, categories: ['plus', 'min', 'keer'] as const },
    // World 3 — Kristalgrot
    { world: 3, level: 1, name: 'Gloeiende Gangen', mathDifficulty: 2, categories: ['keer'] as const },
    { world: 3, level: 2, name: 'Kristalkamer', mathDifficulty: 2, categories: ['keer'] as const },
    { world: 3, level: 3, name: 'Dieptemijn', mathDifficulty: 3, categories: ['keer', 'delen'] as const },
    // World 4 — Vurige Vulkaan
    { world: 4, level: 1, name: 'Lavastroom', mathDifficulty: 3, categories: ['keer', 'delen'] as const },
    { world: 4, level: 2, name: 'Rookpijpen', mathDifficulty: 3, categories: ['keer', 'delen'] as const },
    { world: 4, level: 3, name: 'De Krater', mathDifficulty: 3, categories: ['keer', 'delen'] as const },
    // World 5 — IJspaleis
    { world: 5, level: 1, name: 'Sneeuwvelden', mathDifficulty: 3, categories: ['delen'] as const },
    { world: 5, level: 2, name: 'Bevroren Meer', mathDifficulty: 4, categories: ['delen', 'keer'] as const },
    { world: 5, level: 3, name: 'IJstroon', mathDifficulty: 4, categories: ['delen', 'keer'] as const },
    // World 6 — Woestijntempel
    { world: 6, level: 1, name: 'Zandduinen', mathDifficulty: 4, categories: ['keer', 'delen'] as const },
    { world: 6, level: 2, name: 'Oase', mathDifficulty: 4, categories: ['keer', 'delen'] as const },
    { world: 6, level: 3, name: 'Farao Tempel', mathDifficulty: 4, categories: ['keer', 'delen', 'breuken'] as const },
    // World 7 — Wolkenrijk
    { world: 7, level: 1, name: 'Regenboogbrug', mathDifficulty: 4, categories: ['breuken'] as const },
    { world: 7, level: 2, name: 'Hemeltuin', mathDifficulty: 5, categories: ['breuken'] as const },
    { world: 7, level: 3, name: 'Sterrenpaleis', mathDifficulty: 5, categories: ['breuken', 'keer'] as const },
    // World 8 — Donker Kasteel
    { world: 8, level: 1, name: 'Kasteelpoort', mathDifficulty: 5, categories: ['plus', 'min', 'keer', 'delen'] as const },
    { world: 8, level: 2, name: 'Torentrap', mathDifficulty: 5, categories: ['keer', 'delen', 'breuken'] as const },
    { world: 8, level: 3, name: 'De Troonzaal', mathDifficulty: 5, categories: ['plus', 'min', 'keer', 'delen', 'breuken'] as const },
];

export type MathCategory = 'plus' | 'min' | 'keer' | 'delen' | 'breuken';
