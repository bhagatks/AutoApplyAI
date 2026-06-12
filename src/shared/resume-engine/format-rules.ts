/** Canonical section headers per RESUME_SPEC.md */
export const SECTION_HEADERS = {
  summary: 'Professional Summary',
  competencies: 'Core Competencies',
  skills: 'Skills',
  experience: 'Professional Experience',
  education: 'Education',
} as const;

export const FORBIDDEN_RESUME_PHRASES = [
  /\bATS\b/i,
  /keyword optimization/i,
  /match score/i,
  /keywords injected/i,
];

export function formatExperienceDates(start: string, end: string): string {
  const formatPart = (d: string): string => {
    const t = d.trim();
    if (!t) return '';
    if (/present/i.test(t)) return 'Present';
    const m = t.match(/^(\d{4})(?:-(\d{2}))?$/);
    if (m) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = m[2] ? months[Math.max(0, Math.min(11, parseInt(m[2], 10) - 1))] : '';
      return month ? `${month} ${m[1]}` : m[1];
    }
    return t;
  };
  const s = formatPart(start);
  const e = formatPart(end) || 'Present';
  if (!s) return e;
  return `${s} -- ${e}`;
}

export function stripForbiddenPhrases(text: string): string {
  let out = text;
  for (const pattern of FORBIDDEN_RESUME_PHRASES) {
    out = out.replace(pattern, '');
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function buildUploadFileName(firstName: string, lastName: string, company: string, ext: 'pdf' | 'docx'): string {
  const clean = (s: string) =>
    s
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40);
  return `${clean(firstName)}_${clean(lastName)}_Resume_${clean(company)}.${ext}`;
}
