import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type {
  BenefitsSectionData,
  FaqSectionData,
  ListSectionData,
  PackagesSectionData,
  ServiceSectionsPayload,
  ToolsSectionData,
} from "../service-section-types";
import {
  appendIndexedField,
  appendIndexedLocalized,
  appendLocalized,
  appendLocalizedHtml,
  appendScalar,
  htmlFromUnknown,
} from "../utils/form-data-helpers";

function appendBenefits(fd: FormData, data: BenefitsSectionData) {
  appendLocalized(fd, "benefits_title", data.title);
  if (data.description) {
    appendLocalizedHtml(fd, "benefits_description", data.description.ar, "ar");
    appendLocalizedHtml(fd, "benefits_description", data.description.en, "en");
  }
  if (data.image instanceof File) {
    fd.append("benefits_image", data.image);
  }
}

function appendListSection(
  fd: FormData,
  prefix: string,
  data: ListSectionData,
  options?: { itemLocalizedFields?: string[] },
) {
  appendLocalized(fd, `${prefix}_title`, data.title);
  appendLocalized(fd, `${prefix}_description`, data.description);
  if (data.image instanceof File) {
    fd.append(`${prefix}_image`, data.image);
  }
  const extraFields = options?.itemLocalizedFields ?? [];
  data.items?.forEach((item, index) => {
    appendIndexedLocalized(fd, prefix, index, "title", item.title);
    appendIndexedLocalized(fd, prefix, index, "description", {
      ar: htmlFromUnknown(
        typeof item.description === "object" && item.description !== null
          ? (item.description as { ar?: unknown }).ar
          : item.description,
      ),
      en: htmlFromUnknown(
        typeof item.description === "object" && item.description !== null
          ? (item.description as { en?: unknown }).en
          : item.description,
      ),
    });
    for (const field of extraFields) {
      const value = item[field as keyof typeof item] as
        | { ar?: string; en?: string }
        | undefined;
      appendIndexedLocalized(fd, prefix, index, field, value);
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
  appendListSection(fd, "audits", data, { itemLocalizedFields: ["button_text"] });
}

function appendFaqs(fd: FormData, data: FaqSectionData) {
  appendLocalized(fd, "faqs_title", data.title);
  appendLocalized(fd, "faqs_description", data.description);
  data.items?.forEach((item, index) => {
    appendIndexedLocalized(fd, "faqs", index, "question", item.question ?? item.title);
    const answerAr = item.answer
      ? htmlFromUnknown(item.answer.ar)
      : htmlFromUnknown(item.description?.ar);
    const answerEn = item.answer
      ? htmlFromUnknown(item.answer.en)
      : htmlFromUnknown(item.description?.en);
    if (answerAr) fd.append(`faqs[${index}][answer][ar]`, answerAr);
    if (answerEn) fd.append(`faqs[${index}][answer][en]`, answerEn);
    appendIndexedField(fd, "faqs", index, "sort_order", item.sort_order ?? index + 1);
  });
}

function appendOfferings(fd: FormData, data: ListSectionData) {
  appendLocalized(fd, "offerings_title", data.title);
  appendLocalized(fd, "offerings_description", data.description);
  data.items?.forEach((item, index) => {
    appendIndexedLocalized(fd, "offerings", index, "title", item.title);
    const descAr = htmlFromUnknown(item.description?.ar ?? item.description);
    const descEn = htmlFromUnknown(item.description?.en ?? item.description);
    if (descAr) fd.append(`offerings[${index}][description][ar]`, descAr);
    if (descEn) fd.append(`offerings[${index}][description][en]`, descEn);
    appendIndexedField(fd, "offerings", index, "sort_order", item.sort_order ?? index + 1);
  });
}

function appendTools(fd: FormData, data: ToolsSectionData) {
  appendLocalized(fd, "tools_title", data.title);
  appendLocalizedHtml(fd, "tools_description", data.description?.ar, "ar");
  appendLocalizedHtml(fd, "tools_description", data.description?.en, "en");
  if (data.sub_title) appendLocalized(fd, "tools_sub_title", data.sub_title);
  appendLocalizedHtml(fd, "tools_sub_description", data.sub_description?.ar, "ar");
  appendLocalizedHtml(fd, "tools_sub_description", data.sub_description?.en, "en");
}

function appendCtas(fd: FormData, data: Record<string, unknown>) {
  const title = data.title as { ar?: string; en?: string } | undefined;
  if (title) appendLocalized(fd, "ctas_title", { ar: title.ar ?? "", en: title.en ?? "" });
  const buttonText = data.button_text as { ar?: string; en?: string } | undefined;
  if (buttonText) appendLocalized(fd, "ctas_button_text", buttonText);
  if (data.phone_number) fd.append("ctas_phone_number", String(data.phone_number));
  if (data.phone) fd.append("ctas_phone_number", String(data.phone));
  appendLocalizedHtml(fd, "ctas_description", (data.description as { ar?: unknown })?.ar, "ar");
  appendLocalizedHtml(fd, "ctas_description", (data.description as { en?: unknown })?.en, "en");
}

function appendPackages(fd: FormData, data: PackagesSectionData) {
  appendLocalized(fd, "packages_title", data.title);
  appendLocalized(fd, "packages_description", data.description);
  data.items?.forEach((item, index) => {
    appendIndexedLocalized(fd, "packages", index, "title", item.title);
    if (item.description) {
      appendIndexedLocalized(fd, "packages", index, "description", item.description);
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
  appendScalar(fd, "media_url", basic.media_url);
  appendScalar(fd, "media_type", basic.media_type);
  if (basic.sort_order != null) {
    fd.append("sort_order", String(basic.sort_order));
  }

  basic.package_ids?.forEach((id) => fd.append("package_ids[]", id));

  appendLocalized(fd, "og_title", basic.og_title);
  appendLocalized(fd, "og_description", basic.og_description);
  appendScalar(fd, "og_type", basic.og_type);
  if (basic.og_image instanceof File) {
    fd.append("og_image", basic.og_image);
  } else if (basic.og_image) {
    fd.append("og_image", String(basic.og_image));
  }

  appendScalar(fd, "twitter_card", basic.twitter_card);
  appendLocalized(fd, "twitter_title", basic.twitter_title);
  appendLocalized(fd, "twitter_description", basic.twitter_description);
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
  appendLocalized(fd, "title", basic.title);
  appendLocalized(fd, "description", basic.description);

  basic.country_ids.forEach((id) => fd.append("country_ids[]", id));

  fd.append("is_active", basic.is_active ? "1" : "0");
  fd.append("show_footer", basic.show_footer ? "1" : "0");

  if (basic.highlight_description?.ar) {
    fd.append(
      "highlight_description[ar]",
      htmlFromUnknown(basic.highlight_description.ar),
    );
  }
  if (basic.highlight_description?.en) {
    fd.append(
      "highlight_description[en]",
      htmlFromUnknown(basic.highlight_description.en),
    );
  }

  appendLocalized(fd, "meta_title", basic.meta_title);
  appendLocalized(fd, "meta_description", basic.meta_description);
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
