import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TimeSimProvider } from './context/TimeSimContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TimeSimProvider>
        <App />
      </TimeSimProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register Service Worker for offline PWA companion
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('ASGARD\'CO 26 ServiceWorker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  });
}
