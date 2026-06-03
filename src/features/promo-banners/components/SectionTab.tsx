import { AlignLeft, Languages, Loader2, Save, Settings } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Can } from "@/features/permissions/components/PermissionGate";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { usePromoBannerSection } from "../hooks/usePromoBannerSection";
import type { PromoSectionFormValues } from "../types";

export default function SectionTab() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners.section" });
  const { sectionQuery, updateSection, isSaving } = usePromoBannerSection();
  const apiData = sectionQuery.data;

  const { control, handleSubmit } = useForm<PromoSectionFormValues>({
    values: {
      eyebrow_ar: apiData?.eyebrow.ar ?? "",
      eyebrow_en: apiData?.eyebrow.en ?? "",
      title_ar: apiData?.title.ar ?? "",
      title_en: apiData?.title.en ?? "",
      subtitle_ar: apiData?.subtitle.ar ?? "",
      subtitle_en: apiData?.subtitle.en ?? "",
      is_active: apiData?.is_active ?? true,
    },
  });

  if (sectionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => updateSection(values))}
      className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-500"
    >
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Settings className="h-6 w-6 text-primary" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Controller
          name="eyebrow_ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold justify-start">
                ({t("ar")}) {t("fields.eyebrow")}
                <Languages className="h-4 w-4 text-primary" />
              </FieldLabel>
              <RichTextEditor
                key="promo-section-eyebrow-ar"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="rtl"
              />
            </Field>
          )}
        />
        <Controller
          name="eyebrow_en"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold">
                <Languages className="h-4 w-4 text-primary" />
                {t("fields.eyebrow")} ({t("en")})
              </FieldLabel>
              <RichTextEditor
                key="promo-section-eyebrow-en"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="ltr"
              />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Controller
          name="title_ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold justify-start">
                ({t("ar")}) {t("fields.title")}
                <Languages className="h-4 w-4 text-primary" />
              </FieldLabel>
              <RichTextEditor
                key="promo-section-title-ar"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="rtl"
              />
            </Field>
          )}
        />
        <Controller
          name="title_en"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold">
                <Languages className="h-4 w-4 text-primary" />
                {t("fields.title")} ({t("en")})
              </FieldLabel>
              <RichTextEditor
                key="promo-section-title-en"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="ltr"
              />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Controller
          name="subtitle_ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold justify-start">
                ({t("ar")}) {t("fields.subtitle")}
                <AlignLeft className="h-4 w-4 text-primary" />
              </FieldLabel>
              <RichTextEditor
                key="promo-section-subtitle-ar"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="rtl"
              />
            </Field>
          )}
        />
        <Controller
          name="subtitle_en"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="flex items-center gap-2 text-base font-bold">
                <AlignLeft className="h-4 w-4 text-primary" />
                {t("fields.subtitle")} ({t("en")})
              </FieldLabel>
              <RichTextEditor
                key="promo-section-subtitle-en"
                value={field.value}
                onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                dir="ltr"
              />
            </Field>
          )}
        />
      </div>

      <Controller
        name="is_active"
        control={control}
        render={({ field }) => (
          <Field className="flex max-w-md items-center justify-between rounded-xl border p-4">
            <FieldLabel>{t("fields.is_active")}</FieldLabel>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />

      <div className="flex justify-end pt-6">
        <Can permission="home-content.update">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="h-14 gap-2 rounded-2xl px-10 text-lg font-bold shadow-lg shadow-primary/20"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("save")}
          </Button>
        </Can>
      </div>
    </form>
  );
}
