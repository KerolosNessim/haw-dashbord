import { pickLocalizedImageUrls, resolveImagePreviewFromUnknown } from "@/lib/resolve-media-url";

export type BilingualSectionImage = {
  ar: File | string | null;
  en: File | string | null;
};

export function emptyBilingualSectionImage(): BilingualSectionImage {
  return { ar: null, en: null };
}

/** Maps GET `image` / `images` to dashboard form values. */
export function bilingualSectionImageFromApi(
  image: unknown,
  images?: unknown,
): BilingualSectionImage {
  const urls = pickLocalizedImageUrls(image, images);
  return { ar: urls.ar, en: urls.en };
}

export function hasBilingualSectionImage(image: BilingualSectionImage | null | undefined): boolean {
  if (!image) return false;
  if (image.ar instanceof File) return true;
  if (image.en instanceof File) return true;
  if (typeof image.ar === "string" && image.ar.trim()) return true;
  if (typeof image.en === "string" && image.en.trim()) return true;
  return false;
}

export function sectionImagePreview(
  image: BilingualSectionImage | null | undefined,
  locale: "ar" | "en",
): string | null {
  if (!image) return null;
  const value = image[locale];
  if (value instanceof File) return null;
  return resolveImagePreviewFromUnknown(value);
}
