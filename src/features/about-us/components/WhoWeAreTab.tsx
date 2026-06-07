import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { Languages, Loader2, Save, Trash2, Users } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";

interface WhoWeAreFormValues {
  section_id: number | null;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  is_active: boolean;
}

export default function WhoWeAreTab() {
  const { t } = useTranslation("translation", { keyPrefix: "about.who_we_are" });

  const {
    getAboutUsQuery,
    upsertWhoWeAreSection,
    isUpsertingWhoWeAreSection,
    deleteWhoWeAreSection,
    isDeletingWhoWeAreSection,
  } = useAboutUs();

  const { data: aboutUsData, isLoading } = getAboutUsQuery;

  const { control, handleSubmit, reset } = useForm<WhoWeAreFormValues>({
    defaultValues: {
      section_id: null,
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      is_active: true,
    },
  });

  useEffect(() => {
    const section = aboutUsData?.data?.who_we_are_sections?.[0];
    if (!section) {
      reset({
        section_id: null,
        title_ar: "",
        title_en: "",
        description_ar: "",
        description_en: "",
        is_active: true,
      });
      return;
    }

    reset({
      section_id: section.id,
      title_ar: section.title?.ar || "",
      title_en: section.title?.en || "",
      description_ar: section.description?.ar || "",
      description_en: section.description?.en || "",
      is_active: section.is_active ?? true,
    });
  }, [aboutUsData, reset]);

  const onSubmit = (values: WhoWeAreFormValues) => {
    upsertWhoWeAreSection({
      title: {
        ar: localizedHtmlForApi(values.title_ar),
        en: localizedHtmlForApi(values.title_en),
      },
      description: {
        ar: localizedHtmlForApi(values.description_ar),
        en: localizedHtmlForApi(values.description_en),
      },
      is_active: values.is_active,
    });
  };

  const handleDelete = () => {
    const sectionId = aboutUsData?.data?.who_we_are_sections?.[0]?.id;
    if (!sectionId) return;
    if (!window.confirm(t("delete_confirm"))) return;
    deleteWhoWeAreSection(sectionId);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const hasSection = Boolean(aboutUsData?.data?.who_we_are_sections?.[0]?.id);
  const isBusy = isUpsertingWhoWeAreSection || isDeletingWhoWeAreSection;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-4 space-y-12 duration-500"
    >
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="h-6 w-6 text-primary" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{t("description")}</p>
        </div>

        {hasSection ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={handleDelete}
            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            {isDeletingWhoWeAreSection ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("delete")}
          </Button>
        ) : null}
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="flex items-center justify-start gap-2 text-base font-bold">
                  ({t("ar")}) {t("sec_title")}
                  <Languages className="h-4 w-4 text-primary" />
                </FieldLabel>
                <RichTextEditor
                  key={aboutUsData ? "who-we-are-title-ar-ready" : "who-we-are-title-ar-loading"}
                  value={field.value}
                  onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                  placeholder="..."
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
                  {t("sec_title")} ({t("en")})
                </FieldLabel>
                <RichTextEditor
                  key={aboutUsData ? "who-we-are-title-en-ready" : "who-we-are-title-en-loading"}
                  value={field.value}
                  onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                  placeholder="..."
                  dir="ltr"
                />
              </Field>
            )}
          />
        </div>

        <LocalizedDescriptionFields
          control={control}
          nameAr="description_ar"
          nameEn="description_en"
          labelAr={`(${t("ar")}) ${t("sec_des")}`}
          labelEn={`${t("sec_des")} (${t("en")})`}
          placeholder="..."
          minHeightClass="min-h-[200px]"
        />

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Field className="flex flex-row items-center justify-between rounded-2xl border border-border/60 bg-muted/5 px-6 py-4">
              <div className="space-y-1">
                <FieldLabel className="text-base font-bold">{t("is_active")}</FieldLabel>
                <p className="text-xs text-muted-foreground">{t("is_active_hint")}</p>
              </div>
              <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
      </div>

      <div className="flex justify-end border-t pt-10">
        <Button
          type="submit"
          size="lg"
          disabled={isBusy}
          className="h-16 gap-3 rounded-[20px] bg-primary px-12 text-xl font-black text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isUpsertingWhoWeAreSection ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Save className="h-6 w-6" />
          )}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
