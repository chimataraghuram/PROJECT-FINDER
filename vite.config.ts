import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    base: './', // Ensure relative paths for correct asset loading on GitHub Pages
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.SEARCH_API_KEY || env.GEMINI_API_KEY),
      'process.env.SEARCH_API_KEY': JSON.stringify(env.SEARCH_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
