import { useEffect, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  CoreSkillCatalog,
  getBundledCoreSkillCatalog,
  getSkillSuggestions,
  hasExactSkillMatch,
  isSkillAlreadySelected,
} from '../../shared/skill-catalog';

const SUGGESTION_LIMIT = 24;

interface SkillAddPickerProps {
  disabled: boolean;
  selectedTitles: string[];
  onAdd: (title: string) => void;
}

export default function SkillAddPicker({ disabled, selectedTitles, onAdd }: SkillAddPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog] = useState<CoreSkillCatalog>(() => getBundledCoreSkillCatalog());
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
  const suggestions = getSkillSuggestions(catalog, query, SUGGESTION_LIMIT, null, selectedTitles);

  const showCustomAdd =
    !!trimmed &&
    !isSkillAlreadySelected(selectedTitles, trimmed) &&
    !hasExactSkillMatch(catalog, trimmed);

  const handleSelect = (title: string) => {
    if (disabled || isSkillAlreadySelected(selectedTitles, title)) return;
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
        className="btn"
        disabled={disabled}
        onClick={handleToggle}
        style={{ fontSize: '0.78rem' }}
        aria-expanded={open}
      >
        <Plus size={14} style={{ marginRight: 4 }} /> Add skill
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            border: '1px solid var(--panel-border)',
            borderRadius: 8,
            background: 'var(--panel-bg, #172033)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
            <Search size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="form-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  setQuery('');
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (showCustomAdd) handleSelect(trimmed);
                  else if (suggestions[0]) handleSelect(suggestions[0].title);
                }
              }}
              placeholder="Search technical skills..."
              style={{ border: 'none', boxShadow: 'none', padding: '4px 0', fontSize: '0.82rem' }}
            />
          </div>

          <div role="listbox" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {suggestions.length === 0 && !showCustomAdd && (
              <div style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {trimmed ? 'No matching skills.' : 'Type to search the catalog.'}
              </div>
            )}

            {suggestions.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="option"
                onClick={() => handleSelect(entry.title)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontWeight: 600 }}>{entry.title}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: '0.72rem' }}>
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
                  gap: 6,
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderTop: suggestions.length ? '1px solid var(--panel-border)' : 'none',
                  background: 'rgba(37, 99, 235, 0.08)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--brand-color)',
                  fontWeight: 600,
                }}
              >
                <Plus size={14} />
                Add &ldquo;{trimmed}&rdquo;
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
            {trimmed
              ? `${suggestions.length} match${suggestions.length === 1 ? '' : 'es'} from catalog`
              : `${catalog.entries.length} skills in catalog — type to search`}
          </div>
        </div>
      )}
    </div>
  );
}
