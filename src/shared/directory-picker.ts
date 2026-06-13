/** Chrome extension side panels cannot reliably open the native directory picker. */
export const OUTPUT_DIR_PICKED_ACTION = 'OUTPUT_DIR_PICKED';

const DIRECTORY_PICKER_PAGE = 'directory-picker.html';

export type DirectoryPickerFailureReason = 'cancelled' | 'denied' | 'unsupported';

export type DirectoryPickerResult =
  | { ok: true; handle: FileSystemDirectoryHandle; name: string }
  | { ok: false; reason: DirectoryPickerFailureReason };

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
};

export function isDirectoryPickerApiAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as DirectoryPickerWindow).showDirectoryPicker === 'function';
}

export async function requestDirectoryHandle(): Promise<DirectoryPickerResult> {
  if (!isDirectoryPickerApiAvailable()) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const handle = await (window as DirectoryPickerWindow).showDirectoryPicker!({ mode: 'readwrite' });
    if (!handle?.name) return { ok: false, reason: 'cancelled' };
    return { ok: true, handle, name: handle.name };
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'AbortError') return { ok: false, reason: 'cancelled' };
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        return { ok: false, reason: 'denied' };
      }
    }
    console.warn('Directory picker failed:', err);
    return { ok: false, reason: 'unsupported' };
  }
}

/** Last-resort fallback page when the native picker API is unavailable in this context. */
export async function openDirectoryPickerTab(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.getURL || !chrome.tabs) {
    console.warn('Directory picker tab is unavailable outside the extension.');
    return;
  }

  const targetUrl = chrome.runtime.getURL(DIRECTORY_PICKER_PAGE);
  const matchPattern = chrome.runtime.getURL(`${DIRECTORY_PICKER_PAGE}*`);

  try {
    const existing = await chrome.tabs.query({ url: matchPattern });
    if (existing.length > 0 && existing[0].id != null) {
      const tab = existing[0];
      await chrome.tabs.update(tab.id!, { active: true, url: targetUrl });
      if (tab.windowId != null) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      return;
    }
  } catch (err) {
    console.warn('Could not query directory picker tabs:', err);
  }

  await chrome.tabs.create({ url: targetUrl });
}

export function notifyOutputDirPicked(name: string): void {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
  chrome.runtime.sendMessage({ action: OUTPUT_DIR_PICKED_ACTION, name }).catch(() => {
    // Side panel may not be mounted yet; the saved handle is still in IndexedDB.
  });
}

export function directoryPickerFailureMessage(reason: DirectoryPickerFailureReason): string | null {
  switch (reason) {
    case 'cancelled':
      return null;
    case 'denied':
      return 'Folder access was blocked. Click Choose again and allow access in the system dialog.';
    case 'unsupported':
      return 'Use the picker tab that opened — click "Choose folder…" there.';
    default:
      return null;
  }
}
