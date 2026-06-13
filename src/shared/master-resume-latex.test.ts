import { describe, expect, it } from 'vitest';
import {
  assembleMasterResumeLatex,
  validateMasterResumeLatex,
  MASTER_RESUME_TEMPLATE,
} from './master-resume-latex';
import { getDefaultResumeRules } from './resume-builder-config';
import type { BaseProfile } from './types';
import type { ParsedResume } from './resume-types';

const rules = getDefaultResumeRules();
const profile: BaseProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  location: 'Austin, TX 78701',
  linkedin: 'linkedin.com/in/janedoe',
  role: 'Software Engineer',
  summary: 'Engineer with cloud and ML experience.',
  competencies: [],
};

const parsedResume: ParsedResume = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  city: 'Austin',
  state: 'TX',
  country: 'US',
  postalCode: '78701',
  linkedin: 'linkedin.com/in/janedoe',
  role: 'Software Engineer',
  summary: 'Base summary',
  competencies: [],
  skills: ['Python', 'AWS', 'React', 'PyTorch'],
  experience: [
    {
      company: 'Acme Corp',
      location: 'Remote',
      jobTitle: 'Senior Engineer',
      startDate: '2020-01',
      endDate: 'Present',
      bullets: ['Cut deploy time 40% and saved $120K annually'],
    },
  ],
  education: [
    {
      credentialType: 'degree',
      degree: 'B.S. Computer Science',
      fieldOfStudy: '',
      school: 'State University',
      location: '',
      startDate: '',
      endDate: '2018',
      honors: '',
    },
  ],
  currentCompany: 'Acme Corp',
  currentlyWorking: true,
  highestDegree: 'B.S. Computer Science',
  sourceFileName: 'test.pdf',
  scannedAt: '2026-01-01T00:00:00.000Z',
};

describe('master-resume-template.tex assembly', () => {
  it('loads the canonical template with fixed spacing macros', () => {
    expect(MASTER_RESUME_TEMPLATE).toContain('\\documentclass[9pt, letterpaper]{extarticle}');
    expect(MASTER_RESUME_TEMPLATE).toContain('[FULL_NAME]');
    expect(MASTER_RESUME_TEMPLATE).toContain('\\titlespacing{\\section}{0pt}{6pt}{2pt}');
  });

  it('replaces all bracket placeholders and escapes & and %', () => {
    const tex = assembleMasterResumeLatex({
      jobTitle: 'ML Engineer',
      summary: 'Delivered 35% faster inference and $2M cost savings across cloud workloads.',
      competencies:
        '\\item \\textbf{ML Systems:} Built RAG pipelines serving 10M requests/month\n\\item \\textbf{Cloud:} Cut AWS spend 28%\n\\item \\textbf{Leadership:} Led 6 engineers\n\\item \\textbf{Data:} Shipped streaming ETL',
      rules,
      profile,
      parsedResume,
      tailoredSkills: ['Python', 'PyTorch', 'AWS', 'Kafka'],
      tailoredExperience: [
        {
          experienceIndex: 0,
          tailoredJobTitle: 'Senior ML Engineer',
          bullets: ['Reduced p99 latency 45% and saved $120K/year'],
        },
      ],
    });

    expect(tex).not.toMatch(/\[FULL_NAME\]/);
    expect(tex).toContain('JANE DOE');
    expect(tex).toContain('ML ENGINEER');
    expect(tex).toContain('Core Competencies and Technical Leadership');
    expect(tex).toContain('AI/ML and Architectures');
    expect(tex).toContain('Acme Corp');
    expect(tex).toContain('35\\%');
    expect(tex).not.toMatch(/(?<!\\)&/);

    const validation = validateMasterResumeLatex(tex);
    expect(validation.ok).toBe(true);
  });
});
