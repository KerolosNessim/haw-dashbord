import { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import * as z from "zod";

/** Normalize editor output (HTML string or `{ html }` object) for zod. */
export function richTextValueToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return editorOnChangeToHtml(value);
}

export function hasRichTextContent(value: unknown): boolean {
  return plainTextFromHtml(richTextValueToString(value)).length > 0;
}

const richTextRequiredField = z.preprocess(
  (value) => richTextValueToString(value),
  z.string().refine((html) => plainTextFromHtml(html).length > 0, {
    message: "validation.required",
  }),
);

const richTextOptionalField = z.preprocess(
  (value) => richTextValueToString(value),
  z.string().optional().default(""),
);

/** Required bilingual field backed by Lexical (validates visible text, not raw tags). */
export const localizedRichTextRequired = z.object({
  ar: richTextRequiredField,
  en: richTextOptionalField,
});
