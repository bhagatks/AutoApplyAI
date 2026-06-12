import React from 'react';
import { Briefcase, MapPin, Link2, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { WorkExperience, EducationEntry, emptyEducationEntry, CREDENTIAL_TYPE_OPTIONS, getCredentialFieldLabels } from '../../shared/resume-types';
import CompetencyAddPicker from './CompetencyAddPicker';
import SkillAddPicker from './SkillAddPicker';
import {
  fieldControlClass,
  fieldLabelStyle,
  isFieldInvalid,
  type OnboardingFieldKey,
} from './onboarding-validation';

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: '8px 0 4px',
  borderBottom: '1px solid var(--panel-border)',
  paddingBottom: 6,
};

export interface ResumeProfileSectionsProps {
  disabled: boolean;
  invalidFields?: Set<OnboardingFieldKey> | null;
  onClearInvalidField?: (key: OnboardingFieldKey) => void;
  city: string;
  setCity: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  summary: string;
  setSummary: (v: string) => void;
  competencies: string[];
  setCompetencies: (v: string[]) => void;
  skills: string[];
  setSkills: (v: string[]) => void;
  experience: WorkExperience[];
  setExperience: (v: WorkExperience[]) => void;
  education: EducationEntry[];
  setEducation: (v: EducationEntry[]) => void;
  currentCompany: string;
  setCurrentCompany: (v: string) => void;
  currentlyWorking: boolean;
  setCurrentlyWorking: (v: boolean) => void;
  linkedin: string;
  setLinkedin: (v: string) => void;
  github: string;
  setGithub: (v: string) => void;
  portfolio: string;
  setPortfolio: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  otherLinks: string;
  setOtherLinks: (v: string) => void;
  languages: string;
  setLanguages: (v: string) => void;
  workAuthorizationUS: string;
  setWorkAuthorizationUS: (v: string) => void;
  requiresSponsorship: string;
  setRequiresSponsorship: (v: string) => void;
}

