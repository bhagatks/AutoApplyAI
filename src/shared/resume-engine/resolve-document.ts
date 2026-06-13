import type { ParsedResume } from '../resume-types';
import { formatLocation, resolveEducationEntries } from '../resume-types';
import type { BaseProfile } from '../types';
import { getLayoutBudgetForPages } from './compute-page-budget';
import { stripForbiddenPhrases } from './format-rules';
import {
  mergeExperienceWithTailoring,
  parseCompetencyItems,
  type ResolvedResumeDocument,
  type TailorSnapshotInput,
} from './types';

function buildContactLine(parsed: ParsedResume | null | undefined, profile: BaseProfile): string {
  const parts: string[] = [];
  const location =
    parsed?.city || parsed?.state
      ? formatLocation(parsed.city, parsed.state, parsed.country || '', parsed.postalCode)
      : profile.location?.trim() || '';
  if (location) parts.push(location);
  const phone = parsed?.phone?.trim() || profile.phone?.trim();
  if (phone) parts.push(phone);
  const email = parsed?.email?.trim() || profile.email?.trim();
  if (email) parts.push(email);
  const linkedin = parsed?.linkedin?.trim() || profile.linkedin?.trim();
  if (linkedin) parts.push(linkedin.replace(/^https?:\/\//i, ''));
  return parts.join(' | ');
}

export function resolveResumeDocument(
  parsedResume: ParsedResume | null | undefined,
  profile: BaseProfile,
  snapshot: TailorSnapshotInput
): ResolvedResumeDocument {
  const pages = snapshot.layoutDecision?.pages || 1;
  const budget = getLayoutBudgetForPages(pages);

  const first = parsedResume?.preferredName?.trim() || parsedResume?.firstName?.trim() || profile.firstName;
  const last = parsedResume?.lastName?.trim() || profile.lastName;
  const fullName = `${first} ${last}`.trim();

  const competencies = parseCompetencyItems(snapshot.competencies).slice(0, budget.coreCompetenciesCount);

  const baseSkills = parsedResume?.skills?.filter(Boolean) || [];
  const skills = (snapshot.tailoredSkills?.length ? snapshot.tailoredSkills : baseSkills).slice(
    0,
    budget.maxSkillsTotal
  );

  const experience = mergeExperienceWithTailoring(
    parsedResume?.experience || [],
    snapshot.tailoredExperience,
    budget.maxRolesDetailed,
    budget.maxBulletsPerRole
  );

  const education = resolveEducationEntries(parsedResume).filter((e) => e.degree?.trim() || e.school?.trim());

  return {
    fullName,
    contactLine: buildContactLine(parsedResume, profile),
    targetRole: stripForbiddenPhrases(snapshot.jobTitle?.trim() || parsedResume?.role?.trim() || profile.role || ''),
    summary: stripForbiddenPhrases(snapshot.summary?.trim() || parsedResume?.summary?.trim() || ''),
    competencies,
    skills,
    experience,
    education,
    layoutDecision: snapshot.layoutDecision || { pages: 1, reason: 'Default single-page layout.' },
  };
}

export function documentToPlainText(doc: ResolvedResumeDocument): string {
  const lines: string[] = [
    doc.fullName.toUpperCase(),
    doc.contactLine,
    doc.targetRole.toUpperCase(),
    '',
    doc.summary,
    '',
    'Core Competencies',
    ...doc.competencies.map((c) => `• ${c}`),
  ];
  if (doc.skills.length) {
    lines.push('', 'Skills', doc.skills.join(', '));
  }
  lines.push('', 'Professional Experience');
  for (const role of doc.experience) {
    lines.push(`${role.company} — ${role.jobTitle}`);
    lines.push(`${role.startDate} -- ${role.endDate}`);
    for (const b of role.bullets) lines.push(`• ${b}`);
    lines.push('');
  }
  lines.push('Education');
  for (const e of doc.education) {
    lines.push(`${e.degree} | ${e.school} ${e.endDate}`.trim());
  }
  return lines.join('\n');
}
