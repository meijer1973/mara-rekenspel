import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        assetsInlineLimit: 0,
        target: 'ES2020',
    },
    server: {
        port: 3000,
    },
});
