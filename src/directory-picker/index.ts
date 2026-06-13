import { saveOutputDirHandle } from '../shared/artifacts';
import {
  notifyOutputDirPicked,
  requestDirectoryHandle,
  directoryPickerFailureMessage,
} from '../shared/directory-picker';
import { ensureDirectoryWriteAccess } from '../shared/resume-extract';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

root.innerHTML = `
  <main class="picker-shell">
    <h1>Choose output folder</h1>
    <p>Select where AutoApplyAI should save tailored resumes and cover letters.</p>
    <button type="button" id="pick-btn" class="pick-btn">Choose folder…</button>
    <p id="status" class="status" aria-live="polite"></p>
  </main>
`;

const style = document.createElement('style');
style.textContent = `
  :root {
    color-scheme: light dark;
    font-family: Inter, system-ui, sans-serif;
    --brand: #6366f1;
    --text: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --surface: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --text: #f9fafb;
      --muted: #9ca3af;
      --border: #374151;
      --surface: #111827;
    }
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--surface);
    color: var(--text);
  }
  .picker-shell {
    width: min(420px, calc(100vw - 32px));
    padding: 32px 28px;
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
    text-align: center;
  }
  h1 {
    margin: 0 0 8px;
    font-size: 1.35rem;
  }
  p {
    margin: 0 0 20px;
    color: var(--muted);
    line-height: 1.5;
    font-size: 0.95rem;
  }
  .pick-btn {
    appearance: none;
    border: none;
    border-radius: 10px;
    background: var(--brand);
    color: white;
    font: inherit;
    font-weight: 600;
    padding: 12px 20px;
    cursor: pointer;
  }
  .pick-btn:disabled {
    opacity: 0.65;
    cursor: wait;
  }
  .status {
    min-height: 1.25rem;
    margin: 16px 0 0;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .status.success { color: #059669; }
  .status.error { color: #dc2626; }
`;
document.head.appendChild(style);

const pickBtn = document.getElementById('pick-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLParagraphElement;

function setStatus(text: string, tone: 'default' | 'success' | 'error' = 'default') {
  statusEl.textContent = text;
  statusEl.className = `status${tone === 'default' ? '' : ` ${tone}`}`;
}

async function pickFolder() {
  pickBtn.disabled = true;
  setStatus('Waiting for folder selection…');

  const result = await requestDirectoryHandle();
  if (!result.ok) {
    const message = directoryPickerFailureMessage(result.reason);
    if (message) setStatus(message, 'error');
    else setStatus('');
    pickBtn.disabled = false;
    return;
  }

  const granted = await ensureDirectoryWriteAccess(result.handle);
  if (!granted) {
    setStatus('Write access is required. Choose the folder again and allow access.', 'error');
    pickBtn.disabled = false;
    return;
  }

  await saveOutputDirHandle(result.handle);
  notifyOutputDirPicked(result.name);
  setStatus(`Saved "${result.name}". You can close this tab.`, 'success');
  pickBtn.disabled = false;

  window.setTimeout(() => {
    window.close();
  }, 1200);
}

pickBtn.addEventListener('click', () => {
  void pickFolder();
});

pickBtn.focus();
