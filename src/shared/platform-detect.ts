import { ApplicationPlatform } from './types';

export function detectPlatformFromUrl(url: string): ApplicationPlatform {
  const lower = url.toLowerCase();

  if (/linkedin\.com/.test(lower)) return 'linkedin';
  if (/boards\.greenhouse\.io/.test(lower) || /greenhouse\.io\/embed\/job_app/.test(lower)) return 'greenhouse';
  if (/indeed\.com/.test(lower)) return 'indeed';
  if (/myworkdayjobs\.com/.test(lower) || /workday\.com/.test(lower)) return 'workday';
  if (/jobs\.lever\.co/.test(lower)) return 'lever';
  if (/jobs\.ashbyhq\.com/.test(lower)) return 'ashby';
  if (/smartrecruiters\.com/.test(lower)) return 'smartrecruiters';

  return 'generic';
}

export function platformLabel(platform: ApplicationPlatform): string {
  switch (platform) {
    case 'linkedin':
      return 'LinkedIn';
    case 'greenhouse':
      return 'Greenhouse';
    case 'indeed':
      return 'Indeed';
    case 'workday':
      return 'Workday';
    case 'lever':
      return 'Lever';
    case 'ashby':
      return 'Ashby';
    case 'smartrecruiters':
      return 'SmartRecruiters';
    default:
      return 'Generic';
  }
}

export function supportsAssistApply(platform: ApplicationPlatform): boolean {
  return platform === 'linkedin' || platform === 'greenhouse';
}
