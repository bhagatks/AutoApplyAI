import { Folder } from 'lucide-react';
import {
  fieldControlClass,
  fieldGroupClass,
  fieldLabelStyle,
  type OnboardingFieldKey,
} from './onboarding-validation';

type OutputDirectoryFieldProps = {
  label: string;
  isPicking: boolean;
  invalidFields: Set<OnboardingFieldKey> | null;
  onPick: () => void | Promise<void>;
  onClearInvalid: () => void;
};

export default function OutputDirectoryField({
  label,
  isPicking,
  invalidFields,
  onPick,
  onClearInvalid,
}: OutputDirectoryFieldProps) {
  const handlePick = () => {
    onClearInvalid();
    void onPick();
  };

  return (
    <div className={fieldGroupClass(invalidFields, 'outputDir')} data-field-key="outputDir">
      <label
        style={fieldLabelStyle(invalidFields, 'outputDir', {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
        })}
      >
        <Folder size={12} style={{ color: 'var(--brand-color)' }} /> Output Directory *
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div
          role="button"
          tabIndex={0}
          className={fieldControlClass(invalidFields, 'outputDir')}
          data-field-key="outputDir"
          onClick={handlePick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePick();
            }
          }}
          style={{
            flex: 1,
            cursor: isPicking ? 'wait' : 'pointer',
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            color: label ? 'var(--text-primary)' : 'var(--text-muted)',
            userSelect: 'none',
          }}
          aria-label="Output directory"
        >
          {label || 'Select local target directory...'}
        </div>
        <button
          type="button"
          className="btn"
          disabled={isPicking}
          onClick={handlePick}
          style={{ padding: '0 12px', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
        >
          {isPicking ? 'Opening…' : 'Choose...'}
        </button>
      </div>
      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4, display: 'block' }}>
        Select where tailored resumes will be saved
      </small>
    </div>
  );
}
