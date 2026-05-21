import type { AccreditationImageAlt, LocaleString } from "../types";

export type BilingualAlt = LocaleString;

export type AccreditationNewImage = {
  file: File;
  alt: BilingualAlt;
};

export type AccreditationFormInput = {
  title: BilingualAlt;
  description: BilingualAlt;
  sort_order?: number;
  is_active?: boolean;
  newImages: AccreditationNewImage[];
  /** media_id → bilingual alt for images already on the server */
  existingImagesAlt: Record<string, BilingualAlt>;
  deletedImageIds: number[];
};

/** Builds multipart/form-data for Spatie media gallery (accreditations, partners, …). */
export function buildMediaGalleryFormData(input: AccreditationFormInput): FormData {
  const fd = new FormData();

  fd.append("title[ar]", input.title.ar);
  fd.append("title[en]", input.title.en);
  fd.append("description[ar]", input.description.ar);
  fd.append("description[en]", input.description.en);

  if (input.sort_order != null && !Number.isNaN(input.sort_order)) {
    fd.append("sort_order", String(input.sort_order));
  }

  if (typeof input.is_active === "boolean") {
    fd.append("is_active", input.is_active ? "1" : "0");
  }

  input.newImages.forEach(({ file, alt }, index) => {
    fd.append("images[]", file);
    fd.append(`new_images_alt[${index}][ar]`, alt.ar.trim());
    fd.append(`new_images_alt[${index}][en]`, alt.en.trim());
  });

  Object.entries(input.existingImagesAlt).forEach(([mediaId, alt]) => {
    fd.append(`existing_images_alt[${mediaId}][ar]`, alt.ar.trim());
    fd.append(`existing_images_alt[${mediaId}][en]`, alt.en.trim());
  });

  input.deletedImageIds.forEach((id) => {
    fd.append("deleted_images[]", String(id));
  });

  return fd;
}

/** @deprecated Use buildMediaGalleryFormData */
export const buildAccreditationFormData = buildMediaGalleryFormData;

/** Maps GET `image_alt` (nullable ar/en) to form values. */
export function mediaAltFromApi(imageAlt: AccreditationImageAlt | null | undefined): BilingualAlt {
  if (imageAlt == null) return { ar: "", en: "" };
  return {
    ar: imageAlt.ar ?? "",
    en: imageAlt.en ?? "",
  };
}
