import Phaser from 'phaser';
import { COLORS, TILE_SIZE, SPRITE_SIZE } from '../data/constants';

function hexToRgb(hex: number): string {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex: number, a: number): string {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return `rgba(${r},${g},${b},${a})`;
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    return [c, ctx];
}

function addTexture(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
}

function fillRect(ctx: CanvasRenderingContext2D, color: number, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = hexToRgb(color);
    ctx.fillRect(x, y, w, h);
}

function fillRoundRect(ctx: CanvasRenderingContext2D, color: number, x: number, y: number, w: number, h: number, r: number): void {
    ctx.fillStyle = hexToRgb(color);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

function fillCircle(ctx: CanvasRenderingContext2D, color: number, cx: number, cy: number, r: number): void {
    ctx.fillStyle = hexToRgb(color);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
}

function fillEllipse(ctx: CanvasRenderingContext2D, color: number, cx: number, cy: number, rx: number, ry: number): void {
    ctx.fillStyle = hexToRgb(color);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
}

function fillTriangle(ctx: CanvasRenderingContext2D, color: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    ctx.fillStyle = hexToRgb(color);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
}

// Gradient helpers
function gradientRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colorTop: number, colorBot: number, radius = 0): void {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, hexToRgb(colorTop));
    grad.addColorStop(1, hexToRgb(colorBot));
    ctx.fillStyle = grad;
    if (radius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
    } else {
        ctx.fillRect(x, y, w, h);
    }
}

function gradientCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, colorCenter: number, colorEdge: number): void {
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    grad.addColorStop(0, hexToRgb(colorCenter));
    grad.addColorStop(1, hexToRgb(colorEdge));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
}

function gradientEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, colorTop: number, colorBot: number): void {
    const grad = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
    grad.addColorStop(0, hexToRgb(colorTop));
    grad.addColorStop(1, hexToRgb(colorBot));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
}

export class SpriteGenerator {
    static generateAll(scene: Phaser.Scene): void {
        this.generateMara(scene);
        this.generateGoomba(scene);
        this.generateCoin(scene);
        this.generateQuestionBlock(scene);
        this.generatePlatformTiles(scene);
        this.generateFlag(scene);
        this.generateHeart(scene);
        this.generateParticles(scene);
        this.generateBackground(scene);
        this.generateUI(scene);
    }

    // ============================================================
    // MARA — 128x128, realistic with gradients
    // ============================================================
    private static generateMara(scene: Phaser.Scene): void {
        const s = SPRITE_SIZE;

        for (let frame = 0; frame < 4; frame++) {
            const [c, ctx] = createCanvas(s, s);
            const legOffset = frame === 1 ? 6 : frame === 2 ? -6 : 0;
            const isJump = frame === 3;
            const armSwing = frame === 1 ? -4 : frame === 2 ? 4 : 0;
            this.drawMaraBody(ctx, s, legOffset, isJump, armSwing, false);
            addTexture(scene, `mara_${frame}`, c);
        }

        // Hurt frame
        const [c, ctx] = createCanvas(s, s);
        this.drawMaraBody(ctx, s, 0, false, 0, true);
        addTexture(scene, 'mara_hurt', c);
    }

