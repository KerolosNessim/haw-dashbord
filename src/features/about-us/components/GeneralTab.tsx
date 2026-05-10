import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  Image as ImageIcon,
  Languages,
  Layout,
  Plus,
  Save,
  Search,
  Settings as SettingsIcon,
  Trash2,
  Video,
  Loader2
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";
import { useEffect } from "react";

interface GeneralFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image: string | File | null;
  video_url: string;
  meta_title_ar: string;
  meta_title_en: string;
  meta_description_ar: string;
  meta_description_en: string;
}

/**
 * GeneralTab Component for About Us
 */
export default function GeneralTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about.general",
  });

  const { getAboutUsQuery, updateAboutUs, isUpdating } = useAboutUs();
  const { data: aboutUsData, isLoading, isError } = getAboutUsQuery;

  const { control, handleSubmit, reset } = useForm<GeneralFormValues>({
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      image: null,
      video_url: "",
      meta_title_ar: "",
      meta_title_en: "",
      meta_description_ar: "",
      meta_description_en: "",
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (aboutUsData?.data) {
      const d = aboutUsData.data;
      reset({
        title_ar: d.title?.ar || "",
        title_en: d.title?.en || "",
        description_ar: d.description?.ar || "",
        description_en: d.description?.en || "",
        image: d.image || null,
        video_url: d.video_url || "",
        meta_title_ar: d.meta_title?.ar || "",
        meta_title_en: d.meta_title?.en || "",
        meta_description_ar: d.meta_description?.ar || "",
        meta_description_en: d.meta_description?.en || "",
      });
    }
  }, [aboutUsData, reset]);

  const onSubmit = (values: GeneralFormValues) => {
    updateAboutUs({
      title: { ar: values.title_ar, en: values.title_en },
      description: { ar: values.description_ar, en: values.description_en },
      image: values.image instanceof File ? values.image : undefined,
      video_url: values.video_url,
      meta_title: { ar: values.meta_title_ar, en: values.meta_title_en },
      meta_description: { ar: values.meta_description_ar, en: values.meta_description_en },
    });
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[400px] flex items-center justify-center text-destructive font-bold">
        Failed to load About Us data.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Basic Info & SEO */}
        <div className="lg:col-span-8 space-y-12">
          {/* Section: Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <Layout className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{t("basic_content")}</h3>
            </div>
            
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
                    <Textarea
                      {...field}
                      placeholder="..."
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
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
                      placeholder="..."
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Section: SEO */}
          <div className="space-y-8 bg-primary/5 p-8 rounded-[32px] border border-primary/10">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{t("seo_settings")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="meta_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("meta_title")}
                    </FieldLabel>
                    <Input
                      {...field}
                      className="h-11 rounded-xl bg-white border-border/60"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
              <Controller
                name="meta_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold flex items-center gap-2">
                      {t("meta_title")} ({t("en")})
                    </FieldLabel>
                    <Input
                      {...field}
                      className="h-11 rounded-xl bg-white border-border/60"
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="meta_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("meta_description")}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[80px] rounded-xl bg-white border-border/60 resize-none"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
              <Controller
                name="meta_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold flex items-center gap-2">
                      {t("meta_description")} ({t("en")})
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[80px] rounded-xl bg-white border-border/60 resize-none"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <Video className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{t("media_content")}</h3>
            </div>

            {/* Image Upload */}
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
                      "relative aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all overflow-hidden bg-muted/5 flex flex-col items-center justify-center cursor-pointer group",
                      value ? "border-primary/20" : "border-border hover:border-primary/40"
                    )}
                    onClick={() => {
                      const input = document.getElementById('about-image-input');
                      input?.click();
                    }}
                  >
                    {value ? (
                      <>
                        <img 
                          src={typeof value === 'string' ? value : URL.createObjectURL(value as Blob)} 
                          className="w-full h-full object-cover" 
                          alt="About Us" 
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
                      id="about-image-input"
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

            {/* Video URL */}
            <Controller
              name="video_url"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    {t("video_url")}
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="https://youtube.com/..."
                    className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all shadow-sm"
                  />
                  <p className="text-[11px] text-muted-foreground font-medium mt-2 px-2">
                    {t("video_hint")}
                  </p>
                </Field>
              )}
            />
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
          {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
