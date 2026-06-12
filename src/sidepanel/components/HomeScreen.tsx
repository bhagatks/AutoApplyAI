import React from 'react';
import {
  Globe,
  Loader,
  Pause,
  Play,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Job, PipelineStage } from '../../shared/types';
import { platformLabel } from '../../shared/platform-detect';
import { jobListFitBadge } from '../../shared/JobFitPanel';

const STAGE_LABELS: Record<PipelineStage, string> = {
  queued: 'Queued',
  tailoring: 'Tailoring',
  tailored: 'Ready to Apply',
  applying: 'Applying',
  needs_review: 'Review & Submit',
  applied: 'Applied',
  failed: 'Failed',
};

const STAGE_ORDER: PipelineStage[] = [
  'queued',
  'tailoring',
  'tailored',
  'applying',
  'needs_review',
  'applied',
  'failed',
];

function stageIndex(stage?: PipelineStage): number {
  if (!stage) return 0;
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

interface HomeScreenProps {
  jobs: Job[];
  pipelinePaused: boolean;
  isImporting: boolean;
  onAddCurrentTab: () => void;
  onTogglePause: () => void;
  onSelectJob: (job: Job) => void;
  onDeleteJob: (e: React.MouseEvent, jobId: string) => void;
  onMarkApplied: (jobId: string) => void;
  onRetry: (jobId: string) => void;
}

export default function HomeScreen({
  jobs,
  pipelinePaused,
  isImporting,
  onAddCurrentTab,
  onTogglePause,
  onSelectJob,
  onDeleteJob,
  onMarkApplied,
  onRetry,
}: HomeScreenProps) {
  const activeCount = jobs.filter((j) =>
    ['queued', 'tailoring', 'tailored', 'applying'].includes(j.pipelineStage || '')
  ).length;

  return (
    <section className="input-pane" style={{ width: '100%', maxWidth: '100%', borderRight: 'none' }}>
      <div className="pane-header">
        <h2>Home</h2>
        <button
          type="button"
          onClick={onTogglePause}
          className="btn"
          title={pipelinePaused ? 'Resume pipeline' : 'Pause pipeline'}
          style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {pipelinePaused ? <Play size={14} /> : <Pause size={14} />}
          {pipelinePaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="pane-content">
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
          Add a job from your open tab — we tailor in the background, then assist-apply one at a time.
        </p>

        <button
          type="button"
          onClick={onAddCurrentTab}
          disabled={isImporting}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isImporting ? (
            <>
              <Loader className="animate-spin" size={16} /> Adding job...
            </>
          ) : (
            <>
              <Globe size={16} /> Add + Tailor + Apply
            </>
          )}
        </button>

        {pipelinePaused && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.25)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            Pipeline paused — new jobs queue but tailoring and apply are on hold.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Pipeline ({jobs.length})</h3>
          {activeCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} /> {activeCount} active
            </span>
          )}
        </div>

        <div className="history-list">
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 20 }}>
              No jobs yet. Open a posting and tap Add above.
            </div>
          ) : (
            jobs.map((job) => {
              const stage = job.pipelineStage || 'queued';
              const isActive = ['tailoring', 'applying'].includes(stage);
              return (
                <div
                  key={job.id}
                  className="history-item"
                  style={{ cursor: 'default', marginBottom: 8 }}
                >
                  <div
                    onClick={() => onSelectJob(job)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="history-item-header">
                      <span className="job-title-text" title={job.jobTitle}>
                        {job.jobTitle}
                      </span>
                      {jobListFitBadge(job) ? (
                        <span className="score-badge">{jobListFitBadge(job)}</span>
                      ) : job.atsScore > 0 ? (
                        <span className="score-badge">{job.atsScore}%</span>
                      ) : null}
                    </div>
                    <div className="company-text">{job.companyName}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className={`status-badge ${stage === 'failed' ? 'failed' : stage === 'applied' ? 'completed' : 'processing'}`}>
                        {isActive && <Loader className="animate-spin" size={10} style={{ marginRight: 4, display: 'inline' }} />}
                        {STAGE_LABELS[stage]}
                      </span>
                      {job.platform && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 6px', background: 'var(--panel-bg-2)', borderRadius: 4 }}>
                          {platformLabel(job.platform)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {STAGE_ORDER.slice(0, 5).map((s, i) => (
                        <div
                          key={s}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background: stageIndex(stage) >= i ? 'var(--brand-color)' : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                    {stage === 'needs_review' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => onMarkApplied(job.id)}
                      >
                        <CheckCircle2 size={12} /> Mark Submitted
                      </button>
                    )}
                    {stage === 'failed' && (
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => onRetry(job.id)}
                      >
                        <RotateCcw size={12} /> Retry
                      </button>
                    )}
                    {job.applyError && (
                      <span title={job.applyError} style={{ display: 'flex', alignItems: 'center', color: 'var(--danger-color)' }}>
                        <AlertCircle size={14} />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="btn"
                      style={{ padding: '4px 8px' }}
                      title="View details"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onDeleteJob(e, job.id)}
                      className="item-delete-btn"
                      title="Remove job"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
