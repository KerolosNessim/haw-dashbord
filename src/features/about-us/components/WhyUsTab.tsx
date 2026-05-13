import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Gem,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";
import { useEffect } from "react";
import RichTextEditor from "@/features/shared/components/editor";

interface WhyUsFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  values_title_ar: string;
  values_title_en: string;
  values_description_ar: string;
  values_description_en: string;
  image: string | File | null;
}

/**
 * WhyUsTab Component for About Us
 */
export default function WhyUsTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about.why_us",
  });

  const { getAboutUsQuery, updateWhyUsSection, isUpdatingWhyUsSection } = useAboutUs();
  const { data: aboutUsData, isLoading } = getAboutUsQuery;

  const { control, handleSubmit, reset } = useForm<WhyUsFormValues>({
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      values_title_ar: "",
      values_title_en: "",
      values_description_ar: "",
      values_description_en: "",
      image: null,
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (aboutUsData?.data?.why_us_sections?.[0]) {
      const w = aboutUsData.data.why_us_sections[0];
      reset({
        title_ar: w.title?.ar || "",
        title_en: w.title?.en || "",
        description_ar: w.description?.ar || "",
        description_en: w.description?.en || "",
        values_title_ar: w.values_title?.ar || "",
        values_title_en: w.values_title?.en || "",
        values_description_ar: w.values_description?.ar || "",
        values_description_en: w.values_description?.en || "",
        image: w.image || null,
      });
    }
  }, [aboutUsData, reset]);

  const onSubmit = (values: WhyUsFormValues) => {
    const extractHtml = (val: unknown) =>
      typeof val === "object" && val !== null && "html" in val
        ? (val as { html: string }).html
        : (val as string);

    updateWhyUsSection({
      why_us_title: { ar: values.title_ar, en: values.title_en },
      why_us_description: { 
        ar: extractHtml(values.description_ar), 
        en: extractHtml(values.description_en) 
      },
      why_us_values_title: { ar: values.values_title_ar, en: values.values_title_en },
      why_us_values_description: { 
        ar: extractHtml(values.values_description_ar), 
        en: extractHtml(values.values_description_en) 
      },
      why_us_image: values.image instanceof File ? values.image : undefined,
    });
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
      className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gem className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-20">
        {/* Section: Main Why Us */}
        <div className=" items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <h3 className="text-xl font-bold">Main Content</h3>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("sec_des")}
                    </FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      dir="rtl"
                      placeholder={t("sec_des")}
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
                      {t("sec_des")} ({t("en")})
                    </FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      dir="ltr"
                      placeholder={t("sec_des")}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* Section: Values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t pt-16">
          <div className="lg:col-span-12 space-y-8">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <h3 className="text-xl font-bold">Our Values</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="values_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) Values Title
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
                name="values_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      Values Title ({t("en")})
                    </FieldLabel>
                    <Input
                      {...field}
                      className="h-12 rounded-xl bg-muted/5 border-border/60 focus:bg-white transition-all"
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="values_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) Values Description
                    </FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      dir="rtl"
                      placeholder={t("sec_des")}
                    />
                  </Field>
                )}
              />
              <Controller
                name="values_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      Values Description ({t("en")})
                    </FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      dir="ltr"
                      placeholder={t("sec_des")}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <Controller
            name="image"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="space-y-4">
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  {t("image")}
                </FieldLabel>

                <div
                  className={cn(
                    "relative  rounded-[40px] border-2 border-dashed transition-all overflow-hidden bg-muted/5 flex flex-col items-center justify-center cursor-pointer group",
                    value
                      ? "border-primary/20"
                      : "border-border hover:border-primary/40",
                  )}
                  onClick={() => {
                    const input = document.getElementById("why-us-image-input");
                    input?.click();
                  }}
                >
                  {value ? (
                    <>
                      <img
                        src={
                          typeof value === "string"
                            ? value
                            : URL.createObjectURL(value as Blob)
                        }
                        className="w-full h-full object-cover"
                        alt="Why Us"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="rounded-full w-12 h-12"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground tracking-widest">
                        {t("upload_image")}
                      </p>
                    </div>
                  )}
                  <input
                    id="why-us-image-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-10 border-t">
        <Button
          type="submit"
          size="lg"
          disabled={isUpdatingWhyUsSection}
          className="px-12 rounded-[20px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
        >
          {isUpdatingWhyUsSection ? (
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
