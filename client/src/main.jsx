import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('❌ root 엘리먼트를 찾을 수 없습니다.');
}
