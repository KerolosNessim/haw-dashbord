import type { SectionApiKey, ServiceSectionsPayload } from "../service-section-types";
import type { Service } from "../type";

/** All section keys used for refetch signatures (incl. pricing-only blocks). */
export const SYNCABLE_SECTION_API_KEYS: SectionApiKey[] = [
  "benefits",
  "offerings",
  "steps",
  "tools",
  "faqs",
  "audits",
  "ctas",
  "packages",
];

/**
 * Keys managed on the main page builder save.
 * Excludes `packages` (edited on the pricing page via syncServicePackagesApi).
 */
export const BUILDER_MANAGED_SECTION_API_KEYS: SectionApiKey[] = [
  "benefits",
  "offerings",
  "steps",
  "tools",
  "faqs",
  "audits",
  "ctas",
];

function parseBlockId(value: unknown): number | null {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** API may use `id` or legacy `{type}_id` keys on section blocks. */
export function parseBlockIdFromRow(row: Record<string, unknown>): number | null {
  const candidates = [
    row.id,
    row.tool_id,
    row.benefit_id,
    row.step_id,
    row.faq_id,
    row.offering_id,
    row.cta_id,
    row.audit_id,
    row.package_id,
  ];
  for (const value of candidates) {
    const id = parseBlockId(value);
    if (id != null) return id;
  }
  return null;
}

/** Collect persisted block ids from API shape (object or array). */
export function extractBlockIds(raw: unknown): number[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        item && typeof item === "object"
          ? parseBlockIdFromRow(item as Record<string, unknown>)
          : null,
      )
      .filter((id): id is number => id != null);
  }
  if (typeof raw === "object") {
    const id = parseBlockIdFromRow(raw as Record<string, unknown>);
    return id != null ? [id] : [];
  }
  return [];
}

/** Section exists on the service but has no numeric id (legacy / malformed rows). */
export function apiKeyHasPersistedBlockWithoutId(raw: unknown): boolean {
  if (!raw) return false;
  if (extractBlockIds(raw).length > 0) return false;
  if (Array.isArray(raw)) return raw.length > 0;
  if (typeof raw === "object") return Object.keys(raw as object).length > 0;
  return false;
}

export function nextPayloadOmitsApiKey(
  sections: ServiceSectionsPayload,
  apiKey: SectionApiKey,
): boolean {
  const bucket = sections[apiKey];
  return bucket == null || (Array.isArray(bucket) && bucket.length === 0);
}

export function extractBlockIdsFromPayload(
  sections: ServiceSectionsPayload,
  apiKey: SectionApiKey,
): number[] {
  const bucket = sections[apiKey];
  if (!bucket) return [];
  if (Array.isArray(bucket)) {
    return bucket
      .map((block) =>
        block && typeof block === "object"
          ? parseBlockIdFromRow(block as Record<string, unknown>)
          : null,
      )
      .filter((id): id is number => id != null);
  }
  return [];
}

export function collectBlockIdsByApiKey(
  source: "service" | "payload",
  input: Service | ServiceSectionsPayload,
  keys: readonly SectionApiKey[] = SYNCABLE_SECTION_API_KEYS,
): Record<SectionApiKey, Set<number>> {
  const result = {} as Record<SectionApiKey, Set<number>>;

  for (const key of keys) {
    const ids =
      source === "service"
        ? extractBlockIds((input as Service & Record<string, unknown>)[key])
        : extractBlockIdsFromPayload(input as ServiceSectionsPayload, key);
    result[key] = new Set(ids);
  }

  return result;
}

/** Stable signature for detecting server section changes after save/refetch. */
export function serviceSectionsSignature(service: Service): string {
  const raw = service as Service & Record<string, unknown>;
  return SYNCABLE_SECTION_API_KEYS.map((key) => {
    const ids = [...extractBlockIds(raw[key])].sort((a, b) => a - b).join(",");
    return `${key}:${ids}`;
  }).join("|");
}
