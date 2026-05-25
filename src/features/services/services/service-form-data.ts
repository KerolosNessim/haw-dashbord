import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type {
  BenefitsSectionData,
  FaqSectionData,
  ListSectionData,
  PackagesSectionData,
  ServiceSectionsPayload,
  ToolsSectionData,
} from "../service-section-types";
import { htmlForMultipartApi } from "@/lib/html-for-multipart-api";
import { appendServiceTagsToFormData } from "../lib/service-tags";
import {
  appendIndexedBilingualSectionImage,
  appendItemBilingualSectionImage,
} from "../utils/append-bilingual-section-image";
import {
  appendIndexedField,
  appendIndexedLocalized,
  appendIndexedLocalizedHtml,
  appendLocalized,
  appendLocalizedHtml,
  appendScalar,
  appendSectionItemField,
  appendSectionItemLocalizedHtml,
  htmlFromUnknown,
} from "../utils/form-data-helpers";

function appendSectionId(
  fd: FormData,
  prefix: string,
  index: number,
  id?: number,
) {
  if (id != null && Number.isFinite(id) && id > 0) {
    appendIndexedField(fd, prefix, index, "id", id);
  }
}

/** Global display order (from builder drag order). */
function appendSectionSortOrder(
  fd: FormData,
  prefix: string,
  index: number,
  sortOrder?: number,
) {
  if (sortOrder != null && Number.isFinite(sortOrder) && sortOrder > 0) {
    appendIndexedField(fd, prefix, index, "sort_order", sortOrder);
  }
}

function appendSectionLink(
  fd: FormData,
  prefix: string,
  index: number,
  link?: string,
) {
  const trimmed = link?.trim();
  if (trimmed) {
    appendIndexedField(fd, prefix, index, "link", trimmed);
  }
}

function appendBenefitsSection(
  fd: FormData,
  index: number,
  data: BenefitsSectionData,
) {
  appendSectionId(fd, "benefits", index, data.id);
  appendSectionSortOrder(fd, "benefits", index, data.sort_order);
  appendSectionLink(fd, "benefits", index, data.link);
  appendIndexedLocalizedHtml(fd, "benefits", index, "title", data.title);
  if (data.description) {
    appendIndexedLocalizedHtml(fd, "benefits", index, "description", data.description);
  }
  appendIndexedBilingualSectionImage(fd, "benefits", index, data.image);
  if (data.image_alt) {
    appendIndexedLocalized(fd, "benefits", index, "image_alt", data.image_alt);
  }
}

function appendListSectionBlock(
  fd: FormData,
  prefix: string,
  index: number,
  data: ListSectionData,
  options?: { itemHtmlFields?: string[] },
) {
  appendSectionId(fd, prefix, index, data.id);
  appendSectionSortOrder(fd, prefix, index, data.sort_order);
  appendSectionLink(fd, prefix, index, data.link);
  appendIndexedLocalizedHtml(fd, prefix, index, "title", data.title);
  if (data.description) {
    appendIndexedLocalizedHtml(fd, prefix, index, "description", data.description);
  }
  appendIndexedBilingualSectionImage(fd, prefix, index, data.image);
  if (data.image_alt) {
    appendIndexedLocalized(fd, prefix, index, "image_alt", data.image_alt);
  }

  const itemHtmlFields = options?.itemHtmlFields ?? [];
  data.items?.forEach((item, itemIndex) => {
    appendSectionItemLocalizedHtml(fd, prefix, index, itemIndex, "title", item.title);
    const itemDesc =
      item.description && typeof item.description === "object"
        ? (item.description as { ar?: unknown; en?: unknown })
        : undefined;
    appendSectionItemLocalizedHtml(
      fd,
      prefix,
      index,
      itemIndex,
      "description",
      itemDesc,
    );
    for (const field of itemHtmlFields) {
      const value = item[field as keyof typeof item] as
        | { ar?: string; en?: string }
        | undefined;
      appendSectionItemLocalizedHtml(fd, prefix, index, itemIndex, field, value);
    }
    appendSectionItemField(
      fd,
      prefix,
      index,
      itemIndex,
      "sort_order",
      item.sort_order ?? itemIndex + 1,
    );
    appendItemBilingualSectionImage(fd, prefix, index, itemIndex, item.image);
  });
}

function appendFaqsSection(fd: FormData, index: number, data: FaqSectionData) {
  appendSectionId(fd, "faqs", index, data.id);
  appendSectionSortOrder(fd, "faqs", index, data.sort_order);
  appendSectionLink(fd, "faqs", index, data.link);
  appendIndexedLocalizedHtml(fd, "faqs", index, "title", data.title);
  if (data.description) {
    appendIndexedLocalizedHtml(fd, "faqs", index, "description", data.description);
  }
  data.items?.forEach((item, itemIndex) => {
    appendSectionItemLocalizedHtml(
      fd,
      "faqs",
      index,
      itemIndex,
      "question",
      item.question,
    );
    appendSectionItemLocalizedHtml(fd, "faqs", index, itemIndex, "answer", item.answer);
    appendSectionItemField(
      fd,
      "faqs",
      index,
      itemIndex,
      "sort_order",
      item.sort_order ?? itemIndex + 1,
    );
  });
}

