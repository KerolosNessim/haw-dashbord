import {
  apiKeyHasPersistedBlockWithoutId,
  BUILDER_MANAGED_SECTION_API_KEYS,
  collectBlockIdsByApiKey,
  nextPayloadOmitsApiKey,
} from "../lib/service-section-ids";
import type { SectionApiKey, ServiceSectionsPayload } from "../service-section-types";
import type { Service } from "../type";
import { api } from "@/lib/api";
import { getAdminServicesBasePath } from "./service-resource-config";

async function deleteServiceSectionBlock(
  serviceId: number,
  apiKey: SectionApiKey,
  blockId: number,
): Promise<void> {
  const base = getAdminServicesBasePath();
  await api.delete(`${base}/${serviceId}/${apiKey}/${blockId}`);
}

/** Best-effort delete when the API returned a block without `id` (legacy data). */
async function deleteServiceSectionCollection(
  serviceId: number,
  apiKey: SectionApiKey,
): Promise<void> {
  const base = getAdminServicesBasePath();
  try {
    await api.delete(`${base}/${serviceId}/${apiKey}`);
  } catch {
    /* Endpoint may require block id — backend should always return `id`. */
  }
}

/**
 * DELETE section blocks removed in the page builder (unified save omits them).
 * Matches dedicated endpoints documented in the API (e.g. tools/{id}).
 */
export type SyncRemovedSectionsOptions = {
  /** Defaults to builder-managed keys (excludes packages on main edit form). */
  apiKeys?: readonly SectionApiKey[];
};

export async function syncRemovedServiceSectionsApi(
  serviceId: number,
  previousService: Service,
  nextSections: ServiceSectionsPayload,
  options?: SyncRemovedSectionsOptions,
): Promise<void> {
  const apiKeys = options?.apiKeys ?? BUILDER_MANAGED_SECTION_API_KEYS;
  const previousRaw = previousService as Service & Record<string, unknown>;

  const previous = collectBlockIdsByApiKey("service", previousService, apiKeys);
  const next = collectBlockIdsByApiKey("payload", nextSections, apiKeys);

  const deletions: Array<{ apiKey: SectionApiKey; blockId: number }> = [];

  for (const apiKey of apiKeys) {
    for (const blockId of previous[apiKey]) {
      if (!next[apiKey].has(blockId)) {
        deletions.push({ apiKey, blockId });
      }
    }
  }

  for (const { apiKey, blockId } of deletions) {
    await deleteServiceSectionBlock(serviceId, apiKey, blockId);
  }

  for (const apiKey of apiKeys) {
    const raw = previousRaw[apiKey];
    if (!apiKeyHasPersistedBlockWithoutId(raw)) continue;
    if (!nextPayloadOmitsApiKey(nextSections, apiKey)) continue;
    await deleteServiceSectionCollection(serviceId, apiKey);
  }
}

/** Pricing page: remove packages section block when cleared from the form. */
export async function syncRemovedPackagesSectionApi(
  serviceId: number,
  previousService: Service,
  nextSections: ServiceSectionsPayload,
): Promise<void> {
  return syncRemovedServiceSectionsApi(serviceId, previousService, nextSections, {
    apiKeys: ["packages"],
  });
}
