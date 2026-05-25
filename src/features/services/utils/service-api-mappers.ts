import { normalizeSlugRedirectCodeInput } from "@/lib/http-redirect-codes";
import { normalizeServiceTagsFromApi } from "../lib/service-tags";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import {
  normalizeOgType,
  normalizeTwitterCard,
} from "../constants/social-meta-options";
import type { Service } from "../type";
import type { ServiceSectionsPayload } from "../service-section-types";
import { builderSectionsFromService } from "../lib/section-blocks";
import { buildSectionsPayloadFromInstances } from "./section-form-mappers";
import { mapPackagesToPayload } from "./section-form-mappers";
import { bilingualSectionImageFromApi } from "@/lib/bilingual-section-image";
import { pickServiceImageAlt } from "./service-mapper";

function pickLocalized(
  field: unknown,
): { ar: string; en: string } | undefined {
  if (!field) return undefined;
  if (typeof field === "object" && field !== null && ("ar" in field || "en" in field)) {
    const o = field as { ar?: string; en?: string };
    return { ar: o.ar ?? "", en: o.en ?? "" };
  }
  return undefined;
}

/** Map loaded service API → basic form values (for partial saves without wiping fields). */
export function serviceToBasicInfoValues(service: Service): BasicInfoValues {
  const raw = service as Service & Record<string, unknown>;
  const slugRedirectRaw = raw.slug_redirect_code ?? raw.slugRedirectCode;
  const slugRedirect = { ar: "", en: "" };
  if (slugRedirectRaw && typeof slugRedirectRaw === "object") {
    const o = slugRedirectRaw as { ar?: unknown; en?: unknown };
    slugRedirect.ar = normalizeSlugRedirectCodeInput(o.ar);
    slugRedirect.en = normalizeSlugRedirectCodeInput(o.en);
  }

  return {
    slug: { ar: service.slug?.ar ?? "", en: service.slug?.en ?? "" },
    slug_redirect_code: slugRedirect,
    country_ids: service.countries?.map((c) => String(c.id)) ?? [],
    package_ids: (raw.package_ids as number[] | undefined)?.map(String) ?? [],
    is_active: service.is_active ?? true,
    show_footer: service.show_footer ?? true,
    title: { ar: service.title?.ar ?? "", en: service.title?.en ?? "" },
    single_page_title: pickLocalized(raw.single_page_title) ?? { ar: null, en: null },
    tags: normalizeServiceTagsFromApi(raw.tags ?? raw.article_tags),
    page_script: String(raw.page_script ?? ""),
    description: {
      ar: service.description?.ar ?? "",
      en: service.description?.en ?? "",
    },
    highlight_description: {
      ar: service.highlight_description?.ar ?? null,
      en: service.highlight_description?.en ?? null,
    },
    inside_desc: {
      ar: service.inside_desc?.ar ?? null,
      en: service.inside_desc?.en ?? null,
    },
    meta_title: {
      ar: service.meta_title?.ar ?? "",
      en: service.meta_title?.en ?? "",
    },
    meta_description: {
      ar: service.meta_description?.ar ?? "",
      en: service.meta_description?.en ?? "",
    },
    image: {
      ar: service.image?.ar ?? null,
      en: service.image?.en ?? null,
    },
    image_alt: {
      ar: service.image_alt?.ar ?? "",
      en: service.image_alt?.en ?? "",
    },
    og_title: pickLocalized(raw.og_title) ?? { ar: "", en: "" },
    og_description: pickLocalized(raw.og_description) ?? { ar: "", en: "" },
    og_type: normalizeOgType(raw.og_type),
    og_image: (raw.og_image as string | null) ?? null,
    twitter_card: normalizeTwitterCard(raw.twitter_card),
    twitter_title: pickLocalized(raw.twitter_title) ?? { ar: "", en: "" },
    twitter_description: pickLocalized(raw.twitter_description) ?? { ar: "", en: "" },
    twitter_image: (raw.twitter_image as string | null) ?? null,
  };
}

function normalizeOfferingItem(item: unknown): Record<string, unknown> {
  const row = item as Record<string, unknown>;
  const desc = row.description;
  let description: { ar: unknown; en: unknown } = { ar: null, en: null };
  if (desc && typeof desc === "object" && ("ar" in desc || "en" in desc)) {
    const d = desc as { ar?: unknown; en?: unknown };
    description = { ar: d.ar ?? null, en: d.en ?? null };
  } else if (typeof desc === "string") {
    description = { ar: desc, en: desc };
  }
  return {
    title: pickLocalized(row.title) ?? { ar: "", en: "" },
    description,
  };
}

