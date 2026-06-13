import { SEED_CORE_SKILLS } from './core-skills-seed';

export const MAX_CORE_SKILL_ENTRIES = 2500;
export const CORE_SKILL_CATALOG_STORAGE_KEY = 'core_skill_catalog';

export type SkillSource = 'seed' | 'scan' | 'manual';

export interface CoreSkillEntry {
  id: string;
  title: string;
  category: string;
  sources: SkillSource[];
  createdAt: string;
  updatedAt: string;
}

export interface CoreSkillCatalog {
  version: number;
  entries: CoreSkillEntry[];
  updatedAt: string;
}

/** Per-user skill selections — stored at users/{uid}/config/userSkills */
export interface UserSkillProfile {
  catalogRefs: string[];
  custom: CoreSkillEntry[];
  updatedAt: string;
}

export interface MergeUserSkillsResult {
  profile: UserSkillProfile;
  profileSkills: string[];
  addedCustomCount: number;
  matchedCatalogCount: number;
  matchedCustomCount: number;
  skippedCount: number;
}

export const MAX_USER_CUSTOM_SKILLS = 500;

export function emptyUserSkillProfile(): UserSkillProfile {
  return { catalogRefs: [], custom: [], updatedAt: new Date().toISOString() };
}

export function slugifySkillTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeSkillTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

function normalizeForMatch(title: string): string {
  return normalizeSkillTitle(title).toLowerCase();
}

export function skillTitleKey(title: string): string {
  return normalizeForMatch(title);
}

export function isSkillAlreadySelected(selected: string[], title: string): boolean {
  const key = skillTitleKey(title);
  if (!key) return false;
  return selected.some((s) => skillTitleKey(s) === key);
}

export function createSeedSkillCatalog(): CoreSkillCatalog {
  const now = new Date().toISOString();
  const entries: CoreSkillEntry[] = SEED_CORE_SKILLS.map((seed) => ({
    id: slugifySkillTitle(seed.title),
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

let bundledSkillCatalogCache: CoreSkillCatalog | null = null;

/** In-memory bundled catalog (core-skills-seed.ts). No network I/O. */
export function getBundledCoreSkillCatalog(): CoreSkillCatalog {
  if (!bundledSkillCatalogCache) {
    bundledSkillCatalogCache = createSeedSkillCatalog();
  }
  return bundledSkillCatalogCache;
}

export function findSkillCatalogEntry(catalog: CoreSkillCatalog, rawTitle: string): CoreSkillEntry | null {
  const normalized = normalizeForMatch(rawTitle);
  if (!normalized) return null;

  return (
    catalog.entries.find(
      (entry) =>
        normalizeForMatch(entry.title) === normalized || entry.id === slugifySkillTitle(normalized)
    ) || null
  );
}

export function mergeSkillsForUser(
  globalCatalog: CoreSkillCatalog,
  userProfile: UserSkillProfile,
  rawTitles: string[],
  source: SkillSource = 'scan',
  defaultCategory = 'Scanned from Resume'
): MergeUserSkillsResult {
  const catalogRefs = [...userProfile.catalogRefs];
  const custom = [...userProfile.custom];
  const profileSkills: string[] = [];
  const seenProfile = new Set<string>();
  const refSet = new Set(catalogRefs);
  let addedCustomCount = 0;
  let matchedCatalogCount = 0;
  let matchedCustomCount = 0;
  let skippedCount = 0;

  for (const raw of rawTitles) {
    const normalized = normalizeSkillTitle(raw);
    if (!normalized) continue;

    const globalMatch = findSkillCatalogEntry(globalCatalog, normalized);
    if (globalMatch) {
      matchedCatalogCount++;
      if (!refSet.has(globalMatch.id)) {
        catalogRefs.push(globalMatch.id);
        refSet.add(globalMatch.id);
      }
      const key = normalizeForMatch(globalMatch.title);
      if (!seenProfile.has(key)) {
        profileSkills.push(globalMatch.title);
        seenProfile.add(key);
      }
      continue;
    }

    const customMatch = custom.find(
      (entry) =>
        normalizeForMatch(entry.title) === normalizeForMatch(normalized) ||
        entry.id === slugifySkillTitle(normalized)
    );
    if (customMatch) {
      matchedCustomCount++;
      const key = normalizeForMatch(customMatch.title);
      if (!seenProfile.has(key)) {
        profileSkills.push(customMatch.title);
        seenProfile.add(key);
      }
      continue;
    }

    if (custom.length >= MAX_USER_CUSTOM_SKILLS) {
      skippedCount++;
      const key = normalizeForMatch(normalized);
      if (!seenProfile.has(key)) {
        profileSkills.push(normalized);
        seenProfile.add(key);
      }
      continue;
    }

    const now = new Date().toISOString();
    const newEntry: CoreSkillEntry = {
      id: slugifySkillTitle(normalized),
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
      profileSkills.push(normalized);
      seenProfile.add(key);
    }
  }

  return {
    profile: {
      catalogRefs,
      custom,
      updatedAt: new Date().toISOString(),
    },
    profileSkills,
    addedCustomCount,
    matchedCatalogCount,
    matchedCustomCount,
    skippedCount,
  };
}

export function resolveUserSkillTitles(
  globalCatalog: CoreSkillCatalog,
  userProfile: UserSkillProfile
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

export function getSkillSuggestions(
  globalCatalog: CoreSkillCatalog,
  query: string,
  limit = 12,
  userProfile?: UserSkillProfile | null,
  excludeTitles: string[] = []
): CoreSkillEntry[] {
  const q = query.trim().toLowerCase();
  const exclude = new Set(excludeTitles.map((t) => normalizeForMatch(t)).filter(Boolean));
  const pool = [...globalCatalog.entries, ...(userProfile?.custom ?? [])].filter(
    (entry) => !exclude.has(normalizeForMatch(entry.title))
  );

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

export function hasExactSkillMatch(
  globalCatalog: CoreSkillCatalog,
  query: string,
  userProfile?: UserSkillProfile | null
): boolean {
  const key = normalizeForMatch(query);
  if (!key) return false;
  const pool = [...globalCatalog.entries, ...(userProfile?.custom ?? [])];
  return pool.some((entry) => normalizeForMatch(entry.title) === key);
}

export async function readLocalCoreSkillCatalog(): Promise<CoreSkillCatalog | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return await new Promise((resolve) => {
        chrome.storage.local.get([CORE_SKILL_CATALOG_STORAGE_KEY], (res) => {
          resolve((res[CORE_SKILL_CATALOG_STORAGE_KEY] as CoreSkillCatalog) || null);
        });
      });
    }
    const raw = localStorage.getItem(CORE_SKILL_CATALOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CoreSkillCatalog) : null;
  } catch (err) {
    console.warn('Failed to read local core skill catalog:', err);
    return null;
  }
}

export async function writeLocalCoreSkillCatalog(catalog: CoreSkillCatalog): Promise<void> {
  const payload = { ...catalog, updatedAt: new Date().toISOString() };
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [CORE_SKILL_CATALOG_STORAGE_KEY]: payload }, () => resolve());
      });
      return;
    }
    localStorage.setItem(CORE_SKILL_CATALOG_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write local core skill catalog:', err);
  }
}
