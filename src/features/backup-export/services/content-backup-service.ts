import { blogTagNames } from "@/features/blogs/lib/blog-tags";
import {
  createBlog,
  fetchAdminBlogById,
  fetchAdminBlogs,
  recordToBlogFormValues,
  updateBlog,
  type BlogFormValues,
} from "@/features/blogs/services/blogs-api";
import {
  normalizeAdminBlogListPayload,
  pickAdminBlogMeta,
} from "@/features/blogs/utils/admin-blog-mapper";
import { getLegalPageApi, updateLegalPageApi } from "@/features/legal/services/legal-api";
import type { LegalPageType } from "@/features/legal/types";
import {
  getFaqGeneral,
  createFaqItem,
  updateFaqItem,
  updateFaqGeneral,
} from "@/features/faq/services/faq";
import type { CreateFaqItemInput } from "@/features/faq/types";
import { getAboutUs } from "@/features/about-us/services/about-us";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import {
  buildServicesTemplateSheet,
  exportServiceById,
  fetchAllServiceExportRows,
  importServiceRows,
} from "@/features/backup-export/services/service-backup-service";
import { cellBoolean, cellString } from "@/lib/excel-io";
import type { ExcelSheetInput } from "@/lib/excel-io";

export { exportServiceById } from "@/features/backup-export/services/service-backup-service";

const LEGAL_TYPES: LegalPageType[] = [
  "privacy-policy",
  "terms-of-use",
  "refund-policy",
];

function blogFormValuesToRow(id: string | number | "", values: BlogFormValues): Record<string, unknown> {
  return {
    id,
    blog_category_id: values.category_id,
    title_ar: values.title.ar,
    title_en: values.title.en,
    subtitle_ar: values.subtitle.ar,
    subtitle_en: values.subtitle.en,
    description_ar: values.description.ar,
    description_en: values.description.en,
    content_ar: values.content.ar,
    content_en: values.content.en,
    slug_ar: values.slug.ar,
    slug_en: values.slug.en,
    meta_title_ar: values.meta_title.ar,
    meta_title_en: values.meta_title.en,
    meta_description_ar: values.meta_description.ar,
    meta_description_en: values.meta_description.en,
    image_alt_ar: values.image_alt.ar,
    image_alt_en: values.image_alt.en,
    publisher_name: values.publisher_name,
    tags: blogTagNames(values.tags).join(", "),
    status: values.status,
    is_active: values.is_active ? 1 : 0,
    is_searchable: values.is_searchable ? 1 : 0,
    published_at: values.published_at,
    canonical_url: values.canonical_url,
    _note_image: "Re-upload cover image manually in dashboard after import",
  };
}

function rowToBlogFormValues(row: Record<string, unknown>): BlogFormValues {
  const statusRaw = cellString(row.status);
  const status =
    statusRaw === "published" || statusRaw === "scheduled" || statusRaw === "draft"
      ? statusRaw
      : "draft";

  return {
    title: { ar: cellString(row.title_ar), en: cellString(row.title_en) },
    subtitle: { ar: cellString(row.subtitle_ar), en: cellString(row.subtitle_en) },
    description: {
      ar: cellString(row.description_ar),
      en: cellString(row.description_en),
    },
    content: { ar: cellString(row.content_ar), en: cellString(row.content_en) },
    slug: { ar: cellString(row.slug_ar), en: cellString(row.slug_en) },
    meta_title: {
      ar: cellString(row.meta_title_ar),
      en: cellString(row.meta_title_en),
    },
    meta_description: {
      ar: cellString(row.meta_description_ar),
      en: cellString(row.meta_description_en),
    },
    image_alt: {
      ar: cellString(row.image_alt_ar),
      en: cellString(row.image_alt_en),
    },
    publisher_name: cellString(row.publisher_name),
    tags: cellString(row.tags)
      .split(/[,،]/)
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, index: true, follow: true })),
    category_id: cellString(row.blog_category_id),
    is_active: cellBoolean(row.is_active, true),
    is_searchable: cellBoolean(row.is_searchable, true),
    status,
    published_at: cellString(row.published_at),
    canonical_url: cellString(row.canonical_url),
  };
}

async function fetchAllBlogRecords(): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await fetchAdminBlogs({ page, per_page: 50 });
    const list = normalizeAdminBlogListPayload(payload);
    const meta = pickAdminBlogMeta(payload);
    lastPage = meta.lastPage || 1;

    for (const item of list) {
      const id = (item as Record<string, unknown>).id;
      if (id == null) continue;
      const detail = await fetchAdminBlogById(id);
      const values = recordToBlogFormValues(detail);
      if (values) rows.push(blogFormValuesToRow(id, values));
    }
    page += 1;
  } while (page <= lastPage);

  return rows;
}

