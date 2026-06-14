/** Chrome extension side panels cannot reliably open the native directory picker. */
export const OUTPUT_DIR_PICKED_ACTION = 'OUTPUT_DIR_PICKED';
/** Side panel delegates picking to the active tab's content script. */
export const OPEN_NATIVE_DIRECTORY_PICKER = 'OPEN_NATIVE_DIRECTORY_PICKER';

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

export type NativeDirectoryPickerBridgeFailureReason =
  | DirectoryPickerFailureReason
  | 'no_tab'
  | 'unsupported_tab'
  | 'no_listener';

export type NativeDirectoryPickerBridgeResult =
  | { ok: true; handle: FileSystemDirectoryHandle; name: string }
  | { ok: false; reason: NativeDirectoryPickerBridgeFailureReason };

function isNativePickerHostTab(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

async function injectContentScript(tabId: number): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.scripting?.executeScript) {
    throw new Error('Content script injection is unavailable.');
  }
  await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
}

/**
 * Ask the active tab's top-frame content script to run showDirectoryPicker.
 * The handle is returned to the caller (extension origin) for IndexedDB persistence.
 */
export async function requestNativeDirectoryPickerViaActiveTab(): Promise<NativeDirectoryPickerBridgeResult> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query || !chrome.tabs.sendMessage) {
    return { ok: false, reason: 'unsupported' };
  }

  let tab: chrome.tabs.Tab | undefined;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = tabs[0];
  } catch (err) {
    console.warn('Could not query the active tab for directory picking:', err);
    return { ok: false, reason: 'no_tab' };
  }

  const tabId = tab?.id;
  if (tabId == null) return { ok: false, reason: 'no_tab' };
  if (!isNativePickerHostTab(tab.url)) return { ok: false, reason: 'unsupported_tab' };

  const sendPickerRequest = (): Promise<{
    success?: boolean;
    folderName?: string | null;
    handle?: FileSystemDirectoryHandle;
    reason?: DirectoryPickerFailureReason;
  } | undefined> =>
    new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: OPEN_NATIVE_DIRECTORY_PICKER }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(undefined);
          return;
        }
        resolve(response);
      });
    });

  let response = await sendPickerRequest();
  if (!response) {
    try {
      await injectContentScript(tabId);
      await new Promise((resolve) => setTimeout(resolve, 200));
      response = await sendPickerRequest();
    } catch (err) {
      console.warn('Could not inject content script for directory picking:', err);
      return { ok: false, reason: 'no_listener' };
    }
  }

  if (!response) return { ok: false, reason: 'no_listener' };

  if (response.success && response.handle && response.folderName?.trim()) {
    return { ok: true, handle: response.handle, name: response.folderName.trim() };
  }

  if (response.reason === 'cancelled' || response.reason === 'denied') {
    return { ok: false, reason: response.reason };
  }

  return { ok: false, reason: 'unsupported' };
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