function appendToolsSection(fd: FormData, index: number, data: ToolsSectionData) {
  appendSectionId(fd, "tools", index, data.id);
  appendSectionSortOrder(fd, "tools", index, data.sort_order);
  appendSectionLink(fd, "tools", index, data.link);
  appendIndexedLocalizedHtml(fd, "tools", index, "title", data.title);
  appendIndexedLocalizedHtml(fd, "tools", index, "description", data.description);
  if (data.sub_title) {
    appendIndexedLocalizedHtml(fd, "tools", index, "sub_title", data.sub_title);
  }
  appendIndexedLocalizedHtml(
    fd,
    "tools",
    index,
    "sub_description",
    data.sub_description,
  );
}

function appendCtasSection(
  fd: FormData,
  index: number,
  data: Record<string, unknown>,
) {
  const id = data.id != null ? Number(data.id) : undefined;
  const sortOrder =
    data.sort_order != null ? Number(data.sort_order) : undefined;
  appendSectionId(fd, "ctas", index, id);
  appendSectionSortOrder(fd, "ctas", index, sortOrder);
  appendSectionLink(fd, "ctas", index, typeof data.link === "string" ? data.link : undefined);
  const title = data.title as { ar?: string; en?: string } | undefined;
  appendIndexedLocalizedHtml(fd, "ctas", index, "title", title);
  if (data.phone_number) {
    appendIndexedField(fd, "ctas", index, "phone_number", String(data.phone_number));
  }
  if (data.phone) {
    appendIndexedField(fd, "ctas", index, "phone_number", String(data.phone));
  }
  const description = data.description as { ar?: unknown; en?: unknown } | undefined;
  appendIndexedLocalizedHtml(fd, "ctas", index, "description", description);
}

function appendPackagesSection(
  fd: FormData,
  index: number,
  data: PackagesSectionData,
) {
  appendSectionId(fd, "packages", index, data.id);
  appendSectionSortOrder(fd, "packages", index, data.sort_order);
  appendSectionLink(fd, "packages", index, data.link);
  appendIndexedLocalizedHtml(fd, "packages", index, "title", data.title);
  if (data.description) {
    appendIndexedLocalizedHtml(fd, "packages", index, "description", data.description);
  }
  data.items?.forEach((item, itemIndex) => {
    appendSectionItemLocalizedHtml(
      fd,
      "packages",
      index,
      itemIndex,
      "title",
      item.title,
    );
    appendSectionItemLocalizedHtml(
      fd,
      "packages",
      index,
      itemIndex,
      "description",
      item.description,
    );
    if (item.image_alt) {
      const itemBase = `packages[${index}][items][${itemIndex}][image_alt]`;
      if (item.image_alt.ar) fd.append(`${itemBase}[ar]`, item.image_alt.ar);
      if (item.image_alt.en) fd.append(`${itemBase}[en]`, item.image_alt.en);
    }
    appendItemBilingualSectionImage(fd, "packages", index, itemIndex, item.image);
    if (item.price != null) {
      appendSectionItemField(fd, "packages", index, itemIndex, "price", item.price);
    }
    if (item.currency) {
      appendSectionItemField(
        fd,
        "packages",
        index,
        itemIndex,
        "currency",
        item.currency,
      );
    }
    appendSectionItemField(
      fd,
      "packages",
      index,
      itemIndex,
      "sort_order",
      item.sort_order ?? itemIndex + 1,
    );
    item.features?.ar?.forEach((feature, fi) => {
      if (feature?.trim()) {
        fd.append(
          `packages[${index}][items][${itemIndex}][features][ar][${fi}]`,
          feature,
        );
      }
    });
    item.features?.en?.forEach((feature, fi) => {
      if (feature?.trim()) {
        fd.append(
          `packages[${index}][items][${itemIndex}][features][en][${fi}]`,
          feature,
        );
      }
    });
  });
}

