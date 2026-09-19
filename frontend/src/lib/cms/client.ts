import qs from "qs";

function env(name: "CMS_URL" | "CMS_API_TOKEN"): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set — required for the CMS data-access layer`);
  return v;
}

export function buildQueryString(query: Record<string, unknown>): string {
  return qs.stringify(query, { encodeValuesOnly: true }).replace(/%3A/g, ":");
}

export function absolute(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return `${env("CMS_URL")}${url}`;
}

export async function cmsFetch<T>(
  path: string,
  query: Record<string, unknown> = {},
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const base = env("CMS_URL");
  const token = env("CMS_API_TOKEN");
  const qsStr = buildQueryString(query);
  const url = `${base}/api${path}${qsStr ? `?${qsStr}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
  });
  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} for ${path}`);
  }
  return (await res.json()) as T;
}
