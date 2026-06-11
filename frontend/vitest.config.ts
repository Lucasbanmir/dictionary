import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    server: {
      deps: {
        inline: ['@mui/material', '@mui/icons-material', 'react-transition-group'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-transition-group/TransitionGroupContext': 'react-transition-group/cjs/TransitionGroupContext.js',
    },
  },
});
