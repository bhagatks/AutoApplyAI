import type { CSSProperties } from 'react';
import { ParsedResume, isParsedResumeComplete } from '../../shared/resume-types';

export type OnboardingFieldKey = string;

export interface OnboardingValidationInput {
  geminiApiKey: string;
  isKeyVerified: boolean;
  resumeFile: string;
  isScanningResume: boolean;
  profileUnlocked: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parsedResumeDraft: ParsedResume;
}

export interface OnboardingValidationResult {
  keys: OnboardingFieldKey[];
  messages: string[];
}

function push(keys: OnboardingFieldKey[], messages: string[], key: OnboardingFieldKey, message: string) {
  keys.push(key);
  messages.push(message);
}

export function validateOnboardingForm(input: OnboardingValidationInput): OnboardingValidationResult {
  const keys: OnboardingFieldKey[] = [];
  const messages: string[] = [];
  const {
    geminiApiKey,
    isKeyVerified,
    resumeFile,
    isScanningResume,
    profileUnlocked,
    firstName,
    lastName,
    email,
    phone,
    parsedResumeDraft: resume,
  } = input;

  if (!geminiApiKey.trim()) {
    push(keys, messages, 'apiKey', 'Enter your AI API key');
  } else if (!isKeyVerified) {
    push(keys, messages, 'apiKeyNotVerified', 'Verify your API key');
  }

  if (!resumeFile) {
    push(keys, messages, 'resumeFile', 'Upload your resume (PDF or DOCX)');
  } else if (isScanningResume) {
    push(keys, messages, 'resumeScan', 'Wait for resume scan to finish');
  } else if (!profileUnlocked) {
    push(keys, messages, 'resumeScan', 'Complete resume scan to unlock your profile');
  }

  if (!firstName.trim()) push(keys, messages, 'firstName', 'First name');
  if (!lastName.trim()) push(keys, messages, 'lastName', 'Last name');
  if (!email.trim()) push(keys, messages, 'email', 'Email');
  if (!phone.trim()) push(keys, messages, 'phone', 'Phone');

  if (profileUnlocked && !isScanningResume && !isParsedResumeComplete(resume)) {
    if (!resume.city?.trim()) push(keys, messages, 'city', 'City');
    if (!resume.state?.trim()) push(keys, messages, 'state', 'State');
    if (!resume.country?.trim()) push(keys, messages, 'country', 'Country');
    if (!resume.role?.trim()) push(keys, messages, 'role', 'Target role / headline');
    if (!resume.summary?.trim()) push(keys, messages, 'summary', 'Professional summary');
    const competencyCount = resume.competencies?.filter((c) => c.trim()).length ?? 0;
    if (competencyCount < 6) {
      push(keys, messages, 'competencies', `Core competencies (${competencyCount}/6 minimum)`);
    }
    if (!resume.currentCompany?.trim()) push(keys, messages, 'currentCompany', 'Current company');

    const experience = resume.experience ?? [];
    if (!experience.length) {
      push(keys, messages, 'experience', 'At least one work experience entry');
    } else {
      experience.forEach((job, i) => {
        const prefix = `exp-${i}`;
        if (!job.jobTitle?.trim()) push(keys, messages, `${prefix}-title`, `Experience ${i + 1}: job title`);
        if (!job.company?.trim()) push(keys, messages, `${prefix}-company`, `Experience ${i + 1}: company`);
        if (!job.startDate?.trim() || !job.endDate?.trim()) {
          push(keys, messages, `${prefix}-dates`, `Experience ${i + 1}: start and end dates`);
        }
        if (!job.bullets?.some((b) => b.trim())) {
          push(keys, messages, `${prefix}-bullets`, `Experience ${i + 1}: at least one bullet`);
        }
      });
    }

    const education = resume.education ?? [];
    if (!education.length) {
      push(keys, messages, 'education', 'At least one education entry');
    } else {
      education.forEach((entry, i) => {
        const prefix = `edu-${i}`;
        if (!entry.degree?.trim()) push(keys, messages, `${prefix}-degree`, `Education ${i + 1}: degree`);
        if (!entry.school?.trim()) push(keys, messages, `${prefix}-school`, `Education ${i + 1}: school`);
      });
    }
  }

  return { keys, messages };
}

export function invalidFieldKeysSet(keys: OnboardingFieldKey[]): Set<OnboardingFieldKey> {
  return new Set(keys);
}

export function isFieldInvalid(invalidKeys: Set<OnboardingFieldKey> | null, key: OnboardingFieldKey): boolean {
  return Boolean(invalidKeys?.has(key));
}

export function fieldControlClass(invalidKeys: Set<OnboardingFieldKey> | null, key: OnboardingFieldKey, base = 'form-control'): string {
  return `${base}${isFieldInvalid(invalidKeys, key) ? ' field-invalid' : ''}`;
}

export function fieldGroupClass(invalidKeys: Set<OnboardingFieldKey> | null, key: OnboardingFieldKey): string {
  return `form-group${isFieldInvalid(invalidKeys, key) ? ' field-invalid-group' : ''}`;
}

export function fieldLabelStyle(
  invalidKeys: Set<OnboardingFieldKey> | null,
  key: OnboardingFieldKey,
  base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  }
): CSSProperties {
  return isFieldInvalid(invalidKeys, key) ? { ...base, color: 'var(--danger-color)' } : base;
}

export function scrollToFirstInvalidField(
  keys: OnboardingFieldKey[],
  container: HTMLElement | null
): void {
  if (!container || keys.length === 0) return;
  requestAnimationFrame(() => {
    for (const key of keys) {
      const el = container.querySelector(`[data-field-key="${key}"]`);
      if (!el || !(el instanceof HTMLElement)) continue;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.matches('input, textarea, select, button')) {
        el.focus({ preventScroll: true });
      } else {
        const focusable = el.querySelector<HTMLElement>('input, textarea, select, button');
        focusable?.focus({ preventScroll: true });
      }
      break;
    }
  });
}
