/** Bundled PDF/DOCX/TXT text extraction — CSP-safe for Chrome extension pages */

let pdfjsReady: Promise<typeof import('pdfjs-dist')> | null = null;

type PdfTextItem = {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
};

async function getPdfJs() {
  if (!pdfjsReady) {
    pdfjsReady = (async () => {
      const pdfjs = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsReady;
}

type PositionedPdfItem = {
  str: string;
  x: number;
  y: number;
  hasEOL: boolean;
};

/** Single-column pages: sort by Y (top→bottom) then X (left→right) with line-gap breaks. */
function layoutSingleColumnPdfText(items: PositionedPdfItem[]): string {
  if (!items.length) return '';

  items.sort((a, b) => {
    const yThreshold = 5;
    if (Math.abs(a.y - b.y) < yThreshold) return a.x - b.x;
    return b.y - a.y;
  });

  let lastY = -1;
  let pageText = '';

  for (const item of items) {
    if (lastY !== -1 && Math.abs(item.y - lastY) > 8) {
      pageText += '\n';
    } else if (lastY !== -1 && item.str.trim().length > 0) {
      pageText += ' ';
    }
    pageText += item.str;
    lastY = item.y;
  }

  return pageText;
}

/** Multi-column resumes: read left column top→bottom, then right column (preserves header order). */
function layoutMultiColumnPdfText(items: PositionedPdfItem[], midX: number): string {
  const columns = [items.filter((p) => p.x < midX), items.filter((p) => p.x >= midX)];
  const columnTexts: string[] = [];

  for (const column of columns) {
    column.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 4) return yDiff;
      return a.x - b.x;
    });

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of column) {
      if (lastY !== null && Math.abs(item.y - lastY) > 4) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine = currentLine ? `${currentLine} ${item.str}` : item.str;
      }
      lastY = item.y;

      if (item.hasEOL) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = '';
        lastY = null;
      }
    }

    if (currentLine.trim()) lines.push(currentLine.trim());
    columnTexts.push(lines.join('\n'));
  }

  return columnTexts.filter(Boolean).join('\n\n');
}

function layoutPdfPageText(items: PdfTextItem[]): string {
  const positioned: PositionedPdfItem[] = items
    .filter((item) => item.str?.trim())
    .map((item) => ({
      str: item.str!.trim(),
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
      hasEOL: Boolean(item.hasEOL),
    }));

  if (!positioned.length) return '';

  const xs = positioned.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const pageWidth = maxX - minX;
  const midX = minX + pageWidth / 2;

  const useColumns =
    pageWidth > 200 &&
    positioned.some((p) => p.x < midX - 20) &&
    positioned.some((p) => p.x > midX + 20);

  return useColumns
    ? layoutMultiColumnPdfText(positioned, midX)
    : layoutSingleColumnPdfText(positioned);
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

export async function extractTextFromPdf(file: File, signal?: AbortSignal): Promise<PdfExtractionResult> {
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const pdfjs = await getPdfJs();
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (signal?.aborted) throw new Error('SCAN_CANCELLED');
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    pageTexts.push(layoutPdfPageText(textContent.items as PdfTextItem[]));
  }

  return {
    text: pageTexts.filter(Boolean).join('\n\n').trim(),
    pageCount: pdf.numPages,
  };
}

export async function extractTextFromDocx(file: File, signal?: AbortSignal): Promise<string> {
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const mammoth = await import('mammoth');
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || '').trim();
}

export async function extractTextFromPlainText(file: File, signal?: AbortSignal): Promise<string> {
  if (signal?.aborted) throw new Error('SCAN_CANCELLED');
  return (await file.text()).trim();
}

export interface ResumeExtractionResult {
  text: string;
  pageCount: number;
  warnings: string[];
  likelyScanned: boolean;
}

const MIN_CHARS_PER_PDF_PAGE = 120;

/** Unified entry for resume uploads — PDF, DOCX, or TXT. */
export async function extractResumeDocumentText(
  file: File,
  signal?: AbortSignal
): Promise<ResumeExtractionResult> {
  const nameLower = file.name.toLowerCase();
  const warnings: string[] = [];
  let text = '';
  let pageCount = 1;

  if (nameLower.endsWith('.txt')) {
    text = await extractTextFromPlainText(file, signal);
  } else if (nameLower.endsWith('.pdf')) {
    const pdfResult = await extractTextFromPdf(file, signal);
    text = pdfResult.text;
    pageCount = pdfResult.pageCount;
  } else if (nameLower.endsWith('.docx')) {
    text = await extractTextFromDocx(file, signal);
  } else {
    throw new Error('Unsupported file type. Upload PDF, DOCX, or TXT.');
  }

  const likelyScanned =
    nameLower.endsWith('.pdf') && text.length > 0 && text.length / Math.max(pageCount, 1) < MIN_CHARS_PER_PDF_PAGE;

  if (likelyScanned) {
    warnings.push(
      'This PDF looks image-based (scanned). Text extraction may be incomplete — review every field after import.'
    );
  }
  if (!text.trim()) {
    warnings.push(
      'No readable text was found. Use a text-based PDF or DOCX, or save your resume as .txt and upload again.'
    );
  }

  return { text: text.trim(), pageCount, warnings, likelyScanned };
}

type WritableDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission(descriptor: { mode: 'readwrite' }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: 'readwrite' }): Promise<PermissionState>;
};

export async function ensureDirectoryWriteAccess(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  const handle = dirHandle as WritableDirectoryHandle;
  const opts = { mode: 'readwrite' as const };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return (await handle.requestPermission(opts)) === 'granted';
}

export async function saveResumeToDirectory(
  dirHandle: FileSystemDirectoryHandle | null,
  file: File,
  saveName = 'base_resume'
): Promise<string | undefined> {
  if (!dirHandle) return undefined;

  const hasAccess = await ensureDirectoryWriteAccess(dirHandle);
  if (!hasAccess) {
    throw new Error(
      'Write access to the output folder was denied. Re-select the folder or complete onboarding to save the resume.'
    );
  }

  const lower = file.name.toLowerCase();
  const ext = lower.endsWith('.docx') ? '.docx' : lower.endsWith('.txt') ? '.txt' : '.pdf';
  const targetName = `${saveName}${ext}`;

  try {
    const fileHandle = await dirHandle.getFileHandle(targetName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
    return targetName;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'SecurityError') {
      throw new Error(
        'Folder write permission expired. Re-select the output folder, then upload your resume again.'
      );
    }
    throw err;
  }
}
