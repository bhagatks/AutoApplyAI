import { SEED_CORE_COMPETENCIES } from './core-competencies-seed';

export const MAX_CORE_COMPETENCY_ENTRIES = 1000;
export const CORE_COMPETENCY_CATALOG_STORAGE_KEY = 'core_competency_catalog';

export type CompetencySource = 'seed' | 'scan' | 'manual';

export interface CoreCompetencyEntry {
  id: string;
  title: string;
  category: string;
  sources: CompetencySource[];
  createdAt: string;
  updatedAt: string;
}

export interface CoreCompetencyCatalog {
  version: number;
  entries: CoreCompetencyEntry[];
  updatedAt: string;
}

/** Per-user competency selections — stored at users/{uid}/userData/userCompetencies */
export interface UserCompetencyProfile {
  /** Slug IDs from the bundled core competencies catalog */
  catalogRefs: string[];
  /** User-only competencies from resume scan or manual entry (never written to global catalog) */
  custom: CoreCompetencyEntry[];
  updatedAt: string;
}

export interface MergeUserCompetenciesResult {
  profile: UserCompetencyProfile;
  /** Canonical titles for profile / parsedResume */
  profileCompetencies: string[];
  addedCustomCount: number;
  matchedCatalogCount: number;
  matchedCustomCount: number;
  skippedCount: number;
}

/** @deprecated Use MergeUserCompetenciesResult */
export interface MergeCompetenciesResult {
  catalog: CoreCompetencyCatalog;
  profileCompetencies: string[];
  addedCount: number;
  matchedCount: number;
  skippedCount: number;
}

export const MAX_USER_CUSTOM_COMPETENCIES = 500;

export function emptyUserCompetencyProfile(): UserCompetencyProfile {
  return { catalogRefs: [], custom: [], updatedAt: new Date().toISOString() };
}

export function slugifyCompetencyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeCompetencyTitle(title: string): string {
  const raw = title.replace(/\s+/g, ' ').trim();
  const colonIdx = raw.indexOf(':');
  if (colonIdx > 0) {
    return raw.slice(0, colonIdx).trim();
  }
  return raw;
}

function normalizeForMatch(title: string): string {
  return normalizeCompetencyTitle(title).toLowerCase();
}

export function competencyTitleKey(title: string): string {
  return normalizeForMatch(title);
}

export function isCompetencyAlreadySelected(selected: string[], title: string): boolean {
  const key = competencyTitleKey(title);
  if (!key) return false;
  return selected.some((s) => competencyTitleKey(s) === key);
}

export function createSeedCatalog(): CoreCompetencyCatalog {
  const now = new Date().toISOString();
  const entries: CoreCompetencyEntry[] = SEED_CORE_COMPETENCIES.map((seed) => ({
    id: slugifyCompetencyTitle(seed.title),
    title: seed.title,
    category: seed.category,
    sources: ['seed'],
    createdAt: now,
    updatedAt: now,
  }));

  return {
    version: 1,
    entries,
    updatedAt: now,
  };
}

let bundledCatalogCache: CoreCompetencyCatalog | null = null;

/** In-memory bundled catalog (core-competencies-seed.ts). No network I/O. */
export function getBundledCoreCompetencyCatalog(): CoreCompetencyCatalog {
  if (!bundledCatalogCache) {
    bundledCatalogCache = createSeedCatalog();
  }
  return bundledCatalogCache;
}

export function findCatalogEntry(catalog: CoreCompetencyCatalog, rawTitle: string): CoreCompetencyEntry | null {
  const normalized = normalizeForMatch(rawTitle);
  if (!normalized) return null;

  return (
    catalog.entries.find(
      (entry) =>
        normalizeForMatch(entry.title) === normalized || entry.id === slugifyCompetencyTitle(normalized)
    ) || null
  );
}

