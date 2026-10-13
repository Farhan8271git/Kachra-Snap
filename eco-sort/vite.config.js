import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@tensorflow/tfjs-backend-webgl') || id.includes('node_modules/@tensorflow/tfjs')) {
            return 'tensorflow';
          }
          if (id.includes('node_modules/@tensorflow-models/coco-ssd')) {
            return 'coco-ssd';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
})
