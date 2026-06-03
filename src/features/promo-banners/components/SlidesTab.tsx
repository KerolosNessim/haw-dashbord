import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Image as ImageIcon,
  Languages,
  Link2,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Can } from "@/features/permissions/components/PermissionGate";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { hasRichTextContent } from "@/lib/zod-rich-text";
import { emptySlideFormItem, slideToFormItem } from "../services/promo-banners-api";
import { extractLaravelFieldErrors } from "../utils/form-errors";
import { usePromoBannerSlides } from "../hooks/usePromoBannerSlides";
import type { PromoSlideFormItem, PromoSlidesFormValues } from "../types";

function isValidButtonLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type SlideFieldErrors = {
  title_ar?: string;
  title_en?: string;
  button_link_ar?: string;
  button_link_en?: string;
  server?: string;
};

export default function SlidesTab() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners.slides" });
  const { slidesQuery, bulkSync, isSaving, saveError } = usePromoBannerSlides();
  const apiSlides = slidesQuery.data ?? [];
  const serverFieldErrors = useMemo(
    () => (saveError ? extractLaravelFieldErrors(saveError) : {}),
    [saveError],
  );

  const { control, handleSubmit, clearErrors } = useForm<PromoSlidesFormValues>({
    values: {
      items:
        apiSlides.length > 0
          ? apiSlides.map(slideToFormItem)
          : [emptySlideFormItem()],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const [clientErrors, setClientErrors] = useState<Record<number, SlideFieldErrors>>({});

  useEffect(() => {
    if (!Object.keys(serverFieldErrors).length) return;
    const next: Record<number, SlideFieldErrors> = {};
    for (const [key, message] of Object.entries(serverFieldErrors)) {
      const match = key.match(/^slides\.(\d+)\.(.+)$/);
      if (!match) continue;
      const index = Number(match[1]);
      const field = match[2].replace(/\./g, "_");
      next[index] = { ...next[index], [field]: message };
    }
    setClientErrors((prev) => ({ ...prev, ...next }));
  }, [serverFieldErrors]);

  const validate = (items: PromoSlideFormItem[]): boolean => {
    const next: Record<number, SlideFieldErrors> = {};
    items.forEach((item, index) => {
      const row: SlideFieldErrors = {};
      if (!hasRichTextContent(item.title_ar)) row.title_ar = t("validation.title_ar");
      if (!hasRichTextContent(item.title_en)) row.title_en = t("validation.title_en");
      if (!isValidButtonLink(item.button_link_ar)) row.button_link_ar = t("validation.button_link");
      if (!isValidButtonLink(item.button_link_en)) row.button_link_en = t("validation.button_link");
      if (Object.keys(row).length) next[index] = row;
    });
    setClientErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (data: PromoSlidesFormValues) => {
    clearErrors();
    if (!validate(data.items)) return;
    bulkSync(data);
  };

  if (slidesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-500"
    >
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ImageIcon className="h-6 w-6 text-primary" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{t("description")}</p>
        </div>

        <Button
          type="button"
          onClick={() => append(emptySlideFormItem())}
          className="h-12 gap-2 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="h-5 w-5" />
          {t("add_slide")}
        </Button>
      </div>

      <div className="space-y-12">
        {fields.map((field, index) => {
          const rowErrors = clientErrors[index];
          return (
            <div
              key={field.id}
              className="group relative rounded-[40px] border border-border/60 bg-muted/5 p-8 transition-all hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 md:p-10"
            >
              <div className="absolute -top-4 end-4 z-10 flex gap-2 opacity-0 transition-all group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  {t("move_up")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  {t("move_down")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                  onClick={() => remove(index)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-bold text-muted-foreground">
                  {t("slide_label", { index: index + 1 })}
                </p>
                <Controller
                  name={`items.${index}.is_active`}
                  control={control}
                  render={({ field: activeField }) => (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t("fields.is_active")}</span>
                      <Switch checked={activeField.value} onCheckedChange={activeField.onChange} />
                    </div>
                  )}
                />
              </div>

              <div className="mb-8">
                <Controller
                  name={`items.${index}.image`}
                  control={control}
                  render={({ field: imageField }) => (
                    <BilingualSectionImageUpload
                      value={imageField.value}
                      onChange={imageField.onChange}
                      keyPrefix="promo_banners"
                      required={false}
                      aspectClass="aspect-[21/9] min-h-[180px]"
                    />
                  )}
                />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {(
                  [
                    ["badge_ar", "badge_en", "fields.badge"],
                    ["button_text_ar", "button_text_en", "fields.button_text"],
                  ] as const
                ).map(([nameAr, nameEn, labelKey]) => (
                  <div key={labelKey} className="contents">
                    <Controller
                      name={`items.${index}.${nameAr}`}
                      control={control}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel className="flex items-center gap-2 text-sm font-bold justify-start">
                            ({t("ar")}) {t(labelKey)}
                            <Languages className="h-4 w-4 text-primary/60" />
                          </FieldLabel>
                          <Input {...f} dir="rtl" className="h-12 rounded-xl bg-white" />
                        </Field>
                      )}
                    />
                    <Controller
                      name={`items.${index}.${nameEn}`}
                      control={control}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel className="flex items-center gap-2 text-sm font-bold">
                            <Languages className="h-4 w-4 text-primary/60" />
                            {t(labelKey)} ({t("en")})
                          </FieldLabel>
                          <Input {...f} className="h-12 rounded-xl bg-white" />
                        </Field>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Controller
                  name={`items.${index}.title_ar`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="flex items-center gap-2 text-sm font-bold justify-start">
                        ({t("ar")}) {t("fields.title")}
                        <Languages className="h-4 w-4 text-primary/60" />
                      </FieldLabel>
                      <RichTextEditor
                        key={`slide-${index}-title-ar`}
                        value={field.value}
                        onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                        dir="rtl"
                      />
                      {rowErrors?.title_ar ? (
                        <p className="text-sm text-destructive">{rowErrors.title_ar}</p>
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  name={`items.${index}.title_en`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="flex items-center gap-2 text-sm font-bold">
                        <Languages className="h-4 w-4 text-primary/60" />
                        {t("fields.title")} ({t("en")})
                      </FieldLabel>
                      <RichTextEditor
                        key={`slide-${index}-title-en`}
                        value={field.value}
                        onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                        dir="ltr"
                      />
                      {rowErrors?.title_en ? (
                        <p className="text-sm text-destructive">{rowErrors.title_en}</p>
                      ) : null}
                    </Field>
                  )}
                />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Controller
                  name={`items.${index}.subtitle_ar`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="flex items-center gap-2 text-sm font-bold justify-start">
                        ({t("ar")}) {t("fields.subtitle")}
                        <AlignLeft className="h-4 w-4 text-primary/60" />
                      </FieldLabel>
                      <RichTextEditor
                        key={`slide-${index}-subtitle-ar`}
                        value={field.value}
                        onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                        dir="rtl"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`items.${index}.subtitle_en`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="flex items-center gap-2 text-sm font-bold">
                        <AlignLeft className="h-4 w-4 text-primary/60" />
                        {t("fields.subtitle")} ({t("en")})
                      </FieldLabel>
                      <RichTextEditor
                        key={`slide-${index}-subtitle-en`}
                        value={field.value}
                        onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                        dir="ltr"
                      />
                    </Field>
                  )}
                />
              </div>

              <LocalizedDescriptionFields
                control={control}
                nameAr={`items.${index}.description_ar`}
                nameEn={`items.${index}.description_en`}
                labelAr={`(${t("ar")}) ${t("fields.description")}`}
                labelEn={`${t("fields.description")} (${t("en")})`}
                placeholder="..."
                className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {(
                  [
                    ["button_link_ar", "button_link_en", "fields.button_link"],
                    ["image_alt_ar", "image_alt_en", "fields.image_alt"],
                  ] as const
                ).map(([nameAr, nameEn, labelKey]) => (
                  <div key={labelKey} className="contents">
                    <Controller
                      name={`items.${index}.${nameAr}`}
                      control={control}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel className="flex items-center gap-2 text-sm font-bold justify-start">
                            ({t("ar")}) {t(labelKey)}
                            {labelKey === "fields.button_link" ? (
                              <Link2 className="h-4 w-4 text-primary/60" />
                            ) : (
                              <AlignLeft className="h-4 w-4 text-primary/60" />
                            )}
                          </FieldLabel>
                          <Input {...f} dir="rtl" placeholder="/contact-us" className="h-12 rounded-xl bg-white" />
                          {labelKey === "fields.button_link" && rowErrors?.button_link_ar ? (
                            <p className="text-sm text-destructive">{rowErrors.button_link_ar}</p>
                          ) : null}
                          {labelKey === "fields.button_link" ? (
                            <p className="text-xs text-muted-foreground">{t("button_link_hint")}</p>
                          ) : null}
                        </Field>
                      )}
                    />
                    <Controller
                      name={`items.${index}.${nameEn}`}
                      control={control}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel className="flex items-center gap-2 text-sm font-bold">
                            {labelKey === "fields.button_link" ? (
                              <Link2 className="h-4 w-4 text-primary/60" />
                            ) : (
                              <AlignLeft className="h-4 w-4 text-primary/60" />
                            )}
                            {t(labelKey)} ({t("en")})
                          </FieldLabel>
                          <Input {...f} placeholder="/contact-us" className="h-12 rounded-xl bg-white" />
                          {labelKey === "fields.button_link" && rowErrors?.button_link_en ? (
                            <p className="text-sm text-destructive">{rowErrors.button_link_en}</p>
                          ) : null}
                        </Field>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t pt-10">
        <Can permission="home-content.update">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="h-16 gap-3 rounded-2xl px-16 text-xl font-black shadow-2xl shadow-primary/30"
          >
            {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
            {t("save_all")}
          </Button>
        </Can>
      </div>
    </form>
  );
}
