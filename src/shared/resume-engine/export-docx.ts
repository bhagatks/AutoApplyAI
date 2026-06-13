import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import type { ResolvedResumeDocument } from './types';
import { SECTION_HEADERS, formatExperienceDates } from './format-rules';

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22 })],
  });
}

function bodyParagraph(text: string, bullet = false): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: bullet ? `• ${text}` : text, size: 20 })],
  });
}

export async function exportResumeDocx(doc: ResolvedResumeDocument): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: doc.fullName.toUpperCase(), bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: doc.contactLine, size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: doc.targetRole.toUpperCase(), bold: true, size: 22 })],
    }),
    sectionHeading(SECTION_HEADERS.summary),
    bodyParagraph(doc.summary),
  ];

  if (doc.competencies.length) {
    children.push(sectionHeading(SECTION_HEADERS.competencies));
    for (const c of doc.competencies) children.push(bodyParagraph(c, true));
  }

  if (doc.skills.length) {
    children.push(sectionHeading(SECTION_HEADERS.skills));
    children.push(bodyParagraph(doc.skills.join(', ')));
  }

  children.push(sectionHeading(SECTION_HEADERS.experience));
  for (const role of doc.experience) {
    const dates = formatExperienceDates(role.startDate, role.endDate);
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: role.company, bold: true, size: 20 }),
          ...(role.location
            ? [new TextRun({ text: ` — ${role.location}`, size: 20 })]
            : []),
        ],
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: role.jobTitle, italics: true, size: 20 }),
          new TextRun({ text: `\t${dates}`, bold: true, size: 20 }),
        ],
      })
    );
    for (const bullet of role.bullets) children.push(bodyParagraph(bullet, true));
  }

  if (doc.education.length) {
    children.push(sectionHeading(SECTION_HEADERS.education));
    for (const e of doc.education) {
      const degree =
        e.fieldOfStudy?.trim() && e.degree?.trim()
          ? `${e.degree} in ${e.fieldOfStudy}`
          : e.degree || e.fieldOfStudy;
      children.push(bodyParagraph([degree, e.school, e.endDate].filter(Boolean).join(' | ')));
    }
  }

  const document = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(document);
}

export async function exportCoverLetterDocx(text: string, fullName: string): Promise<Blob> {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const children = paragraphs.map(
    (p) =>
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: p.replace(/\n/g, ' '), size: 22 })],
      })
  );
  if (fullName) {
    children.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [new TextRun({ text: fullName, size: 22 })],
      })
    );
  }
  const document = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(document);
}
