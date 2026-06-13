/**
 * Master resume exports — PDF and DOCX mirror master-resume-template.tex layout.
 * Single visual standard for preview, print, saved artifacts, and assist-apply uploads.
 */

import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from 'docx';
import type { MasterResumePreviewModel } from '../resume-preview-model';

/** Section titles — must match master-resume-template.tex */
export const MASTER_RESUME_SECTIONS = {
  competencies: 'Core Competencies and Technical Leadership',
  skills: 'Technical Skills',
  experience: 'Professional Experience',
  education: 'Education and Certifications',
} as const;

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
/** 0.35in margins — matches template geometry */
const MARGIN = Math.round(0.35 * 72);
const BODY_SIZE = 9;
const TITLE_SIZE = 16;
const HEADLINE_SIZE = 11;
const SECTION_SIZE = 11;
const LINE_HEIGHT = 11;

function contactLine(model: MasterResumePreviewModel): string {
  return [
    [model.city, model.state, model.zip].filter(Boolean).join(', '),
    model.phone,
    model.email,
    model.linkedin,
  ]
    .filter(Boolean)
    .join(' | ');
}

function headlineLine(model: MasterResumePreviewModel): string {
  return model.coreFocusDomains
    ? `${model.targetRole} | ${model.coreFocusDomains}`
    : model.targetRole;
}

export function masterResumeModelToPlainText(model: MasterResumePreviewModel): string {
  const lines: string[] = [
    model.fullName.toUpperCase(),
    contactLine(model),
    headlineLine(model).toUpperCase(),
    '',
    model.summary,
    '',
    MASTER_RESUME_SECTIONS.competencies,
    ...model.competencies.map((c) =>
      c.description ? `• ${c.title}: ${c.description}` : `• ${c.title}`
    ),
  ];

  if (model.skillBuckets.length) {
    lines.push('', MASTER_RESUME_SECTIONS.skills);
    for (const b of model.skillBuckets) {
      lines.push(`• ${b.label}: ${b.items}`);
    }
  }

  lines.push('', MASTER_RESUME_SECTIONS.experience);
  for (const role of model.roles) {
    lines.push(`${role.company}${role.location ? ` — ${role.location}` : ''}`);
    lines.push(`${role.title}    ${role.timeline}`);
    for (const b of role.bullets) lines.push(`• ${b}`);
    lines.push('');
  }

  lines.push(MASTER_RESUME_SECTIONS.education);
  for (const cred of model.credentials) {
    lines.push(`• ${cred.title} | ${cred.organization}`);
  }
  if (model.universityName && model.universityName !== '—') {
    lines.push(
      `• Bachelor of Technology (B.Tech) in Computer Science and Engineering | ${model.universityName}`
    );
  }

  return lines.join('\n');
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
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

type PdfCtx = {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
  maxWidth: number;
};

function ensureSpace(ctx: PdfCtx, needed: number): void {
  if (ctx.y - needed < MARGIN) {
    ctx.page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    ctx.y = PAGE_HEIGHT - MARGIN;
  }
}

function drawCentered(ctx: PdfCtx, text: string, size: number, bold = false): void {
  const f = bold ? ctx.fontBold : ctx.font;
  ensureSpace(ctx, LINE_HEIGHT + 2);
  const x = MARGIN + (ctx.maxWidth - f.widthOfTextAtSize(text, size)) / 2;
  ctx.page.drawText(text, { x, y: ctx.y, size, font: f, color: rgb(0, 0, 0) });
  ctx.y -= LINE_HEIGHT + (bold ? 2 : 0);
}

function drawWrapped(ctx: PdfCtx, text: string, size: number, bold = false, maxWidth = ctx.maxWidth): void {
  const f = bold ? ctx.fontBold : ctx.font;
  for (const line of wrapText(text, maxWidth, f, size)) {
    ensureSpace(ctx, LINE_HEIGHT);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: f, color: rgb(0, 0, 0) });
    ctx.y -= LINE_HEIGHT;
  }
}

function drawWrappedCentered(ctx: PdfCtx, text: string, size: number): void {
  const summaryWidth = ctx.maxWidth * 0.95;
  const offset = (ctx.maxWidth - summaryWidth) / 2;
  for (const line of wrapText(text, summaryWidth, ctx.font, size)) {
    ensureSpace(ctx, LINE_HEIGHT);
    const x = MARGIN + offset + (summaryWidth - ctx.font.widthOfTextAtSize(line, size)) / 2;
    ctx.page.drawText(line, { x, y: ctx.y, size, font: ctx.font, color: rgb(0, 0, 0) });
    ctx.y -= LINE_HEIGHT;
  }
}

function drawSection(ctx: PdfCtx, title: string): void {
  ctx.y -= 6;
  drawWrapped(ctx, title.toUpperCase(), SECTION_SIZE, true);
  ctx.y -= 1;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 8 },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y + 8 },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  ctx.y -= 4;
}

