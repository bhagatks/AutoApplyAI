import React from 'react';
import {
  buildMasterResumePreviewFromJob,
  type MasterResumePreviewModel,
} from '../../shared/resume-preview-model';
import type { BaseProfile, Job, ResumeRules } from '../../shared/types';
import type { ParsedResume } from '../../shared/resume-types';

interface ResumePrintPreviewProps {
  job: Job;
  rules: ResumeRules;
  profile: BaseProfile;
  parsedResume?: ParsedResume | null;
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="resume-preview-section">{title}</div>
      {children}
    </>
  );
}

export default function ResumePrintPreview({ job, rules, profile, parsedResume }: ResumePrintPreviewProps) {
  const model: MasterResumePreviewModel = buildMasterResumePreviewFromJob(
    job,
    rules,
    profile,
    parsedResume
  );

  const contactParts = [
    [model.city, model.state, model.zip].filter(Boolean).join(', '),
    model.phone,
    model.email,
    model.linkedin,
  ].filter(Boolean);

  return (
    <div className="resume-preview-container">
      <div className="resume-preview-header">
        <div className="resume-preview-title">{model.fullName}</div>
        <div className="resume-preview-contact">
          {contactParts.map((part, i) => (
            <span key={i}>
              {i > 0 && <span className="resume-preview-sep"> | </span>}
              {part === model.email ? (
                <a href={`mailto:${part}`} className="resume-preview-link">
                  {part}
                </a>
              ) : part === model.linkedin ? (
                <a
                  href={part.startsWith('http') ? part : `https://${part}`}
                  className="resume-preview-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {part}
                </a>
              ) : (
                part
              )}
            </span>
          ))}
        </div>
        <div className="resume-preview-role">
          {model.coreFocusDomains
            ? `${model.targetRole} | ${model.coreFocusDomains}`
            : model.targetRole}
        </div>
      </div>

      {model.summary ? <div className="resume-preview-summary">{model.summary}</div> : null}

      <PreviewSection title="Core Competencies and Technical Leadership">
        <ul className="resume-preview-bullets">
          {model.competencies.map((c, i) => (
            <li key={i}>
              <strong>{c.title}{c.description ? ':' : ''}</strong>
              {c.description ? ` ${c.description}` : null}
            </li>
          ))}
        </ul>
      </PreviewSection>

      {model.skillBuckets.length > 0 ? (
        <PreviewSection title="Technical Skills">
          <ul className="resume-preview-bullets">
            {model.skillBuckets.map((b, i) => (
              <li key={i}>
                <strong>{b.label}:</strong> {b.items}
              </li>
            ))}
          </ul>
        </PreviewSection>
      ) : null}

      <PreviewSection title="Professional Experience">
        {model.roles.map((role, i) => (
          <div key={i} className="resume-preview-role-block">
            <div className="resume-preview-header-line">
              <span>{role.company}</span>
              <span>{role.location}</span>
            </div>
            <div className="resume-preview-subline">
              <span>
                <em>{role.title}</em>
              </span>
              <span>
                <strong>{role.timeline}</strong>
              </span>
            </div>
            <ul className="resume-preview-bullets">
              {role.bullets.map((bullet, bi) => (
                <li key={bi}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Education and Certifications">
        <ul className="resume-preview-bullets">
          {model.credentials.map((cred, i) => (
            <li key={`cred-${i}`}>
              <strong>{cred.title}</strong> | {cred.organization}
              {cred.url ? (
                <>
                  {' '}
                  (<a href={cred.url} className="resume-preview-link" target="_blank" rel="noreferrer">
                    Credential Link
                  </a>
                  )
                </>
              ) : null}
            </li>
          ))}
          {model.universityName && model.universityName !== '—' ? (
            <li>
              <strong>Bachelor of Technology (B.Tech) in Computer Science and Engineering</strong> |{' '}
              {model.universityName}
            </li>
          ) : null}
        </ul>
      </PreviewSection>
    </div>
  );
}
