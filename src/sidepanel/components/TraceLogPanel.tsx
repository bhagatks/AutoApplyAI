import { useCallback, useEffect, useState } from 'react';
import {
  clearTraceLogs,
  formatTraceLine,
  loadTraceLogs,
  TRACE_BROADCAST_ACTION,
  TraceEntry,
} from '../../shared/trace-logger';

interface TraceLogPanelProps {
  maxHeight?: number;
  defaultOpen?: boolean;
  filter?: string;
}

export default function TraceLogPanel({ maxHeight = 220, defaultOpen = false, filter }: TraceLogPanelProps) {
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [open, setOpen] = useState(defaultOpen);

  const refresh = useCallback(async () => {
    const logs = await loadTraceLogs();
    setEntries(logs);
  }, []);

  useEffect(() => {
    void refresh();
    const onMessage = (msg: { action?: string; entry?: TraceEntry }) => {
      if (msg.action === TRACE_BROADCAST_ACTION && msg.entry) {
        setEntries((prev) => [...prev.slice(-499), msg.entry!]);
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    const interval = setInterval(refresh, 5000);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      clearInterval(interval);
    };
  }, [refresh]);

  const filtered = entries.filter((e) => {
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    if (filter && !formatTraceLine(e).toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const categories = ['ALL', 'AI', 'LOCAL', 'FIRESTORE', 'PIPELINE', 'TAILOR', 'RESUME', 'AUTH', 'MSG', 'QUEUE'];

  return (
    <div style={{ marginTop: 8, textAlign: 'left' }}>
      <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
        <summary
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: 600,
          }}
        >
          Trace Logs ({filtered.length}/{entries.length})
        </summary>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: '0.65rem', padding: '2px 4px', borderRadius: 4 }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void refresh()}
            style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              void clearTraceLogs().then(refresh);
            }}
            style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
        <div
          style={{
            marginTop: 8,
            maxHeight,
            overflowY: 'auto',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: 6,
            padding: 10,
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#334155',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          {filtered.length === 0
            ? 'No trace logs yet. Tailor a job, scan a resume, or sign in to populate.'
            : filtered.map((e) => formatTraceLine(e)).join('\n')}
        </div>
      </details>
    </div>
  );
}
