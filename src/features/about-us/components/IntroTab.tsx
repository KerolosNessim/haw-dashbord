import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  Image as ImageIcon,
  Languages,
  Layout,
  Loader2,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";

interface IntroFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image: string | File | null;
}

/**
 * IntroTab Component for About Us
 */
export default function IntroTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about.intro",
  });
  const { getAboutUsQuery,updateIntroSection,isUpdatingIntroSection } = useAboutUs();
  const { data: aboutUsData, isLoading } = getAboutUsQuery;
  const { control, handleSubmit ,reset} = useForm<IntroFormValues>({
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      image: null,
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (aboutUsData?.data) {
      const d = aboutUsData.data;
      reset({
        title_ar: d?.sections?.[0]?.title.ar || "",
        title_en: d?.sections?.[0]?.title.en || "",
        description_ar: d?.sections?.[0]?.description.ar || "",
        description_en: d?.sections?.[0]?.description.en || "",
        image: d?.sections?.[0]?.image || null,
      });
    }
  }, [aboutUsData, reset]);
  const onSubmit = (values: IntroFormValues) => {
    updateIntroSection({
      title: { ar: values.title_ar, en: values.title_en },
      description: { 
        ar: localizedHtmlForApi(values.description_ar), 
        en: localizedHtmlForApi(values.description_en) 
      },
      image: values?.image instanceof File ? values?.image : undefined,
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
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className=" space-y-10">
        {/* Left Column: Text Content */}
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                    ({t("ar")}) {t("sec_title")}
                    <Languages className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="..."
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
                    <Languages className="w-4 h-4 text-primary" />
                    {t("sec_title")} ({t("en")})
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="..."
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
                    <AlignLeft className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <RichTextEditor
                    key={aboutUsData ? "ar-ready" : "ar-loading"}
                    value={field.value}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      field.onChange(html);
                    }}
                    placeholder="..."
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
                  <RichTextEditor
                    key={aboutUsData ? "en-ready" : "en-loading"}
                    value={field.value}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      field.onChange(html);
                    }}
                    placeholder="..."
                    dir="ltr"
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="lg:col-span-4 space-y-6">
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
                    const input = document.getElementById("intro-image-input");
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
                        alt="Intro Section"
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
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        {t("upload_image")}
                      </p>
                    </div>
                  )}
                  <input
                    id="intro-image-input"
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
          disabled={isUpdatingIntroSection}
          className="px-12 rounded-[20px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
        >
          {isUpdatingIntroSection ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
