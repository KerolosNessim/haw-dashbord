import type { SectionType } from "../service-section-types";
import { SECTION_TYPE_TO_API_KEY, type SectionApiKey } from "../service-section-types";
import type { Service } from "../type";
import { bilingualSectionImageFromApi } from "@/lib/bilingual-section-image";
import {
  auditsDataFromService,
  offeringsDataFromService,
} from "../utils/service-api-mappers";
import { pickServiceImageAlt } from "../utils/service-mapper";

export type BuilderSectionDef = {
  id: string;
  type: SectionType;
  data: unknown;
  sort_order: number;
};

const API_KEY_TO_SECTION_TYPE = Object.fromEntries(
  Object.entries(SECTION_TYPE_TO_API_KEY).map(([type, key]) => [key, type]),
) as Record<SectionApiKey, SectionType>;

const DEFAULT_BUILDER_ORDER: Record<SectionApiKey, number> = {
  benefits: 10,
  offerings: 20,
  steps: 30,
  tools: 40,
  faqs: 50,
  packages: 60,
  audits: 80,
  ctas: 90,
};

function blockSortOrder(raw: unknown, fallback: number): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const n = Number((raw as Record<string, unknown>).sort_order);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function sectionId(apiKey: SectionApiKey, raw: unknown, index: number): string {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const id = (raw as Record<string, unknown>).id;
    if (id != null && String(id).trim() !== "") {
      return `${apiKey}-${id}`;
    }
  }
  return `${apiKey}-${index}`;
}

function normalizeSectionBlockForForm(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items.map((item) => {
        if (!item || typeof item !== "object") return item;
        const row = item as Record<string, unknown>;
        const link = typeof row.link === "string" ? row.link.trim() : "";
        const icon = typeof row.icon === "string" ? row.icon.trim() : "";
        return {
          ...row,
          ...(link ? { link } : {}),
          ...(icon ? { icon } : {}),
        };
      })
    : o.items;
  return {
    ...o,
    items,
    image: bilingualSectionImageFromApi(o.image, o.images),
    image_alt: pickServiceImageAlt(o.image_alt),
  };
}

function dataForBuilder(
  apiKey: SectionApiKey,
  raw: unknown,
  service: Service,
): unknown {
  if (apiKey === "offerings") {
    if (Array.isArray(raw)) return raw.map(normalizeSectionBlockForForm);
    return offeringsDataFromService(service);
  }
  if (apiKey === "audits") {
    if (Array.isArray(raw)) return raw.map(normalizeSectionBlockForForm);
    return auditsDataFromService(service);
  }
  if (Array.isArray(raw)) {
    return raw.map(normalizeSectionBlockForForm);
  }
  if (raw && typeof raw === "object") {
    return normalizeSectionBlockForForm(raw);
  }
  return raw;
}

function collectApiSections(
  service: Service,
  apiKey: SectionApiKey,
): BuilderSectionDef[] {
  const raw = service as Record<string, unknown>;
  const value = raw[apiKey];
  if (!value) return [];

  const type = API_KEY_TO_SECTION_TYPE[apiKey];
  const fallback = DEFAULT_BUILDER_ORDER[apiKey];

  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        id: sectionId(apiKey, item, index),
        type,
        data: item,
        sort_order: blockSortOrder(item, fallback + index),
      }));
  }

  if (typeof value === "object") {
    return [
      {
        id: sectionId(apiKey, value, 0),
        type,
        data: dataForBuilder(apiKey, value, service),
        sort_order: blockSortOrder(value, fallback),
      },
    ];
  }

  return [];
}

/** Build builder section list from admin service, ordered by API `sort_order`. */
export function builderSectionsFromService(service: Service): BuilderSectionDef[] {
  const apiKeys: SectionApiKey[] = [
    "benefits",
    "offerings",
    "steps",
    "tools",
    "faqs",
    "audits",
    "ctas",
  ];

  return apiKeys
    .flatMap((apiKey) => collectApiSections(service, apiKey))
    .sort((a, b) => a.sort_order - b.sort_order);
}
