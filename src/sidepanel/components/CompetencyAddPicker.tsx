import { useEffect, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  CoreCompetencyCatalog,
  getBundledCoreCompetencyCatalog,
  getCompetencySuggestions,
  hasExactCompetencyMatch,
  isCompetencyAlreadySelected,
} from '../../shared/competency-catalog';

const SUGGESTION_LIMIT = 24;

interface CompetencyAddPickerProps {
  disabled: boolean;
  selectedTitles: string[];
  onAdd: (title: string) => void;
}

export default function CompetencyAddPicker({
  disabled,
  selectedTitles,
  onAdd,
}: CompetencyAddPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog] = useState<CoreCompetencyCatalog>(() => getBundledCoreCompetencyCatalog());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const trimmed = query.trim();
  const suggestions = getCompetencySuggestions(catalog, query, SUGGESTION_LIMIT, null, selectedTitles);

  const showCustomAdd =
    !!trimmed &&
    !isCompetencyAlreadySelected(selectedTitles, trimmed) &&
    !hasExactCompetencyMatch(catalog, trimmed);

  const handleSelect = (title: string) => {
    if (disabled || isCompetencyAlreadySelected(selectedTitles, title)) return;
    onAdd(title);
    setQuery('');
    setOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setQuery('');
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', alignSelf: 'flex-start', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          borderRadius: 8,
          border: '1px dashed var(--panel-border)',
          background: 'transparent',
          color: disabled ? 'var(--text-muted)' : 'var(--accent)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Plus size={14} />
        Add competency
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderBottom: '1px solid var(--panel-border)',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search competencies…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {suggestions.length === 0 && !showCustomAdd && (
              <div style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {trimmed ? 'No matches. Add a custom competency below.' : 'Type to search the catalog.'}
              </div>
            )}

            {suggestions.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelect(entry.title)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.04))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontWeight: 600 }}>{entry.title}</span>
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {entry.category}
                </span>
              </button>
            ))}

            {showCustomAdd && (
              <button
                type="button"
                onClick={() => handleSelect(trimmed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 'none',
                  borderTop: suggestions.length ? '1px solid var(--panel-border)' : 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}
              >
                <Plus size={14} />
                Add custom: &quot;{trimmed}&quot;
              </button>
            )}
          </div>

          <div
            style={{
              padding: '6px 12px',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--panel-border)',
            }}
          >
            {catalog.entries.length} competencies in catalog
          </div>
        </div>
      )}
    </div>
  );
}
