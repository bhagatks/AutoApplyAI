import { describe, expect, it } from 'vitest';
import { extractBasicContactFromText, parseResumeWithoutAi } from './ai';
import { parsedResumeSchema } from './resume-types';

const SAMPLE_RESUME = `Jane Doe
Software Engineer
San Francisco, CA
jane.doe@example.com | (555) 123-4567
linkedin.com/in/janedoe

EXPERIENCE
Acme Corp — Senior Engineer
Built platform services
Led migration to Kubernetes

EDUCATION
B.S. Computer Science
State University, 2018

SKILLS
TypeScript, React, Node.js, AWS, Docker`;

describe('extractBasicContactFromText', () => {
  it('extracts email, phone, linkedin, name, role, and location from header lines', () => {
    const contact = extractBasicContactFromText(SAMPLE_RESUME);
    expect(contact.firstName).toBe('Jane');
    expect(contact.lastName).toBe('Doe');
    expect(contact.role).toBe('Software Engineer');
    expect(contact.city).toBe('San Francisco');
    expect(contact.state).toBe('CA');
    expect(contact.email).toBe('jane.doe@example.com');
    expect(contact.phone).toBe('(555) 123-4567');
    expect(contact.linkedin).toBe('https://linkedin.com/in/janedoe');
  });
});

describe('parseResumeWithoutAi', () => {
  it('returns contact fields from regex extraction', () => {
    const text = 'John Smith\njohn@acme.org\n+15551234567';
    const resume = parseResumeWithoutAi(text, 'resume.pdf');
    expect(resume.firstName).toBe('John');
    expect(resume.lastName).toBe('Smith');
    expect(resume.email).toBe('john@acme.org');
    expect(resume.sourceFileName).toBe('resume.pdf');
    expect(resume.scannedAt).toBeTruthy();
  });

  it('tokenizes experience, education, and skills into structural drafts', () => {
    const resume = parseResumeWithoutAi(SAMPLE_RESUME, 'resume.pdf');

    expect(resume.experience).toHaveLength(1);
    expect(resume.experience[0].bullets).toEqual([
      'Acme Corp — Senior Engineer',
      'Built platform services',
      'Led migration to Kubernetes',
    ]);

    expect(resume.education).toHaveLength(1);
    expect(resume.education[0].degree).toBe('B.S. Computer Science\nState University, 2018');

    expect(resume.skills).toEqual(
      expect.arrayContaining(['TypeScript', 'React', 'Node.js', 'AWS', 'Docker'])
    );
  });

  it('splits skills on commas and bullet separators', () => {
    const text = `Alex Kim\nalex@example.com

SKILLS
Python • Java | SQL; Go`;
    const resume = parseResumeWithoutAi(text, 'resume.docx');
    expect(resume.skills).toEqual(expect.arrayContaining(['Python', 'Java', 'SQL', 'Go']));
  });
});

describe('parsedResumeSchema', () => {
  it('accepts partial AI payloads with defaults', () => {
    const result = parsedResumeSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual([]);
      expect(result.data.country).toBe('United States');
    }
  });
});
