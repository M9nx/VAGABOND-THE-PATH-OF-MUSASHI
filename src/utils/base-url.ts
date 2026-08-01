/** Normalize Astro `BASE_URL` so joins always include a trailing slash. */
export function getBaseUrl(): string {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export function withBase(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  return `${getBaseUrl()}${normalized}`;
}
