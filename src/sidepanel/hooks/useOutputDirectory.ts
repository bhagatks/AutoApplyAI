import { useCallback, useEffect, useRef, useState } from 'react';
import {
  commitOutputDirectorySelection,
  loadOutputDirectorySelection,
  pickOutputDirectory,
  pickOutputDirectoryFailureMessage,
  subscribeOutputDirectoryPicked,
} from '../../shared/output-directory';

export function useOutputDirectory() {
  const [label, setLabel] = useState('');
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const pickingRef = useRef(false);

  const refresh = useCallback(async () => {
    const selection = await loadOutputDirectorySelection();
    setLabel(selection.label);
    setHandle(selection.handle);
    setIsReady(true);
    return selection;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadOutputDirectorySelection().then((selection) => {
      if (cancelled) return;
      setLabel(selection.label);
      setHandle(selection.handle);
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeOutputDirectoryPicked(() => {
    void refresh();
  }), [refresh]);

  const pick = useCallback(async (): Promise<string | null> => {
    if (pickingRef.current) return null;
    pickingRef.current = true;
    setIsPicking(true);

    try {
      const result = await pickOutputDirectory();
      if (result.ok) {
        setLabel(result.label);
        setHandle(result.handle);
        return result.label;
      }

      if (result.reason === 'picker_tab') {
        return null;
      }

      if (result.reason === 'cancelled') {
        await refresh();
        return null;
      }

      const message = pickOutputDirectoryFailureMessage(result.reason);
      if (message) {
        await refresh();
        throw new Error(message);
      }
      await refresh();
      return null;
    } finally {
      pickingRef.current = false;
      setIsPicking(false);
    }
  }, [refresh]);

  const ensureHandle = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    if (handle) return handle;
    const selection = await loadOutputDirectorySelection();
    setLabel(selection.label);
    setHandle(selection.handle);
    return selection.handle;
  }, [handle]);

  return {
    label,
    handle,
    isReady,
    isPicking,
    pick,
    refresh,
    ensureHandle,
    setSelection: useCallback(async (nextHandle: FileSystemDirectoryHandle, nextLabel?: string) => {
      const resolvedLabel = await commitOutputDirectorySelection(nextHandle, nextLabel);
      setLabel(resolvedLabel);
      setHandle(nextHandle);
      return resolvedLabel;
    }, []),
  };
}
