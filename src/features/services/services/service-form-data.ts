import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type {
  BenefitsSectionData,
  FaqSectionData,
  ListSectionData,
  ServiceSectionsPayload,
  ToolsSectionData,
} from "../service-section-types";
import {
  appendIndexedField,
  appendIndexedLocalized,
  appendLocalized,
  appendLocalizedHtml,
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

function appendListSection(fd: FormData, prefix: string, data: ListSectionData) {
  appendLocalized(fd, `${prefix}_title`, data.title);
  appendLocalized(fd, `${prefix}_description`, data.description);
  if (data.image instanceof File) {
    fd.append(`${prefix}_image`, data.image);
  }
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
    appendIndexedField(fd, prefix, index, "sort_order", item.sort_order ?? index);
    if (item.image instanceof File) {
      fd.append(`${prefix}[${index}][image]`, item.image);
    }
  });
}

function appendSteps(fd: FormData, data: ListSectionData) {
  appendListSection(fd, "steps", data);
}

function appendFaqs(fd: FormData, data: FaqSectionData) {
  appendLocalized(fd, "faqs_title", data.title);
  appendLocalized(fd, "faqs_description", data.description);
  data.items?.forEach((item, index) => {
    appendIndexedLocalized(fd, "faqs", index, "question", item.question ?? item.title);
    const answerAr = item.answer ? htmlFromUnknown(item.answer.ar) : htmlFromUnknown(item.description?.ar);
    const answerEn = item.answer ? htmlFromUnknown(item.answer.en) : htmlFromUnknown(item.description?.en);
    if (answerAr) fd.append(`faqs[${index}][answer][ar]`, answerAr);
    if (answerEn) fd.append(`faqs[${index}][answer][en]`, answerEn);
    appendIndexedField(fd, "faqs", index, "sort_order", item.sort_order ?? index);
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
    appendIndexedField(fd, "offerings", index, "sort_order", item.sort_order ?? index);
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
  if (data.phone_number) fd.append("ctas_phone_number", String(data.phone_number));
  if (data.phone) fd.append("ctas_phone_number", String(data.phone));
  appendLocalizedHtml(fd, "ctas_description", (data.description as { ar?: unknown })?.ar, "ar");
  appendLocalizedHtml(fd, "ctas_description", (data.description as { en?: unknown })?.en, "en");
}

function appendSeoFields(fd: FormData, seo?: ServiceSectionsPayload["seo"]) {
  if (!seo) return;
  if (seo.og) {
    appendLocalized(fd, "og_title", seo.og.title);
    appendLocalized(fd, "og_description", seo.og.description);
    if (seo.og.type) fd.append("og_type", seo.og.type);
    if (seo.og.image instanceof File) fd.append("og_image", seo.og.image);
    else if (seo.og.image) fd.append("og_image", String(seo.og.image));
  }
  if (seo.twitter) {
    appendLocalized(fd, "twitter_title", seo.twitter.title);
    appendLocalized(fd, "twitter_description", seo.twitter.description);
    if (seo.twitter.card) fd.append("twitter_card", seo.twitter.card);
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

  if (sections.benefits) appendBenefits(fd, sections.benefits);
  if (sections.steps) appendSteps(fd, sections.steps);
  if (sections.faqs) appendFaqs(fd, sections.faqs);
  if (sections.offerings) appendOfferings(fd, sections.offerings);
  if (sections.tools) appendTools(fd, sections.tools);
  if (sections.ctas) appendCtas(fd, sections.ctas);
  if (sections.audits) appendListSection(fd, "audits", sections.audits);

  appendSeoFields(fd, sections.seo);

  return fd;
}
