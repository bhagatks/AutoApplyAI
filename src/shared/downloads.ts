/** Root folder under the user's default Downloads directory for all AutoApplyAI exports. */
export const DOWNLOADS_ROOT = 'AutoApplyAI';

/** Base resumes uploaded during onboarding. */
export const DOWNLOADS_RESUMES_DIR = `${DOWNLOADS_ROOT}/Resumes`;

/** Legacy `CustomerConfig.outputDir` / `ResumeRules.file_naming.output_dir` label. */
export const DEFAULT_OUTPUT_DIR = DOWNLOADS_ROOT;

export interface DownloadResult {
  fileName: string;
  downloadId: number;
  relativePath: string;
}

export interface ArtifactPaths {
  resumeTexPath: string;
  coverLetterTexPath: string;
  resumePdfPath: string;
  resumeDocxPath: string;
  coverLetterPdfPath: string;
  coverLetterDocxPath: string;
}

function assertDownloadsApi(): void {
  if (typeof chrome === 'undefined' || !chrome.downloads?.download) {
    throw new Error('Downloads API is unavailable in this context.');
  }
}

export function buildDownloadPath(...segments: string[]): string {
  return segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

export async function downloadBlob(blob: Blob, relativePath: string): Promise<number> {
  assertDownloadsApi();
  const url = URL.createObjectURL(blob);
  try {
    const downloadId = await new Promise<number>((resolve, reject) => {
      chrome.downloads.download({ url, filename: relativePath, saveAs: false }, (id) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (id === undefined) {
          reject(new Error('Download failed to start.'));
          return;
        }
        resolve(id);
      });
    });
    return downloadId;
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

export async function downloadFile(file: File, relativePath: string): Promise<number> {
  return downloadBlob(file, relativePath);
}

export async function showDownloadInFolder(downloadId: number): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.downloads?.show) return;
  try {
    chrome.downloads.show(downloadId);
  } catch (err) {
    console.warn('Could not reveal download in folder:', err);
  }
}

function resumeExtension(fileName: string): '.pdf' | '.docx' | '.txt' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return '.docx';
  if (lower.endsWith('.txt')) return '.txt';
  return '.pdf';
}

export async function saveResumeToDirectory(
  file: File,
  saveName = 'base_resume'
): Promise<DownloadResult> {
  const ext = resumeExtension(file.name);
  const fileName = `${saveName}${ext}`;
  const relativePath = buildDownloadPath(DOWNLOADS_RESUMES_DIR, fileName);
  const downloadId = await downloadFile(file, relativePath);
  return { fileName, downloadId, relativePath };
}

export async function saveJobArtifactsViaDownloads(
  baseName: string,
  resumeTex: string,
  coverLetterTex: string,
  resumePdfBlob: Blob,
  coverLetterPdfBlob: Blob,
  resumeDocxBlob?: Blob,
  coverLetterDocxBlob?: Blob
): Promise<ArtifactPaths> {
  const resumeTexName = `${baseName}_resume.tex`;
  const coverTexName = `${baseName}_coverletter.tex`;
  const resumePdfName = `${baseName}_resume.pdf`;
  const resumeDocxName = `${baseName}_resume.docx`;
  const coverPdfName = `${baseName}_coverletter.pdf`;
  const coverDocxName = `${baseName}_coverletter.docx`;

  const resumeTexPath = `resume_tex/${resumeTexName}`;
  const coverLetterTexPath = `coverletter_tex/${coverTexName}`;
  const resumePdfPath = `resume_pdf/${resumePdfName}`;
  const resumeDocxPath = `resume_docx/${resumeDocxName}`;
  const coverLetterPdfPath = `coverletter_pdf/${coverPdfName}`;
  const coverLetterDocxPath = `coverletter_docx/${coverDocxName}`;

  await downloadBlob(
    new Blob([resumeTex], { type: 'text/plain' }),
    buildDownloadPath(DOWNLOADS_ROOT, resumeTexPath)
  );
  await downloadBlob(
    new Blob([coverLetterTex], { type: 'text/plain' }),
    buildDownloadPath(DOWNLOADS_ROOT, coverLetterTexPath)
  );
  await downloadBlob(resumePdfBlob, buildDownloadPath(DOWNLOADS_ROOT, resumePdfPath));
  await downloadBlob(coverLetterPdfBlob, buildDownloadPath(DOWNLOADS_ROOT, coverLetterPdfPath));

  if (resumeDocxBlob) {
    await downloadBlob(resumeDocxBlob, buildDownloadPath(DOWNLOADS_ROOT, resumeDocxPath));
  }
  if (coverLetterDocxBlob) {
    await downloadBlob(coverLetterDocxBlob, buildDownloadPath(DOWNLOADS_ROOT, coverLetterDocxPath));
  }

  return {
    resumeTexPath,
    coverLetterTexPath,
    resumePdfPath,
    resumeDocxPath,
    coverLetterPdfPath,
    coverLetterDocxPath,
  };
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
): Promise<ArtifactPaths> {
  return saveJobArtifactsViaDownloads(
    baseName,
    resumeTex,
    coverLetterTex,
    resumePdfBlob,
    coverLetterPdfBlob,
    resumeDocxBlob,
    coverLetterDocxBlob
  );
}
