import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';

import { AuthProvider } from './context/AuthContext'; // ✅ AuthContext 추가

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>  {/* ✅ Provider로 App을 감쌈 */}
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('❌ root 엘리먼트를 찾을 수 없습니다.');
}
