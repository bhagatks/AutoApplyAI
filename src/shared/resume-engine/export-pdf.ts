import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { MasterResumePreviewModel } from '../resume-preview-model';
import { exportMasterResumePdf as exportPdf } from './export-master';

export { exportMasterResumePdf, exportMasterResumeDocx, masterResumeModelToPlainText, MASTER_RESUME_SECTIONS } from './export-master';

/** @deprecated Use exportMasterResumePdf — kept for signature compatibility */
export async function exportResumePdf(model: MasterResumePreviewModel): Promise<Uint8Array> {
  return exportPdf(model);
}

export async function exportCoverLetterPdf(text: string, fullName: string): Promise<Uint8Array> {
  const PAGE_WIDTH = 612;
  const PAGE_HEIGHT = 792;
  const MARGIN = Math.round(0.35 * 72);
  const BODY_SIZE = 9;
  const LINE_HEIGHT = 11;

  const pdf = await PDFDocument.create();
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  let y = PAGE_HEIGHT - MARGIN;

  const wrapText = (t: string, maxW: number): string[] => {
    const words = t.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, BODY_SIZE) <= maxW) current = test;
      else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  };

  for (const para of text.split(/\n\n+/).filter(Boolean)) {
    for (const line of wrapText(para.replace(/\n/g, ' '), maxWidth)) {
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
