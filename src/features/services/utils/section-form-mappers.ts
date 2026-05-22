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

function localizedEditorHtml(
  value: { ar?: unknown; en?: unknown } | undefined,
): { ar: string; en: string } | undefined {
  if (!value) return undefined;
  return { ar: editorHtml(value.ar), en: editorHtml(value.en) };
}

export function mapImageTextToBenefits(data: Record<string, unknown>): BenefitsSectionData {
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as BenefitsSectionData["title"]),
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    image: data.image as File | string | null,
    image_alt: data.image_alt as BenefitsSectionData["image_alt"],
  };
}

export function mapFullSectionToSteps(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const itemTitle = item.title as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: localizedEditorHtml(itemTitle) ?? (item.title as ListSectionData["items"][0]["title"]),
        description: {
          ar: editorHtml((item.description as { ar?: unknown })?.ar ?? item.description),
          en: editorHtml((item.description as { en?: unknown })?.en ?? item.description),
        },
        sort_order: Number(item.sort_order ?? index),
      };
    },
  );
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as ListSectionData["title"]),
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    image: data.image as File | string | null,
    image_alt: data.image_alt as ListSectionData["image_alt"],
    items,
    sort_order: Number(data.sort_order ?? 0) || undefined,
  };
}

export function mapFaqToPayload(data: Record<string, unknown>): FaqSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const answer = item.answer as { ar?: unknown; en?: unknown } | undefined;
      const question = item.question as { ar?: unknown; en?: unknown } | undefined;
      return {
        question: question
          ? { ar: editorHtml(question.ar), en: editorHtml(question.en) }
          : undefined,
        answer: answer
          ? { ar: editorHtml(answer.ar), en: editorHtml(answer.en) }
          : undefined,
        sort_order: index,
      };
    },
  );
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as FaqSectionData["title"]),
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    items,
  };
}

export function mapCardsToOfferings(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const desc = item.description as { ar?: unknown; en?: unknown } | undefined;
      const itemTitle = item.title as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: localizedEditorHtml(itemTitle) ?? (item.title as ListSectionData["items"][0]["title"]),
        description: desc
          ? { ar: editorHtml(desc.ar), en: editorHtml(desc.en) }
          : undefined,
        sort_order: index,
      };
    },
  );
  const sectionDescription = data.description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as ListSectionData["title"]),
    description: sectionDescription
      ? {
          ar: editorHtml(sectionDescription.ar),
          en: editorHtml(sectionDescription.en),
        }
      : undefined,
    items,
  };
}

export function mapDualDescToTools(data: Record<string, unknown>): ToolsSectionData {
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const subDescription = data.sub_description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  const subTitle = data.sub_title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as ToolsSectionData["title"]),
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
    sub_title: localizedEditorHtml(subTitle) ?? (data.sub_title as ToolsSectionData["sub_title"]),
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
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? data.title,
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
      const itemTitle = item.title as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: localizedEditorHtml(itemTitle) ?? (item.title as PackagesSectionData["items"][0]["title"]),
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
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  const sectionDescription = data.description as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as PackagesSectionData["title"]),
    description: localizedEditorHtml(sectionDescription) ?? (data.description as PackagesSectionData["description"]),
    items,
  };
}

export function mapAuditsToPayload(data: Record<string, unknown>): ListSectionData {
  const items = (data.items as Array<Record<string, unknown>> | undefined)?.map(
    (item, index) => {
      const itemTitle = item.title as { ar?: unknown; en?: unknown } | undefined;
      const buttonText = item.button_text as { ar?: unknown; en?: unknown } | undefined;
      return {
        title: localizedEditorHtml(itemTitle) ?? (item.title as ListSectionData["items"][0]["title"]),
        description: {
          ar: editorHtml((item.description as { ar?: unknown })?.ar ?? item.description),
          en: editorHtml((item.description as { en?: unknown })?.en ?? item.description),
        },
        button_text: localizedEditorHtml(buttonText) ?? (item.button_text as ListSectionData["items"][0]["button_text"]),
        sort_order: index + 1,
      };
    },
  );
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  const title = data.title as { ar?: unknown; en?: unknown } | undefined;
  return {
    title: localizedEditorHtml(title) ?? (data.title as ListSectionData["title"]),
    description: description
      ? { ar: editorHtml(description.ar), en: editorHtml(description.en) }
      : undefined,
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

  instances.forEach((instance, index) => {
    const raw = dataByInstanceId[instance.id];
    if (!raw) return;
    const apiKey = SECTION_TYPE_TO_API_KEY[instance.type];
    const mapped = mapSectionFormToPayload(instance.type, raw) as Record<string, unknown>;
    mapped.sort_order = index + 1;
    (payload as Record<string, unknown>)[apiKey] = mapped;
  });

  return payload;
}
