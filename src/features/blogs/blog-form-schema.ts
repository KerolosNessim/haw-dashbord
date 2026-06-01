import { BLOG_TOC_PLACEMENTS } from "@/features/blogs/lib/default-blog-toc";
import { BLOG_SLUG_REDIRECT_CODES } from "@/lib/http-redirect-codes";
import { localizedSlugOptional } from "@/lib/zod-localized-slug";
import * as z from "zod";

const blogTagInputSchema = z.object({
  name: z.string().default(""),
  index: z.boolean().default(true),
  follow: z.boolean().default(true),
});

/** Arabic required; English optional (blog create/edit). */
const localizedArRequiredEnOptional = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedOptional = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

const slugRedirectCodeOptional = z.object({
  ar: z
    .string()
    .optional()
    .default("")
    .refine((v) => v === "" || (BLOG_SLUG_REDIRECT_CODES as readonly string[]).includes(v), {
      message: "validation.invalid_redirect_code",
    }),
  en: z
    .string()
    .optional()
    .default("")
    .refine((v) => v === "" || (BLOG_SLUG_REDIRECT_CODES as readonly string[]).includes(v), {
      message: "validation.invalid_redirect_code",
    }),
});

export const blogSchema = z.object({
  title: localizedArRequiredEnOptional,
  /** Postman allows empty subtitle. */
  subtitle: localizedOptional,
  description: localizedArRequiredEnOptional,
  content: localizedArRequiredEnOptional,
  /** Per-post FAQ rich HTML (`{ ar, en }`); optional on create/edit. */
  faq: localizedOptional,
  /** Show table of contents on the public blog post. */
  toc_enabled: z.boolean().default(false),
  /** Where the TOC block appears on the single post page. */
  toc_placement: z.enum(BLOG_TOC_PLACEMENTS).default("before_body"),
  /** Per-post TOC rich HTML (`{ ar, en }`); optional on create/edit. */
  table_of_contents: localizedOptional,
  publisher_name: z.string().min(1, { message: "validation.required" }),
  tags: z
    .array(blogTagInputSchema)
    .default([])
    .transform((rows) =>
      rows
        .map((r) => ({ ...r, name: r.name.trim() }))
        .filter((r) => r.name.length > 0),
    ),
  category_id: z.string().min(1, { message: "validation.required" }),
  image_alt: localizedOptional,
  is_active: z.boolean().default(true),
  /** When false, sends `is_searchable=0` in multipart. */
  is_searchable: z.boolean().default(true),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  slug: localizedSlugOptional,
  /**
   * When the slug changes, the previous URL can respond with this status (per locale).
   * Empty = no redirect rule for that locale.
   */
  slug_redirect_code: slugRedirectCodeOptional,
  /** Browser `datetime-local`; serialized as `Y-m-d H:i:s` for API. */
  published_at: z.string().default(""),
  canonical_url: z
    .string()
    .default("")
    .refine((s) => {
      const t = s.trim();
      if (!t) return true;
      try {
        const u = new URL(t);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, { message: "validation.url_invalid" }),
  meta_title: localizedOptional,
  meta_description: localizedOptional,
});

export type BlogFormValues = z.infer<typeof blogSchema>;
