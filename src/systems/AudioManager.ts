export class AudioManager {
    private static ctx: AudioContext | null = null;

    private static getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        return this.ctx;
    }

    static play(type: 'jump' | 'coin' | 'correct' | 'wrong' | 'hurt' | 'stomp' | 'block' | 'levelComplete' | 'gameOver'): void {
        try {
            const ctx = this.getCtx();
            if (ctx.state === 'suspended') ctx.resume();

            switch (type) {
                case 'jump': this.playTone(ctx, [300, 500], 0.12, 0.15); break;
                case 'coin': this.playTone(ctx, [988, 1319], 0.08, 0.2); break;
                case 'correct': this.playChord(ctx, [523, 659, 784], 0.3, 0.25); break;
                case 'wrong': this.playTone(ctx, [200, 150], 0.3, 0.2); break;
                case 'hurt': this.playTone(ctx, [400, 200, 100], 0.15, 0.2); break;
                case 'stomp': this.playTone(ctx, [150, 300], 0.08, 0.15); break;
                case 'block': this.playTone(ctx, [600, 800, 600], 0.06, 0.15); break;
                case 'levelComplete': this.playMelody(ctx, [523, 587, 659, 698, 784, 880, 988, 1047], 0.12, 0.2); break;
                case 'gameOver': this.playMelody(ctx, [400, 350, 300, 250, 200], 0.2, 0.25); break;
            }
        } catch {
            // Audio not available
        }
    }

    private static playTone(ctx: AudioContext, freqs: number[], stepDuration: number, volume: number): void {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);

        freqs.forEach((f, i) => {
            osc.frequency.setValueAtTime(f, now + i * stepDuration);
        });

        const totalDuration = freqs.length * stepDuration;
        gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);
        osc.start(now);
        osc.stop(now + totalDuration + 0.01);
    }

    private static playChord(ctx: AudioContext, freqs: number[], duration: number, volume: number): void {
        const now = ctx.currentTime;
        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(volume / freqs.length, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.start(now);
            osc.stop(now + duration + 0.01);
        });
    }

    private static playMelody(ctx: AudioContext, notes: number[], noteDuration: number, volume: number): void {
        const now = ctx.currentTime;
        notes.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = f;
            osc.connect(gain);
            gain.connect(ctx.destination);
            const start = now + i * noteDuration;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(volume, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration - 0.01);
            osc.start(start);
            osc.stop(start + noteDuration);
        });
    }
}
