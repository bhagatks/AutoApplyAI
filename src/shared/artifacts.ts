const DB_NAME = 'autoapplyai-fs';
const DB_VERSION = 1;
const STORE = 'handles';
const OUTPUT_DIR_KEY = 'outputDir';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

export async function saveOutputDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(handle, OUTPUT_DIR_KEY);
  });
  db.close();
}

export async function loadOutputDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb();
    const handle = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      tx.onerror = () => reject(tx.error);
      const req = tx.objectStore(STORE).get(OUTPUT_DIR_KEY);
      req.onsuccess = () => resolve(req.result as FileSystemDirectoryHandle | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return handle || null;
  } catch {
    return null;
  }
}

type WritableDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission(descriptor: { mode: 'readwrite' }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: 'readwrite' }): Promise<PermissionState>;
};

async function ensureWriteAccess(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const writable = handle as WritableDirectoryHandle;
  const opts = { mode: 'readwrite' as const };
  if ((await writable.queryPermission(opts)) === 'granted') return true;
  return (await writable.requestPermission(opts)) === 'granted';
}

async function getOrCreateSubdir(
  root: FileSystemDirectoryHandle,
  segments: string[]
): Promise<FileSystemDirectoryHandle> {
  let current = root;
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true });
  }
  return current;
}

async function writeTextFile(
  dir: FileSystemDirectoryHandle,
  fileName: string,
  content: string
): Promise<void> {
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export interface ArtifactPaths {
  resumeTexPath: string;
  coverLetterTexPath: string;
  resumePdfPath: string;
  resumeDocxPath: string;
  coverLetterPdfPath: string;
  coverLetterDocxPath: string;
}

export async function saveJobArtifactsToOutputDir(
  rootHandle: FileSystemDirectoryHandle,
  baseName: string,
  resumeTex: string,
  coverLetterTex: string,
  resumePdfBlob: Blob,
  coverLetterPdfBlob: Blob,
  resumeDocxBlob?: Blob,
  coverLetterDocxBlob?: Blob
): Promise<ArtifactPaths> {
  const hasAccess = await ensureWriteAccess(rootHandle);
  if (!hasAccess) {
    throw new Error('Write access to the output folder was denied. Re-select the folder in onboarding.');
  }

  const resumeTexDir = await getOrCreateSubdir(rootHandle, ['resume_tex']);
  const coverTexDir = await getOrCreateSubdir(rootHandle, ['coverletter_tex']);
  const resumePdfDir = await getOrCreateSubdir(rootHandle, ['resume_pdf']);
  const resumeDocxDir = await getOrCreateSubdir(rootHandle, ['resume_docx']);
  const coverPdfDir = await getOrCreateSubdir(rootHandle, ['coverletter_pdf']);
  const coverDocxDir = await getOrCreateSubdir(rootHandle, ['coverletter_docx']);

  const resumeTexName = `${baseName}_resume.tex`;
  const coverTexName = `${baseName}_coverletter.tex`;
  const resumePdfName = `${baseName}_resume.pdf`;
  const resumeDocxName = `${baseName}_resume.docx`;
  const coverPdfName = `${baseName}_coverletter.pdf`;
  const coverDocxName = `${baseName}_coverletter.docx`;

  await writeTextFile(resumeTexDir, resumeTexName, resumeTex);
  await writeTextFile(coverTexDir, coverTexName, coverLetterTex);

  const resumePdfHandle = await resumePdfDir.getFileHandle(resumePdfName, { create: true });
  const resumePdfWritable = await resumePdfHandle.createWritable();
  await resumePdfWritable.write(resumePdfBlob);
  await resumePdfWritable.close();

  const coverPdfHandle = await coverPdfDir.getFileHandle(coverPdfName, { create: true });
  const coverPdfWritable = await coverPdfHandle.createWritable();
  await coverPdfWritable.write(coverLetterPdfBlob);
  await coverPdfWritable.close();

  if (resumeDocxBlob) {
    const resumeDocxHandle = await resumeDocxDir.getFileHandle(resumeDocxName, { create: true });
    const resumeDocxWritable = await resumeDocxHandle.createWritable();
    await resumeDocxWritable.write(resumeDocxBlob);
    await resumeDocxWritable.close();
  }

  if (coverLetterDocxBlob) {
    const coverDocxHandle = await coverDocxDir.getFileHandle(coverDocxName, { create: true });
    const coverDocxWritable = await coverDocxHandle.createWritable();
    await coverDocxWritable.write(coverLetterDocxBlob);
    await coverDocxWritable.close();
  }

  return {
    resumeTexPath: `resume_tex/${resumeTexName}`,
    coverLetterTexPath: `coverletter_tex/${coverTexName}`,
    resumePdfPath: `resume_pdf/${resumePdfName}`,
    resumeDocxPath: `resume_docx/${resumeDocxName}`,
    coverLetterPdfPath: `coverletter_pdf/${coverPdfName}`,
    coverLetterDocxPath: `coverletter_docx/${coverDocxName}`,
  };
}

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

export async function buildAndSaveJobArtifacts(
  baseName: string,
  resumeTex: string,
  coverLetterTex: string,
  _resumePlainText: string,
  _coverLetterPlainText: string,
  resumePdfBlob: Blob,
  coverLetterPdfBlob: Blob,
  resumeDocxBlob?: Blob,
  coverLetterDocxBlob?: Blob
): Promise<ArtifactPaths | null> {
  const handle = await loadOutputDirHandle();
  if (!handle) return null;

  return saveJobArtifactsToOutputDir(
    handle,
    baseName,
    resumeTex,
    coverLetterTex,
    resumePdfBlob,
    coverLetterPdfBlob,
    resumeDocxBlob,
    coverLetterDocxBlob
  );
}
