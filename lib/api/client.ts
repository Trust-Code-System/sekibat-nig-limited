import "server-only";

/** HTTP and cache policy for the Sekibat backend adapter. */

export const CACHE_TAGS = {
  properties: "properties",
  property: (slug: string) => `property:${slug}`,
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  services: "services",
  company: "company",
} as const;

/** Seconds. Short enough that a missed purge self-heals, long enough to be worth caching. */
export const DEFAULT_REVALIDATE = 300;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string
  ) {
    super(`Sekibat API responded ${status} for ${path}`);
    this.name = "ApiError";
  }
}

export class ApiUnavailableError extends Error {
  constructor(
    readonly path: string,
    options?: { cause?: unknown }
  ) {
    super(`Sekibat API is unreachable for ${path}`);
    this.name = "ApiUnavailableError";
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

export function hasRemoteApi(): boolean {
  return Boolean(process.env.SEKIBAT_API_URL?.trim());
}

export function apiUrl(path: string): string {
  const base = process.env.SEKIBAT_API_URL?.trim();
  if (!base) throw new Error("SEKIBAT_API_URL is not set");
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function apiHeaders(extra: HeadersInit = {}): HeadersInit {
  return {
    accept: "application/json",
    ...(process.env.SEKIBAT_API_KEY ? { "x-api-key": process.env.SEKIBAT_API_KEY } : {}),
    ...extra,
  };
}

/** Serialise the repository query objects using repeated keys for array filters. */
export function apiPath(
  path: string,
  query: Record<string, string | number | boolean | string[] | undefined> = {}
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    } else {
      search.set(key, String(value));
    }
  }
  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

/**
 * Returns `null` on 404 so callers can keep the `T | null` contract without try/catch.
 * Throws on any other non-OK response — a 500 should surface, not render as an empty page.
 */
export async function fetchJson<T>(
  path: string,
  tags: string[],
  revalidate: number = DEFAULT_REVALIDATE
): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      headers: apiHeaders(),
      // Next 15+ does not cache fetch by default, so this must be explicit.
      next: { revalidate, tags },
    });
  } catch (error) {
    throw new ApiUnavailableError(path, { cause: error });
  }

  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}

/** Use the remote record when the API is up; otherwise the bundled local data. */
export async function remoteOrLocal<T>(
  path: string,
  tags: string[],
  fallback: () => T | Promise<T>,
  revalidate: number = DEFAULT_REVALIDATE
): Promise<T> {
  if (!hasRemoteApi()) return fallback();
  try {
    const result = await fetchJson<T>(path, tags, revalidate);
    if (result !== null) return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.warn(`[api] ${path}: remote unavailable, using local records`);
  }
  return fallback();
}

/** Like `remoteOrLocal`, but a remote 404 stays `null` instead of using local data. */
export async function remoteOrLocalNullable<T>(
  path: string,
  tags: string[],
  fallback: () => T | null | Promise<T | null>,
  revalidate: number = DEFAULT_REVALIDATE
): Promise<T | null> {
  if (!hasRemoteApi()) return fallback();
  try {
    return await fetchJson<T>(path, tags, revalidate);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.warn(`[api] ${path}: remote unavailable, using local records`);
    return fallback();
  }
}
