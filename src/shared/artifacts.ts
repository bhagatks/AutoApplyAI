export {
  buildAndSaveJobArtifacts,
  saveJobArtifactsViaDownloads,
  saveResumeToDirectory,
  type ArtifactPaths,
  type DownloadResult,
} from './downloads';

/** @deprecated Use resume-engine exportResumePdf — kept for emergency fallback only */
export function createSimpleTextPdf(title: string, body: string): Blob {
  const escapePdf = (text: string): string =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '?');

  const lines = [title, '', ...body.split('\n').slice(0, 80)];
  let y = 750;
  const contentLines = ['BT', '/F1 11 Tf', '50 750 Td'];
  for (const line of lines) {
    contentLines.push(`(${escapePdf(line.slice(0, 100))}) Tj`);
    y -= 14;
    contentLines.push(`0 -14 Td`);
    if (y < 50) break;
  }
  contentLines.push('ET');
  const stream = contentLines.join('\n');

  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length ${stream.length} >>stream
${stream}
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000266 00000 n 
0000000${(350 + stream.length).toString().padStart(3, '0')} 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
${400 + stream.length}
%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
