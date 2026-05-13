import * as z from "zod";

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedOptional = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

const slugLatinPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/**
 * Slug for the Arabic locale. The backend stores either Arabic letters or
 * Latin transliterations (e.g. id 14 returns `"ar": "vitae-dolor-cumque-v"`),
 * so this pattern accepts Arabic presentation forms + lowercase Latin + digits,
 * separated by single hyphens between segments.
 */
const slugArabicPattern =
  /^(?:[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:-[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)$/u;

const localizedBlogSlug = z.object({
  ar: z
    .string()
    .default("")
    .refine((s) => s === "" || slugArabicPattern.test(s), {
      message: "validation.slug_format",
    }),
  en: z
    .string()
    .default("")
    .refine((s) => s === "" || slugLatinPattern.test(s), {
      message: "validation.slug_format",
    }),
});

export const blogSchema = z.object({
  title: localizedRequired,
  /** Postman allows empty subtitle. */
  subtitle: localizedOptional,
  description: localizedRequired,
  content: localizedRequired,
  publisher_name: z.string().min(1, { message: "validation.required" }),
  tags: z.string().default(""),
  category_id: z.string().min(1, { message: "validation.required" }),
  image_alt: localizedOptional,
  is_active: z.boolean().default(true),
  /** When false, sends `is_searchable=0` in multipart. */
  is_searchable: z.boolean().default(true),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  slug: localizedBlogSlug,
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