/** Map API offerings → cards section form shape */
export function offeringsDataFromService(service: Service): Record<string, unknown> {
  const raw = service as Record<string, unknown>;
  const offerings = service.offerings;
  const items = Array.isArray(offerings)
    ? offerings
    : ((offerings as { items?: unknown[] } | undefined)?.items ?? []);

  const block = Array.isArray(offerings) ? offerings[0] : offerings;
  const blockObj =
    block && typeof block === "object" ? (block as Record<string, unknown>) : {};

  return {
    title:
      pickLocalized((offerings as { title?: unknown } | undefined)?.title) ??
      pickLocalized(raw.offerings_title) ??
      pickLocalized(blockObj.title) ?? { ar: "", en: "" },
    description:
      pickLocalized((offerings as { description?: unknown } | undefined)?.description) ??
      pickLocalized(raw.offerings_description) ??
      pickLocalized(blockObj.description) ?? { ar: "", en: "" },
    image: bilingualSectionImageFromApi(blockObj.image, blockObj.images),
    image_alt: pickServiceImageAlt(blockObj.image_alt),
    items: items.length
      ? items.map(normalizeOfferingItem)
      : [{ title: { ar: "", en: "" }, description: { ar: null, en: null } }],
  };
}

function normalizeAuditItem(item: unknown): Record<string, unknown> {
  const row = item as Record<string, unknown>;
  const desc = row.description;
  let description: { ar: unknown; en: unknown } = { ar: null, en: null };
  if (desc && typeof desc === "object" && ("ar" in desc || "en" in desc)) {
    const d = desc as { ar?: unknown; en?: unknown };
    description = { ar: d.ar ?? null, en: d.en ?? null };
  } else if (typeof desc === "string") {
    description = { ar: desc, en: desc };
  }
  return {
    title: pickLocalized(row.title) ?? { ar: "", en: "" },
    description,
    button_text: pickLocalized(row.button_text) ?? { ar: "", en: "" },
  };
}

export function auditsDataFromService(service: Service): Record<string, unknown> {
  const raw = service as Record<string, unknown>;
  const audits = raw.audits;
  const items = Array.isArray(audits)
    ? audits
    : ((audits as { items?: unknown[] } | undefined)?.items ?? []);

  return {
    title:
      pickLocalized((audits as { title?: unknown } | undefined)?.title) ??
      pickLocalized(raw.audits_title) ?? { ar: "", en: "" },
    description:
      pickLocalized((audits as { description?: unknown } | undefined)?.description) ??
      pickLocalized(raw.audits_description) ?? { ar: "", en: "" },
    items: items.length
      ? items.map(normalizeAuditItem)
      : [{ title: { ar: "", en: "" }, description: { ar: "", en: "" }, button_text: { ar: "", en: "" } }],
  };
}

function normalizePackageItems(items: unknown[]): Array<Record<string, unknown>> {
  return items.map((item) => {
    const row = item as Record<string, unknown>;
    const features = row.features;
    let featuresNormalized = { ar: [""], en: [""] };
    if (Array.isArray(features)) {
      featuresNormalized = { ar: features.map(String), en: features.map(String) };
    } else if (features && typeof features === "object") {
      const f = features as { ar?: string[]; en?: string[] };
      featuresNormalized = {
        ar: f.ar?.length ? f.ar : [""],
        en: f.en?.length ? f.en : [""],
      };
    }
    const desc = row.description;
    const description =
      desc && typeof desc === "object" && ("ar" in desc || "en" in desc)
        ? {
            ar: (desc as { ar?: string }).ar ?? "",
            en: (desc as { en?: string }).en ?? "",
          }
        : typeof desc === "string"
          ? { ar: desc, en: desc }
          : { ar: "", en: "" };

    return {
      ...row,
      description,
      image: bilingualSectionImageFromApi(row.image, row.images),
      image_alt: pickServiceImageAlt(row.image_alt),
      features: featuresNormalized,
    };
  });
}

export function packagesDataFromService(service: Service): Record<string, unknown> {
  const raw = service as Record<string, unknown>;
  const items = Array.isArray(service.packages)
    ? service.packages
    : ((service.packages as { items?: unknown[] } | undefined)?.items ?? []);

  return {
    title:
      pickLocalized(raw.packages_title) ??
      pickLocalized((service.packages as { title?: unknown })?.title) ?? {
        ar: "",
        en: "",
      },
    description:
      pickLocalized(raw.packages_description) ??
      pickLocalized((service.packages as { description?: unknown })?.description) ?? {
        ar: "",
        en: "",
      },
    items: items.length
      ? normalizePackageItems(items)
      : [
          {
            title: { ar: "", en: "" },
            description: { ar: null, en: null },
            image: { ar: null, en: null },
            image_alt: { ar: "", en: "" },
            price: 0,
            currency: "OMR",
            features: { ar: [""], en: [""] },
          },
        ],
  };
}

/** Rebuild section payload from API so a partial save does not wipe other sections. */
export function serviceToSectionsPayload(service: Service): ServiceSectionsPayload {
  const defs = builderSectionsFromService(service);
  const dataById: Record<string, Record<string, unknown>> = {};

  for (const def of defs) {
    const row = (def.data ?? {}) as Record<string, unknown>;
    dataById[def.id] = row;
  }

  const payload = buildSectionsPayloadFromInstances(
    defs.map((def) => ({ id: def.id, type: def.type })),
    dataById,
  );

  if (service.packages || (service as Record<string, unknown>).packages_title) {
    payload.packages = [
      mapPackagesToPayload(packagesDataFromService(service)),
    ];
  }

  return payload;
}
