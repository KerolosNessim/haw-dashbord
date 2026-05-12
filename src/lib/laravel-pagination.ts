/** Laravel LengthAwarePaginator JSON (`Illuminate\Pagination\LengthAwarePaginator`). */

export type LaravelPaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type LaravelPaginationMetaLink = {
  url: string | null;
  label: string;
  active: boolean;
};

export type LaravelPaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links?: LaravelPaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type LaravelPaginatedResponse<T = unknown> = {
  data: T[];
  links: LaravelPaginationLinks;
  meta: LaravelPaginationMeta;
};

export function parsePageFromUrl(url: string | null | undefined): number | null {
  if (url == null || url === "") return null;
  try {
    const u = new URL(url);
    const p = u.searchParams.get("page");
    if (p == null || p === "") return 1;
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    const m = /[?&]page=(\d+)/.exec(url);
    if (!m) return null;
    const n = Number.parseInt(m[1]!, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
}

/** Builds a URL for `page`, preserving existing query params on `path` when it is absolute. */
export function buildLaravelPageUrl(path: string, page: number): string {
  try {
    const u = new URL(path);
    u.searchParams.set("page", String(page));
    return u.toString();
  } catch {
    const base = path.split("?")[0] ?? path;
    const qs = path.includes("?") ? path.slice(path.indexOf("?") + 1) : "";
    const params = new URLSearchParams(qs);
    params.set("page", String(page));
    const q = params.toString();
    return q ? `${base}?${q}` : `${base}?page=${page}`;
  }
}

/**
 * Unwraps common API envelope shapes to Laravel's `{ data, meta, links }`.
 * Handles `{ data, meta, links }` and `{ data: { data, meta, links } }`.
 */
export function unwrapLaravelPaginated<T = unknown>(
  payload: unknown
): LaravelPaginatedResponse<T> | null {
  const tryShape = (obj: unknown): LaravelPaginatedResponse<T> | null => {
    if (!obj || typeof obj !== "object") return null;
    const o = obj as Record<string, unknown>;
    const data = o.data;
    const meta = o.meta;
    const links = o.links;
    if (!Array.isArray(data) || !meta || !links || typeof meta !== "object") return null;
    if (typeof links !== "object") return null;
    const m = meta as Record<string, unknown>;
    if (
      typeof m.current_page !== "number" ||
      typeof m.last_page !== "number" ||
      typeof m.path !== "string" ||
      typeof m.per_page !== "number" ||
      typeof m.total !== "number"
    ) {
      return null;
    }
    return {
      data: data as T[],
      meta: meta as LaravelPaginationMeta,
      links: links as LaravelPaginationLinks,
    };
  };

  const top = tryShape(payload);
  if (top) return top;
  if (payload && typeof payload === "object" && "data" in payload) {
    return tryShape((payload as Record<string, unknown>).data);
  }
  return null;
}

/** Page numbers with ellipsis markers between gaps (for button rows). */
export function getPaginationWindow(
  current: number,
  last: number,
  siblingCount = 1
): Array<number | "ellipsis"> {
  if (last < 1) return [];
  if (last === 1) return [1];

  const delta = Math.max(0, siblingCount);
  const left = Math.max(2, current - delta);
  const right = Math.min(last - 1, current + delta);

  const items: Array<number | "ellipsis"> = [1];
  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < last - 1) items.push("ellipsis");
  items.push(last);
  return items;
}
