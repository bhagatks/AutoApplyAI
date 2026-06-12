import type { ParsedResume } from '../resume-types';
import type { LayoutDecision, ResumeLayoutBudget } from './types';
import { computeExperienceYears } from './types';

export const MIN_PAGES = 1;
export const MAX_PAGES = 6;

const FEDERAL_ACADEMIC_PATTERN =
  /\b(usajobs|federal|government|gs-\d|publication|dissertation|curriculum vitae|cv required|academic|tenure|research assistant|postdoc)\b/i;

function clampPages(n: number): number {
  return Math.min(MAX_PAGES, Math.max(MIN_PAGES, Math.round(n)));
}

export function getLayoutBudgetForPages(pages: number): ResumeLayoutBudget {
  const p = clampPages(pages);
  switch (p) {
    case 2:
      return {
        pages: 2,
        summarySentencesMax: 5,
        coreCompetenciesCount: 8,
        maxBulletsPerRole: 5,
        maxRolesDetailed: 4,
        maxSkillsTotal: 40,
        coverLetterParagraphs: 4,
      };
    case 3:
      return {
        pages: 3,
        summarySentencesMax: 6,
        coreCompetenciesCount: 10,
        maxBulletsPerRole: 6,
        maxRolesDetailed: 5,
        maxSkillsTotal: 50,
        coverLetterParagraphs: 4,
      };
    case 4:
      return {
        pages: 4,
        summarySentencesMax: 6,
        coreCompetenciesCount: 12,
        maxBulletsPerRole: 6,
        maxRolesDetailed: 5,
        maxSkillsTotal: 60,
        coverLetterParagraphs: 5,
      };
    case 5:
      return {
        pages: 5,
        summarySentencesMax: 7,
        coreCompetenciesCount: 12,
        maxBulletsPerRole: 7,
        maxRolesDetailed: 6,
        maxSkillsTotal: 70,
        coverLetterParagraphs: 5,
      };
    case 6:
      return {
        pages: 6,
        summarySentencesMax: 8,
        coreCompetenciesCount: 12,
        maxBulletsPerRole: 7,
        maxRolesDetailed: 8,
        maxSkillsTotal: 80,
        coverLetterParagraphs: 5,
      };
    case 1:
    default:
      return {
        pages: 1,
        summarySentencesMax: 4,
        coreCompetenciesCount: 6,
        maxBulletsPerRole: 4,
        maxRolesDetailed: 3,
        maxSkillsTotal: 28,
        coverLetterParagraphs: 3,
      };
  }
}

function isExecutiveRole(role: string): boolean {
  return /\b(director|vp|vice president|chief|head of|executive|svp|evp|president)\b/i.test(role);
}

/** Engine decides integer page count 1–6 from profile + optional JD signals. */
export function computeLayoutDecision(
  parsedResume: ParsedResume | null | undefined,
  jobDescription?: string
): LayoutDecision {
  const experience = parsedResume?.experience || [];
  const roleCount = experience.filter((j) => j.company?.trim() || j.jobTitle?.trim()).length;
  const years = computeExperienceYears(experience);
  const role = parsedResume?.role || experience[0]?.jobTitle || '';
  const jd = jobDescription || '';

  let pages = 1;
  let reason = '';

  if (FEDERAL_ACADEMIC_PATTERN.test(jd)) {
    pages = Math.min(6, Math.max(3, Math.ceil(roleCount / 2)));
    reason = `Federal or academic signals in the job description — ${pages} pages preserve required detail.`;
  } else if (years > 10 || isExecutiveRole(role)) {
    pages = 2;
    reason =
      years > 10
        ? `${years} years of experience across ${roleCount} role${roleCount === 1 ? '' : 's'} — 2 pages preserve metrics without cramming.`
        : `Senior/executive profile — 2 pages give room for leadership scope and outcomes.`;
  } else if (years >= 5 && roleCount >= 3) {
    pages = 2;
    reason = `${years} years across ${roleCount} roles — 2 pages recommended for readable density.`;
  } else {
    pages = 1;
    reason =
      roleCount <= 2
        ? `Focused profile (${years} years, ${roleCount} role${roleCount === 1 ? '' : 's'}) — 1 page keeps the story tight.`
        : `${years} years of experience — 1 page with prioritized recent roles.`;
  }

  pages = clampPages(pages);

  return { pages, reason, experienceYears: years, roleCount };
}

export function computeLayoutDecisionFromParsed(
  parsedResume: ParsedResume | null | undefined,
  jobDescription?: string
): { decision: LayoutDecision; budget: ResumeLayoutBudget } {
  const decision = computeLayoutDecision(parsedResume, jobDescription);
  const budget = getLayoutBudgetForPages(decision.pages);
  return { decision, budget };
}
