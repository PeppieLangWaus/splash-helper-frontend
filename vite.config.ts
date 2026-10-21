import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devtoolsJson from 'vite-plugin-devtools-json';
import { fileURLToPath } from 'url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devtoolsJson(),
  ],
  css: {
    devSourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
