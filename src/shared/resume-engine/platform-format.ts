import type { ApplicationPlatform } from '../types';

export type ResumeExportFormat = 'pdf' | 'docx';

const PLATFORM_DEFAULTS: Record<ApplicationPlatform, ResumeExportFormat> = {
  linkedin: 'pdf',
  indeed: 'pdf',
  workday: 'docx',
  greenhouse: 'docx',
  lever: 'docx',
  ashby: 'docx',
  smartrecruiters: 'docx',
  generic: 'docx',
};

export function recommendResumeFormat(platform?: ApplicationPlatform): ResumeExportFormat {
  if (!platform) return 'docx';
  return PLATFORM_DEFAULTS[platform] || 'docx';
}

export function resolveApplyFormat(
  platform?: ApplicationPlatform,
  userOverride?: ResumeExportFormat
): ResumeExportFormat {
  return userOverride || recommendResumeFormat(platform);
}

export function formatRecommendationLabel(format: ResumeExportFormat): string {
  return format === 'pdf'
    ? 'PDF recommended for this portal (text-selectable upload).'
    : 'DOCX recommended for this portal (Workday-style parsers).';
}
