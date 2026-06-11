import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../sidepanel/style.css';

// Gracefully handle uncaught promise rejections, specifically Firebase offline/network errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (
    reason &&
    (reason.name === 'FirebaseError' ||
      (reason.message &&
        (reason.message.toLowerCase().includes('offline') ||
          reason.message.toLowerCase().includes('network') ||
          reason.message.toLowerCase().includes('auth/internal-error'))))
  ) {
    console.warn('Handled offline/network promise rejection gracefully:', reason.message || reason);
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

