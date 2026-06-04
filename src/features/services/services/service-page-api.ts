import type { GetServiceResponse } from "../type";
import type { Service } from "../type";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type {
  PackagesSectionData,
  PackagesSectionItem,
  ServiceSectionsPayload,
} from "../service-section-types";
import { buildServicePageFormData } from "./service-form-data";
import {
  syncRemovedPackagesSectionApi,
  syncRemovedServiceSectionsApi,
} from "./sync-removed-service-sections";

export { syncRemovedPackagesSectionApi, syncRemovedServiceSectionsApi };
import { api } from "@/lib/api";
import { getAdminServicesBasePath } from "./service-resource-config";
import { appendLocalizedHtml } from "../utils/form-data-helpers";

export type SaveServicePageOptions = {
  /** When set on edit, removed builder sections are DELETE'd via nested section APIs. */
  previousService?: Service;
};

/**
 * Single request create/update for service + all sections (page builder).
 * POST /v1/admin/services or POST /v1/admin/services/{id} with _method=PUT
 */
export async function saveServicePageApi(
  basic: BasicInfoValues,
  sections: ServiceSectionsPayload,
  serviceId?: number,
  options?: SaveServicePageOptions,
): Promise<GetServiceResponse> {
  if (serviceId && options?.previousService) {
    await syncRemovedServiceSectionsApi(serviceId, options.previousService, sections);
  }

  const formData = buildServicePageFormData(basic, sections);
  const base = getAdminServicesBasePath();
  const url = serviceId ? `${base}/${serviceId}` : base;

  if (serviceId) {
    formData.append("_method", "PUT");
  }

  return api.post(url, formData).then((res) => res.data);
}

/** @deprecated Use saveServicePageApi — kept for gradual migration */
export const basicFormApi = (
  values: BasicInfoValues,
  id?: number,
  sections: ServiceSectionsPayload = {},
) => saveServicePageApi(values, sections, id);

function buildPackageItemFormData(item: PackagesSectionItem): FormData {
  const fd = new FormData();

  appendLocalizedHtml(fd, "title", item.title?.ar, "ar");
  appendLocalizedHtml(fd, "title", item.title?.en, "en");
  appendLocalizedHtml(fd, "description", item.description?.ar, "ar");
  appendLocalizedHtml(fd, "description", item.description?.en, "en");

  if (item.image_alt?.ar?.trim()) fd.append("image_alt[ar]", item.image_alt.ar.trim());
  if (item.image_alt?.en?.trim()) fd.append("image_alt[en]", item.image_alt.en.trim());

  const image = item.image as { ar?: unknown; en?: unknown } | undefined;
  if (image?.ar instanceof File) fd.append("image[ar]", image.ar);
  if (image?.en instanceof File) fd.append("image[en]", image.en);

  if (item.price != null) fd.append("price", String(item.price));
  if (item.currency) fd.append("currency", String(item.currency).trim());
  if (item.sort_order != null) fd.append("sort_order", String(item.sort_order));
  if (item.link?.trim()) fd.append("link", item.link.trim());

  item.features?.ar?.forEach((feature, index) => {
    const value = feature?.trim();
    if (value) fd.append(`features[ar][${index}]`, value);
  });
  item.features?.en?.forEach((feature, index) => {
    const value = feature?.trim();
    if (value) fd.append(`features[en][${index}]`, value);
  });

  return fd;
}

function itemHasId(item: PackagesSectionItem): item is PackagesSectionItem & { id: number } {
  return item.id != null && Number.isFinite(item.id) && item.id > 0;
}

/**
 * Sync package items with dedicated nested endpoints:
 * POST   /v1/admin/{scope}/{service}/packages
 * PUT    /v1/admin/{scope}/{service}/packages/{package}
 * DELETE /v1/admin/{scope}/{service}/packages/{package}
 */
export async function syncServicePackagesApi(args: {
  serviceId: number;
  next: PackagesSectionData;
  previous?: PackagesSectionData;
}): Promise<void> {
  const { serviceId, next, previous } = args;
  const base = `${getAdminServicesBasePath()}/${serviceId}/packages`;

  const prevItems = (previous?.items ?? []).filter(itemHasId);
  const nextItems = next.items ?? [];
  const nextIds = new Set(
    nextItems.filter(itemHasId).map((item) => Number(item.id)),
  );

  const deletions = prevItems.filter((item) => !nextIds.has(Number(item.id)));
  for (const item of deletions) {
    await api.delete(`${base}/${item.id}`);
  }

  for (let index = 0; index < nextItems.length; index += 1) {
    const item = nextItems[index];
    const fd = buildPackageItemFormData({
      ...item,
      sort_order: index + 1,
    });

    if (itemHasId(item)) {
      fd.append("_method", "PUT");
      await api.post(`${base}/${item.id}`, fd);
      continue;
    }

    await api.post(base, fd);
  }
}
