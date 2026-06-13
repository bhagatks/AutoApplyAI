import { assembleMasterResumeLatex, type MasterResumeBuildInput } from '../master-resume-latex';
import type { ResolvedResumeDocument } from './types';
import type { ResumeRules, BaseProfile } from '../types';
import type { ParsedResume } from '../resume-types';
import { parseCompetencyItems } from './types';

/** Map resolved document back to master LaTeX builder input. */
export function buildTexFromResolved(
  doc: ResolvedResumeDocument,
  rules: ResumeRules,
  profile: BaseProfile,
  parsedResume?: ParsedResume | null
): string {
  const competenciesLatex = doc.competencies
    .map((c) => {
      const colonIdx = c.indexOf(':');
      if (colonIdx > 0 && colonIdx < 60) {
        const head = c.slice(0, colonIdx).trim();
        const tail = c.slice(colonIdx + 1).trim();
        return `\\item \\textbf{${head}:} ${tail}`;
      }
      return `\\item ${c}`;
    })
    .join('\n');

  const input: MasterResumeBuildInput = {
    jobTitle: doc.targetRole,
    summary: doc.summary,
    competencies: competenciesLatex,
    rules,
    profile,
    parsedResume,
    tailoredSkills: doc.skills,
    tailoredExperience: doc.experience.map((e, experienceIndex) => ({
      experienceIndex,
      tailoredJobTitle: e.jobTitle,
      bullets: e.bullets,
    })),
    layoutPages: doc.layoutDecision.pages,
  };

  return assembleMasterResumeLatex(input);
}

export function competenciesStringToLatex(competencies: string): string {
  const items = parseCompetencyItems(competencies);
  if (items.length && !competencies.includes('\\item')) {
    return items
      .map((c) => {
        const colonIdx = c.indexOf(':');
        if (colonIdx > 0 && colonIdx < 60) {
          return `\\item \\textbf{${c.slice(0, colonIdx).trim()}:} ${c.slice(colonIdx + 1).trim()}`;
        }
        return `\\item ${c}`;
      })
      .join('\n');
  }
  return competencies;
}
