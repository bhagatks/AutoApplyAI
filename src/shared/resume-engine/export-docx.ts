import type { MasterResumePreviewModel } from '../resume-preview-model';
import { exportMasterResumeDocx as exportDocx } from './export-master';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

export { exportMasterResumeDocx } from './export-master';

/** @deprecated Use exportMasterResumeDocx */
export async function exportResumeDocx(model: MasterResumePreviewModel): Promise<Blob> {
  return exportDocx(model);
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
  return Packer.toBlob(new Document({ sections: [{ properties: {}, children }] }));
}
