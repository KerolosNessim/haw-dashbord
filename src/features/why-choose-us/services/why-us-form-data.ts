import type { BilingualSectionImage } from "@/lib/bilingual-section-image";
import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { appendBilingualImageAlt } from "@/lib/bilingual-image-alt";
import { appendRootBilingualSectionImageFilesOnly } from "@/features/services/utils/append-bilingual-section-image";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";

export type BilingualAlt = { ar: string; en: string };

export type GalleryNewImage = {
  file: File;
  alt: BilingualAlt;
};

export type WhyUsGeneralFormInput = {
  title: BilingualAlt;
  description: BilingualAlt;
  coverImage?: BilingualSectionImage | null;
  coverImageAlt?: BilingualImageAlt;
  newGalleryImages: GalleryNewImage[];
  existingGalleryAlt: Record<string, BilingualAlt>;
  deletedGalleryIds: number[];
};

/** Multipart payload for POST /v1/admin/why-choose-us */
export function buildWhyUsGeneralFormData(input: WhyUsGeneralFormInput): FormData {
  const fd = new FormData();

  fd.append("title[ar]", input.title.ar);
  fd.append("title[en]", input.title.en);
  appendLocalizedDescriptionHtml(
    fd,
    "description",
    input.description.ar,
    input.description.en,
  );

  appendRootBilingualSectionImageFilesOnly(fd, "image", input.coverImage);
  appendBilingualImageAlt(fd, "image_alt", input.coverImageAlt);

  input.newGalleryImages.forEach(({ file, alt }, index) => {
    fd.append("images[]", file);
    fd.append(`new_images_alt[${index}][ar]`, alt.ar.trim());
    fd.append(`new_images_alt[${index}][en]`, alt.en.trim());
  });

  Object.entries(input.existingGalleryAlt).forEach(([mediaId, alt]) => {
    fd.append(`existing_images_alt[${mediaId}][ar]`, alt.ar.trim());
    fd.append(`existing_images_alt[${mediaId}][en]`, alt.en.trim());
  });

  input.deletedGalleryIds.forEach((id) => {
    fd.append("deleted_images[]", String(id));
  });

  return fd;
}
