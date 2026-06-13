import { Job } from './types';
import { formatFitDisplay, buildGapChecklist, getMatchScore } from './resume-engine/fit-bands';

interface JobFitPanelProps {
  job: Pick<Job, 'jobTitle' | 'companyName' | 'keywords' | 'analysis' | 'matchAnalysis' | 'atsScore' | 'matchScore' | 'layoutDecision'>;
  staleProfileWarning?: boolean;
  staleJdWarning?: boolean;
}

export function JobFitPanel({ job, staleProfileWarning, staleJdWarning }: JobFitPanelProps) {
  const score = getMatchScore(job);
  const fit = formatFitDisplay(score);
  const analysis = job.matchAnalysis || job.analysis || '';
  const gaps = buildGapChecklist(job.keywords, analysis);

  return (
    <div>
      {(staleProfileWarning || staleJdWarning) && (
        <div
          className="detail-card"
          style={{
            marginBottom: 12,
            borderColor: 'rgba(255, 193, 7, 0.4)',
            background: 'rgba(255, 193, 7, 0.08)',
          }}
        >
          {staleProfileWarning && (
            <p style={{ fontSize: '0.82rem', margin: 0 }}>
              <strong>Re-tailor recommended</strong> — your base profile changed since this job was tailored.
            </p>
          )}
          {staleJdWarning && (
            <p style={{ fontSize: '0.82rem', margin: staleProfileWarning ? '8px 0 0' : 0 }}>
              <strong>Job description updated</strong> since last tailor — re-tailor for best alignment.
            </p>
          )}
        </div>
      )}

      <div className="detail-card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '4px solid var(--brand-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            textAlign: 'center',
            lineHeight: 1.2,
            padding: 4,
          }}
        >
          <span>{fit.label}</span>
          <span style={{ fontSize: '1rem' }}>{fit.percent}%</span>
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Job Fit</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>
            Compared to this job description — <strong>{job.jobTitle}</strong> at <strong>{job.companyName}</strong>.
          </p>
          {job.layoutDecision?.reason && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              <strong>{job.layoutDecision.pages} page{job.layoutDecision.pages === 1 ? '' : 's'}</strong> — {job.layoutDecision.reason}
            </p>
          )}
        </div>
      </div>

      {gaps.length > 0 && (
        <div className="detail-card">
          <div className="detail-card-title">Gap Checklist</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {gaps.map((item, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis && (
        <div className="detail-card">
          <div className="detail-card-title">Fit Analysis</div>
          <p className="plain-text">{analysis}</p>
        </div>
      )}

      {job.keywords?.length > 0 && (
        <div className="detail-card">
          <div className="detail-card-title">Keywords Matched</div>
          <div className="keyword-tags">
            {job.keywords.map((kw, i) => (
              <span key={i} className="keyword-tag">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function jobListFitBadge(job: Pick<Job, 'atsScore' | 'matchScore'>): string {
  const score = getMatchScore(job);
  if (score <= 0) return '';
  return formatFitDisplay(score).display;
}
