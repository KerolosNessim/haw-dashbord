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
import {
  appendIndexedField,
  appendIndexedLocalized,
  appendIndexedLocalizedHtml,
  appendLocalized,
  appendLocalizedHtml,
  appendScalar,
  htmlFromUnknown,
} from "../utils/form-data-helpers";

function appendSectionBlockSortOrder(
  fd: FormData,
  prefix: string,
  sortOrder?: number,
) {
  if (sortOrder == null) return;
  fd.append(`${prefix}_sort_order`, String(sortOrder));
}

function appendLocalizedContentTitle(
  fd: FormData,
  prefix: string,
  title: { ar?: string; en?: string } | undefined,
) {
  if (!title) return;
  appendLocalizedHtml(fd, prefix, title.ar, "ar");
  appendLocalizedHtml(fd, prefix, title.en, "en");
}

function appendBenefits(fd: FormData, data: BenefitsSectionData) {
  appendSectionBlockSortOrder(fd, "benefits", data.sort_order);
  appendLocalizedContentTitle(fd, "benefits_title", data.title);
  if (data.description) {
    appendLocalizedHtml(fd, "benefits_description", data.description.ar, "ar");
    appendLocalizedHtml(fd, "benefits_description", data.description.en, "en");
  }
  if (data.image instanceof File) {
    fd.append("benefits_image", data.image);
  }
  if (data.image_alt) {
    appendLocalized(fd, "benefits_image_alt", data.image_alt);
  }
}

function appendListSection(
  fd: FormData,
  prefix: string,
  data: ListSectionData,
  options?: { itemHtmlFields?: string[] },
) {
  appendSectionBlockSortOrder(fd, prefix, data.sort_order);
  appendLocalizedContentTitle(fd, `${prefix}_title`, data.title);
  if (data.description) {
    appendLocalizedHtml(fd, `${prefix}_description`, data.description.ar, "ar");
    appendLocalizedHtml(fd, `${prefix}_description`, data.description.en, "en");
  }
  if (data.image instanceof File) {
    fd.append(`${prefix}_image`, data.image);
  }
  if (data.image_alt) {
    appendLocalized(fd, `${prefix}_image_alt`, data.image_alt);
  }
  const itemHtmlFields = options?.itemHtmlFields ?? [];
  data.items?.forEach((item, index) => {
    appendIndexedLocalizedHtml(fd, prefix, index, "title", item.title);
    const itemDesc =
      item.description && typeof item.description === "object"
        ? (item.description as { ar?: unknown; en?: unknown })
        : undefined;
    appendIndexedLocalizedHtml(fd, prefix, index, "description", itemDesc);
    for (const field of itemHtmlFields) {
      const value = item[field as keyof typeof item] as
        | { ar?: string; en?: string }
        | undefined;
      appendIndexedLocalizedHtml(fd, prefix, index, field, value);
    }
    appendIndexedField(fd, prefix, index, "sort_order", item.sort_order ?? index + 1);
    if (item.image instanceof File) {
      fd.append(`${prefix}[${index}][image]`, item.image);
    }
  });
}

function appendSteps(fd: FormData, data: ListSectionData) {
  appendListSection(fd, "steps", data);
}

function appendAudits(fd: FormData, data: ListSectionData) {
  appendListSection(fd, "audits", data, { itemHtmlFields: ["button_text"] });
}

function appendFaqs(fd: FormData, data: FaqSectionData) {
  appendSectionBlockSortOrder(fd, "faqs", data.sort_order);
  if (data.title) {
    appendLocalizedHtml(fd, "faqs_title", data.title.ar, "ar");
    appendLocalizedHtml(fd, "faqs_title", data.title.en, "en");
  }
  if (data.description) {
    appendLocalizedHtml(fd, "faqs_description", data.description.ar, "ar");
    appendLocalizedHtml(fd, "faqs_description", data.description.en, "en");
  }
  data.items?.forEach((item, index) => {
    appendIndexedLocalizedHtml(fd, "faqs", index, "question", item.question);
    appendIndexedLocalizedHtml(fd, "faqs", index, "answer", item.answer);
    appendIndexedField(fd, "faqs", index, "sort_order", item.sort_order ?? index + 1);
  });
}

