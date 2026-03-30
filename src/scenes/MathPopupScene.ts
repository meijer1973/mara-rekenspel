import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, LEVEL_CONFIG, MathCategory } from '../data/constants';
import { MathEngine, MathProblem } from '../systems/MathEngine';
import { AudioManager } from '../systems/AudioManager';

export type MathTrigger = 'enemy_hit' | 'question_block' | 'level_complete' | 'game_over';

interface MathPopupData {
    trigger: MathTrigger;
    difficulty: number;
    categories: readonly MathCategory[];
    onCorrect: () => void;
    onWrong: () => void;
}

export class MathPopupScene extends Phaser.Scene {
    private problem!: MathProblem;
    private data_config!: MathPopupData;
    private buttons: Phaser.GameObjects.Container[] = [];
    private feedbackText!: Phaser.GameObjects.Text;
    private answered = false;

    constructor() {
        super({ key: 'MathPopupScene' });
    }

    init(data: MathPopupData): void {
        this.data_config = data;
        this.answered = false;
    }

    create(): void {
        const config = this.data_config;
        this.problem = MathEngine.generate(config.difficulty, config.categories);

        // Semi-transparent backdrop
        const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
        backdrop.setInteractive(); // Block clicks through

        // Popup container
        const popup = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        // Background panel
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x5D4037);
        panelBg.fillRoundedRect(-230, -170, 460, 340, 16);
        panelBg.fillStyle(0x8D6E63);
        panelBg.fillRoundedRect(-220, -160, 440, 320, 12);
        panelBg.fillStyle(0xFFF8E1);
        panelBg.fillRoundedRect(-205, -145, 410, 290, 8);
        popup.add(panelBg);

        // Trigger description
        let triggerText = '';
        switch (config.trigger) {
            case 'enemy_hit': triggerText = 'Een vijand raakte je! Los de som op om je hart te behouden!'; break;
            case 'question_block': triggerText = 'Vraagteken-blok! Los de som op voor een beloning!'; break;
            case 'level_complete': triggerText = 'Level gehaald! Los de som op om door te gaan!'; break;
            case 'game_over': triggerText = 'Game Over! Los de som op voor een nieuwe kans!'; break;
        }

        const triggerLabel = this.add.text(0, -120, triggerText, {
            fontSize: '14px',
            color: '#5D4037',
            fontFamily: 'Arial, sans-serif',
            wordWrap: { width: 380 },
            align: 'center',
        }).setOrigin(0.5);
        popup.add(triggerLabel);

        // Question
        const questionText = this.add.text(0, -65, this.problem.question + ' = ?', {
            fontSize: '36px',
            color: '#1A237E',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 2,
        }).setOrigin(0.5);
        popup.add(questionText);

        // Answer buttons (2x2 grid)
        this.buttons = [];
        const isFraction = this.problem.category === 'breuken';

        this.problem.choices.forEach((choice, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = -95 + col * 190;
            const by = 0 + row * 65;

            const displayText = isFraction ? MathEngine.formatFraction(choice) : `${choice}`;
            const keyHint = `[${i + 1}] `;
            const btn = this.createAnswerButton(bx, by, keyHint + displayText, choice);
            popup.add(btn);
            this.buttons.push(btn);
        });

        // Feedback text (hidden initially)
        this.feedbackText = this.add.text(0, 130, '', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        popup.add(this.feedbackText);

        // Entrance animation
        popup.setScale(0);
        this.tweens.add({
            targets: popup,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut',
        });

        // Allow keyboard input (1-4 keys)
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ONE', () => this.selectAnswer(0));
            this.input.keyboard.on('keydown-TWO', () => this.selectAnswer(1));
            this.input.keyboard.on('keydown-THREE', () => this.selectAnswer(2));
            this.input.keyboard.on('keydown-FOUR', () => this.selectAnswer(3));
        }
    }

    private createAnswerButton(x: number, y: number, text: string, value: number): Phaser.GameObjects.Container {
        const bg = this.add.graphics();
        bg.fillStyle(0x8D6E63);
        bg.fillRoundedRect(-80, -22, 160, 44, 10);
        bg.fillStyle(0xC4A265);
        bg.fillRoundedRect(-77, -19, 154, 38, 8);

        const label = this.add.text(0, 0, text, {
            fontSize: '22px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#5D4037',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const container = this.add.container(x, y, [bg, label]);
        container.setSize(160, 44);
        container.setInteractive({ useHandCursor: true });
        container.setData('value', value);

        container.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 80 });
        });
        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
        });
        container.on('pointerdown', () => {
            this.checkAnswer(value, container);
        });

        return container;
    }

    private selectAnswer(index: number): void {
        if (index >= 0 && index < this.buttons.length) {
            const btn = this.buttons[index];
            this.checkAnswer(btn.getData('value'), btn);
        }
    }

    private checkAnswer(value: number, button: Phaser.GameObjects.Container): void {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = Math.abs(value - this.problem.answer) < 0.01;

        if (isCorrect) {
            AudioManager.play('correct');
            this.feedbackText.setText('Goed zo! ✓');
            this.feedbackText.setColor('#4CAF50');

            // Green highlight on button
            this.tweens.add({
                targets: button,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
            });

            // Sparkle particles
            const particles = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'particle_star', {
                speed: { min: 100, max: 250 },
                scale: { start: 1, end: 0 },
                lifespan: 800,
                quantity: 15,
                emitting: false,
            });
            particles.explode(15);

            this.time.delayedCall(1200, () => {
                this.data_config.onCorrect();
                this.closePopup();
            });
        } else {
            AudioManager.play('wrong');
            this.feedbackText.setText('Helaas! ✗');
            this.feedbackText.setColor('#E53935');

            // Shake button
            this.tweens.add({
                targets: button,
                x: button.x + 5,
                duration: 50,
                yoyo: true,
                repeat: 3,
            });

            // Camera shake
            this.cameras.main.shake(200, 0.008);

            this.time.delayedCall(1200, () => {
                this.data_config.onWrong();
                this.closePopup();
            });
        }

        // Disable all buttons
        this.buttons.forEach(btn => btn.disableInteractive());
    }

    private closePopup(): void {
        this.scene.stop('MathPopupScene');
        this.scene.resume('GameScene');
    }
}
