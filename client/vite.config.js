import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        // This forces Vite to look closely at dependencies
        dedupe: ['@studio-freight/react-lenis'],
    },
    optimizeDeps: {
        include: ['@studio-freight/react-lenis'],
    },
    build: {
        // This helps debug if chunks are failing
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
})