import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ResolvedResumeDocument } from './types';
import { SECTION_HEADERS, formatExperienceDates } from './format-rules';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 25;
const LINE_HEIGHT = 12;
const BODY_SIZE = 10;
const TITLE_SIZE = 16;
const SECTION_SIZE = 11;

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export async function exportResumePdf(doc: ResolvedResumeDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawLine = (text: string, size: number, bold = false, centered = false) => {
    const f = bold ? fontBold : font;
    ensureSpace(LINE_HEIGHT + 2);
    const x = centered ? MARGIN + (maxWidth - f.widthOfTextAtSize(text, size)) / 2 : MARGIN;
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });
    y -= LINE_HEIGHT + (bold ? 2 : 0);
  };

  const drawWrapped = (text: string, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    for (const line of wrapText(text, maxWidth, f, size)) {
      ensureSpace(LINE_HEIGHT);
      page.drawText(line, { x: MARGIN, y, size, font: f, color: rgb(0, 0, 0) });
      y -= LINE_HEIGHT;
    }
  };

  const drawSection = (title: string) => {
    y -= 6;
    drawLine(title.toUpperCase(), SECTION_SIZE, true);
    y -= 2;
    page.drawLine({
      start: { x: MARGIN, y: y + 8 },
      end: { x: PAGE_WIDTH - MARGIN, y: y + 8 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    y -= 4;
  };

  drawLine(doc.fullName.toUpperCase(), TITLE_SIZE, true, true);
  drawLine(doc.contactLine, BODY_SIZE, false, true);
  drawLine(doc.targetRole.toUpperCase(), BODY_SIZE, true, true);
  y -= 8;

  drawSection(SECTION_HEADERS.summary);
  drawWrapped(doc.summary, BODY_SIZE);

  if (doc.competencies.length) {
    drawSection(SECTION_HEADERS.competencies);
    for (const c of doc.competencies) {
      drawWrapped(`• ${c}`, BODY_SIZE);
    }
  }

  if (doc.skills.length) {
    drawSection(SECTION_HEADERS.skills);
    drawWrapped(doc.skills.join(', '), BODY_SIZE);
  }

  drawSection(SECTION_HEADERS.experience);
  for (const role of doc.experience) {
    const header = role.location
      ? `${role.company} — ${role.location}`
      : role.company;
    drawLine(header, BODY_SIZE, true);
    const dates = formatExperienceDates(role.startDate, role.endDate);
    drawLine(`${role.jobTitle}    ${dates}`, BODY_SIZE);
    for (const bullet of role.bullets) {
      drawWrapped(`• ${bullet}`, BODY_SIZE);
    }
    y -= 4;
  }

  if (doc.education.length) {
    drawSection(SECTION_HEADERS.education);
    for (const e of doc.education) {
      const degree =
        e.fieldOfStudy?.trim() && e.degree?.trim()
          ? `${e.degree} in ${e.fieldOfStudy}`
          : e.degree || e.fieldOfStudy;
      const line = [degree, e.school, e.endDate].filter(Boolean).join(' | ');
      drawWrapped(line, BODY_SIZE);
    }
  }

  return pdf.save();
}

export async function exportCoverLetterPdf(text: string, fullName: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  let y = PAGE_HEIGHT - MARGIN;

  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  for (const para of paragraphs) {
    for (const line of wrapText(para.replace(/\n/g, ' '), maxWidth, font, BODY_SIZE)) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0, 0, 0) });
      y -= LINE_HEIGHT;
    }
    y -= LINE_HEIGHT;
  }

  void fullName;
  return pdf.save();
}

export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: 'application/pdf',
  });
}
