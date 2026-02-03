import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'gemini': ['@google/genai'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api/telegram': {
        target: 'https://api.telegram.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/telegram/, '')
      }
    }
  }
});
