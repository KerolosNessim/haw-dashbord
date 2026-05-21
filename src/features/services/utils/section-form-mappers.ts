import { editorOnChangeToHtml } from "@/features/shared/components/editor";
import type {
  BenefitsSectionData,
  FaqSectionData,
  ListSectionData,
  PackagesSectionData,
  ServiceSectionsPayload,
  ToolsSectionData,
} from "../service-section-types";
import { SECTION_TYPE_TO_API_KEY, type SectionType } from "../service-section-types";
import { htmlFromUnknown } from "./form-data-helpers";

function editorHtml(value: unknown): string {
  return htmlFromUnknown(editorOnChangeToHtml(value));
}

export function mapImageTextToBenefits(data: Record<string, unknown>): BenefitsSectionData {
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: data.title as BenefitsSectionData["title"],
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    image: data.image as File | string | null,
  };
}

export function mapFullSectionToSteps(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => ({
      title: item.title as ListSectionData["items"][0]["title"],
      description: {
        ar: editorHtml((item.description as { ar?: unknown })?.ar ?? item.description),
        en: editorHtml((item.description as { en?: unknown })?.en ?? item.description),
      },
      sort_order: index,
    }),
  );
  return {
    title: data.title as ListSectionData["title"],
    description: data.description as ListSectionData["description"],
    image: data.image as File | string | null,
    items,
  };
}

export function mapFaqToPayload(data: Record<string, unknown>): FaqSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => ({
      question: item.question as FaqSectionData["items"][0]["question"],
      answer: item.answer as FaqSectionData["items"][0]["answer"],
      sort_order: index,
    }),
  );
  return {
    title: data.title as FaqSectionData["title"],
    description: data.description as FaqSectionData["description"],
    items,
  };
}

export function mapCardsToOfferings(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const desc = item.description as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: item.title as ListSectionData["items"][0]["title"],
        description: desc
          ? { ar: editorHtml(desc.ar), en: editorHtml(desc.en) }
          : undefined,
        sort_order: index,
      };
    },
  );
  return {
    title: data.title as ListSectionData["title"],
    description: data.description as ListSectionData["description"],
    items,
  };
}

export function mapDualDescToTools(data: Record<string, unknown>): ToolsSectionData {
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const subDescription = data.sub_description as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: data.title as ToolsSectionData["title"],
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    sub_title: data.sub_title as ToolsSectionData["sub_title"],
    sub_description: subDescription
      ? {
          ar: editorHtml(subDescription.ar),
          en: editorHtml(subDescription.en),
        }
      : undefined,
  };
}

export function mapContactToCtas(data: Record<string, unknown>): Record<string, unknown> {
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: data.title,
    phone_number: data.phone_number ?? data.phone,
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
  };
}

export function mapPackagesToPayload(data: Record<string, unknown>): PackagesSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const desc = item.description as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: item.title as PackagesSectionData["items"][0]["title"],
        description: desc
          ? { ar: editorHtml(desc.ar), en: editorHtml(desc.en) }
          : { ar: "", en: "" },
        image: item.image as PackagesSectionData["items"][0]["image"],
        image_alt: item.image_alt as PackagesSectionData["items"][0]["image_alt"],
        price: Number(item.price ?? 0),
        currency: String(item.currency ?? ""),
        features: item.features as PackagesSectionData["items"][0]["features"],
        sort_order: index + 1,
      };
    },
  );
  return {
    title: data.title as PackagesSectionData["title"],
    description: data.description as PackagesSectionData["description"],
    items,
  };
}

export function mapAuditsToPayload(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => ({
      title: item.title as ListSectionData["items"][0]["title"],
      description: {
        ar: editorHtml((item.description as { ar?: unknown })?.ar ?? item.description),
        en: editorHtml((item.description as { en?: unknown })?.en ?? item.description),
      },
      button_text: item.button_text as ListSectionData["items"][0]["button_text"],
      sort_order: index + 1,
    }),
  );
  return {
    title: data.title as ListSectionData["title"],
    description: data.description as ListSectionData["description"],
    items,
  };
}

const MAPPERS: Record<
  SectionType,
  (data: Record<string, unknown>) => ServiceSectionsPayload[keyof ServiceSectionsPayload]
> = {
  image_text: mapImageTextToBenefits,
  full_section: mapFullSectionToSteps,
  faq: mapFaqToPayload,
  cards: mapCardsToOfferings,
  dual_desc: mapDualDescToTools,
  contact: mapContactToCtas,
  packages: mapPackagesToPayload,
  audits: mapAuditsToPayload,
};

export function mapSectionFormToPayload(
  type: SectionType,
  data: Record<string, unknown>,
): ServiceSectionsPayload[keyof ServiceSectionsPayload] {
  return MAPPERS[type](data);
}

export interface SectionInstanceInput {
  id: string;
  type: SectionType;
}

/** Build API sections object from builder instances (last instance wins per API key). */
export function buildSectionsPayloadFromInstances(
  instances: SectionInstanceInput[],
  dataByInstanceId: Record<string, Record<string, unknown>>,
): ServiceSectionsPayload {
  const payload: ServiceSectionsPayload = {};

  for (const instance of instances) {
    const raw = dataByInstanceId[instance.id];
    if (!raw) continue;
    const apiKey = SECTION_TYPE_TO_API_KEY[instance.type];
    (payload as Record<string, unknown>)[apiKey] = mapSectionFormToPayload(
      instance.type,
      raw,
    );
  }

  return payload;
}
