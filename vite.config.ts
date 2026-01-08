import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configure public directory for static assets (videos, audios, images)
  publicDir: 'public',
  // Ensure proper asset handling
  assetsInclude: ['**/*.mp4', '**/*.mp3', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  build: {
    // Optimize for Cloudflare Pages
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
