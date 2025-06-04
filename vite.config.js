import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        outDir: 'public/build',
        manifest: "manifest.json",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                app: 'resources/js/app.jsx',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),  // Define el alias '@'
        },
    },
    optimizeDeps: {
        include: ['@pqina/flip'],
    },
});
