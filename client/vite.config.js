import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // 📦 .env 파일 로드 (mode: development / production 등)
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    base: './', // ✅ 상대 경로로 수정 → React 빌드 후 Express, Nginx에서 문제 없이 작동
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 선택: @로 src 접근
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
