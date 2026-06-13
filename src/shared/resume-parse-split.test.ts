import { describe, expect, it } from 'vitest';
import { assembleSplitParseParts } from './resume-types';
import {
  buildProfileCategoryPromptText,
  parseSkillsFromLines,
  shouldUseSplitResumeParse,
  splitExperienceIntoChunks,
  splitExperienceLinesIntoRoleBlocks,
  tokenizeResumeSections,
} from './resume-parse-split';

const MULTI_ROLE_EXPERIENCE = `EXPERIENCE
Senior Engineer | Acme Corp
2020 – Present
- Built platform services
- Led migration to Kubernetes

Software Engineer | Beta Inc
2018 – 2020
- Developed APIs
- Improved latency by 40%

EDUCATION
B.S. Computer Science, State University, 2018

SKILLS
Python, Kubernetes, AWS, TypeScript`;

describe('shouldUseSplitResumeParse', () => {
  it('triggers for multi-page PDFs', () => {
    expect(shouldUseSplitResumeParse(5000, 2)).toBe(true);
  });

  it('triggers for long single-page text', () => {
    expect(shouldUseSplitResumeParse(10_000, 1)).toBe(true);
  });

  it('does not trigger for short one-page resumes', () => {
    expect(shouldUseSplitResumeParse(4000, 1)).toBe(false);
  });
});

describe('tokenizeResumeSections', () => {
  it('segments experience, education, and skills', () => {
    const buckets = tokenizeResumeSections(MULTI_ROLE_EXPERIENCE);
    expect(buckets.experience.some((l) => l.includes('Acme Corp'))).toBe(true);
    expect(buckets.education.some((l) => l.includes('Computer Science'))).toBe(true);
    expect(buckets.skills.some((l) => l.includes('Kubernetes'))).toBe(true);
  });
});

describe('splitExperienceLinesIntoRoleBlocks', () => {
  it('splits on date-range boundaries', () => {
    const buckets = tokenizeResumeSections(MULTI_ROLE_EXPERIENCE);
    const blocks = splitExperienceLinesIntoRoleBlocks(buckets.experience);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
  });
});

describe('splitExperienceIntoChunks', () => {
  it('keeps small experience in one chunk', () => {
    const buckets = tokenizeResumeSections(MULTI_ROLE_EXPERIENCE);
    const chunks = splitExperienceIntoChunks(buckets.experience, 20_000);
    expect(chunks).toHaveLength(1);
  });

  it('splits very large experience text into multiple chunks', () => {
    const line = '- Delivered measurable outcomes across platform, data, and infrastructure initiatives.';
    const huge = Array.from({ length: 400 }, (_, i) =>
      i % 5 === 0 ? `Engineer ${i} | Company ${i}\n2018 – 2020` : line
    );
    const chunks = splitExperienceIntoChunks(huge, 3000);
    expect(chunks.length).toBeGreaterThan(1);
  });
});

describe('buildProfileCategoryPromptText', () => {
  it('includes only header, education, and skills — not full experience body', () => {
    const buckets = tokenizeResumeSections(MULTI_ROLE_EXPERIENCE);
    const prompt = buildProfileCategoryPromptText(MULTI_ROLE_EXPERIENCE, buckets);
    expect(prompt).toContain('TECHNICAL SKILLS');
    expect(prompt).toContain('EDUCATION');
    expect(prompt).not.toContain('Built platform services');
  });
});

describe('parseSkillsFromLines', () => {
  it('splits comma-separated skills', () => {
    expect(parseSkillsFromLines(['Python, Kubernetes, AWS'])).toEqual(
      expect.arrayContaining(['Python', 'Kubernetes', 'AWS'])
    );
  });
});

describe('assembleSplitParseParts', () => {
  it('merges profile patch with experience and local seed', () => {
    const merged = assembleSplitParseParts(
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        skills: ['Go', 'Rust'],
      },
      [
        {
          jobTitle: 'Engineer',
          company: 'Acme',
          startDate: '2020',
          endDate: 'Present',
          bullets: ['Shipped features'],
        },
      ],
      { phone: '555-0100', city: 'Austin', state: 'TX', country: 'United States' }
    );

    expect(merged.firstName).toBe('Jane');
    expect(merged.phone).toBe('555-0100');
    expect(merged.skills).toEqual(['Go', 'Rust']);
    expect(merged.experience).toHaveLength(1);
    expect(merged.summary).toBe('');
    expect(merged.competencies).toEqual([]);
  });
});
