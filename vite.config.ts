import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index-vite.html')
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
