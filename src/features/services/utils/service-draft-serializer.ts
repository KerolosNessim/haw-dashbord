import type { BasicInfoValues } from "../components/builder/basic-info-form";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function serializeValue(value: unknown): Promise<unknown> {
  if (value instanceof File) {
    return fileToDataUrl(value);
  }
  if (Array.isArray(value)) {
    return Promise.all(value.map(serializeValue));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = await serializeValue(entry);
    }
    return out;
  }
  return value;
}

export async function serializeBasicInfoForDraft(
  basic: BasicInfoValues,
  coverPreviewAr: string | null,
  coverPreviewEn: string | null,
): Promise<BasicInfoValues> {
  const image = basic.image ?? { ar: null, en: null };
  const serialized = (await serializeValue(basic)) as BasicInfoValues;

  return {
    ...serialized,
    image: {
      ar:
        image.ar instanceof File
          ? (coverPreviewAr ?? (await fileToDataUrl(image.ar)))
          : image.ar,
      en:
        image.en instanceof File
          ? (coverPreviewEn ?? (await fileToDataUrl(image.en)))
          : image.en,
    },
    og_image:
      basic.og_image instanceof File
        ? await fileToDataUrl(basic.og_image)
        : basic.og_image,
    twitter_image:
      basic.twitter_image instanceof File
        ? await fileToDataUrl(basic.twitter_image)
        : basic.twitter_image,
  };
}

export async function serializeSectionDataForDraft(
  data: Record<string, Record<string, unknown>>,
): Promise<Record<string, Record<string, unknown>>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [sectionId, sectionData] of Object.entries(data)) {
    out[sectionId] = (await serializeValue(sectionData)) as Record<string, unknown>;
  }
  return out;
}

export function deserializeBasicInfoFromDraft(basic: BasicInfoValues): BasicInfoValues {
  return basic;
}
