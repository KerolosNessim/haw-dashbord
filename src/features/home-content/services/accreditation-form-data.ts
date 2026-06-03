import type {
  AccreditationImageAlt,
  AccreditationLinkedService,
  AccreditationMedia,
  LocaleString,
} from "../types";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Service } from "@/features/services/type";

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
  /** media_id → linked regular service ids (accreditations only) */
  existingImagesServices?: Record<string, number[]>;
  /** parallel to newImages — service ids per new file index */
  newImagesServices?: number[][];
  deletedImageIds: number[];
};

/** Builds multipart/form-data for Spatie media gallery (accreditations, partners, …). */
export function buildMediaGalleryFormData(input: AccreditationFormInput): FormData {
  const fd = new FormData();

  fd.append("title[ar]", input.title.ar);
  fd.append("title[en]", input.title.en);
  appendLocalizedDescriptionHtml(fd, "description", input.description.ar, input.description.en);

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
    const serviceIds = input.newImagesServices?.[index] ?? [];
    serviceIds.forEach((serviceId) => {
      fd.append(`new_images_services[${index}][]`, String(serviceId));
    });
  });

  Object.entries(input.existingImagesAlt).forEach(([mediaId, alt]) => {
    fd.append(`existing_images_alt[${mediaId}][ar]`, alt.ar.trim());
    fd.append(`existing_images_alt[${mediaId}][en]`, alt.en.trim());
  });

  if (input.existingImagesServices) {
    Object.entries(input.existingImagesServices).forEach(([mediaId, serviceIds]) => {
      serviceIds.forEach((serviceId) => {
        fd.append(`existing_images_services[${mediaId}][]`, String(serviceId));
      });
    });
  }

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

/** Plain-text service title for lists and chips (titles may be rich HTML). */
export function linkedServicePlainTitle(
  title: LocaleString | string,
  lang: "ar" | "en",
): string {
  if (typeof title === "string") return plainTextFromHtml(title);
  return (
    plainTextFromHtml(title[lang]) ||
    plainTextFromHtml(title.en) ||
    plainTextFromHtml(title.ar) ||
    ""
  );
}

export function resolveLinkedServiceLabels(
  serviceIds: number[],
  catalog: Service[],
  embedded: AccreditationLinkedService[] | undefined,
  lang: "ar" | "en",
): { id: number; label: string }[] {
  return serviceIds.map((id) => {
    const fromCatalog = catalog.find((s) => s.id === id);
    if (fromCatalog) {
      return { id, label: linkedServicePlainTitle(fromCatalog.title, lang) || `#${id}` };
    }
    const fromEmbedded = embedded?.find((s) => s.id === id);
    if (fromEmbedded) {
      return { id, label: linkedServicePlainTitle(fromEmbedded.title, lang) || `#${id}` };
    }
    return { id, label: `#${id}` };
  });
}

export function linkedServicesFromIds(
  serviceIds: number[],
  catalog: Service[],
  previous: AccreditationLinkedService[] = [],
): AccreditationLinkedService[] {
  return serviceIds.map((id) => {
    const fromCatalog = catalog.find((s) => s.id === id);
    if (fromCatalog) return { id, title: fromCatalog.title };
    const fromPrev = previous.find((s) => s.id === id);
    if (fromPrev) return fromPrev;
    return { id, title: { ar: "", en: "" } };
  });
}

/** Regular services linked to an accreditation image (not Service AI). */
export function serviceIdsFromAccreditationImage(
  image: Pick<AccreditationMedia, "service_ids" | "services">,
): number[] {
  if (Array.isArray(image.service_ids) && image.service_ids.length > 0) {
    return image.service_ids.map((id) => Number(id)).filter((id) => id > 0);
  }
  if (Array.isArray(image.services) && image.services.length > 0) {
    return image.services.map((s) => Number(s.id)).filter((id) => id > 0);
  }
  return [];
}
