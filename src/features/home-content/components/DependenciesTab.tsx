import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Type,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import {
  buildMediaGalleryFormData,
  mediaAltFromApi,
  type BilingualAlt,
} from "../services/accreditation-form-data";
import { useAccreditations } from "../hooks/useAccreditations";

const dependenciesSchema = z.object({
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().optional().default(""),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().optional().default(""),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean(),
});

type DependenciesFormValues = z.infer<typeof dependenciesSchema>;

type ExistingImage = {
  id: number;
  url: string;
  alt: BilingualAlt;
};

type NewImage = {
  file: File;
  preview: string;
  alt: BilingualAlt;
};

export default function DependenciesTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "home_content.dependencies",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getAccreditationsQuery, updateAccred, isPending } = useAccreditations();
  const apiData = getAccreditationsQuery?.data?.data;

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DependenciesFormValues>({
    resolver: zodResolver(dependenciesSchema),
    defaultValues: {
      title_ar: "",
      title_en: "",
      des_ar: "",
      des_en: "",
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!apiData) return;

    reset({
      title_ar: apiData.title?.ar ?? "",
      title_en: apiData.title?.en ?? "",
      des_ar: apiData.description?.ar ?? "",
      des_en: apiData.description?.en ?? "",
      sort_order: apiData.sort_order ?? 0,
      is_active: apiData.is_active ?? true,
    });

    setExistingImages(
      (apiData.images ?? []).map((img) => ({
        id: img.id,
        url: img.url,
        alt: mediaAltFromApi(img.image_alt),
      })),
    );
    setNewImages([]);
    setDeletedImageIds([]);
  }, [apiData, reset]);

  const onSubmit = (data: DependenciesFormValues) => {
    const existingImagesAlt: Record<string, BilingualAlt> = {};
    existingImages.forEach((img) => {
      existingImagesAlt[String(img.id)] = {
        ar: img.alt.ar.trim(),
        en: img.alt.en.trim(),
      };
    });

    const formData = buildMediaGalleryFormData({
      title: { ar: data.title_ar, en: data.title_en },
      description: { ar: data.des_ar, en: data.des_en },
      sort_order: data.sort_order,
      is_active: data.is_active,
      newImages: newImages.map(({ file, alt }) => ({ file, alt })),
      existingImagesAlt,
      deletedImageIds,
    });

    updateAccred({ data: formData });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImages((prev) => [
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (id: number) => {
    setDeletedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExistingAlt = (id: number, lang: keyof BilingualAlt, value: string) => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, alt: { ...img.alt, [lang]: value } } : img,
      ),
    );
  };

  const updateNewAlt = (index: number, lang: keyof BilingualAlt, value: string) => {
    setNewImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, alt: { ...img.alt, [lang]: value } } : img,
      ),
    );
  };

  const previewAlt = (alt: BilingualAlt) => alt.ar.trim() || alt.en.trim() || "";

  const galleryCount = existingImages.length + newImages.length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                    ({t("ar", { defaultValue: "AR" })}) {t("sec_title")}
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
                    {t("sec_title")} (EN)
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
        </div>

        <LocalizedDescriptionFields
          control={control}
          nameAr="des_ar"
          nameEn="des_en"
          labelAr={`(${t("ar", { defaultValue: "AR" })}) ${t("sec_des")}`}
          labelEn={`${t("sec_des")} (EN)`}
          placeholder="..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="sort_order"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold">{t("sort_order")}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                />
              </Field>
            )}
          />
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold">{t("is_active")}</FieldLabel>
                <div className="flex h-14 items-center rounded-2xl border border-border/60 bg-muted/5 px-5">
                  <Switch
                    dir="ltr"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </Field>
            )}
          />
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="sticky top-6">
          <FieldLabel className="text-base font-bold mb-4 flex items-center justify-between">
            <span>{t("images")}</span>
            <span className="text-xs font-medium text-muted-foreground bg-muted/10 px-2 py-1 rounded-full border">
              {galleryCount} {t("images")}
            </span>
          </FieldLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {existingImages.map((img) => (
              <div
                key={`existing-${img.id}`}
                className="group relative rounded-2xl border border-border/60 overflow-hidden bg-white shadow-sm"
              >
                <div className="aspect-square relative bg-muted/5">
                  <img
                    src={img.url}
                    className="w-full h-full object-contain p-2"
                    alt={previewAlt(img.alt) || t("image_alt_placeholder")}
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 space-y-2 border-t border-border/40">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {t("image_alt")}
                  </label>
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {t("image_alt_ar")}
                    </span>
                    <Input
                      value={img.alt.ar}
                      onChange={(e) => updateExistingAlt(img.id, "ar", e.target.value)}
                      dir="rtl"
                      placeholder={t("image_alt_placeholder")}
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {t("image_alt_en")}
                    </span>
                    <Input
                      value={img.alt.en}
                      onChange={(e) => updateExistingAlt(img.id, "en", e.target.value)}
                      placeholder={t("image_alt_placeholder")}
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {newImages.map((img, idx) => (
              <div
                key={`new-${idx}-${img.preview.slice(0, 24)}`}
                className="group relative rounded-2xl border border-primary/30 overflow-hidden bg-white shadow-sm"
              >
                <div className="aspect-square relative bg-muted/5">
                  <img
                    src={img.preview}
                    className="w-full h-full object-contain p-2"
                    alt={previewAlt(img.alt) || t("image_alt_placeholder")}
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-primary/90 text-white px-1.5 py-0.5 rounded">
                    {t("new_image_badge")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 space-y-2 border-t border-border/40">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {t("image_alt")}
                  </label>
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {t("image_alt_ar")}
                    </span>
                    <Input
                      value={img.alt.ar}
                      onChange={(e) => updateNewAlt(idx, "ar", e.target.value)}
                      dir="rtl"
                      placeholder={t("image_alt_placeholder")}
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {t("image_alt_en")}
                    </span>
                    <Input
                      value={img.alt.en}
                      onChange={(e) => updateNewAlt(idx, "en", e.target.value)}
                      placeholder={t("image_alt_placeholder")}
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square min-h-[200px] rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {t("add_images")}
              </span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending || getAccreditationsQuery.isLoading}
        className="rounded-2xl h-14 px-12 font-black text-lg gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {t("save")}
      </Button>
    </form>
  );
}