function appendBasicSocialAndMedia(fd: FormData, basic: BasicInfoValues) {
  basic.package_ids?.forEach((id) => fd.append("package_ids[]", id));

  if (basic.og_title) {
    appendLocalizedHtml(fd, "og_title", basic.og_title.ar, "ar");
    appendLocalizedHtml(fd, "og_title", basic.og_title.en, "en");
  }
  if (basic.og_description) {
    appendLocalizedHtml(fd, "og_description", basic.og_description.ar, "ar");
    appendLocalizedHtml(fd, "og_description", basic.og_description.en, "en");
  }
  appendScalar(fd, "og_type", basic.og_type);
  if (basic.og_image instanceof File) {
    fd.append("og_image", basic.og_image);
  } else if (basic.og_image) {
    fd.append("og_image", String(basic.og_image));
  }

  appendScalar(fd, "twitter_card", basic.twitter_card);
  if (basic.twitter_title) {
    appendLocalizedHtml(fd, "twitter_title", basic.twitter_title.ar, "ar");
    appendLocalizedHtml(fd, "twitter_title", basic.twitter_title.en, "en");
  }
  if (basic.twitter_description) {
    appendLocalizedHtml(fd, "twitter_description", basic.twitter_description.ar, "ar");
    appendLocalizedHtml(fd, "twitter_description", basic.twitter_description.en, "en");
  }
  if (basic.twitter_image instanceof File) {
    fd.append("twitter_image", basic.twitter_image);
  } else if (basic.twitter_image) {
    fd.append("twitter_image", String(basic.twitter_image));
  }
}

export function buildServicePageFormData(
  basic: BasicInfoValues,
  sections: ServiceSectionsPayload = {},
): FormData {
  const fd = new FormData();

  appendLocalized(fd, "slug", basic.slug);
  fd.append("slug_redirect_code[ar]", basic.slug_redirect_code?.ar ?? "");
  fd.append("slug_redirect_code[en]", basic.slug_redirect_code?.en ?? "");
  appendLocalizedHtml(fd, "title", basic.title?.ar, "ar");
  appendLocalizedHtml(fd, "title", basic.title?.en, "en");
  if (basic.single_page_title?.ar) {
    appendLocalizedHtml(fd, "single_page_title", basic.single_page_title.ar, "ar");
  }
  if (basic.single_page_title?.en) {
    appendLocalizedHtml(fd, "single_page_title", basic.single_page_title.en, "en");
  }
  if (basic.page_script?.trim()) {
    fd.append("page_script", basic.page_script.trim());
  }
  appendServiceTagsToFormData(fd, basic.tags ?? []);
  if (basic.description) {
    appendLocalizedHtml(fd, "description", basic.description.ar, "ar");
    appendLocalizedHtml(fd, "description", basic.description.en, "en");
  }

  basic.country_ids.forEach((id, index) =>
    fd.append(`country_ids[${index}]`, id),
  );

  fd.append("is_active", basic.is_active ? "1" : "0");
  fd.append("show_footer", basic.show_footer ? "1" : "0");

  if (basic.highlight_description?.ar) {
    fd.append(
      "highlight_description[ar]",
      htmlForMultipartApi(htmlFromUnknown(basic.highlight_description.ar)),
    );
  }
  if (basic.highlight_description?.en) {
    fd.append(
      "highlight_description[en]",
      htmlForMultipartApi(htmlFromUnknown(basic.highlight_description.en)),
    );
  }

  appendLocalizedHtml(fd, "inside_desc", basic.inside_desc?.ar, "ar");
  appendLocalizedHtml(fd, "inside_desc", basic.inside_desc?.en, "en");

  appendLocalizedHtml(fd, "meta_title", basic.meta_title?.ar, "ar");
  appendLocalizedHtml(fd, "meta_title", basic.meta_title?.en, "en");
  appendLocalizedHtml(fd, "meta_description", basic.meta_description?.ar, "ar");
  appendLocalizedHtml(fd, "meta_description", basic.meta_description?.en, "en");
  appendLocalized(fd, "image_alt", basic.image_alt);

  if (basic.image.ar instanceof File) {
    fd.append("image[ar]", basic.image.ar);
  } else if (typeof basic.image.ar === "string" && basic.image.ar.trim()) {
    fd.append("image[ar]", basic.image.ar.trim());
  }
  if (basic.image.en instanceof File) {
    fd.append("image[en]", basic.image.en);
  } else if (typeof basic.image.en === "string" && basic.image.en.trim()) {
    fd.append("image[en]", basic.image.en.trim());
  }

  appendBasicSocialAndMedia(fd, basic);

  sections.benefits?.forEach((section, index) => appendBenefitsSection(fd, index, section));
  sections.steps?.forEach((section, index) => appendListSectionBlock(fd, "steps", index, section));
  sections.faqs?.forEach((section, index) => appendFaqsSection(fd, index, section));
  sections.offerings?.forEach((section, index) =>
    appendListSectionBlock(fd, "offerings", index, section),
  );
  sections.tools?.forEach((section, index) => appendToolsSection(fd, index, section));
  sections.ctas?.forEach((section, index) => appendCtasSection(fd, index, section));
  sections.audits?.forEach((section, index) =>
    appendListSectionBlock(fd, "audits", index, section, {
      itemHtmlFields: ["button_text"],
    }),
  );
  sections.packages?.forEach((section, index) =>
    appendPackagesSection(fd, index, section),
  );

  return fd;
}
