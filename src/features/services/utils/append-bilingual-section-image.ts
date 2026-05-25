import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

/** Appends `benefits[0][image][ar]` / `[en]` (and legacy single `image` when only one locale). */
export function appendIndexedBilingualSectionImage(
  fd: FormData,
  prefix: string,
  index: number,
  image?: BilingualSectionImage | File | string | null,
) {
  if (!image) return;

  if (image instanceof File) {
    fd.append(`${prefix}[${index}][image]`, image);
    return;
  }

  if (typeof image === "string" && image.trim()) {
    fd.append(`${prefix}[${index}][image]`, image.trim());
    return;
  }

  if (typeof image !== "object") return;

  const { ar, en } = image;
  if (ar instanceof File) {
    fd.append(`${prefix}[${index}][image][ar]`, ar);
  } else if (typeof ar === "string" && ar.trim()) {
    fd.append(`${prefix}[${index}][image][ar]`, ar.trim());
  }

  if (en instanceof File) {
    fd.append(`${prefix}[${index}][image][en]`, en);
  } else if (typeof en === "string" && en.trim()) {
    fd.append(`${prefix}[${index}][image][en]`, en.trim());
  }

  if (!(ar instanceof File) && !(en instanceof File)) {
    const fallback = (typeof ar === "string" && ar.trim()) || (typeof en === "string" && en.trim());
    if (fallback && !fd.has(`${prefix}[${index}][image][ar]`) && !fd.has(`${prefix}[${index}][image][en]`)) {
      fd.append(`${prefix}[${index}][image]`, fallback);
    }
  }
}

export function appendItemBilingualSectionImage(
  fd: FormData,
  prefix: string,
  sectionIndex: number,
  itemIndex: number,
  image?: BilingualSectionImage | File | string | null,
) {
  const base = `${prefix}[${sectionIndex}][items][${itemIndex}]`;
  if (!image) return;

  if (image instanceof File) {
    fd.append(`${base}[image]`, image);
    return;
  }

  if (typeof image === "string" && image.trim()) {
    fd.append(`${base}[image]`, image.trim());
    return;
  }

  if (typeof image !== "object") return;

  const { ar, en } = image;
  if (ar instanceof File) fd.append(`${base}[image][ar]`, ar);
  else if (typeof ar === "string" && ar.trim()) fd.append(`${base}[image][ar]`, ar.trim());

  if (en instanceof File) fd.append(`${base}[image][en]`, en);
  else if (typeof en === "string" && en.trim()) fd.append(`${base}[image][en]`, en.trim());
}
