export type FitBandLabel = 'Strong fit' | 'Good fit' | 'Fair fit' | 'Needs work';

export interface FitBand {
  label: FitBandLabel;
  min: number;
  max: number;
}

export const FIT_BANDS: FitBand[] = [
  { label: 'Strong fit', min: 80, max: 100 },
  { label: 'Good fit', min: 65, max: 79 },
  { label: 'Fair fit', min: 50, max: 64 },
  { label: 'Needs work', min: 0, max: 49 },
];

export function getFitBand(score: number): FitBand {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return FIT_BANDS.find((b) => clamped >= b.min && clamped <= b.max) || FIT_BANDS[FIT_BANDS.length - 1];
}

export function formatFitDisplay(score: number): { label: FitBandLabel; percent: number; display: string } {
  const percent = Math.max(0, Math.min(100, Math.round(score)));
  const band = getFitBand(percent);
  return { label: band.label, percent, display: `${band.label} · ${percent}%` };
}

export function buildGapChecklist(keywords: string[] | undefined, analysis: string | undefined): string[] {
  const items: string[] = [];
  if (keywords?.length) {
    const missing = keywords.slice(0, 8);
    for (const kw of missing) {
      items.push(`Align experience with: ${kw}`);
    }
  }
  if (analysis?.trim()) {
    const sentences = analysis.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    for (const s of sentences.slice(0, 4)) {
      if (s.length > 12 && s.length < 200) items.push(s);
    }
  }
  return items.slice(0, 8);
}

export function getMatchScore(job: { matchScore?: number; atsScore?: number }): number {
  return job.matchScore ?? job.atsScore ?? 0;
}
