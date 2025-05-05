// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ 정적 파일 경로 기준
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://apple2ne1-node:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
