import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { initSentry } from '../shared/sentry';
import { ErrorBoundary } from '@sentry/react';

initSentry('sidepanel');

document.documentElement.classList.add('sidepanel-root');
document.body.classList.add('sidepanel-root');

// Long-lived port — background detects disconnect when the sidepanel closes.
if (typeof chrome !== 'undefined' && chrome.runtime?.connect) {
  const sidepanelPort = chrome.runtime.connect({ name: 'autoapplyai-sidepanel' });

  const announceReady = () => {
    if (!chrome.tabs?.query) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sidepanelPort.postMessage({
        action: 'SIDEPANEL_READY',
        tabId: tabs[0]?.id,
      });
    });
  };

  announceReady();
}

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
  <ErrorBoundary fallback={<p>Something went wrong. Reload the extension.</p>}>
    <App />
  </ErrorBoundary>
);
