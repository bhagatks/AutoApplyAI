/** Normalize URL for identity hashing (strip hash, sort query, trim trailing slash). */
export function normalizeJobUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    const params = [...parsed.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
    parsed.search = '';
    for (const [k, v] of params) parsed.searchParams.append(k, v);
    let path = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Normalize JD text for content hashing. */
export function normalizeJobDescription(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashJobDescription(text: string): Promise<string> {
  return sha256Hex(normalizeJobDescription(text));
}

export async function hashJobUrl(url: string): Promise<string> {
  return sha256Hex(normalizeJobUrl(url));
}
