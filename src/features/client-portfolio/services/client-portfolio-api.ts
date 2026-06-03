import { API_BASE_URL } from "@/config/api";
import { api } from "@/lib/api";
import {
  appendRootBilingualSectionImage,
  appendRootBilingualSectionImageFilesOnly,
} from "@/features/services/utils/append-bilingual-section-image";
import {
  assertApiEnvelopeSuccess,
  unwrapDataArray,
  unwrapShowResource,
} from "@/lib/api-payload";
import type { BilingualSectionImage } from "@/lib/bilingual-section-image";
import { bilingualSectionImageFromApi } from "@/lib/bilingual-section-image";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import type {
  LinkedService,
  LocalizedText,
  PortfolioCategory,
  PortfolioItem,
  PortfolioItemFormValues,
  PortfolioMetric,
  PortfolioSection,
  PortfolioSectionFormValues,
} from "../types";
import { isAxiosError } from "axios";

const SECTION_PATH = "/v1/admin/client-portfolio/section";
const ITEMS_PATH = "/v1/admin/client-portfolio/items";
const LIST_PATH = "/v1/admin/client-portfolio";

function pickLocalized(input: unknown): LocalizedText {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ar: "", en: "" };
  const row = input as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function pickCategory(value: unknown): PortfolioCategory {
  if (value === "healthcare" || value === "animals" || value === "food_retail") return value;
  return "healthcare";
}

function pickMetrics(raw: unknown): PortfolioMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => pickLocalized(row));
}

function pickLinkedServices(raw: unknown): LinkedService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const r = row as { id?: unknown; title?: unknown };
      const id = Number(r.id ?? 0);
      if (!id) return null;
      return { id, title: pickLocalized(r.title) };
    })
    .filter((s): s is LinkedService => s != null);
}

function serviceIdsFromItem(item: Pick<PortfolioItem, "service_ids" | "services">): number[] {
  if (Array.isArray(item.service_ids) && item.service_ids.length > 0) {
    return item.service_ids.map((id) => Number(id)).filter((id) => id > 0);
  }
  return (item.services ?? []).map((s) => s.id);
}

function extractPayload(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    const payload = (data as { data?: unknown }).data;
    if (payload != null) return payload;
  }
  return data;
}

