import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), viteTsconfigPaths()],
    build: {
        chunkSizeWarningLimit: 1024,
        rollupOptions: {
            output: {
                manualChunks: {
                    cloudscape: ['@cloudscape-design/components']
                },
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://rcon1.1-fjg.de/',
                changeOrigin: true,
            },
        }
    }
});