/** Export one or many blogs into a single `blogs` sheet. */
export async function exportBlogsByIds(
  ids: (string | number)[],
): Promise<ExcelSheetInput[]> {
  const unique = [...new Set(ids.map((id) => String(id)))];
  const rows: Record<string, unknown>[] = [];

  for (const id of unique) {
    const detail = await fetchAdminBlogById(id);
    const values = recordToBlogFormValues(detail);
    if (values) rows.push(blogFormValuesToRow(id, values));
  }

  return [{ name: "blogs", rows }];
}

export async function exportBlogById(blogId: string | number): Promise<ExcelSheetInput[]> {
  return exportBlogsByIds([blogId]);
}

export async function buildAllBlogsSheets(): Promise<ExcelSheetInput[]> {
  return [{ name: "blogs", rows: await fetchAllBlogRecords() }];
}

export async function buildFullBackupSheets(): Promise<ExcelSheetInput[]> {
  const [blogRows, serviceRows] = await Promise.all([
    fetchAllBlogRecords(),
    fetchAllServiceExportRows(),
  ]);

  const legalRows: Record<string, unknown>[] = [];
  for (const type of LEGAL_TYPES) {
    const page = await getLegalPageApi(type);
    legalRows.push({
      page_type: type,
      description_ar: page.description?.ar ?? "",
      description_en: page.description?.en ?? "",
      meta_title_ar: page.meta_title?.ar ?? "",
      meta_title_en: page.meta_title?.en ?? "",
      meta_description_ar: page.meta_description?.ar ?? "",
      meta_description_en: page.meta_description?.en ?? "",
      slug: page.slug ?? "",
      image_url: page.image ?? "",
    });
  }

  const faq = (await getFaqGeneral()).data;
  const faqGeneralRow: Record<string, unknown> = {
    id: faq.id,
    title_ar: faq.title?.ar ?? "",
    title_en: faq.title?.en ?? "",
    description_ar: faq.description?.ar ?? "",
    description_en: faq.description?.en ?? "",
    meta_title_ar: faq.meta_title?.ar ?? "",
    meta_title_en: faq.meta_title?.en ?? "",
    meta_description_ar: faq.meta_description?.ar ?? "",
    meta_description_en: faq.meta_description?.en ?? "",
    slug_ar: faq.slug ?? "",
    slug_en: faq.slug ?? "",
    is_active: faq.is_active ? 1 : 0,
  };

  const faqItemRows = (faq.items ?? []).map((item) => ({
    id: item.id,
    question_ar: item.question?.ar ?? "",
    question_en: item.question?.en ?? "",
    answer_ar: item.answer?.ar ?? "",
    answer_en: item.answer?.en ?? "",
    sort_order: item.sort_order,
    is_active: item.is_active ? 1 : 0,
  }));

  let aboutJson = "";
  try {
    const about = (await getAboutUs()).data;
    aboutJson = JSON.stringify(about);
  } catch {
    aboutJson = "";
  }

  return [
    { name: "blogs", rows: blogRows },
    { name: "services", rows: serviceRows },
    { name: "legal_pages", rows: legalRows },
    { name: "faq_general", rows: [faqGeneralRow] },
    { name: "faq_items", rows: faqItemRows },
    {
      name: "about_us_json",
      rows: aboutJson ? [{ json_backup: aboutJson }] : [],
    },
  ];
}

export type ImportResult = {
  blogs: { created: number; updated: number; failed: number };
  services: { created: number; updated: number; failed: number };
  legal: { updated: number; failed: number };
  faqGeneral: boolean;
  faqItems: { created: number; updated: number; failed: number };
  errors: string[];
};

function legalRowToFormData(row: Record<string, unknown>): FormData {
  const fd = new FormData();
  fd.append("_method", "PUT");
  const descAr = localizedHtmlForApi(cellString(row.description_ar));
  const descEn = localizedHtmlForApi(cellString(row.description_en));
  if (descAr) fd.append("description[ar]", descAr);
  if (descEn) fd.append("description[en]", descEn);
  fd.append("meta_title[ar]", cellString(row.meta_title_ar));
  fd.append("meta_title[en]", cellString(row.meta_title_en));
  fd.append("meta_description[ar]", cellString(row.meta_description_ar));
  fd.append("meta_description[en]", cellString(row.meta_description_en));
  const slug = cellString(row.slug);
  if (slug) fd.append("slug", slug);
  return fd;
}

