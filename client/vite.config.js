import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // 📦 .env 파일 로드 (mode: development / production 등)
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    base: './', //   ✅ 상대경로 유지 <==  절대 경로로 변경 : 선택 새로운 화면 이 랜더링 안되어서
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