function drawSplitLine(
  ctx: PdfCtx,
  left: string,
  right: string,
  size: number,
  leftItalic = false
): void {
  const f = leftItalic ? ctx.font : ctx.fontBold;
  ensureSpace(ctx, LINE_HEIGHT);
  ctx.page.drawText(left, { x: MARGIN, y: ctx.y, size, font: f, color: rgb(0, 0, 0) });
  if (right) {
    const rw = ctx.fontBold.widthOfTextAtSize(right, size);
    ctx.page.drawText(right, {
      x: PAGE_WIDTH - MARGIN - rw,
      y: ctx.y,
      size,
      font: ctx.fontBold,
      color: rgb(0, 0, 0),
    });
  }
  ctx.y -= LINE_HEIGHT;
}

export async function exportMasterResumePdf(model: MasterResumePreviewModel): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx: PdfCtx = {
    pdf,
    page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    font,
    fontBold,
    y: PAGE_HEIGHT - MARGIN,
    maxWidth: PAGE_WIDTH - MARGIN * 2,
  };

  drawCentered(ctx, model.fullName.toUpperCase(), TITLE_SIZE, true);
  drawCentered(ctx, contactLine(model), BODY_SIZE);
  drawCentered(ctx, headlineLine(model).toUpperCase(), HEADLINE_SIZE, true);
  ctx.y -= 4;

  if (model.summary) {
    drawWrappedCentered(ctx, model.summary, BODY_SIZE);
    ctx.y -= 4;
  }

  if (model.competencies.length) {
    drawSection(ctx, MASTER_RESUME_SECTIONS.competencies);
    for (const c of model.competencies) {
      const line = c.description ? `${c.title}: ${c.description}` : c.title;
      drawWrapped(ctx, `• ${line}`, BODY_SIZE);
    }
  }

  if (model.skillBuckets.length) {
    drawSection(ctx, MASTER_RESUME_SECTIONS.skills);
    for (const b of model.skillBuckets) {
      drawWrapped(ctx, `• ${b.label}: ${b.items}`, BODY_SIZE);
    }
  }

  if (model.roles.length) {
    drawSection(ctx, MASTER_RESUME_SECTIONS.experience);
    for (const role of model.roles) {
      drawSplitLine(ctx, role.company, role.location, BODY_SIZE);
      drawSplitLine(ctx, role.title, role.timeline, BODY_SIZE, true);
      for (const bullet of role.bullets) {
        drawWrapped(ctx, `• ${bullet}`, BODY_SIZE);
      }
      ctx.y -= 3;
    }
  }

  const eduLines: string[] = [];
  for (const cred of model.credentials) {
    eduLines.push(`${cred.title} | ${cred.organization}`);
  }
  if (model.universityName && model.universityName !== '—') {
    eduLines.push(
      `Bachelor of Technology (B.Tech) in Computer Science and Engineering | ${model.universityName}`
    );
  }
  if (eduLines.length) {
    drawSection(ctx, MASTER_RESUME_SECTIONS.education);
    for (const line of eduLines) {
      drawWrapped(ctx, `• ${line}`, BODY_SIZE);
    }
  }

  return pdf.save();
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22 })],
  });
}

function bulletParagraph(text: string, boldPrefix?: string): Paragraph {
  if (boldPrefix) {
    return new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: '• ', size: 18 }),
        new TextRun({ text: `${boldPrefix}: `, bold: true, size: 18 }),
        new TextRun({ text, size: 18 }),
      ],
    });
  }
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `• ${text}`, size: 18 })],
  });
}

export async function exportMasterResumeDocx(model: MasterResumePreviewModel): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: model.fullName.toUpperCase(), bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: contactLine(model), size: 18 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: headlineLine(model).toUpperCase(), bold: true, size: 22 })],
    }),
  ];

  if (model.summary) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: model.summary, size: 18 })],
      })
    );
  }

  if (model.competencies.length) {
    children.push(sectionHeading(MASTER_RESUME_SECTIONS.competencies));
    for (const c of model.competencies) {
      children.push(
        c.description
          ? bulletParagraph(c.description, c.title)
          : bulletParagraph(c.title)
      );
    }
  }

  if (model.skillBuckets.length) {
    children.push(sectionHeading(MASTER_RESUME_SECTIONS.skills));
    for (const b of model.skillBuckets) {
      children.push(bulletParagraph(b.items, b.label));
    }
  }

  if (model.roles.length) {
    children.push(sectionHeading(MASTER_RESUME_SECTIONS.experience));
    for (const role of model.roles) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: role.company, bold: true, size: 18 }),
            new TextRun({ text: `\t${role.location}`, bold: true, size: 18 }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: role.title, italics: true, size: 18 }),
            new TextRun({ text: `\t${role.timeline}`, bold: true, size: 18 }),
          ],
        })
      );
      for (const bullet of role.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  const eduItems: string[] = [];
  for (const cred of model.credentials) {
    eduItems.push(`${cred.title} | ${cred.organization}`);
  }
  if (model.universityName && model.universityName !== '—') {
    eduItems.push(
      `Bachelor of Technology (B.Tech) in Computer Science and Engineering | ${model.universityName}`
    );
  }
  if (eduItems.length) {
    children.push(sectionHeading(MASTER_RESUME_SECTIONS.education));
    for (const line of eduItems) children.push(bulletParagraph(line));
  }

  return Packer.toBlob(new Document({ sections: [{ properties: {}, children }] }));
}