export async function importBackupWorkbook(
  sheets: Record<string, Record<string, unknown>[]>,
): Promise<ImportResult> {
  const result: ImportResult = {
    blogs: { created: 0, updated: 0, failed: 0 },
    services: { created: 0, updated: 0, failed: 0 },
    legal: { updated: 0, failed: 0 },
    faqGeneral: false,
    faqItems: { created: 0, updated: 0, failed: 0 },
    errors: [],
  };

  const blogRows = sheets.blogs ?? sheets.Blogs ?? [];
  for (const row of blogRows) {
    try {
      const values = rowToBlogFormValues(row);
      const id = cellString(row.id);
      if (id) {
        await updateBlog(id, values, null);
        result.blogs.updated += 1;
      } else {
        await createBlog(values, null);
        result.blogs.created += 1;
      }
    } catch (e) {
      result.blogs.failed += 1;
      result.errors.push(
        `Blog ${cellString(row.id) || cellString(row.title_ar) || "?"}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  const serviceRows = sheets.services ?? sheets.Services ?? [];
  const serviceImport = await importServiceRows(serviceRows);
  result.services = {
    created: serviceImport.created,
    updated: serviceImport.updated,
    failed: serviceImport.failed,
  };
  result.errors.push(...serviceImport.errors);

  const legalRows = sheets.legal_pages ?? sheets.Legal_pages ?? [];
  for (const row of legalRows) {
    const type = cellString(row.page_type) as LegalPageType;
    if (!LEGAL_TYPES.includes(type)) continue;
    try {
      await updateLegalPageApi(type, legalRowToFormData(row));
      result.legal.updated += 1;
    } catch (e) {
      result.legal.failed += 1;
      result.errors.push(
        `Legal ${type}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  const faqGeneralRows = sheets.faq_general ?? sheets.Faq_general ?? [];
  if (faqGeneralRows[0]) {
    const row = faqGeneralRows[0];
    try {
      await updateFaqGeneral({
        title: { ar: cellString(row.title_ar), en: cellString(row.title_en) },
        description: {
          ar: cellString(row.description_ar),
          en: cellString(row.description_en),
        },
        meta_title: {
          ar: cellString(row.meta_title_ar),
          en: cellString(row.meta_title_en),
        },
        meta_description: {
          ar: cellString(row.meta_description_ar),
          en: cellString(row.meta_description_en),
        },
        slug: {
          ar: cellString(row.slug_ar) || cellString(row.slug),
          en: cellString(row.slug_en) || cellString(row.slug),
        },
      });
      result.faqGeneral = true;
    } catch (e) {
      result.errors.push(
        `FAQ general: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  const faqItemRows = sheets.faq_items ?? sheets.Faq_items ?? [];
  for (const row of faqItemRows) {
    const payload: CreateFaqItemInput = {
      question: { ar: cellString(row.question_ar), en: cellString(row.question_en) },
      answer: { ar: cellString(row.answer_ar), en: cellString(row.answer_en) },
      is_active: cellBoolean(row.is_active, true),
    };
    const id = cellString(row.id);
    try {
      if (id && /^\d+$/.test(id)) {
        await updateFaqItem(Number(id), payload);
        result.faqItems.updated += 1;
      } else {
        await createFaqItem(payload);
        result.faqItems.created += 1;
      }
    } catch (e) {
      result.faqItems.failed += 1;
      result.errors.push(
        `FAQ item ${id || "?"}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return result;
}

export async function buildServicesOnlySheets(): Promise<ExcelSheetInput[]> {
  return [{ name: "services", rows: await fetchAllServiceExportRows() }];
}

export function buildTemplateSheets(): ExcelSheetInput[] {
  return [
    buildServicesTemplateSheet(),
    {
      name: "blogs",
      rows: [
        {
          id: "",
          blog_category_id: "1",
          title_ar: "عنوان المقال",
          title_en: "Article title",
          description_ar: "<p>وصف</p>",
          description_en: "<p>Description</p>",
          content_ar: "<p>محتوى</p>",
          content_en: "<p>Content</p>",
          status: "draft",
          is_active: 1,
          is_searchable: 1,
        },
      ],
    },
    {
      name: "legal_pages",
      rows: [
        {
          page_type: "privacy-policy",
          description_ar: "",
          description_en: "",
          meta_title_ar: "",
          meta_title_en: "",
        },
      ],
    },
  ];
}
