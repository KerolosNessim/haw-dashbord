import * as z from "zod";

/** Bilingual slug/path — required, any characters (no URL format enforcement). */
export const localizedSlugRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

/** Bilingual slug/path — optional free text. */
export const localizedSlugOptional = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});
