export type AccreditationNewImage = {
  file: File;
  alt: string;
};

export type AccreditationFormInput = {
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  sort_order?: number;
  is_active?: boolean;
  newImages: AccreditationNewImage[];
  /** media_id → alt text for images already on the server */
  existingImagesAlt: Record<string, string>;
  deletedImageIds: number[];
};

/** Builds multipart/form-data for POST /v1/admin/accreditations (Spatie Media Library). */
export function buildAccreditationFormData(input: AccreditationFormInput): FormData {
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

  input.newImages.forEach(({ file, alt }) => {
    fd.append("images[]", file);
    const trimmed = alt.trim();
    fd.append("new_images_alt[]", trimmed === "" ? "" : trimmed);
  });

  // Laravel expects an array in multipart, not a JSON string: existing_images_alt[mediaId]=alt
  Object.entries(input.existingImagesAlt).forEach(([mediaId, alt]) => {
    fd.append(`existing_images_alt[${mediaId}]`, alt.trim());
  });

  input.deletedImageIds.forEach((id) => {
    fd.append("deleted_images[]", String(id));
  });

  return fd;
}
