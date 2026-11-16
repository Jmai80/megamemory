import { defineConfig } from 'vite';

// base './' gör att bygget fungerar oavsett sökväg (t.ex. GitHub Pages /megamemory/)
export default defineConfig({
    base: './',
    logLevel: 'warn',
    build: {
        rollupOptions: {
            output: {
                manualChunks: { phaser: ['phaser'] }
            }
        },
        chunkSizeWarningLimit: 1600,   // Phaser är stort – det är helt okej
        minify: 'terser',
        terserOptions: {
            compress: { passes: 2 },
            mangle: true,
            format: { comments: false }
        }
    },
    server: { port: 8080 },
    preview: { port: 8080 }
});
