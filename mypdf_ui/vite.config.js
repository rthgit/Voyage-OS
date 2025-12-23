import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3007,
        proxy: {
            '/api': 'http://localhost:3006',
            '/exports': 'http://localhost:3006',
            '/sse': 'http://localhost:3006'
        }
    }
})