/** Match scan/manual titles against the global catalog; store refs or user-only custom entries. */
export function mergeCompetenciesForUser(
  globalCatalog: CoreCompetencyCatalog,
  userProfile: UserCompetencyProfile,
  rawTitles: string[],
  source: CompetencySource = 'scan',
  defaultCategory = 'Scanned from Resume'
): MergeUserCompetenciesResult {
  const catalogRefs = [...userProfile.catalogRefs];
  const custom = [...userProfile.custom];
  const profileCompetencies: string[] = [];
  const seenProfile = new Set<string>();
  const refSet = new Set(catalogRefs);
  let addedCustomCount = 0;
  let matchedCatalogCount = 0;
  let matchedCustomCount = 0;
  let skippedCount = 0;

  for (const raw of rawTitles) {
    const normalized = normalizeCompetencyTitle(raw);
    if (!normalized) continue;

    const globalMatch = findCatalogEntry(globalCatalog, normalized);
    if (globalMatch) {
      matchedCatalogCount++;
      if (!refSet.has(globalMatch.id)) {
        catalogRefs.push(globalMatch.id);
        refSet.add(globalMatch.id);
      }
      const key = normalizeForMatch(globalMatch.title);
      if (!seenProfile.has(key)) {
        profileCompetencies.push(globalMatch.title);
        seenProfile.add(key);
      }
      continue;
    }

    const customMatch = custom.find(
      (entry) =>
        normalizeForMatch(entry.title) === normalizeForMatch(normalized) ||
        entry.id === slugifyCompetencyTitle(normalized)
    );
    if (customMatch) {
      matchedCustomCount++;
      const key = normalizeForMatch(customMatch.title);
      if (!seenProfile.has(key)) {
        profileCompetencies.push(customMatch.title);
        seenProfile.add(key);
      }
      continue;
    }

    if (custom.length >= MAX_USER_CUSTOM_COMPETENCIES) {
      skippedCount++;
      const key = normalizeForMatch(normalized);
      if (!seenProfile.has(key)) {
        profileCompetencies.push(normalized);
        seenProfile.add(key);
      }
      continue;
    }

    const now = new Date().toISOString();
    const newEntry: CoreCompetencyEntry = {
      id: slugifyCompetencyTitle(normalized),
      title: normalized,
      category: defaultCategory,
      sources: [source],
      createdAt: now,
      updatedAt: now,
    };
    custom.push(newEntry);
    addedCustomCount++;
    const key = normalizeForMatch(normalized);
    if (!seenProfile.has(key)) {
      profileCompetencies.push(normalized);
      seenProfile.add(key);
    }
  }

  return {
    profile: {
      catalogRefs,
      custom,
      updatedAt: new Date().toISOString(),
    },
    profileCompetencies,
    addedCustomCount,
    matchedCatalogCount,
    matchedCustomCount,
    skippedCount,
  };
}

/** Resolve display titles from catalog refs + custom entries. */
export function resolveUserCompetencyTitles(
  globalCatalog: CoreCompetencyCatalog,
  userProfile: UserCompetencyProfile
): string[] {
  const titles: string[] = [];
  const seen = new Set<string>();
  const entryById = new Map(globalCatalog.entries.map((entry) => [entry.id, entry]));

  for (const refId of userProfile.catalogRefs) {
    const entry = entryById.get(refId);
    if (!entry) continue;
    const key = normalizeForMatch(entry.title);
    if (seen.has(key)) continue;
    titles.push(entry.title);
    seen.add(key);
  }

  for (const entry of userProfile.custom) {
    const key = normalizeForMatch(entry.title);
    if (seen.has(key)) continue;
    titles.push(entry.title);
    seen.add(key);
  }

  return titles;
}

export function getCompetencySuggestions(
  globalCatalog: CoreCompetencyCatalog,
  query: string,
  limit = 12,
  userProfile?: UserCompetencyProfile | null,
  excludeTitles: string[] = []
): CoreCompetencyEntry[] {
  const q = query.trim().toLowerCase();
  const exclude = new Set(excludeTitles.map((t) => normalizeForMatch(t)).filter(Boolean));
  const pool = [
    ...globalCatalog.entries,
    ...(userProfile?.custom ?? []),
  ].filter((entry) => !exclude.has(normalizeForMatch(entry.title)));

  if (!q) return pool.slice(0, limit);

  return pool
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.id.includes(q.replace(/\s+/g, '-'))
    )
    .slice(0, limit);
}

export function hasExactCompetencyMatch(
  globalCatalog: CoreCompetencyCatalog,
  query: string,
  userProfile?: UserCompetencyProfile | null
): boolean {
  const key = normalizeForMatch(query);
  if (!key) return false;
  const pool = [...globalCatalog.entries, ...(userProfile?.custom ?? [])];
  return pool.some((entry) => normalizeForMatch(entry.title) === key);
}

export async function readLocalCoreCompetencyCatalog(): Promise<CoreCompetencyCatalog | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return await new Promise((resolve) => {
        chrome.storage.local.get([CORE_COMPETENCY_CATALOG_STORAGE_KEY], (res) => {
          resolve((res[CORE_COMPETENCY_CATALOG_STORAGE_KEY] as CoreCompetencyCatalog) || null);
        });
      });
    }
    const raw = localStorage.getItem(CORE_COMPETENCY_CATALOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CoreCompetencyCatalog) : null;
  } catch (err) {
    console.warn('Failed to read local core competency catalog:', err);
    return null;
  }
}

export async function writeLocalCoreCompetencyCatalog(catalog: CoreCompetencyCatalog): Promise<void> {
  const payload = { ...catalog, updatedAt: new Date().toISOString() };
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [CORE_COMPETENCY_CATALOG_STORAGE_KEY]: payload }, () => resolve());
      });
      return;
    }
    localStorage.setItem(CORE_COMPETENCY_CATALOG_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write local core competency catalog:', err);
  }
}
