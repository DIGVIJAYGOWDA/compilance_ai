import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.jsx', '.js', '.json'],
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['tesseract.js'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
