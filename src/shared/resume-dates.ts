/** Parse and sanitize resume date strings (YYYY, YYYY-MM, Present). */

const PRESENT_RE = /^present$/i;
const VALID_DATE_RE = /^(\d{4})(?:-(\d{2}))?$/;
const YEAR_RE = /\b(19|20)\d{2}\b/;

export interface ResumeDateParts {
  year: string;
  month: string;
  isPresent: boolean;
}

export function parseResumeDateParts(value: string): ResumeDateParts {
  const trimmed = value.trim();
  if (!trimmed) return { year: '', month: '', isPresent: false };
  if (PRESENT_RE.test(trimmed)) return { year: '', month: '', isPresent: true };

  const match = trimmed.match(VALID_DATE_RE);
  if (match) {
    const year = match[1];
    const month = match[2] && isValidMonth(match[2]) ? match[2] : '';
    return { year, month, isPresent: false };
  }

  const yearMatch = trimmed.match(YEAR_RE);
  if (yearMatch) {
    return { year: yearMatch[0], month: '', isPresent: false };
  }

  return { year: '', month: '', isPresent: false };
}

export function combineResumeDateParts(
  year: string,
  month: string,
  isPresent = false
): string {
  if (isPresent) return 'Present';
  const y = year.trim();
  const m = month.trim();
  if (!y) return '';
  if (m && isValidMonth(m)) return `${y}-${m.padStart(2, '0')}`;
  return y;
}

function isValidMonth(month: string): boolean {
  const n = parseInt(month, 10);
  return n >= 1 && n <= 12;
}

/** Strip AI commentary and normalize to YYYY, YYYY-MM, Present, or empty. */
export function sanitizeResumeDate(value: unknown): string {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (PRESENT_RE.test(raw)) return 'Present';

  const strict = raw.match(VALID_DATE_RE);
  if (strict) {
    const year = strict[1];
    const month = strict[2];
    if (!month) return year;
    if (isValidMonth(month)) return `${year}-${month}`;
    return year;
  }

  const leading = raw.match(/^(\d{4})-(\d{2})/);
  if (leading) {
    const year = leading[1];
    const month = leading[2];
    if (isValidMonth(month)) return `${year}-${month}`;
    return year;
  }

  const yearOnly = raw.match(YEAR_RE);
  if (yearOnly) return yearOnly[0];

  return '';
}

export const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Month (optional)' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];
