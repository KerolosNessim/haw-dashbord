import type { BasicInfoValues } from "../components/builder/basic-info-form";
import {
  normalizeOgType,
  normalizeTwitterCard,
} from "../constants/social-meta-options";
import type { Service } from "../type";
import type { ServiceSectionsPayload } from "../service-section-types";
import { mapPackagesToPayload } from "./section-form-mappers";
import { pickPackageImage, pickServiceImageAlt } from "./service-mapper";

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
  return {
    slug: { ar: service.slug?.ar ?? "", en: service.slug?.en ?? "" },
    country_ids: service.countries?.map((c) => String(c.id)) ?? [],
    package_ids: (raw.package_ids as number[] | undefined)?.map(String) ?? [],
    is_active: service.is_active ?? true,
    show_footer: service.show_footer ?? true,
    title: { ar: service.title?.ar ?? "", en: service.title?.en ?? "" },
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

  return {
    title:
      pickLocalized((offerings as { title?: unknown } | undefined)?.title) ??
      pickLocalized(raw.offerings_title) ?? { ar: "", en: "" },
    description:
      pickLocalized((offerings as { description?: unknown } | undefined)?.description) ??
      pickLocalized(raw.offerings_description) ?? { ar: "", en: "" },
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
      image: pickPackageImage(row.image),
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
            image: null,
            image_alt: { ar: "", en: "" },
            price: 0,
            currency: "OMR",
            features: { ar: [""], en: [""] },
          },
        ],
  };
}

/** Rebuild section payload from API so a packages-only save does not wipe other sections. */
export function serviceToSectionsPayload(service: Service): ServiceSectionsPayload {
  const raw = service as Record<string, unknown>;
  const payload: ServiceSectionsPayload = {};

  if (service.benefits) {
    const benefits = service.benefits as Record<string, unknown>;
    payload.benefits = {
      title: pickLocalized(benefits.title),
      description: benefits.description as { ar: unknown; en: unknown } | undefined,
      image: (benefits.image as string | null) ?? null,
      image_alt: pickServiceImageAlt(benefits.image_alt),
      sort_order: Number(benefits.sort_order ?? 0) || undefined,
    };
  }
  if (service.steps) {
    const stepsItems = Array.isArray(service.steps)
      ? service.steps
      : (service.steps as { items?: unknown }).items;
    const stepsObj =
      service.steps && typeof service.steps === "object" && !Array.isArray(service.steps)
        ? (service.steps as Record<string, unknown>)
        : null;
    payload.steps = {
      title: pickLocalized(raw.steps_title ?? stepsObj?.title),
      description: pickLocalized(raw.steps_description ?? stepsObj?.description),
      image: (stepsObj?.image as string | null) ?? (raw.steps_image as string | null) ?? null,
      image_alt: pickServiceImageAlt(stepsObj?.image_alt ?? raw.steps_image_alt),
      items: stepsItems as ServiceSectionsPayload["steps"],
      sort_order: Number(stepsObj?.sort_order ?? raw.steps_sort_order ?? 0) || undefined,
    };
  }
  if (service.faqs) {
    const faqsObj =
      service.faqs && typeof service.faqs === "object" && !Array.isArray(service.faqs)
        ? (service.faqs as Record<string, unknown>)
        : null;
    payload.faqs = {
      title: pickLocalized(raw.faqs_title ?? faqsObj?.title),
      description: pickLocalized(raw.faqs_description ?? faqsObj?.description),
      items: Array.isArray(service.faqs)
        ? service.faqs
        : (service.faqs as { items?: unknown }).items,
      sort_order: Number(faqsObj?.sort_order ?? raw.faqs_sort_order ?? 0) || undefined,
    } as ServiceSectionsPayload["faqs"];
  }
  if (service.tools) {
    const tools = service.tools as Record<string, unknown>;
    payload.tools = {
      ...(service.tools as ServiceSectionsPayload["tools"]),
      sort_order: Number(tools.sort_order ?? raw.tools_sort_order ?? 0) || undefined,
    };
  }
  if (service.ctas) {
    const ctas = service.ctas as Record<string, unknown>;
    payload.ctas = {
      ...(service.ctas as Record<string, unknown>),
      sort_order: Number(ctas.sort_order ?? raw.ctas_sort_order ?? 0) || undefined,
    };
  }
  if (raw.audits || raw.audits_title) {
    const auditsObj =
      raw.audits && typeof raw.audits === "object" && !Array.isArray(raw.audits)
        ? (raw.audits as Record<string, unknown>)
        : null;
    payload.audits = {
      title: pickLocalized(raw.audits_title ?? auditsObj?.title),
      description: pickLocalized(raw.audits_description ?? auditsObj?.description),
      items: (Array.isArray(raw.audits)
        ? raw.audits
        : (raw.audits as { items?: unknown }).items) as ServiceSectionsPayload["audits"],
      sort_order: Number(auditsObj?.sort_order ?? raw.audits_sort_order ?? 0) || undefined,
    };
  }
  if (service.packages || raw.packages_title) {
    payload.packages = mapPackagesToPayload(packagesDataFromService(service));
  }
  if (raw.offerings || raw.offerings_title) {
    const offeringsObj =
      service.offerings && typeof service.offerings === "object" && !Array.isArray(service.offerings)
        ? (service.offerings as Record<string, unknown>)
        : null;
    payload.offerings = {
      title: pickLocalized(raw.offerings_title ?? offeringsObj?.title),
      description: pickLocalized(raw.offerings_description ?? offeringsObj?.description),
      items: (Array.isArray(raw.offerings)
        ? raw.offerings
        : (service.offerings as { items?: unknown }).items) as ServiceSectionsPayload["offerings"],
      sort_order: Number(offeringsObj?.sort_order ?? raw.offerings_sort_order ?? 0) || undefined,
    };
  }

  return payload;
}