function normalizeSection(input: unknown): PortfolioSection {
  const row = (extractPayload(input) ?? {}) as Record<string, unknown>;
  return {
    id: Number(row.id ?? 1),
    title: pickLocalized(row.title),
    subtitle: pickLocalized(row.subtitle),
    view_all_link: pickLocalized(row.view_all_link),
    view_all_button_text: pickLocalized(row.view_all_button_text),
    view_all_card_title: pickLocalized(row.view_all_card_title),
    view_all_card_description: pickLocalized(row.view_all_card_description),
    view_all_card_button_text: pickLocalized(row.view_all_card_button_text),
    read_case_study_button_text: pickLocalized(row.read_case_study_button_text),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function normalizeItem(raw: unknown): PortfolioItem {
  const row = (raw ?? {}) as Record<string, unknown>;
  const imageUrls = bilingualSectionImageFromApi(row.image);
  const services = pickLinkedServices(row.services);
  return {
    id: Number(row.id ?? 0),
    category: pickCategory(row.category),
    client_tag: pickLocalized(row.client_tag),
    headline: pickLocalized(row.headline),
    period: pickLocalized(row.period),
    client: pickLocalized(row.client),
    challenge: pickLocalized(row.challenge),
    what_we_did: pickLocalized(row.what_we_did),
    results: pickLocalized(row.results),
    metrics: pickMetrics(row.metrics),
    image: { ar: imageUrls.ar, en: imageUrls.en },
    image_alt: pickLocalized(row.image_alt),
    full_case_study_link: pickLocalized(row.full_case_study_link),
    read_case_study_button_text:
      row.read_case_study_button_text == null
        ? null
        : pickLocalized(row.read_case_study_button_text),
    service_ids: serviceIdsFromItem({
      service_ids: Array.isArray(row.service_ids)
        ? row.service_ids.map((id) => Number(id))
        : [],
      services,
    }),
    services,
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function localizedPair(ar: string, en: string): LocalizedText {
  return { ar: ar.trim(), en: en.trim() };
}

function compactMetrics(metrics: PortfolioItemFormValues["metrics"]): PortfolioMetric[] {
  return metrics
    .filter((m) => m.ar.trim() || m.en.trim())
    .map((m) => ({ ar: m.ar.trim(), en: m.en.trim() }));
}

function itemHasNewImageFiles(image: BilingualSectionImage): boolean {
  return image.ar instanceof File || image.en instanceof File;
}

export function sectionToFormValues(section: PortfolioSection): PortfolioSectionFormValues {
  return {
    title_ar: section.title.ar,
    title_en: section.title.en,
    subtitle_ar: section.subtitle.ar,
    subtitle_en: section.subtitle.en,
    view_all_link_ar: section.view_all_link.ar,
    view_all_link_en: section.view_all_link.en,
    view_all_button_text_ar: section.view_all_button_text.ar,
    view_all_button_text_en: section.view_all_button_text.en,
    view_all_card_title_ar: section.view_all_card_title.ar,
    view_all_card_title_en: section.view_all_card_title.en,
    view_all_card_description_ar: section.view_all_card_description.ar,
    view_all_card_description_en: section.view_all_card_description.en,
    view_all_card_button_text_ar: section.view_all_card_button_text.ar,
    view_all_card_button_text_en: section.view_all_card_button_text.en,
    read_case_study_button_text_ar: section.read_case_study_button_text.ar,
    read_case_study_button_text_en: section.read_case_study_button_text.en,
    is_active: section.is_active,
  };
}

export function itemToFormValues(item: PortfolioItem): PortfolioItemFormValues {
  return {
    category: item.category,
    client_tag_ar: item.client_tag.ar,
    client_tag_en: item.client_tag.en,
    headline_ar: item.headline.ar,
    headline_en: item.headline.en,
    period_ar: item.period.ar,
    period_en: item.period.en,
    client_ar: item.client.ar,
    client_en: item.client.en,
    challenge_ar: item.challenge.ar,
    challenge_en: item.challenge.en,
    what_we_did_ar: item.what_we_did.ar,
    what_we_did_en: item.what_we_did.en,
    results_ar: item.results.ar,
    results_en: item.results.en,
    metrics: item.metrics.length ? item.metrics.map((m) => ({ ...m })) : [{ ar: "", en: "" }],
    image: { ar: item.image.ar, en: item.image.en },
    image_alt_ar: item.image_alt.ar,
    image_alt_en: item.image_alt.en,
    full_case_study_link_ar: item.full_case_study_link.ar,
    full_case_study_link_en: item.full_case_study_link.en,
    read_case_study_button_text_ar: item.read_case_study_button_text?.ar ?? "",
    read_case_study_button_text_en: item.read_case_study_button_text?.en ?? "",
    serviceIds: serviceIdsFromItem(item),
    linkedServices: item.services ?? [],
    sort_order: item.sort_order,
    is_active: item.is_active,
  };
}

export function emptyItemFormValues(): PortfolioItemFormValues {
  return {
    category: "healthcare",
    client_tag_ar: "",
    client_tag_en: "",
    headline_ar: "",
    headline_en: "",
    period_ar: "",
    period_en: "",
    client_ar: "",
    client_en: "",
    challenge_ar: "",
    challenge_en: "",
    what_we_did_ar: "",
    what_we_did_en: "",
    results_ar: "",
    results_en: "",
    metrics: [{ ar: "", en: "" }],
    image: { ar: null, en: null },
    image_alt_ar: "",
    image_alt_en: "",
    full_case_study_link_ar: "",
    full_case_study_link_en: "",
    read_case_study_button_text_ar: "",
    read_case_study_button_text_en: "",
    serviceIds: [],
    linkedServices: [],
    sort_order: 0,
    is_active: true,
  };
}

function appendLocalized(fd: FormData, prefix: string, ar: string, en: string) {
  fd.append(`${prefix}[ar]`, ar);
  fd.append(`${prefix}[en]`, en);
}

function appendOptionalLocalized(fd: FormData, prefix: string, ar: string, en: string) {
  if (ar.trim() || en.trim()) appendLocalized(fd, prefix, ar.trim(), en.trim());
}

function appendLocalizedIfAny(fd: FormData, prefix: string, ar: string, en: string) {
  appendOptionalLocalized(fd, prefix, ar, en);
}

function appendServiceIds(
  fd: FormData,
  serviceIds: number[],
  options?: { syncEmptyOnUpdate?: boolean },
) {
  if (serviceIds.length > 0) {
    serviceIds.forEach((id) => {
      fd.append("service_ids[]", String(id));
    });
    return;
  }
  if (options?.syncEmptyOnUpdate) {
    fd.append("service_ids", "[]");
  }
}

function buildItemFormData(
  values: PortfolioItemFormValues,
  options?: { imageFilesOnly?: boolean; syncEmptyOnUpdate?: boolean },
): FormData {
  const fd = new FormData();

  if (values.category) fd.append("category", values.category);
  appendLocalizedIfAny(fd, "client_tag", values.client_tag_ar, values.client_tag_en);
  appendLocalizedIfAny(fd, "headline", values.headline_ar, values.headline_en);
  appendLocalizedIfAny(fd, "period", values.period_ar, values.period_en);
  appendLocalizedIfAny(fd, "client", values.client_ar, values.client_en);
  appendLocalizedIfAny(
    fd,
    "challenge",
    localizedHtmlForApi(values.challenge_ar),
    localizedHtmlForApi(values.challenge_en),
  );
  appendLocalizedIfAny(
    fd,
    "what_we_did",
    localizedHtmlForApi(values.what_we_did_ar),
    localizedHtmlForApi(values.what_we_did_en),
  );
  appendLocalizedIfAny(
    fd,
    "results",
    localizedHtmlForApi(values.results_ar),
    localizedHtmlForApi(values.results_en),
  );

  let metricIndex = 0;
  compactMetrics(values.metrics).forEach((metric) => {
    fd.append(`metrics[${metricIndex}][ar]`, metric.ar);
    fd.append(`metrics[${metricIndex}][en]`, metric.en);
    metricIndex += 1;
  });

  appendLocalizedIfAny(fd, "image_alt", values.image_alt_ar, values.image_alt_en);
  appendLocalizedIfAny(
    fd,
    "full_case_study_link",
    values.full_case_study_link_ar,
    values.full_case_study_link_en,
  );
  appendOptionalLocalized(
    fd,
    "read_case_study_button_text",
    values.read_case_study_button_text_ar,
    values.read_case_study_button_text_en,
  );

  appendServiceIds(fd, values.serviceIds, {
    syncEmptyOnUpdate: options?.syncEmptyOnUpdate,
  });

  fd.append("sort_order", String(values.sort_order ?? 0));
  fd.append("is_active", values.is_active ? "1" : "0");

  if (options?.imageFilesOnly) {
    appendRootBilingualSectionImageFilesOnly(fd, "image", values.image);
  } else {
    appendRootBilingualSectionImage(fd, "image", values.image);
  }

  return fd;
}

function buildItemJsonBody(values: PortfolioItemFormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {
    category: values.category,
    client_tag: localizedPair(values.client_tag_ar, values.client_tag_en),
    headline: localizedPair(values.headline_ar, values.headline_en),
    period: localizedPair(values.period_ar, values.period_en),
    client: localizedPair(values.client_ar, values.client_en),
    challenge: localizedPair(
      localizedHtmlForApi(values.challenge_ar),
      localizedHtmlForApi(values.challenge_en),
    ),
    what_we_did: localizedPair(
      localizedHtmlForApi(values.what_we_did_ar),
      localizedHtmlForApi(values.what_we_did_en),
    ),
    results: localizedPair(
      localizedHtmlForApi(values.results_ar),
      localizedHtmlForApi(values.results_en),
    ),
    metrics: compactMetrics(values.metrics),
    image_alt: localizedPair(values.image_alt_ar, values.image_alt_en),
    full_case_study_link: localizedPair(
      values.full_case_study_link_ar,
      values.full_case_study_link_en,
    ),
    service_ids: values.serviceIds,
    sort_order: values.sort_order ?? 0,
    is_active: values.is_active,
  };

  if (values.read_case_study_button_text_ar.trim() || values.read_case_study_button_text_en.trim()) {
    body.read_case_study_button_text = localizedPair(
      values.read_case_study_button_text_ar,
      values.read_case_study_button_text_en,
    );
  }

  return body;
}

export async function fetchPortfolioSection(): Promise<PortfolioSection | null> {
  try {
    const res = await api.get(SECTION_PATH);
    assertApiEnvelopeSuccess(res.data);
    return normalizeSection(res.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function updatePortfolioSection(values: PortfolioSectionFormValues) {
  const res = await api.put(SECTION_PATH, {
    title: {
      ar: localizedHtmlForApi(values.title_ar),
      en: localizedHtmlForApi(values.title_en),
    },
    subtitle: {
      ar: localizedHtmlForApi(values.subtitle_ar),
      en: localizedHtmlForApi(values.subtitle_en),
    },
    view_all_link: { ar: values.view_all_link_ar, en: values.view_all_link_en },
    view_all_button_text: {
      ar: values.view_all_button_text_ar,
      en: values.view_all_button_text_en,
    },
    view_all_card_title: {
      ar: values.view_all_card_title_ar,
      en: values.view_all_card_title_en,
    },
    view_all_card_description: {
      ar: localizedHtmlForApi(values.view_all_card_description_ar),
      en: localizedHtmlForApi(values.view_all_card_description_en),
    },
    view_all_card_button_text: {
      ar: values.view_all_card_button_text_ar,
      en: values.view_all_card_button_text_en,
    },
    read_case_study_button_text: {
      ar: values.read_case_study_button_text_ar,
      en: values.read_case_study_button_text_en,
    },
    is_active: values.is_active,
  });
  assertApiEnvelopeSuccess(res.data);
  return res.data as { message?: string };
}

function extractPortfolioRows(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  const sources: unknown[] = [extractPayload(data), data];
  for (const source of sources) {
    const rows = unwrapDataArray(source ?? {});
    if (rows.length > 0) return rows;
    if (source && typeof source === "object" && !Array.isArray(source)) {
      const rec = source as Record<string, unknown>;
      for (const key of ["client_portfolio_items", "client_portfolio", "portfolio_items", "items"]) {
        const nested = rec[key];
        if (Array.isArray(nested)) return nested as Record<string, unknown>[];
      }
    }
  }
  return [];
}

function normalizePortfolioItems(rows: Record<string, unknown>[]): PortfolioItem[] {
  return rows
    .map(normalizeItem)
    .filter((item) => item.id > 0)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function portfolioItemFromApiResponse(data: unknown): PortfolioItem | null {
  try {
    assertApiEnvelopeSuccess(data);
    const record = unwrapShowResource(data);
    const item = normalizeItem(record);
    return item.id > 0 ? item : null;
  } catch {
    return null;
  }
}

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const res = await api.get(LIST_PATH);
  assertApiEnvelopeSuccess(res.data);
  return normalizePortfolioItems(extractPortfolioRows(res.data));
}

export async function fetchPortfolioItem(id: number): Promise<PortfolioItem> {
  const res = await api.get(`${ITEMS_PATH}/${id}`);
  assertApiEnvelopeSuccess(res.data);
  const record = unwrapShowResource(res.data);
  return normalizeItem(record);
}

export async function createPortfolioItem(values: PortfolioItemFormValues) {
  const res = itemHasNewImageFiles(values.image)
    ? await api.post(ITEMS_PATH, buildItemFormData(values, { imageFilesOnly: true }))
    : await api.post(ITEMS_PATH, buildItemJsonBody(values));
  assertApiEnvelopeSuccess(res.data);
  const created = portfolioItemFromApiResponse(res.data);
  const body = res.data as { message?: string };
  return { message: body?.message, item: created };
}

export async function updatePortfolioItem(id: number, values: PortfolioItemFormValues) {
  if (itemHasNewImageFiles(values.image)) {
    const fd = buildItemFormData(values, {
      imageFilesOnly: false,
      syncEmptyOnUpdate: true,
    });
    fd.append("_method", "PUT");
    const res = await api.post(`${ITEMS_PATH}/${id}`, fd);
    assertApiEnvelopeSuccess(res.data);
    const updated = portfolioItemFromApiResponse(res.data);
    const body = res.data as { message?: string };
    return { message: body?.message, item: updated };
  }

  const res = await api.put(`${ITEMS_PATH}/${id}`, buildItemJsonBody(values));
  assertApiEnvelopeSuccess(res.data);
  const updated = portfolioItemFromApiResponse(res.data);
  const body = res.data as { message?: string };
  return { message: body?.message, item: updated };
}

export async function deletePortfolioItem(id: number) {
  const res = await api.delete(`${ITEMS_PATH}/${id}`);
  assertApiEnvelopeSuccess(res.data);
  return res.data as { message?: string };
}

/** Public preview (no auth): GET /api/v1/client-portfolio/{id} */
export function publicPortfolioItemPreviewUrl(id: number): string {
  if (!id) return "";
  return `${API_BASE_URL}/api/v1/client-portfolio/${id}`;
}

/** Public list preview: GET /api/v1/client-portfolio */
export function publicPortfolioListPreviewUrl(): string {
  return `${API_BASE_URL}/api/v1/client-portfolio`;
}
