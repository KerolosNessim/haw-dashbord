import type { SectionType } from "../service-section-types";
import type { Service } from "../type";
import { offeringsDataFromService } from "../utils/service-api-mappers";

export type BuilderSectionDef = {
  id: string;
  type: SectionType;
  data: unknown;
  sort_order: number;
};

const DEFAULT_BUILDER_ORDER: Record<string, number> = {
  benefits: 10,
  offerings: 20,
  steps: 30,
  tools: 40,
  faqs: 50,
  ctas: 90,
};

function blockSortOrder(raw: unknown, fallback: number): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const n = Number((raw as Record<string, unknown>).sort_order);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Build builder section list from admin service, ordered by API `sort_order`. */
export function builderSectionsFromService(service: Service): BuilderSectionDef[] {
  const raw = service as Record<string, unknown>;
  const defs: BuilderSectionDef[] = [];

  if (service.benefits) {
    defs.push({
      id: "benefits",
      type: "image_text",
      data: service.benefits,
      sort_order: blockSortOrder(service.benefits, DEFAULT_BUILDER_ORDER.benefits),
    });
  }
  if (service.steps) {
    defs.push({
      id: "steps",
      type: "full_section",
      data: service.steps,
      sort_order: blockSortOrder(service.steps, DEFAULT_BUILDER_ORDER.steps),
    });
  }
  if (service.faqs) {
    defs.push({
      id: "faqs",
      type: "faq",
      data: service.faqs,
      sort_order: blockSortOrder(service.faqs, DEFAULT_BUILDER_ORDER.faqs),
    });
  }
  if (service.tools) {
    defs.push({
      id: "tools",
      type: "dual_desc",
      data: service.tools,
      sort_order: blockSortOrder(service.tools, DEFAULT_BUILDER_ORDER.tools),
    });
  }
  if (service.ctas) {
    defs.push({
      id: "ctas",
      type: "contact",
      data: service.ctas,
      sort_order: blockSortOrder(service.ctas, DEFAULT_BUILDER_ORDER.ctas),
    });
  }
  if (service.offerings || raw.offerings_title) {
    defs.push({
      id: "offerings",
      type: "cards",
      data: offeringsDataFromService(service),
      sort_order: blockSortOrder(
        service.offerings ?? { sort_order: raw.offerings_sort_order },
        DEFAULT_BUILDER_ORDER.offerings,
      ),
    });
  }

  return defs.sort((a, b) => a.sort_order - b.sort_order);
}
