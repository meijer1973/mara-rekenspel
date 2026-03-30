import { MathCategory } from '../data/constants';

export interface MathProblem {
    question: string;
    answer: number;
    choices: number[];
    category: MathCategory;
}

export class MathEngine {
    static generate(difficulty: number, categories: readonly MathCategory[]): MathProblem {
        const category = categories[Math.floor(Math.random() * categories.length)];

        switch (category) {
            case 'plus': return this.generatePlus(difficulty);
            case 'min': return this.generateMin(difficulty);
            case 'keer': return this.generateKeer(difficulty);
            case 'delen': return this.generateDelen(difficulty);
            case 'breuken': return this.generateBreuken(difficulty);
        }
    }

    private static generatePlus(difficulty: number): MathProblem {
        const max = difficulty <= 2 ? 100 : 200;
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        const answer = a + b;
        return {
            question: `${a} + ${b}`,
            answer,
            choices: this.makeChoices(answer),
            category: 'plus',
        };
    }

    private static generateMin(difficulty: number): MathProblem {
        const max = difficulty <= 2 ? 100 : 200;
        const a = Math.floor(Math.random() * max) + 10;
        const b = Math.floor(Math.random() * a) + 1;
        const answer = a - b;
        return {
            question: `${a} - ${b}`,
            answer,
            choices: this.makeChoices(answer),
            category: 'min',
        };
    }

    private static generateKeer(difficulty: number): MathProblem {
        const maxFactor = difficulty <= 2 ? 10 : 12;
        const a = Math.floor(Math.random() * maxFactor) + 2;
        const b = Math.floor(Math.random() * maxFactor) + 2;
        const answer = a * b;
        return {
            question: `${a} × ${b}`,
            answer,
            choices: this.makeChoices(answer),
            category: 'keer',
        };
    }

    private static generateDelen(difficulty: number): MathProblem {
        const maxFactor = difficulty <= 3 ? 10 : 12;
        const b = Math.floor(Math.random() * maxFactor) + 2;
        const result = Math.floor(Math.random() * maxFactor) + 2;
        const a = b * result;
        return {
            question: `${a} ÷ ${b}`,
            answer: result,
            choices: this.makeChoices(result),
            category: 'delen',
        };
    }

    private static generateBreuken(difficulty: number): MathProblem {
        const denoms = [2, 3, 4, 5, 6, 8];
        const d1 = denoms[Math.floor(Math.random() * denoms.length)];
        const d2 = denoms[Math.floor(Math.random() * denoms.length)];
        const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;

        const ops = difficulty >= 5 ? ['+', '-', '×', '÷'] : ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        let answerNum: number;
        let answerDen: number;

        switch (op) {
            case '+':
                answerNum = n1 * d2 + n2 * d1;
                answerDen = d1 * d2;
                break;
            case '-': {
                const v1 = n1 / d1;
                const v2 = n2 / d2;
                const big = Math.max(v1, v2);
                const small = Math.min(v1, v2);
                const bigN = big === v1 ? n1 : n2;
                const bigD = big === v1 ? d1 : d2;
                const smallN = big === v1 ? n2 : n1;
                const smallD = big === v1 ? d2 : d1;
                answerNum = bigN * smallD - smallN * bigD;
                answerDen = bigD * smallD;
                break;
            }
            case '×':
                answerNum = n1 * n2;
                answerDen = d1 * d2;
                break;
            case '÷':
                answerNum = n1 * d2;
                answerDen = d1 * n2;
                break;
            default:
                answerNum = n1 * d2 + n2 * d1;
                answerDen = d1 * d2;
        }

        // Simplify
        const g = this.gcd(Math.abs(answerNum), answerDen);
        answerNum = answerNum / g;
        answerDen = answerDen / g;

        const question = op === '-'
            ? `${Math.max(n1/d1, n2/d2) === n1/d1 ? n1 : n2}/${Math.max(n1/d1, n2/d2) === n1/d1 ? d1 : d2} ${op} ${Math.max(n1/d1, n2/d2) === n1/d1 ? n2 : n1}/${Math.max(n1/d1, n2/d2) === n1/d1 ? d2 : d1}`
            : `${n1}/${d1} ${op} ${n2}/${d2}`;

        const answerStr = answerDen === 1 ? `${answerNum}` : `${answerNum}/${answerDen}`;
        const answerDecimal = answerNum / answerDen;

        // For fractions, use string-based choices
        const choices = this.makeFractionChoices(answerNum, answerDen);

        return {
            question,
            answer: answerDecimal,
            choices,
            category: 'breuken',
        };
    }

    private static gcd(a: number, b: number): number {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    private static makeChoices(correct: number): number[] {
        const choices = new Set<number>([correct]);
        const offsets = [1, 2, 3, 5, 10, -1, -2, -3, -5, -10];

        while (choices.size < 4) {
            const offset = offsets[Math.floor(Math.random() * offsets.length)];
            const val = correct + offset;
            if (val >= 0 && val !== correct) {
                choices.add(val);
            }
        }

        return this.shuffle([...choices]);
    }

    private static makeFractionChoices(correctNum: number, correctDen: number): number[] {
        const correct = correctNum / correctDen;
        const choices = new Set<number>([correct]);

        // Generate plausible wrong fractions
        const attempts = [
            (correctNum + 1) / correctDen,
            (correctNum - 1) / correctDen,
            correctNum / (correctDen + 1),
            correctNum / (correctDen - 1),
            (correctNum + 2) / correctDen,
            (correctNum * 2) / correctDen,
        ];

        for (const a of attempts) {
            if (a > 0 && a !== correct && isFinite(a)) {
                choices.add(Math.round(a * 1000) / 1000);
            }
            if (choices.size >= 4) break;
        }

        // Fill remaining with random offsets
        while (choices.size < 4) {
            const offset = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
            const val = Math.round((correct + offset) * 1000) / 1000;
            if (val > 0) choices.add(val);
        }

        return this.shuffle([...choices]);
    }

    static formatFraction(decimal: number): string {
        // Try to express as a simple fraction
        for (let d = 1; d <= 12; d++) {
            const n = decimal * d;
            if (Math.abs(n - Math.round(n)) < 0.001) {
                const num = Math.round(n);
                const den = d;
                if (den === 1) return `${num}`;
                const g = this.gcd(Math.abs(num), den);
                return `${num / g}/${den / g}`;
            }
        }
        return decimal.toFixed(2);
    }

    private static shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
