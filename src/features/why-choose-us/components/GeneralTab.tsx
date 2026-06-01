import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Save, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import {
  bilingualSectionImageFromApi,
  emptyBilingualSectionImage,
  type BilingualSectionImage,
} from "@/lib/bilingual-section-image";
import {
  bilingualImageAltFromApi,
  emptyBilingualImageAlt,
  type BilingualImageAlt,
} from "@/lib/bilingual-image-alt";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { mediaAltFromApi } from "@/features/home-content/services/accreditation-form-data";
import { useWhyUs, type UpdateWhyUsContext } from "../hooks/useWhyUs";
import { buildGallerySnapshotFromForm, pickWhyUsGalleryFromApi } from "../lib/gallery-from-api";
import {
  buildWhyUsGeneralFormData,
  type BilingualAlt,
  type GalleryNewImage,
} from "../services/why-us-form-data";
import type { WhyUsData } from "../types";
import {
  SectionMediaGallery,
  type GalleryExistingImage,
} from "./section-media-gallery";

const generalSchema = z.object({
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().optional().default(""),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().optional().default(""),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export default function GeneralTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "why_choose_us.general",
  });
  const { getWhyUsQuery, updateWhyUs, isPending } = useWhyUs();
  const apiData = getWhyUsQuery?.data?.data as WhyUsData | undefined;

  const [coverImage, setCoverImage] = useState<BilingualSectionImage>(
    emptyBilingualSectionImage(),
  );
  const [coverImageAlt, setCoverImageAlt] = useState<BilingualImageAlt>(
    emptyBilingualImageAlt(),
  );
  const [existingGallery, setExistingGallery] = useState<GalleryExistingImage[]>([]);
  const [newGallery, setNewGallery] = useState<GalleryNewImage[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      title_ar: "",
      title_en: "",
      des_ar: "",
      des_en: "",
    },
  });

  useEffect(() => {
    if (!apiData) return;

    reset({
      title_ar: apiData?.content?.title?.ar ?? "",
      title_en: apiData?.content?.title?.en ?? "",
      des_ar: apiData?.content?.description?.ar ?? "",
      des_en: apiData?.content?.description?.en ?? "",
    });

    setCoverImage(
      bilingualSectionImageFromApi(apiData.media?.image, apiData.media?.images),
    );
    setCoverImageAlt(bilingualImageAltFromApi(apiData.media?.image_alt));

    setExistingGallery(
      pickWhyUsGalleryFromApi(apiData).map((img) => ({
        id: img.id,
        url: img.url,
        alt: mediaAltFromApi(img.image_alt),
      })),
    );
    setNewGallery([]);
    setDeletedGalleryIds([]);
  }, [apiData, reset]);

  const onSubmit = (data: GeneralFormValues) => {
    const existingGalleryAlt: Record<string, BilingualAlt> = {};
    existingGallery.forEach((img) => {
      existingGalleryAlt[String(img.id)] = {
        ar: img.alt.ar.trim(),
        en: img.alt.en.trim(),
      };
    });

    const formData = buildWhyUsGeneralFormData({
      title: { ar: data.title_ar, en: data.title_en },
      description: {
        ar: localizedHtmlForApi(data.des_ar) ?? data.des_ar,
        en: localizedHtmlForApi(data.des_en) ?? data.des_en,
      },
      coverImage,
      coverImageAlt,
      newGalleryImages: newGallery.map(({ file, alt }) => ({ file, alt })),
      existingGalleryAlt,
      deletedGalleryIds,
    });

    const gallerySnapshot = buildGallerySnapshotFromForm({
      existing: existingGallery,
      newImages: newGallery,
      deletedIds: deletedGalleryIds,
    });

    updateWhyUs(formData, {
      onMutate: () =>
        ({
          gallerySnapshot,
        }) satisfies UpdateWhyUsContext,
    });
  };

  const handleAddGalleryFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGallery((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
            alt: { ar: "", en: "" },
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingGallery = (id: number) => {
    setDeletedGalleryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setExistingGallery((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="border-b pb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Type className="w-6 h-6 text-primary" />
          {t("title", { defaultValue: "General Settings" })}
        </h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          {t("description", {
            defaultValue:
              "Manage the main title and description of the Why Choose Us section.",
          })}
        </p>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                  (AR) {t("sec_title", { defaultValue: "Section Title" })}
                  <Type className="w-4 h-4 text-primary" />
                </FieldLabel>
                <Input
                  {...field}
                  dir="rtl"
                  placeholder="..."
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                />
                <FieldError errors={[{ message: errors.title_ar?.message }]} />
              </Field>
            )}
          />
          <Controller
            name="title_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  {t("sec_title", { defaultValue: "Section Title" })} (EN)
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="..."
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                />
                <FieldError errors={[{ message: errors.title_en?.message }]} />
              </Field>
            )}
          />
        </div>

        <LocalizedDescriptionFields
          control={control}
          nameAr="des_ar"
          nameEn="des_en"
          labelAr={`(AR) ${t("sec_des", { defaultValue: "Section Description" })}`}
          labelEn={`${t("sec_des", { defaultValue: "Section Description" })} (EN)`}
        />

        <div className="border-t pt-10 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            {t("section_cover")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("section_cover_hint")}</p>
          <BilingualSectionImageUpload
            value={coverImage}
            onChange={setCoverImage}
            keyPrefix="why_choose_us.general"
            required={false}
            aspectClass="aspect-square max-w-md min-h-[240px]"
          />
          <BilingualImageAltFields
            value={coverImageAlt}
            onChange={setCoverImageAlt}
            keyPrefix="why_choose_us.general"
          />
        </div>

        <div className="border-t pt-10">
          <SectionMediaGallery
            existingImages={existingGallery}
            newImages={newGallery}
            onAddFiles={handleAddGalleryFiles}
            onRemoveExisting={removeExistingGallery}
            onRemoveNew={(index) =>
              setNewGallery((prev) => prev.filter((_, i) => i !== index))
            }
            onUpdateExistingAlt={(id, lang, value) =>
              setExistingGallery((prev) =>
                prev.map((img) =>
                  img.id === id ? { ...img, alt: { ...img.alt, [lang]: value } } : img,
                ),
              )
            }
            onUpdateNewAlt={(index, lang, value) =>
              setNewGallery((prev) =>
                prev.map((img, i) =>
                  i === index ? { ...img, alt: { ...img.alt, [lang]: value } } : img,
                ),
              )
            }
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending || getWhyUsQuery.isLoading}
        className="rounded-2xl h-14 px-12 font-black text-lg gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {t("save", { defaultValue: "Save Changes" })}
      </Button>
    </form>
  );
}
