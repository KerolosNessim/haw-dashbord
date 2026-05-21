import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type { Service } from "../type";
import type { ServiceSectionsPayload } from "../service-section-types";
import { mapPackagesToPayload } from "./section-form-mappers";

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
    sort_order: service.sort_order ?? 0,
    media_url: service.media_url ?? "",
    media_type: service.media_type ?? "",
    og_title: pickLocalized(raw.og_title) ?? { ar: "", en: "" },
    og_description: pickLocalized(raw.og_description) ?? { ar: "", en: "" },
    og_type: (raw.og_type as string) ?? "website",
    og_image: (raw.og_image as string | null) ?? null,
    twitter_card: (raw.twitter_card as string) ?? "summary_large_image",
    twitter_title: pickLocalized(raw.twitter_title) ?? { ar: "", en: "" },
    twitter_description: pickLocalized(raw.twitter_description) ?? { ar: "", en: "" },
    twitter_image: (raw.twitter_image as string | null) ?? null,
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
    payload.benefits = {
      title: pickLocalized((service.benefits as { title?: unknown }).title),
      description: (service.benefits as { description?: unknown }).description as
        | { ar: unknown; en: unknown }
        | undefined,
      image: (service.benefits as { image?: string | null }).image ?? null,
    };
  }
  if (service.steps) {
    const stepsItems = Array.isArray(service.steps)
      ? service.steps
      : (service.steps as { items?: unknown }).items;
    payload.steps = {
      title: pickLocalized(raw.steps_title ?? (service.steps as { title?: unknown }).title),
      description: pickLocalized(
        raw.steps_description ?? (service.steps as { description?: unknown }).description,
      ),
      items: stepsItems as ServiceSectionsPayload["steps"],
    };
  }
  if (service.faqs) {
    payload.faqs = {
      title: pickLocalized(raw.faqs_title),
      description: pickLocalized(raw.faqs_description),
      items: Array.isArray(service.faqs)
        ? service.faqs
        : (service.faqs as { items?: unknown }).items,
    } as ServiceSectionsPayload["faqs"];
  }
  if (service.tools) {
    payload.tools = service.tools as ServiceSectionsPayload["tools"];
  }
  if (service.ctas) {
    payload.ctas = service.ctas as Record<string, unknown>;
  }
  if (raw.audits || raw.audits_title) {
    payload.audits = {
      title: pickLocalized(raw.audits_title),
      description: pickLocalized(raw.audits_description),
      items: (Array.isArray(raw.audits)
        ? raw.audits
        : (raw.audits as { items?: unknown }).items) as ServiceSectionsPayload["audits"],
    };
  }
  if (service.packages || raw.packages_title) {
    payload.packages = mapPackagesToPayload(packagesDataFromService(service));
  }
  if (raw.offerings || raw.offerings_title) {
    payload.offerings = {
      title: pickLocalized(raw.offerings_title),
      description: pickLocalized(raw.offerings_description),
      items: (Array.isArray(raw.offerings)
        ? raw.offerings
        : (raw.offerings as { items?: unknown }).items) as ServiceSectionsPayload["offerings"],
    };
  }

  return payload;
}
