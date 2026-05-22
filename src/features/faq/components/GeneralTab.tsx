import { useEffect } from "react";
import { Save, Search, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { useFaqGeneral } from "../hooks/useFaqGeneral";
import { slugify, slugifyAr } from "@/lib/slugify";

interface GeneralFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  meta_title_ar: string;
  meta_title_en: string;
  meta_description_ar: string;
  meta_description_en: string;
}

/**
 * GeneralTab Component for FAQ
 */
export default function GeneralTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "faq.general",
  });

  const { getGeneralQuery, updateGeneral, isUpdating } = useFaqGeneral();
  const { data: faqData, isLoading } = getGeneralQuery;

  const { control, handleSubmit, reset } = useForm<GeneralFormValues>({
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      meta_title_ar: "",
      meta_title_en: "",
      meta_description_ar: "",
      meta_description_en: "",
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (faqData?.data) {
      const d = faqData.data;
      reset({
        title_ar: d.title?.ar || "",
        title_en: d.title?.en || "",
        description_ar: d.description?.ar || "",
        description_en: d.description?.en || "",
        meta_title_ar: d.meta_title?.ar || "",
        meta_title_en: d.meta_title?.en || "",
        meta_description_ar: d.meta_description?.ar || "",
        meta_description_en: d.meta_description?.en || "",
      });
    }
  }, [faqData, reset]);

  const onSubmit = (values: GeneralFormValues) => {
    const payload = {
      title: { ar: values.title_ar, en: values.title_en },
      description: {
        ar: localizedHtmlForApi(values.description_ar),
        en: localizedHtmlForApi(values.description_en),
      },
      meta_title: { ar: values.meta_title_ar, en: values.meta_title_en },
      meta_description: {
        ar: values.meta_description_ar,
        en: values.meta_description_en,
      },
      slug: { ar: slugifyAr(values.title_ar), en: slugify(values.title_en) },
    };
    updateGeneral(payload);
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }



  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Main Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                  ({t("ar")}) {t("sec_title")}
                </FieldLabel>
                <Input
                  {...field}
                  className="h-12 rounded-xl bg-muted/5 border-border/60 focus:bg-white transition-all"
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
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  {t("sec_title")} ({t("en")})
                </FieldLabel>
                <Input
                  {...field}
                  className="h-12 rounded-xl bg-muted/5 border-border/60 focus:bg-white transition-all"
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
        />

        {/* SEO Section */}
        <div className="pt-10 border-t space-y-8">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">{t("seo_settings")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Controller
                name="meta_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold justify-start">
                      Meta Title (AR)
                    </FieldLabel>
                    <Input
                      {...field}
                      className="h-11 rounded-xl bg-muted/5"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
              <Controller
                name="meta_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold justify-start">
                      Meta Description (AR)
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[100px] rounded-xl bg-muted/5 resize-none"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
            </div>
            <div className="space-y-6">
              <Controller
                name="meta_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold">
                      Meta Title (EN)
                    </FieldLabel>
                    <Input {...field} className="h-11 rounded-xl bg-muted/5" />
                  </Field>
                )}
              />
              <Controller
                name="meta_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold">
                      Meta Description (EN)
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[100px] rounded-xl bg-muted/5 resize-none"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-10 border-t">
        <Button
          type="submit"
          size="lg"
          disabled={isUpdating}
          className="px-12 rounded-[20px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
        >
          {isUpdating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
