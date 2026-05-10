import {
  AlignLeft,
  Languages,
  Loader2,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useTestimonialsGeneral } from "../hooks/useTestimonialsGeneral";

interface GeneralFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
}

/**
 * GeneralTab Component
 *
 * Manages the main title and description for the testimonials section.
 */
export default function GeneralTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "testimonials.general",
  });

  const { getGeneralQuery, updateGeneral, isPending } =
    useTestimonialsGeneral();
  const apiData = getGeneralQuery.data?.data;

  const { control, handleSubmit } = useForm<GeneralFormValues>({
    values: {
      title_ar: apiData?.title?.ar ?? "",
      title_en: apiData?.title?.en ?? "",
      description_ar: apiData?.description?.ar ?? "",
      description_en: apiData?.description?.en ?? "",
    },
  });

  const onSubmit = (data: GeneralFormValues) => {
    const formData = new FormData();
    formData.append("title[ar]", data.title_ar);
    formData.append("title[en]", data.title_en);
    formData.append("description[ar]", data.description_ar);
    formData.append("description[en]", data.description_en);

    updateGeneral(formData);
  };

  if (getGeneralQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Title (AR & EN) */}
        <div className="space-y-8">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                  ({t("ar")}) {t("sec_title")}
                  <Languages className="w-4 h-4 text-primary" />
                </FieldLabel>
                <Textarea
                  {...field}
                  placeholder="أدخل العنوان هنا..."
                  className="min-h-[80px] rounded-[20px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none text-lg p-4"
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
                  <Languages className="w-4 h-4 text-primary" />
                  {t("sec_title")} ({t("en")})
                </FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Enter title here..."
                  className="min-h-[80px] rounded-[20px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none text-lg p-4"
                  dir="ltr"
                />
              </Field>
            )}
          />
        </div>

        {/* Description (AR & EN) */}
        <div className="space-y-8">
          <Controller
            name="description_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                  ({t("ar")}) {t("sec_des")}
                  <AlignLeft className="w-4 h-4 text-primary" />
                </FieldLabel>
                <Textarea
                  {...field}
                  placeholder="أدخل الوصف هنا..."
                  className="min-h-[120px] rounded-[20px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none text-lg p-4"
                  dir="rtl"
                />
              </Field>
            )}
          />
          <Controller
            name="description_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-primary" />
                  {t("sec_des")} ({t("en")})
                </FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Enter description here..."
                  className="min-h-[120px] rounded-[20px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none text-lg p-4"
                  dir="ltr"
                />
              </Field>
            )}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="px-10 rounded-2xl h-14 font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
