import { useEffect, useState, type CSSProperties } from 'react';
import { MessageSquareWarning, X } from 'lucide-react';
import {
  SUPPORT_REPORT_CATEGORIES,
  SupportReportCategory,
  SupportReportContext,
  SupportReportScreen,
  checkSupportReportReady,
  fetchSupportReportContext,
  submitSupportReport,
} from '../../shared/support-report';

const MIN_DETAILS_LENGTH = 10;

interface ReportProblemModalProps {
  userId: string;
  userEmail?: string;
  screen: SupportReportScreen;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ReportProblemModal({
  userId,
  userEmail,
  screen,
  onClose,
  showToast,
}: ReportProblemModalProps) {
  const [category, setCategory] = useState<SupportReportCategory>(SUPPORT_REPORT_CATEGORIES[0]);
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [context, setContext] = useState<SupportReportContext>(() => ({
    tabUrl: '',
    extensionVersion: typeof chrome !== 'undefined' ? chrome.runtime.getManifest?.()?.version || '' : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  }));
  const [loadingTabUrl, setLoadingTabUrl] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setCheckingConfig(true);
      const readyState = await checkSupportReportReady(userId);
      if (cancelled) return;
      setConfigError(readyState.ready ? null : readyState.error || 'Support email is not configured.');
      setCheckingConfig(false);
    })();

    void (async () => {
      setLoadingTabUrl(true);
      const nextContext = await fetchSupportReportContext();
      if (cancelled) return;
      setContext(nextContext);
      if (nextContext.tabUrl) setUrl(nextContext.tabUrl);
      setLoadingTabUrl(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const detailsLength = details.trim().length;
  const detailsValid = detailsLength >= MIN_DETAILS_LENGTH;
  const detailsRemaining = Math.max(MIN_DETAILS_LENGTH - detailsLength, 0);
  const canSubmit = detailsValid && !submitting && !checkingConfig && !configError;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const { mailId, subject } = await submitSupportReport(
        userId,
        {
          category,
          url,
          details,
          includeDiagnostics,
          screen,
          userEmail,
        },
        context
      );
      showToast(`Report sent (mail/${mailId}). Subject: ${subject}`, 'success');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit report.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="report-modal-content">
        <div className="report-modal-header">
          <div className="report-modal-title-row">
            <MessageSquareWarning size={18} style={{ color: 'var(--brand-color)' }} />
            <h3 id="report-modal-title">Report a problem</h3>
          </div>
          <button type="button" onClick={onClose} className="report-modal-close" title="Close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="report-modal-body">
          {checkingConfig ? (
            <p className="report-modal-status">Checking support configuration…</p>
          ) : configError ? (
            <p className="report-modal-status report-modal-status-error">{configError}</p>
          ) : null}

          <div className="form-group">
            <label htmlFor="report-category">Category</label>
            <select
              id="report-category"
              className="report-modal-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportReportCategory)}
            >
              {SUPPORT_REPORT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="report-url">Page URL (optional)</label>
            <input
              id="report-url"
              type="url"
              className="report-modal-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={loadingTabUrl ? 'Loading active tab…' : 'https://…'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="report-details">
              Details <span className="report-modal-required">(required — at least {MIN_DETAILS_LENGTH} characters)</span>
            </label>
            <textarea
              id="report-details"
              className={`report-modal-textarea ${detailsLength > 0 && !detailsValid ? 'report-modal-textarea-invalid' : ''}`}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what you were doing and what went wrong. We need a few words so we can help."
              rows={5}
              aria-describedby="report-details-hint"
            />
            <p
              id="report-details-hint"
              className={`report-modal-hint ${detailsValid ? 'report-modal-hint-valid' : 'report-modal-hint-warning'}`}
            >
              {detailsValid
                ? `Ready to submit (${detailsLength} characters).`
                : `Add ${detailsRemaining} more character${detailsRemaining === 1 ? '' : 's'} to enable Submit (${detailsLength}/${MIN_DETAILS_LENGTH}).`}
            </p>
          </div>

          <label className="report-modal-checkbox">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(e) => setIncludeDiagnostics(e.target.checked)}
            />
            <span>Include basic diagnostics (extension version, browser user agent)</span>
          </label>
        </div>

        <div className="report-modal-footer">
          {!canSubmit && !submitting && !checkingConfig && (
            <p className="report-modal-footer-hint">
              {configError
                ? 'Submit is unavailable until support configuration loads.'
                : !detailsValid
                  ? `Please enter at least ${MIN_DETAILS_LENGTH} characters in Details to submit your report.`
                  : null}
            </p>
          )}
          <div className="report-modal-footer-actions">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void handleSubmit()} disabled={!canSubmit}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportProblemIconButton({
  onClick,
  title = 'Report a problem',
  className = 'btn',
  style,
}: {
  onClick: () => void;
  title?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={onClick} className={className} style={style} title={title} aria-label={title}>
      <MessageSquareWarning size={18} />
    </button>
  );
}
