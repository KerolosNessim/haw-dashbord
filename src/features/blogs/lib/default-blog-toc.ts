/** Default TOC HTML shown in the dashboard until the editor replaces it. */
export const DEFAULT_BLOG_TOC_HTML = {
  ar: `<div class="editor-toc cms-toc"><p><strong>جدول المحتويات</strong></p><ul><li><a href="#section-1">القسم الأول</a></li><li><a href="#section-2">القسم الثاني</a></li><li><a href="#section-3">القسم الثالث</a></li></ul></div>`,
  en: `<div class="editor-toc cms-toc"><p><strong>Table of contents</strong></p><ul><li><a href="#section-1">Section 1</a></li><li><a href="#section-2">Section 2</a></li><li><a href="#section-3">Section 3</a></li></ul></div>`,
} as const;

export const BLOG_TOC_PLACEMENTS = [
  "after_meta",
  "before_body",
  "after_body",
  "before_faq",
] as const;

export type BlogTocPlacement = (typeof BLOG_TOC_PLACEMENTS)[number];

export const DEFAULT_BLOG_TOC_PLACEMENT: BlogTocPlacement = "before_body";