export default function ResumeProfileSections(props: ResumeProfileSectionsProps) {
  const {
    disabled,
    invalidFields = null,
    onClearInvalidField,
    city, setCity, state, setState, country, setCountry, postalCode, setPostalCode,
    role, setRole, summary, setSummary, competencies, setCompetencies, skills, setSkills,
    experience, setExperience, education, setEducation,
    currentCompany, setCurrentCompany, currentlyWorking, setCurrentlyWorking,
    linkedin, setLinkedin, github, setGithub, portfolio, setPortfolio,
    website, setWebsite, otherLinks, setOtherLinks, languages, setLanguages,
    workAuthorizationUS, setWorkAuthorizationUS, requiresSponsorship, setRequiresSponsorship,
  } = props;

  const wrapStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const updateJob = (index: number, patch: Partial<WorkExperience>) => {
    const next = [...experience];
    next[index] = { ...next[index], ...patch };
    setExperience(next);
  };

  const updateEducation = (index: number, patch: Partial<EducationEntry>) => {
    const next = [...education];
    next[index] = { ...next[index], ...patch };
    setEducation(next);
  };

  const sectionTitleClass = (key?: OnboardingFieldKey) =>
    `section-title${key && isFieldInvalid(invalidFields, key) ? ' field-invalid-section' : ''}`;

  const touch = (key: OnboardingFieldKey, fn: () => void) => {
    onClearInvalidField?.(key);
    fn();
  };

  const locationInvalid = isFieldInvalid(invalidFields, 'city') || isFieldInvalid(invalidFields, 'state') || isFieldInvalid(invalidFields, 'country');

  return (
    <div style={wrapStyle}>
      <div className={sectionTitleClass(locationInvalid ? 'city' : undefined)} style={sectionTitleStyle} data-field-key={locationInvalid ? 'city' : undefined}>
        <MapPin size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
        Location *
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group" data-field-key="city">
          <label style={fieldLabelStyle(invalidFields, 'city', labelStyle)}>City *</label>
          <input className={fieldControlClass(invalidFields, 'city')} data-field-key="city" value={city} onChange={(e) => touch('city', () => setCity(e.target.value))} disabled={disabled} />
        </div>
        <div className="form-group" data-field-key="state">
          <label style={fieldLabelStyle(invalidFields, 'state', labelStyle)}>State *</label>
          <input className={fieldControlClass(invalidFields, 'state')} data-field-key="state" value={state} onChange={(e) => touch('state', () => setState(e.target.value))} disabled={disabled} />
        </div>
        <div className="form-group" data-field-key="country">
          <label style={fieldLabelStyle(invalidFields, 'country', labelStyle)}>Country *</label>
          <input className={fieldControlClass(invalidFields, 'country')} data-field-key="country" value={country} onChange={(e) => touch('country', () => setCountry(e.target.value))} disabled={disabled} />
        </div>
        <div className="form-group">
          <label style={labelStyle}>Postal Code</label>
          <input className="form-control" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={disabled} />
        </div>
      </div>

      <div className={sectionTitleClass('role')} style={sectionTitleStyle} data-field-key="role">
        <Briefcase size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
        Professional Identity *
      </div>
      <div className="form-group" data-field-key="role">
        <label style={fieldLabelStyle(invalidFields, 'role', labelStyle)}>Target Role / Headline *</label>
        <input className={fieldControlClass(invalidFields, 'role')} data-field-key="role" value={role} onChange={(e) => touch('role', () => setRole(e.target.value))} disabled={disabled} />
      </div>
      <div className="form-group" data-field-key="currentCompany">
        <label style={fieldLabelStyle(invalidFields, 'currentCompany', labelStyle)}>Current Company *</label>
        <input className={fieldControlClass(invalidFields, 'currentCompany')} data-field-key="currentCompany" value={currentCompany} onChange={(e) => touch('currentCompany', () => setCurrentCompany(e.target.value))} disabled={disabled} />
      </div>
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          disabled={disabled}
          id="currentlyWorking"
        />
        <label htmlFor="currentlyWorking" style={{ ...labelStyle, margin: 0 }}>Currently working at this company</label>
      </div>
      <div className="form-group" data-field-key="summary">
        <label style={fieldLabelStyle(invalidFields, 'summary', labelStyle)}>Professional Summary *</label>
        <textarea
          className={fieldControlClass(invalidFields, 'summary')}
          data-field-key="summary"
          rows={4}
          value={summary}
          onChange={(e) => touch('summary', () => setSummary(e.target.value))}
          disabled={disabled}
          placeholder="3-5 sentence executive summary..."
        />
      </div>

      <div className={sectionTitleClass('competencies')} style={sectionTitleStyle} data-field-key="competencies">Core Competencies * (min 6)</div>
      {competencies.map((comp, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8 }} data-field-key={idx === 0 ? 'competencies' : undefined}>
          <input
            className={fieldControlClass(invalidFields, idx === 0 ? 'competencies' : `comp-${idx}`, 'form-control')}
            data-field-key={idx === 0 ? 'competencies' : undefined}
            value={comp}
            disabled={disabled}
            onChange={(e) => {
              touch('competencies', () => {
                const next = [...competencies];
                next[idx] = e.target.value;
                setCompetencies(next);
              });
            }}
          />
          <button
            type="button"
            className="btn"
            disabled={disabled}
            onClick={() => setCompetencies(competencies.filter((_, i) => i !== idx))}
            style={{ padding: '0 10px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <CompetencyAddPicker
        disabled={disabled}
        selectedTitles={competencies}
        onAdd={(title) => {
          const existing = competencies.filter((c) => c.trim());
          setCompetencies([...existing, title]);
        }}
      />

      <div style={sectionTitleStyle}>Technical Skills</div>
      <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Languages, frameworks, databases, and tools — used for ATS matching (separate from core competencies).
      </p>
      {skills.map((skill, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-control"
            value={skill}
            disabled={disabled}
            onChange={(e) => {
              const next = [...skills];
              next[idx] = e.target.value;
              setSkills(next);
            }}
          />
          <button
            type="button"
            className="btn"
            disabled={disabled}
            onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
            style={{ padding: '0 10px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <SkillAddPicker
        disabled={disabled}
        selectedTitles={skills}
        onAdd={(title) => {
          const existing = skills.filter((s) => s.trim());
          setSkills([...existing, title]);
        }}
      />

      <div className={sectionTitleClass('experience')} style={sectionTitleStyle} data-field-key="experience">Work Experience *</div>
      {experience.map((job, idx) => {
        const cardInvalid =
          isFieldInvalid(invalidFields, `exp-${idx}-title`) ||
          isFieldInvalid(invalidFields, `exp-${idx}-company`) ||
          isFieldInvalid(invalidFields, `exp-${idx}-dates`) ||
          isFieldInvalid(invalidFields, `exp-${idx}-bullets`) ||
          (idx === 0 && isFieldInvalid(invalidFields, 'experience'));
        const cardKey = idx === 0 && isFieldInvalid(invalidFields, 'experience') ? 'experience' : `exp-${idx}-title`;
        return (
        <div
          key={idx}
          data-field-key={cardKey}
          style={{
            border: `1px solid ${cardInvalid ? 'var(--danger-color)' : 'var(--panel-border)'}`,
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: cardInvalid ? '0 0 0 1px rgba(239, 68, 68, 0.15)' : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.78rem', color: cardInvalid ? 'var(--danger-color)' : undefined }}>Position {idx + 1}</strong>
            {experience.length > 1 && (
              <button type="button" className="btn" disabled={disabled} onClick={() => setExperience(experience.filter((_, i) => i !== idx))}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <input className={fieldControlClass(invalidFields, `exp-${idx}-title`)} data-field-key={`exp-${idx}-title`} placeholder="Job title *" value={job.jobTitle} disabled={disabled} onChange={(e) => touch(`exp-${idx}-title`, () => updateJob(idx, { jobTitle: e.target.value }))} />
          <input className={fieldControlClass(invalidFields, `exp-${idx}-company`)} data-field-key={`exp-${idx}-company`} placeholder="Company *" value={job.company} disabled={disabled} onChange={(e) => touch(`exp-${idx}-company`, () => updateJob(idx, { company: e.target.value }))} />
          <input className="form-control" placeholder="Location" value={job.location || ''} disabled={disabled} onChange={(e) => updateJob(idx, { location: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} data-field-key={`exp-${idx}-dates`}>
            <input className={fieldControlClass(invalidFields, `exp-${idx}-dates`)} placeholder="Start (YYYY-MM) *" value={job.startDate} disabled={disabled} onChange={(e) => touch(`exp-${idx}-dates`, () => updateJob(idx, { startDate: e.target.value }))} />
            <input className={fieldControlClass(invalidFields, `exp-${idx}-dates`)} placeholder="End (YYYY-MM or Present) *" value={job.endDate} disabled={disabled} onChange={(e) => touch(`exp-${idx}-dates`, () => updateJob(idx, { endDate: e.target.value }))} />
          </div>
          <label style={fieldLabelStyle(invalidFields, `exp-${idx}-bullets`, labelStyle)}>Bullets * (one per line)</label>
          <textarea
            className={fieldControlClass(invalidFields, `exp-${idx}-bullets`)}
            data-field-key={`exp-${idx}-bullets`}
            rows={4}
            disabled={disabled}
            value={job.bullets.join('\n')}
            onChange={(e) => touch(`exp-${idx}-bullets`, () => updateJob(idx, { bullets: e.target.value.split('\n') }))}
          />
        </div>
        );
      })}
      <button
        type="button"
        className="btn"
        disabled={disabled}
        onClick={() => setExperience([...experience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }])}
        style={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}
      >
        <Plus size={14} style={{ marginRight: 4 }} /> Add position
      </button>

      <div className={sectionTitleClass('education')} style={sectionTitleStyle} data-field-key="education">
        <GraduationCap size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
        Education &amp; Credentials *
      </div>
      {education.map((entry, idx) => {
        const labels = getCredentialFieldLabels(entry.credentialType);
        const typeLabel = CREDENTIAL_TYPE_OPTIONS.find((o) => o.value === entry.credentialType)?.label || 'Credential';
        const cardInvalid =
          isFieldInvalid(invalidFields, `edu-${idx}-degree`) ||
          isFieldInvalid(invalidFields, `edu-${idx}-school`) ||
          (idx === 0 && isFieldInvalid(invalidFields, 'education'));
        const cardKey = idx === 0 && isFieldInvalid(invalidFields, 'education') ? 'education' : `edu-${idx}-degree`;
        return (
        <div
          key={idx}
          data-field-key={cardKey}
          style={{
            border: `1px solid ${cardInvalid ? 'var(--danger-color)' : 'var(--panel-border)'}`,
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: cardInvalid ? '0 0 0 1px rgba(239, 68, 68, 0.15)' : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: '0.78rem', color: cardInvalid ? 'var(--danger-color)' : undefined }}>{typeLabel} {idx + 1}</strong>
            {education.length > 1 && (
              <button
                type="button"
                className="btn"
                disabled={disabled}
                onClick={() => setEducation(education.filter((_, i) => i !== idx))}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={labelStyle}>Type *</label>
            <select
              className="form-control"
              value={entry.credentialType}
              disabled={disabled}
              onChange={(e) =>
                updateEducation(idx, { credentialType: e.target.value as EducationEntry['credentialType'] })
              }
            >
              {CREDENTIAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <input
            className={fieldControlClass(invalidFields, `edu-${idx}-degree`)}
            data-field-key={`edu-${idx}-degree`}
            placeholder={labels.title}
            value={entry.degree}
            disabled={disabled}
            onChange={(e) => touch(`edu-${idx}-degree`, () => updateEducation(idx, { degree: e.target.value }))}
          />
          <input
            className="form-control"
            placeholder={labels.fieldOfStudy}
            value={entry.fieldOfStudy}
            disabled={disabled}
            onChange={(e) => updateEducation(idx, { fieldOfStudy: e.target.value })}
          />
          <input
            className={fieldControlClass(invalidFields, `edu-${idx}-school`)}
            data-field-key={`edu-${idx}-school`}
            placeholder={labels.issuer}
            value={entry.school}
            disabled={disabled}
            onChange={(e) => touch(`edu-${idx}-school`, () => updateEducation(idx, { school: e.target.value }))}
          />
          <input
            className="form-control"
            placeholder="Location (city, state)"
            value={entry.location}
            disabled={disabled}
            onChange={(e) => updateEducation(idx, { location: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              className="form-control"
              placeholder="Start (optional, YYYY or YYYY-MM)"
              value={entry.startDate}
              disabled={disabled}
              onChange={(e) => updateEducation(idx, { startDate: e.target.value })}
            />
            <input
              className="form-control"
              placeholder={labels.endDate}
              value={entry.endDate}
              disabled={disabled}
              onChange={(e) => updateEducation(idx, { endDate: e.target.value })}
            />
          </div>
          <input
            className="form-control"
            placeholder={labels.honors}
            value={entry.honors}
            disabled={disabled}
            onChange={(e) => updateEducation(idx, { honors: e.target.value })}
          />
        </div>
        );
      })}
      <button
        type="button"
        className="btn"
        disabled={disabled}
        onClick={() => setEducation([...education, emptyEducationEntry()])}
        style={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}
      >
        <Plus size={14} style={{ marginRight: 4 }} /> Add credential
      </button>

      <details style={{ opacity: disabled ? 0.45 : 1 }}>
        <summary style={{ ...sectionTitleStyle, cursor: disabled ? 'not-allowed' : 'pointer', listStyle: 'none' }}>
          <Link2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          Links &amp; Languages (optional)
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, pointerEvents: disabled ? 'none' : 'auto' }}>
          <input className="form-control" placeholder="LinkedIn" value={linkedin} disabled={disabled} onChange={(e) => setLinkedin(e.target.value)} />
          <input className="form-control" placeholder="GitHub" value={github} disabled={disabled} onChange={(e) => setGithub(e.target.value)} />
          <input className="form-control" placeholder="Portfolio" value={portfolio} disabled={disabled} onChange={(e) => setPortfolio(e.target.value)} />
          <input className="form-control" placeholder="Website" value={website} disabled={disabled} onChange={(e) => setWebsite(e.target.value)} />
          <textarea className="form-control" rows={2} placeholder="Other links (one per line)" value={otherLinks} disabled={disabled} onChange={(e) => setOtherLinks(e.target.value)} />
          <input className="form-control" placeholder="Languages (comma separated)" value={languages} disabled={disabled} onChange={(e) => setLanguages(e.target.value)} />
        </div>
      </details>

      <details style={{ opacity: disabled ? 0.45 : 1 }}>
        <summary style={{ ...sectionTitleStyle, cursor: disabled ? 'not-allowed' : 'pointer', listStyle: 'none' }}>
          Work Eligibility (optional)
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, pointerEvents: disabled ? 'none' : 'auto' }}>
          <input className="form-control" placeholder="Work authorization (US)" value={workAuthorizationUS} disabled={disabled} onChange={(e) => setWorkAuthorizationUS(e.target.value)} />
          <select className="form-control" value={requiresSponsorship} disabled={disabled} onChange={(e) => setRequiresSponsorship(e.target.value)}>
            <option value="">Sponsorship required?</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </details>
    </div>
  );
}