    private static drawMaraBody(ctx: CanvasRenderingContext2D, s: number, legOffset: number, isJump: boolean, armSwing: number, isHurt: boolean): void {
        const cx = s / 2;

        // Shadow under feet
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(cx, s - 6, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // === LONG BROWN HAIR (background, flowing) ===
        const hairGrad = ctx.createLinearGradient(cx, 0, cx, 70);
        hairGrad.addColorStop(0, hexToRgb(0x6D4C41));
        hairGrad.addColorStop(0.4, hexToRgb(COLORS.brownHair));
        hairGrad.addColorStop(1, hexToRgb(0x4E342E));
        ctx.fillStyle = hairGrad;
        ctx.beginPath();
        ctx.roundRect(28, 2, 72, 32, 16);
        ctx.fill();
        // Left flowing hair
        ctx.beginPath();
        ctx.roundRect(20, 10, 20, 60, 8);
        ctx.fill();
        // Right flowing hair
        ctx.beginPath();
        ctx.roundRect(88, 10, 20, 52, 8);
        ctx.fill();
        // Hair highlight
        ctx.fillStyle = hexToRgba(0x8D6E63, 0.5);
        ctx.beginPath();
        ctx.roundRect(42, 4, 20, 14, 6);
        ctx.fill();

        // === HEAD/FACE ===
        const skinGrad = ctx.createRadialGradient(cx, 30, 2, cx, 32, 28);
        skinGrad.addColorStop(0, hexToRgb(0xFFDDBB));
        skinGrad.addColorStop(1, hexToRgb(COLORS.skin));
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.roundRect(34, 16, 60, 38, 18);
        ctx.fill();

        // === EYES ===
        // Eye whites
        fillEllipse(ctx, COLORS.white, 50, 34, 7, 8);
        fillEllipse(ctx, COLORS.white, 78, 34, 7, 8);
        // Iris (brown with gradient)
        gradientCircle(ctx, 51, 35, 5, 0x6D4C41, COLORS.brownEyes);
        gradientCircle(ctx, 79, 35, 5, 0x6D4C41, COLORS.brownEyes);
        // Pupils
        fillCircle(ctx, COLORS.black, 52, 35, 2.5);
        fillCircle(ctx, COLORS.black, 80, 35, 2.5);
        // Eye shine
        fillCircle(ctx, COLORS.white, 49, 33, 2);
        fillCircle(ctx, COLORS.white, 77, 33, 2);
        // Eyelashes
        ctx.strokeStyle = hexToRgb(0x3E2723);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(42, 28); ctx.lineTo(46, 26); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(54, 26); ctx.lineTo(58, 28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(70, 28); ctx.lineTo(74, 26); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(82, 26); ctx.lineTo(86, 28); ctx.stroke();

        // === ROSY CHEEKS ===
        ctx.fillStyle = hexToRgba(COLORS.rosyCheek, 0.4);
        ctx.beginPath(); ctx.ellipse(42, 42, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(86, 42, 7, 4, 0, 0, Math.PI * 2); ctx.fill();

        // === MOUTH ===
        if (isHurt) {
            fillCircle(ctx, 0xDD4444, cx, 48, 5);
            fillCircle(ctx, 0x222222, cx, 48, 3);
        } else {
            ctx.strokeStyle = hexToRgb(0xCC7766);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, 46, 6, 0.1, Math.PI - 0.1);
            ctx.stroke();
        }

        // === PAJAMA TOP (light blue with gradient) ===
        gradientRect(ctx, 30, 56, 68, 24, 0xC8D8F0, 0xA0B4D0, 8);
        // Collar
        gradientRect(ctx, 38, 54, 52, 5, 0xD0E0F8, 0xB0C8E0, 3);
        // "DC" text
        ctx.fillStyle = hexToRgba(COLORS.white, 0.6);
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DC', cx, 72);
        // Fabric fold lines
        ctx.strokeStyle = hexToRgba(0x8098B0, 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(50, 60); ctx.lineTo(48, 78); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(78, 60); ctx.lineTo(80, 78); ctx.stroke();

        // === SLEEVES + ARMS ===
        gradientRect(ctx, 12 + armSwing, 58, 22, 18, 0xC8D8F0, 0xA0B4D0, 8);
        gradientRect(ctx, 94 - armSwing, 58, 22, 18, 0xC8D8F0, 0xA0B4D0, 8);
        // Hands (smooth circles with gradient)
        gradientCircle(ctx, 20 + armSwing, 80, 6, 0xFFDDBB, COLORS.skin);
        gradientCircle(ctx, 108 - armSwing, 80, 6, 0xFFDDBB, COLORS.skin);

        // === BAGGY PAJAMA PANTS ===
        if (isJump) {
            gradientRect(ctx, 26, 80, 30, 26, 0xD0E0F8, 0xB0C4DE, 8);
            gradientRect(ctx, 72, 80, 30, 26, 0xD0E0F8, 0xB0C4DE, 8);
        } else {
            gradientRect(ctx, 30 + legOffset, 80, 28, 26, 0xD0E0F8, 0xB0C4DE, 8);
            gradientRect(ctx, 70 - legOffset, 80, 28, 26, 0xD0E0F8, 0xB0C4DE, 8);
        }

        // === SLIPPERS ===
        if (isJump) {
            gradientRect(ctx, 24, 104, 32, 12, 0xE8DDD0, 0xCCC0B0, 6);
            gradientRect(ctx, 72, 104, 32, 12, 0xE8DDD0, 0xCCC0B0, 6);
        } else {
            gradientRect(ctx, 26 + legOffset, 104, 32, 12, 0xE8DDD0, 0xCCC0B0, 6);
            gradientRect(ctx, 68 - legOffset, 104, 32, 12, 0xE8DDD0, 0xCCC0B0, 6);
        }
    }

    // ============================================================
    // GOOMBA — 96x96 with gradients
    // ============================================================
    private static generateGoomba(scene: Phaser.Scene): void {
        const s = 96;

        for (let frame = 0; frame < 2; frame++) {
            const [c, ctx] = createCanvas(s, s);
            const fo = frame === 0 ? 0 : 5;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath(); ctx.ellipse(s / 2, s - 5, 28, 6, 0, 0, Math.PI * 2); ctx.fill();

            // Mushroom cap with radial gradient
            gradientEllipse(ctx, s / 2, 26, 40, 26, 0xA1887F, 0x6D4C41);
            // Cap highlight
            ctx.fillStyle = hexToRgba(0xBCAAA4, 0.4);
            ctx.beginPath(); ctx.ellipse(s / 2, 16, 24, 10, 0, 0, Math.PI * 2); ctx.fill();

            // Face area
            gradientRect(ctx, 16, 42, 64, 26, 0xFFE8CC, 0xFFD8B0, 10);

            // Eyes with whites
            fillEllipse(ctx, COLORS.white, 32, 50, 8, 9);
            fillEllipse(ctx, COLORS.white, 64, 50, 8, 9);
            fillCircle(ctx, COLORS.black, 34, 51, 5);
            fillCircle(ctx, COLORS.black, 66, 51, 5);
            fillCircle(ctx, COLORS.white, 32, 49, 2);
            fillCircle(ctx, COLORS.white, 64, 49, 2);

            // Angry eyebrows
            ctx.strokeStyle = hexToRgb(COLORS.enemyDark);
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(22, 40); ctx.lineTo(38, 38); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(74, 40); ctx.lineTo(58, 38); ctx.stroke();

            // Mouth
            gradientRect(ctx, 32, 62, 32, 8, 0x222222, 0x111111, 4);
            fillRect(ctx, COLORS.white, 38, 62, 6, 4);
            fillRect(ctx, COLORS.white, 52, 62, 6, 4);

            // Feet with gradient
            gradientRect(ctx, 8 - fo, 72, 30, 22, 0x795548, 0x5D4037, 8);
            gradientRect(ctx, 58 + fo, 72, 30, 22, 0x795548, 0x5D4037, 8);

            addTexture(scene, `goomba_${frame}`, c);
        }

        // Squished
        const [c, ctx] = createCanvas(s, s);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath(); ctx.ellipse(s / 2, s - 8, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
        gradientEllipse(ctx, s / 2, s - 14, 38, 10, 0xA1887F, 0x6D4C41);
        fillCircle(ctx, COLORS.black, 36, s - 14, 3);
        fillCircle(ctx, COLORS.black, 60, s - 14, 3);
        addTexture(scene, 'goomba_squish', c);
    }

    // ============================================================
    // COIN — 64x64 with metallic gradient
    // ============================================================
    private static generateCoin(scene: Phaser.Scene): void {
        const s = 64;
        const widths = [28, 18, 6, 18];

        for (let frame = 0; frame < 4; frame++) {
            const [c, ctx] = createCanvas(s, s);
            const w = widths[frame];
            const x = (s - w) / 2;

            // Coin body with gradient
            const coinGrad = ctx.createLinearGradient(x, 8, x + w, 8);
            coinGrad.addColorStop(0, hexToRgb(0xFFD54F));
            coinGrad.addColorStop(0.3, hexToRgb(0xFFECB3));
            coinGrad.addColorStop(0.6, hexToRgb(0xFFD700));
            coinGrad.addColorStop(1, hexToRgb(0xFFA000));
            ctx.fillStyle = coinGrad;
            ctx.beginPath();
            ctx.roundRect(x, 8, w, 48, Math.min(w / 2, 14));
            ctx.fill();

            // Inner ring
            if (w > 10) {
                ctx.strokeStyle = hexToRgba(0xCC8800, 0.5);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x + 3, 12, w - 6, 40, Math.min((w - 6) / 2, 10));
                ctx.stroke();
            }

            // $ symbol
            if (w >= 16) {
                ctx.fillStyle = hexToRgba(0xCC8800, 0.7);
                ctx.font = `bold ${Math.min(w - 4, 24)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', s / 2, s / 2);
            }

            // Shine highlight
            if (w > 10) {
                ctx.fillStyle = hexToRgba(0xFFFFFF, 0.4);
                ctx.beginPath();
                ctx.ellipse(x + w * 0.35, 18, w * 0.15, 8, -0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            addTexture(scene, `coin_${frame}`, c);
        }
    }

    // ============================================================
    // QUESTION BLOCK — 64x64 with 3D gradient
    // ============================================================
    private static generateQuestionBlock(scene: Phaser.Scene): void {
        const s = 64;

        // Normal
        {
            const [c, ctx] = createCanvas(s, s);
            // 3D block with gradient (light top, dark bottom)
            gradientRect(ctx, 0, 0, s, s, 0xFFE082, 0xFFA000, 8);
            // Top highlight
            gradientRect(ctx, 3, 3, s - 6, 8, 0xFFECB3, 0xFFD54F, 4);
            // Side shadow
            ctx.fillStyle = hexToRgba(0xCC7700, 0.3);
            ctx.fillRect(s - 6, 6, 4, s - 12);
            ctx.fillRect(6, s - 6, s - 12, 4);
            // Corner rivets
            fillCircle(ctx, 0xCC8800, 8, 8, 3);
            fillCircle(ctx, 0xCC8800, s - 8, 8, 3);
            fillCircle(ctx, 0xCC8800, 8, s - 8, 3);
            fillCircle(ctx, 0xCC8800, s - 8, s - 8, 3);
            // ? mark with shadow
            ctx.fillStyle = hexToRgba(0x000000, 0.15);
            ctx.font = 'bold 38px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', s / 2 + 2, s / 2 + 2);
            ctx.fillStyle = hexToRgb(COLORS.white);
            ctx.fillText('?', s / 2, s / 2);
            // Top-left shine
            ctx.fillStyle = hexToRgba(0xFFFFFF, 0.25);
            ctx.beginPath(); ctx.roundRect(6, 6, 20, 20, 6); ctx.fill();
            addTexture(scene, 'question_block', c);
        }

        // Used
        {
            const [c, ctx] = createCanvas(s, s);
            gradientRect(ctx, 0, 0, s, s, 0x9E8E7E, 0x6E5E4E, 8);
            gradientRect(ctx, 3, 3, s - 6, 6, 0xAE9E8E, 0x8E7E6E, 4);
            fillCircle(ctx, 0x7E6E5E, 8, 8, 3);
            fillCircle(ctx, 0x7E6E5E, s - 8, 8, 3);
            fillCircle(ctx, 0x7E6E5E, 8, s - 8, 3);
            fillCircle(ctx, 0x7E6E5E, s - 8, s - 8, 3);
            addTexture(scene, 'question_block_used', c);
        }
    }

    // ============================================================
    // PLATFORM TILES — 32x32 with gradient shading
    // ============================================================
    private static generatePlatformTiles(scene: Phaser.Scene): void {
        const s = TILE_SIZE;

        // Grass top tile
        {
            const [c, ctx] = createCanvas(s, s);
            gradientRect(ctx, 0, 0, s, s, 0x9B7720, COLORS.dirt);
            // Dirt spots
            fillCircle(ctx, COLORS.dirtDark, 5, 18, 2.5);
            fillCircle(ctx, COLORS.dirtDark, 20, 24, 2);
            fillCircle(ctx, COLORS.dirtDark, 28, 14, 1.5);
            // Pebbles
            fillCircle(ctx, 0x9E9E9E, 10, 22, 1.5);
            fillCircle(ctx, 0x8E8E8E, 26, 28, 1);
            // Grass layer with gradient
            gradientRect(ctx, 0, 0, s, 10, 0x66BB6A, COLORS.grass, 2);
            gradientRect(ctx, 0, 8, s, 3, COLORS.grassDark, 0x2E7D32);
            // Grass blades
            fillCircle(ctx, 0x81C784, 4, 0, 2.5);
            fillCircle(ctx, 0x66BB6A, 12, 1, 2);
            fillCircle(ctx, 0x4CAF50, 20, 0, 2.5);
            fillCircle(ctx, 0x81C784, 28, 1, 2);
            // Tiny flowers
            fillCircle(ctx, 0xFF8A80, 8, 2, 1.5);
            fillCircle(ctx, 0xFFFF8D, 22, 1, 1);
            addTexture(scene, 'tile_grass', c);
        }

        // Dirt tile
        {
            const [c, ctx] = createCanvas(s, s);
            gradientRect(ctx, 0, 0, s, s, COLORS.dirt, COLORS.dirtDark);
            fillCircle(ctx, 0x7A5A10, 5, 7, 3);
            fillCircle(ctx, 0x7A5A10, 18, 16, 2.5);
            fillCircle(ctx, 0x7A5A10, 26, 5, 2);
            fillCircle(ctx, 0x7A5A10, 11, 24, 3);
            fillCircle(ctx, 0x9E9E9E, 15, 10, 1.5);
            fillCircle(ctx, 0x8E8E8E, 8, 20, 1);
            addTexture(scene, 'tile_dirt', c);
        }

        // Platform tile (floating)
        {
            const [c, ctx] = createCanvas(s, s);
            // Stone base with gradient
            gradientRect(ctx, 0, 8, s, s - 8, 0xA0A0A0, 0x707070, 4);
            // Bottom shadow
            ctx.fillStyle = hexToRgba(0x000000, 0.2);
            ctx.beginPath(); ctx.roundRect(0, s - 5, s, 5, 2); ctx.fill();
            // Stone highlights
            ctx.fillStyle = hexToRgba(0xFFFFFF, 0.15);
            ctx.beginPath(); ctx.roundRect(2, 10, s - 4, 4, 2); ctx.fill();
            // Grass top with gradient
            gradientRect(ctx, 0, 0, s, 11, 0x81C784, COLORS.grass, 3);
            gradientRect(ctx, 0, 9, s, 3, COLORS.grassDark, 0x2E7D32);
            // Grass blades
            fillCircle(ctx, 0x81C784, 4, 0, 2.5);
            fillCircle(ctx, 0x66BB6A, 14, 1, 2);
            fillCircle(ctx, 0x4CAF50, 22, 0, 2.5);
            fillCircle(ctx, 0x81C784, 30, 1, 2);
            // Hanging moss
            ctx.fillStyle = hexToRgba(0x388E3C, 0.6);
            ctx.beginPath(); ctx.roundRect(5, s - 5, 3, 5, 1); ctx.fill();
            ctx.beginPath(); ctx.roundRect(24, s - 4, 3, 4, 1); ctx.fill();
            addTexture(scene, 'tile_platform', c);
        }

        // Stone tile
        {
            const [c, ctx] = createCanvas(s, s);
            gradientRect(ctx, 0, 0, s, s, 0x909090, 0x707070);
            ctx.strokeStyle = hexToRgba(0x505050, 0.6);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(s, 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(s, 16); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(s, 24); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(16, 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(8, 16); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(24, 16); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, 16); ctx.lineTo(16, 24); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, 24); ctx.lineTo(8, 32); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(24, 24); ctx.lineTo(24, 32); ctx.stroke();
            // Top edge highlight
            ctx.fillStyle = hexToRgba(0xFFFFFF, 0.1);
            ctx.fillRect(0, 0, s, 1);
            addTexture(scene, 'tile_stone', c);
        }
    }

    // ============================================================
    // FLAG — smooth with gradient
    // ============================================================
    private static generateFlag(scene: Phaser.Scene): void {
        const s = SPRITE_SIZE;
        const [c, ctx] = createCanvas(s, s * 2);
        // Pole with gradient
        gradientRect(ctx, s / 2 - 4, 0, 8, s * 2, 0xD0D0D0, 0x909090, 3);
        // Flag with gradient
        const flagGrad = ctx.createLinearGradient(s / 2, 4, s / 2 + 40, 4);
        flagGrad.addColorStop(0, hexToRgb(0xC8D4E8));
        flagGrad.addColorStop(1, hexToRgb(0x8FA0B8));
        ctx.fillStyle = flagGrad;
        ctx.beginPath();
        ctx.moveTo(s / 2 + 4, 6);
        ctx.lineTo(s / 2 + 44, 22);
        ctx.lineTo(s / 2 + 4, 38);
        ctx.closePath();
        ctx.fill();
        // Star on flag
        gradientCircle(ctx, s / 2 + 20, 22, 6, 0xFFEB3B, COLORS.gold);
        // Base
        gradientRect(ctx, s / 2 - 14, s * 2 - 16, 28, 16, 0x8D6E63, 0x5D4037, 4);
        addTexture(scene, 'flag', c);
    }

    // ============================================================
    // HEARTS
    // ============================================================
    private static generateHeart(scene: Phaser.Scene): void {
        {
            const [c, ctx] = createCanvas(24, 24);
            const grad = ctx.createRadialGradient(12, 10, 2, 12, 12, 12);
            grad.addColorStop(0, hexToRgb(0xFF5252));
            grad.addColorStop(1, hexToRgb(0xC62828));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(12, 20);
            ctx.bezierCurveTo(2, 14, 0, 6, 6, 4);
            ctx.bezierCurveTo(10, 2, 12, 6, 12, 8);
            ctx.bezierCurveTo(12, 6, 14, 2, 18, 4);
            ctx.bezierCurveTo(24, 6, 22, 14, 12, 20);
            ctx.fill();
            // Shine
            fillCircle(ctx, 0xFF8A80, 8, 8, 3);
            addTexture(scene, 'heart_full', c);
        }
        {
            const [c, ctx] = createCanvas(24, 24);
            ctx.fillStyle = hexToRgb(0x424242);
            ctx.beginPath();
            ctx.moveTo(12, 20);
            ctx.bezierCurveTo(2, 14, 0, 6, 6, 4);
            ctx.bezierCurveTo(10, 2, 12, 6, 12, 8);
            ctx.bezierCurveTo(12, 6, 14, 2, 18, 4);
            ctx.bezierCurveTo(24, 6, 22, 14, 12, 20);
            ctx.fill();
            addTexture(scene, 'heart_empty', c);
        }
    }

    // ============================================================
    // PARTICLES
    // ============================================================
    private static generateParticles(scene: Phaser.Scene): void {
        { const [c, ctx] = createCanvas(8, 8); fillRect(ctx, COLORS.white, 3, 0, 2, 8); fillRect(ctx, COLORS.white, 0, 3, 8, 2); addTexture(scene, 'particle_sparkle', c); }
        { const [c, ctx] = createCanvas(8, 8); fillCircle(ctx, 0xBCAAA4, 4, 4, 4); addTexture(scene, 'particle_dust', c); }
        { const [c, ctx] = createCanvas(6, 6); fillCircle(ctx, COLORS.gold, 3, 3, 3); addTexture(scene, 'particle_coin', c); }
        { const [c, ctx] = createCanvas(8, 8); gradientCircle(ctx, 4, 4, 4, 0xFFEB3B, COLORS.gold); addTexture(scene, 'particle_star', c); }
    }

    // ============================================================
    // BACKGROUNDS (for title scene)
    // ============================================================
    private static generateBackground(scene: Phaser.Scene): void {
        { const [c] = createCanvas(1, 1); addTexture(scene, 'bg_sky', c); }
        { const [c] = createCanvas(1, 1); addTexture(scene, 'bg_mountains', c); }
        { const [c] = createCanvas(1, 1); addTexture(scene, 'bg_trees_far', c); }
        { const [c] = createCanvas(1, 1); addTexture(scene, 'bg_trees_near', c); }
    }

    // ============================================================
    // UI
    // ============================================================
    private static generateUI(scene: Phaser.Scene): void {
        const s = TILE_SIZE;
        {
            const [c, ctx] = createCanvas(400, 60);
            gradientRect(ctx, 0, 0, 400, 60, 0xD4B074, 0xA07830, 10);
            gradientRect(ctx, 4, 4, 392, 52, 0xC4A265, 0x9A7028, 8);
            gradientRect(ctx, 8, 8, 384, 44, 0xD4B074, 0xB08840, 6);
            ctx.strokeStyle = hexToRgba(0x8B6914, 0.2);
            ctx.lineWidth = 1;
            for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(12, 14 + i * 6); ctx.lineTo(388, 14 + i * 6); ctx.stroke(); }
            addTexture(scene, 'wooden_banner', c);
        }
        {
            const [c, ctx] = createCanvas(500, 350);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, 500, 350);
            gradientRect(ctx, 20, 20, 460, 310, 0x9A7028, 0x6B4F12, 16);
            gradientRect(ctx, 28, 28, 444, 294, 0xD4B074, 0xB08840, 12);
            gradientRect(ctx, 40, 40, 420, 270, 0xFFF8E1, 0xFFF0D0, 8);
            addTexture(scene, 'math_popup_bg', c);
        }
        {
            const [c, ctx] = createCanvas(100, 45);
            gradientRect(ctx, 0, 0, 100, 45, 0xB08840, COLORS.woodDark, 8);
            gradientRect(ctx, 3, 3, 94, 39, 0xD4B074, COLORS.woodLight, 6);
            addTexture(scene, 'button_wood', c);
        }
        {
            const [c, ctx] = createCanvas(100, 45);
            gradientRect(ctx, 0, 0, 100, 45, 0xFFD54F, 0xFFA000, 8);
            gradientRect(ctx, 3, 3, 94, 39, 0xFFECB3, 0xFFD700, 6);
            addTexture(scene, 'button_wood_hover', c);
        }
        {
            const [c, ctx] = createCanvas(24, 24);
            gradientCircle(ctx, 12, 12, 12, 0xFFECB3, COLORS.gold);
            gradientCircle(ctx, 12, 12, 8, 0xFFD54F, 0xFFA000);
            ctx.fillStyle = hexToRgba(0xCC8800, 0.6);
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 12, 12);
            addTexture(scene, 'coin_icon', c);
        }
        {
            const [c, ctx] = createCanvas(s, s + 4);
            fillRect(ctx, 0x5D4037, 12, 16, 8, 20);
            gradientRect(ctx, 0, 0, s, 18, 0xD4B074, 0xA07830, 4);
            gradientRect(ctx, 2, 2, s - 4, 14, 0xB08840, 0x8B6914, 3);
            ctx.fillStyle = hexToRgb(COLORS.white);
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('>', s / 2, 12);
            addTexture(scene, 'wooden_sign', c);
        }
    }
}
