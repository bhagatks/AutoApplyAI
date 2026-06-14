import { getChromeLocal, setChromeLocal } from './storage';
import { DEFAULT_OUTPUT_DIR } from './downloads';
import type { CustomerConfig } from './types';

/** Display label for the legacy output folder field (chrome.storage.local). */
export const OUTPUT_DIR_LABEL_KEY = 'output_dir_label';

export type OutputDirectorySelection = {
  label: string;
  handle: null;
};

export function isSidePanelContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('sidepanel');
}

/** Downloads-based export no longer uses a persisted directory handle. */
export async function loadOutputDirectorySelection(): Promise<OutputDirectorySelection> {
  const local = await getChromeLocal([OUTPUT_DIR_LABEL_KEY]);
  const fromLabel =
    typeof local[OUTPUT_DIR_LABEL_KEY] === 'string'
      ? (local[OUTPUT_DIR_LABEL_KEY] as string).trim()
      : '';

  return { label: fromLabel || DEFAULT_OUTPUT_DIR, handle: null };
}

export async function commitOutputDirectorySelection(
  _handle: unknown,
  label?: string
): Promise<string> {
  const resolvedLabel = (label || DEFAULT_OUTPUT_DIR).trim() || DEFAULT_OUTPUT_DIR;

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
  | { ok: false; reason: 'unsupported' };

export async function pickOutputDirectory(): Promise<PickOutputDirectoryResult> {
  return { ok: false, reason: 'unsupported' };
}

export function pickOutputDirectoryFailureMessage(
  reason: PickOutputDirectoryResult['reason']
): string | null {
  if (reason === 'unsupported') {
    return 'Folder picking is no longer required. Files save to Downloads/AutoApplyAI automatically.';
  }
  return null;
}

export const OUTPUT_DIR_PICKED_ACTION = 'OUTPUT_DIR_PICKED';

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

export function notifyOutputDirPicked(name: string): void {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
  chrome.runtime.sendMessage({ action: OUTPUT_DIR_PICKED_ACTION, name }).catch(() => {});
}
