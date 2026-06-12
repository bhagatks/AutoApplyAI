import type { ResolvedResumeDocument } from './types';
import { SECTION_HEADERS, FORBIDDEN_RESUME_PHRASES } from './format-rules';
import { getLayoutBudgetForPages } from './compute-page-budget';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warn';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateDocument(doc: ResolvedResumeDocument): ValidationResult {
  const issues: ValidationIssue[] = [];
  const pages = doc.layoutDecision.pages;
  if (pages < 1 || pages > 6 || !Number.isInteger(pages)) {
    issues.push({ code: 'pages', message: 'Page count must be integer 1–6.', severity: 'error' });
  }

  const budget = getLayoutBudgetForPages(pages);
  if (doc.competencies.length > budget.coreCompetenciesCount + 2) {
    issues.push({
      code: 'competencies_overflow',
      message: `Too many competencies for ${pages}-page budget.`,
      severity: 'warn',
    });
  }

  if (!doc.summary.trim()) {
    issues.push({ code: 'summary_empty', message: 'Summary is empty.', severity: 'error' });
  }

  if (!doc.fullName.trim()) {
    issues.push({ code: 'name_empty', message: 'Name is missing.', severity: 'error' });
  }

  const blob = [doc.summary, ...doc.competencies, ...doc.skills.join(' '), ...doc.experience.flatMap((e) => e.bullets)].join(
    ' '
  );
  for (const pattern of FORBIDDEN_RESUME_PHRASES) {
    if (pattern.test(blob)) {
      issues.push({ code: 'forbidden_phrase', message: 'Document contains forbidden in-app jargon.', severity: 'error' });
      break;
    }
  }

  if (doc.experience.length === 0) {
    issues.push({ code: 'experience_empty', message: 'No experience blocks.', severity: 'warn' });
  }

  const metricsPattern = /\d+%|\$\d|#\d|\d+\+|increased|decreased|reduced|saved|grew|improved/i;
  const allBullets = doc.experience.flatMap((e) => e.bullets);
  if (allBullets.length) {
    const withMetrics = allBullets.filter((b) => metricsPattern.test(b)).length;
    const ratio = withMetrics / allBullets.length;
    if (ratio < 0.5) {
      issues.push({
        code: 'metrics_low',
        message: 'Fewer than half of bullets include quantified outcomes.',
        severity: 'warn',
      });
    }
  }

  // Section headers are enforced at export — sanity check target role present
  if (!doc.targetRole.trim()) {
    issues.push({ code: 'target_role', message: 'Target role headline is empty.', severity: 'warn' });
  }

  void SECTION_HEADERS;

  return {
    valid: !issues.some((i) => i.severity === 'error'),
    issues,
  };
}
