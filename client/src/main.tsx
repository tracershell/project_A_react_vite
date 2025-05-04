import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');
console.log('✅ root 엘리먼트:', rootEl);

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('❌ root 엘리먼트가 없습니다!');
}