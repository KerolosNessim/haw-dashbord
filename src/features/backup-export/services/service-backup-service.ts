import {
  getAdminServiceByIdApi,
  getAdminServicesApi,
} from "@/features/services/services/admin-services";
import { saveServicePageApi } from "@/features/services/services/service-page-api";
import type { BasicInfoValues } from "@/features/services/components/builder/basic-info-form";
import type { ServiceSectionsPayload } from "@/features/services/service-section-types";
import type { Service } from "@/features/services/type";
import {
  serviceToBasicInfoValues,
  serviceToSectionsPayload,
} from "@/features/services/utils/service-api-mappers";
import { cellBoolean, cellString } from "@/lib/excel-io";
import type { ExcelSheetInput } from "@/lib/excel-io";

export type ServiceBackupPayload = {
  basic: BasicInfoValues;
  sections: ServiceSectionsPayload;
};

function serviceToExportRow(service: Service): Record<string, unknown> {
  const basic = serviceToBasicInfoValues(service);
  const sections = serviceToSectionsPayload(service);
  const payload: ServiceBackupPayload = { basic, sections };

  return {
    id: service.id,
    title_ar: service.title?.ar ?? "",
    title_en: service.title?.en ?? "",
    slug_ar: service.slug?.ar ?? "",
    slug_en: service.slug?.en ?? "",
    country_ids: (basic.country_ids ?? []).join(","),
    package_ids: (basic.package_ids ?? []).join(","),
    is_active: basic.is_active ? 1 : 0,
    show_footer: basic.show_footer ? 1 : 0,
    meta_title_ar: basic.meta_title?.ar ?? "",
    meta_title_en: basic.meta_title?.en ?? "",
    meta_description_ar: basic.meta_description?.ar ?? "",
    meta_description_en: basic.meta_description?.en ?? "",
    payload_json: JSON.stringify(payload),
    _note_images:
      "Cover/section images are not in Excel — re-upload in the service editor after import if needed.",
  };
}

function parsePayloadJson(row: Record<string, unknown>): ServiceBackupPayload | null {
  const raw = cellString(row.payload_json);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceBackupPayload;
    if (!parsed?.basic) return null;
    return {
      basic: parsed.basic,
      sections: parsed.sections ?? {},
    };
  } catch {
    return null;
  }
}

export async function fetchAllServiceExportRows(): Promise<Record<string, unknown>[]> {
  const res = await getAdminServicesApi();
  const list = res.data?.data ?? [];
  const rows: Record<string, unknown>[] = [];

  for (const summary of list) {
    const detail = await getAdminServiceByIdApi(summary.id);
    rows.push(serviceToExportRow(detail.data));
  }

  return rows;
}

export async function exportServiceById(
  serviceId: number | string,
): Promise<ExcelSheetInput[]> {
  const sheets = await exportServicesByIds([serviceId]);
  return sheets;
}

/** Export one or many services into a single `services` sheet. */
export async function exportServicesByIds(
  ids: (number | string)[],
): Promise<ExcelSheetInput[]> {
  const unique = [...new Set(ids.map((id) => String(id)))];
  const rows: Record<string, unknown>[] = [];

  for (const id of unique) {
    const detail = await getAdminServiceByIdApi(id);
    rows.push(serviceToExportRow(detail.data));
  }

  return [{ name: "services", rows }];
}

export async function importServiceRows(
  rows: Record<string, unknown>[],
): Promise<{ created: number; updated: number; failed: number; errors: string[] }> {
  const out = { created: 0, updated: 0, failed: 0, errors: [] as string[] };

  for (const row of rows) {
    const label = cellString(row.title_ar) || cellString(row.title_en) || cellString(row.id) || "?";
    try {
      const payload = parsePayloadJson(row);
      if (!payload) {
        throw new Error("Missing or invalid payload_json column");
      }

      const idRaw = cellString(row.id);
      const serviceId = idRaw && /^\d+$/.test(idRaw) ? Number(idRaw) : undefined;

      await saveServicePageApi(payload.basic, payload.sections, serviceId);
      if (serviceId) out.updated += 1;
      else out.created += 1;
    } catch (e) {
      out.failed += 1;
      out.errors.push(
        `Service ${label}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return out;
}

export function buildServicesTemplateSheet(): ExcelSheetInput {
  return {
    name: "services",
    rows: [
      {
        id: "",
        title_ar: "اسم الخدمة",
        title_en: "Service name",
        slug_ar: "slug-ar",
        slug_en: "slug-en",
        country_ids: "1,2",
        is_active: 1,
        show_footer: 1,
        payload_json:
          '{"basic":{"slug":{"ar":"slug-ar","en":"slug-en"},"country_ids":["1"],"package_ids":[],"is_active":true,"show_footer":true,"title":{"ar":"عنوان","en":"Title"},"description":{"ar":"<p></p>","en":"<p></p>"},"meta_title":{"ar":"","en":""},"meta_description":{"ar":"","en":""},"image":{"ar":null,"en":null},"image_alt":{"ar":"","en":""}},"sections":{}}',
        _note_images: "Export an existing service first, then edit payload_json in Excel.",
      },
    ],
  };
}
