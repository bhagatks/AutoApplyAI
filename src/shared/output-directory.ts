import { loadOutputDirHandle, saveOutputDirHandle } from './artifacts';
import {
  directoryPickerFailureMessage,
  notifyOutputDirPicked,
  openDirectoryPickerTab,
  OUTPUT_DIR_PICKED_ACTION,
  requestDirectoryHandle,
  requestNativeDirectoryPickerViaActiveTab,
} from './directory-picker';
import { ensureDirectoryWriteAccess } from './resume-extract';
import { getChromeLocal, setChromeLocal } from './storage';
import type { CustomerConfig } from './types';

/** Display label for the picked output folder (chrome.storage.local). */
export const OUTPUT_DIR_LABEL_KEY = 'output_dir_label';

export type OutputDirectorySelection = {
  label: string;
  handle: FileSystemDirectoryHandle | null;
};

export function isSidePanelContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('sidepanel');
}

/** IndexedDB handle name is authoritative; never prefer stale customer_config labels. */
export async function loadOutputDirectorySelection(): Promise<OutputDirectorySelection> {
  const handle = await loadOutputDirHandle();
  if (handle?.name?.trim()) {
    return { label: handle.name.trim(), handle };
  }

  const local = await getChromeLocal([OUTPUT_DIR_LABEL_KEY]);
  const fromLabel =
    typeof local[OUTPUT_DIR_LABEL_KEY] === 'string'
      ? (local[OUTPUT_DIR_LABEL_KEY] as string).trim()
      : '';

  return { label: fromLabel, handle };
}

export async function commitOutputDirectorySelection(
  handle: FileSystemDirectoryHandle,
  label?: string
): Promise<string> {
  const resolvedLabel = (label || handle.name || '').trim();
  if (!resolvedLabel) {
    throw new Error('Selected folder is missing a name. Choose a different folder.');
  }

  const granted = await ensureDirectoryWriteAccess(handle);
  if (!granted) {
    throw new Error('Write access to the folder is required. Allow access and try again.');
  }

  await saveOutputDirHandle(handle);
  await setChromeLocal({ [OUTPUT_DIR_LABEL_KEY]: resolvedLabel });

  const local = await getChromeLocal(['customer_config']);
  const config = local.customer_config as CustomerConfig | undefined;
  if (config && config.outputDir !== resolvedLabel) {
    await setChromeLocal({
      customer_config: { ...config, outputDir: resolvedLabel },
    });
  }

  return resolvedLabel;
}

export type PickOutputDirectoryResult =
  | { ok: true; label: string; handle: FileSystemDirectoryHandle }
  | { ok: false; reason: 'cancelled' | 'denied' | 'unsupported' | 'picker_tab' | 'no_tab' | 'unsupported_tab' };

/**
 * Pick an output folder. Side panels delegate to the active tab's content script
 * (native OS picker). Falls back to directory-picker.html when the bridge is unavailable.
 */
export async function pickOutputDirectory(): Promise<PickOutputDirectoryResult> {
  if (isSidePanelContext()) {
    const bridgeResult = await requestNativeDirectoryPickerViaActiveTab();
    if (bridgeResult.ok) {
      try {
        const label = await commitOutputDirectorySelection(bridgeResult.handle, bridgeResult.name);
        notifyOutputDirPicked(label);
        return { ok: true, label, handle: bridgeResult.handle };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not save the selected folder.';
        throw new Error(message);
      }
    }

    if (bridgeResult.reason === 'cancelled' || bridgeResult.reason === 'denied') {
      return { ok: false, reason: bridgeResult.reason };
    }

    if (
      bridgeResult.reason === 'no_tab' ||
      bridgeResult.reason === 'unsupported_tab' ||
      bridgeResult.reason === 'no_listener' ||
      bridgeResult.reason === 'unsupported'
    ) {
      await openDirectoryPickerTab();
      return { ok: false, reason: 'picker_tab' };
    }

    return { ok: false, reason: 'unsupported' };
  }

  const result = await requestDirectoryHandle();
  if (!result.ok) {
    if (result.reason === 'unsupported') {
      await openDirectoryPickerTab();
      return { ok: false, reason: 'picker_tab' };
    }
    return { ok: false, reason: result.reason };
  }

  try {
    const label = await commitOutputDirectorySelection(result.handle, result.name);
    notifyOutputDirPicked(label);
    return { ok: true, label, handle: result.handle };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save the selected folder.';
    throw new Error(message);
  }
}

export function pickOutputDirectoryFailureMessage(
  reason: Exclude<PickOutputDirectoryResult, { ok: true }>['reason']
): string | null {
  if (reason === 'picker_tab') {
    return 'Choose a folder in the picker tab, then return here.';
  }
  if (reason === 'no_tab') {
    return 'Open a job page in the active tab, then choose your output folder again.';
  }
  if (reason === 'unsupported_tab') {
    return 'Switch to a normal web page tab (not a Chrome settings or extension page), then try again.';
  }
  if (reason === 'cancelled' || reason === 'denied' || reason === 'unsupported') {
    return directoryPickerFailureMessage(reason);
  }
  return null;
}

export function subscribeOutputDirectoryPicked(
  onPicked: (label: string) => void
): () => void {
  if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) {
    return () => {};
  }

  const onMessage = (message: { action?: string; name?: string }) => {
    if (message.action !== OUTPUT_DIR_PICKED_ACTION || !message.name?.trim()) return;
    onPicked(message.name.trim());
  };

  chrome.runtime.onMessage.addListener(onMessage);
  return () => chrome.runtime.onMessage.removeListener(onMessage);
}
