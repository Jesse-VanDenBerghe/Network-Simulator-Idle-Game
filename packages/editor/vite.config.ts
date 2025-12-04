import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@network-simulator/shared': path.resolve(__dirname, '../shared/src')
    }
  },
  root: '.',
  publicDir: 'public',
  server: {
    port: 3001
  },
  build: {
    outDir: '../../dist-editor',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue']
        }
      }
    }
  }
})
