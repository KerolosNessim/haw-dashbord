import { useState } from "react";
import { Loader2, Save, Settings } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { extractLaravelFieldErrors } from "../utils/form-errors";
import { validateSectionLinks } from "../utils/validation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Can } from "@/features/permissions/components/PermissionGate";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { sectionToFormValues } from "../services/client-portfolio-api";
import { useClientPortfolioSection } from "../hooks/useClientPortfolioSection";
import type { PortfolioSectionFormValues } from "../types";

function BilingualInputs({
  control,
  nameAr,
  nameEn,
  label,
  t,
}: {
  control: ReturnType<typeof useForm<PortfolioSectionFormValues>>["control"];
  nameAr: keyof PortfolioSectionFormValues;
  nameEn: keyof PortfolioSectionFormValues;
  label: string;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Controller
        name={nameAr}
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              ({t("ar")}) {label}
            </FieldLabel>
            <Input {...field} dir="rtl" value={String(field.value ?? "")} className="h-11 rounded-xl" />
          </Field>
        )}
      />
      <Controller
        name={nameEn}
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              {label} ({t("en")})
            </FieldLabel>
            <Input {...field} value={String(field.value ?? "")} className="h-11 rounded-xl" />
          </Field>
        )}
      />
    </div>
  );
}

export default function SectionTab() {
  const { t } = useTranslation("translation", { keyPrefix: "client_portfolio.section" });
  const { sectionQuery, updateSection, isSaving, saveError } = useClientPortfolioSection();
  const apiData = sectionQuery.data;
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});

  const { control, handleSubmit, setError } = useForm<PortfolioSectionFormValues>({
    values: apiData ? sectionToFormValues(apiData) : undefined,
    defaultValues: {
      title_ar: "",
      title_en: "",
      subtitle_ar: "",
      subtitle_en: "",
      view_all_link_ar: "",
      view_all_link_en: "",
      view_all_button_text_ar: "",
      view_all_button_text_en: "",
      view_all_card_title_ar: "",
      view_all_card_title_en: "",
      view_all_card_description_ar: "",
      view_all_card_description_en: "",
      view_all_card_button_text_ar: "",
      view_all_card_button_text_en: "",
      read_case_study_button_text_ar: "",
      read_case_study_button_text_en: "",
      is_active: true,
    },
  });

  if (sectionQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit = (values: PortfolioSectionFormValues) => {
    const nextLinkErrors = validateSectionLinks(values);
    const mapped: Record<string, string> = {};
    if (nextLinkErrors.view_all_link_ar) {
      mapped.view_all_link_ar = t("validation.link");
      setError("view_all_link_ar", { message: mapped.view_all_link_ar });
    }
    if (nextLinkErrors.view_all_link_en) {
      mapped.view_all_link_en = t("validation.link");
      setError("view_all_link_en", { message: mapped.view_all_link_en });
    }
    setLinkErrors(mapped);
    if (Object.keys(mapped).length) return;
    updateSection(values);
  };

  const serverErrors = saveError ? extractLaravelFieldErrors(saveError) : {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="border-b pb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="h-6 w-6 text-primary" />
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("groups.main")}
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>({t("ar")}) {t("fields.title")}</FieldLabel>
                <RichTextEditor
                  value={field.value}
                  onChange={(v) => field.onChange(editorOnChangeToHtml(v))}
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
                <FieldLabel>{t("fields.title")} ({t("en")})</FieldLabel>
                <RichTextEditor
                  value={field.value}
                  onChange={(v) => field.onChange(editorOnChangeToHtml(v))}
                  dir="ltr"
                />
              </Field>
            )}
          />
        </div>
        <LocalizedDescriptionFields
          control={control}
          nameAr="subtitle_ar"
          nameEn="subtitle_en"
          labelAr={`(${t("ar")}) ${t("fields.subtitle")}`}
          labelEn={`${t("fields.subtitle")} (${t("en")})`}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("groups.view_all")}
        </h3>
        <div className="space-y-1">
          <BilingualInputs control={control} nameAr="view_all_link_ar" nameEn="view_all_link_en" label={t("fields.view_all_link")} t={t} />
          {linkErrors.view_all_link_ar || serverErrors.view_all_link_ar ? (
            <p className="text-sm text-destructive">
              ({t("ar")}) {linkErrors.view_all_link_ar || serverErrors.view_all_link_ar}
            </p>
          ) : null}
          {linkErrors.view_all_link_en || serverErrors.view_all_link_en ? (
            <p className="text-sm text-destructive">
              ({t("en")}) {linkErrors.view_all_link_en || serverErrors.view_all_link_en}
            </p>
          ) : null}
        </div>
        <BilingualInputs control={control} nameAr="view_all_button_text_ar" nameEn="view_all_button_text_en" label={t("fields.view_all_button_text")} t={t} />
        <BilingualInputs control={control} nameAr="view_all_card_title_ar" nameEn="view_all_card_title_en" label={t("fields.view_all_card_title")} t={t} />
        <LocalizedDescriptionFields
          control={control}
          nameAr="view_all_card_description_ar"
          nameEn="view_all_card_description_en"
          labelAr={`(${t("ar")}) ${t("fields.view_all_card_description")}`}
          labelEn={`${t("fields.view_all_card_description")} (${t("en")})`}
        />
        <BilingualInputs control={control} nameAr="view_all_card_button_text_ar" nameEn="view_all_card_button_text_en" label={t("fields.view_all_card_button_text")} t={t} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("groups.cards")}
        </h3>
        <BilingualInputs control={control} nameAr="read_case_study_button_text_ar" nameEn="read_case_study_button_text_en" label={t("fields.read_case_study_button_text")} t={t} />
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

      <div className="flex justify-end">
        <Can permission="home-content.update">
          <Button type="submit" size="lg" disabled={isSaving} className="gap-2 rounded-2xl px-10">
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("save")}
          </Button>
        </Can>
      </div>
    </form>
  );
}
