const SAVE_KEY = 'mara_rekenspel_save';

interface SaveData {
    currentLevel: number;
    highScore: number;
    totalCoins: number;
    mathCorrect: number;
    mathTotal: number;
}

export class SaveManager {
    static load(): SaveData {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) return JSON.parse(raw);
        } catch { /* ignore */ }
        return { currentLevel: 0, highScore: 0, totalCoins: 0, mathCorrect: 0, mathTotal: 0 };
    }

    static save(data: Partial<SaveData>): void {
        try {
            const current = this.load();
            const merged = { ...current, ...data };
            localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
        } catch { /* ignore */ }
    }

    static updateHighScore(score: number): void {
        const data = this.load();
        if (score > data.highScore) {
            this.save({ highScore: score });
        }
    }

    static reset(): void {
        try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    }
}