function appendOfferings(fd: FormData, data: ListSectionData) {
  appendSectionBlockSortOrder(fd, "offerings", data.sort_order);
  appendLocalizedContentTitle(fd, "offerings_title", data.title);
  if (data.description) {
    appendLocalizedHtml(fd, "offerings_description", data.description.ar, "ar");
    appendLocalizedHtml(fd, "offerings_description", data.description.en, "en");
  }
  data.items?.forEach((item, index) => {
    appendIndexedLocalizedHtml(fd, "offerings", index, "title", item.title);
    const desc =
      item.description && typeof item.description === "object"
        ? (item.description as { ar?: unknown; en?: unknown })
        : undefined;
    appendIndexedLocalizedHtml(fd, "offerings", index, "description", desc);
    appendIndexedField(fd, "offerings", index, "sort_order", item.sort_order ?? index + 1);
  });
}

function appendTools(fd: FormData, data: ToolsSectionData) {
  appendSectionBlockSortOrder(fd, "tools", data.sort_order);
  appendLocalizedContentTitle(fd, "tools_title", data.title);
  appendLocalizedHtml(fd, "tools_description", data.description?.ar, "ar");
  appendLocalizedHtml(fd, "tools_description", data.description?.en, "en");
  if (data.sub_title) {
    appendLocalizedHtml(fd, "tools_sub_title", data.sub_title.ar, "ar");
    appendLocalizedHtml(fd, "tools_sub_title", data.sub_title.en, "en");
  }
  appendLocalizedHtml(fd, "tools_sub_description", data.sub_description?.ar, "ar");
  appendLocalizedHtml(fd, "tools_sub_description", data.sub_description?.en, "en");
}

function appendCtas(fd: FormData, data: Record<string, unknown>) {
  const sortOrder = data.sort_order;
  if (sortOrder != null) {
    appendSectionBlockSortOrder(fd, "ctas", Number(sortOrder));
  }
  const title = data.title as { ar?: string; en?: string } | undefined;
  if (title) appendLocalizedContentTitle(fd, "ctas_title", title);
  if (data.phone_number) fd.append("ctas_phone_number", String(data.phone_number));
  if (data.phone) fd.append("ctas_phone_number", String(data.phone));
  appendLocalizedHtml(fd, "ctas_description", (data.description as { ar?: unknown })?.ar, "ar");
  appendLocalizedHtml(fd, "ctas_description", (data.description as { en?: unknown })?.en, "en");
}

function appendPackages(fd: FormData, data: PackagesSectionData) {
  appendSectionBlockSortOrder(fd, "packages", data.sort_order);
  appendLocalizedContentTitle(fd, "packages_title", data.title);
  if (data.description) {
    appendLocalizedHtml(fd, "packages_description", data.description.ar, "ar");
    appendLocalizedHtml(fd, "packages_description", data.description.en, "en");
  }
  data.items?.forEach((item, index) => {
    appendIndexedLocalizedHtml(fd, "packages", index, "title", item.title);
    appendIndexedLocalizedHtml(fd, "packages", index, "description", item.description);
    appendIndexedLocalized(fd, "packages", index, "image_alt", item.image_alt);
    if (item.image instanceof File) {
      fd.append(`packages[${index}][image]`, item.image);
    }
    if (item.price != null) {
      fd.append(`packages[${index}][price]`, String(item.price));
    }
    if (item.currency) {
      fd.append(`packages[${index}][currency]`, item.currency);
    }
    appendIndexedField(fd, "packages", index, "sort_order", item.sort_order ?? index + 1);
    item.features?.ar?.forEach((feature, fi) => {
      if (feature?.trim()) {
        fd.append(`packages[${index}][features][ar][${fi}]`, feature);
      }
    });
    item.features?.en?.forEach((feature, fi) => {
      if (feature?.trim()) {
        fd.append(`packages[${index}][features][en][${fi}]`, feature);
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
  appendLocalizedHtml(fd, "title", basic.title?.ar, "ar");
  appendLocalizedHtml(fd, "title", basic.title?.en, "en");
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

  if (basic.image.ar instanceof File) fd.append("image[ar]", basic.image.ar);
  if (basic.image.en instanceof File) fd.append("image[en]", basic.image.en);

  appendBasicSocialAndMedia(fd, basic);

  if (sections.benefits) appendBenefits(fd, sections.benefits);
  if (sections.steps) appendSteps(fd, sections.steps);
  if (sections.faqs) appendFaqs(fd, sections.faqs);
  if (sections.offerings) appendOfferings(fd, sections.offerings);
  if (sections.tools) appendTools(fd, sections.tools);
  if (sections.ctas) appendCtas(fd, sections.ctas);
  if (sections.audits) appendAudits(fd, sections.audits);
  if (sections.packages) appendPackages(fd, sections.packages);

  return fd;
}
