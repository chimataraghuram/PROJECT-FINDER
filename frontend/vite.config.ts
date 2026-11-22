import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const copy404Plugin = (): Plugin => ({
  name: 'copy-404-html',
  closeBundle() {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    const notFoundPath = path.join(distDir, '404.html');
    if (fs.existsSync(indexPath)) {
      fs.copyFileSync(indexPath, notFoundPath);
    }
  }
});

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // SPA fallback: serve index.html for ALL unmatched routes so React handles 404s
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    base: '/PROJECT-FINDER/', // Ensure absolute paths for correct asset loading on GitHub Pages
    plugins: [react(), copy404Plugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('node_modules/framer-motion')) return 'motion-vendor';
            if (id.includes('node_modules/firebase')) return 'firebase-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
