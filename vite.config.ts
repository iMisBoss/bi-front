import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
    plugins: [vue()],
    base: '/',
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    server: {
        port: 8088,
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        proxy: {
            '/x_organization_assemble_surface': {
                target: 'http://localhost:20080',
                changeOrigin: true,
                secure: false,
                ws: true
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'static',
        sourcemap: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
})
