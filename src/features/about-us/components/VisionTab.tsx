import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Eye,
  Image as ImageIcon,
  Plus,
  Save,
  Target,
  Trash2,
  Loader2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";
import { useEffect } from "react";

interface VisionFormValues {
  vision_title_ar: string;
  vision_title_en: string;
  vision_description_ar: string;
  vision_description_en: string;
  vision_image: string | File | null;
  message_title_ar: string;
  message_title_en: string;
  message_description_ar: string;
  message_description_en: string;
  message_image: string | File | null;
}

/**
 * VisionTab Component for About Us
 */
export default function VisionTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about.vision",
  });

  const { getAboutUsQuery, updateVisionSection, isUpdatingVisionSection } = useAboutUs();
  const { data: aboutUsData, isLoading, isError } = getAboutUsQuery;

  const { control, handleSubmit, reset } = useForm<VisionFormValues>({
    defaultValues: {
      vision_title_ar: "",
      vision_title_en: "",
      vision_description_ar: "",
      vision_description_en: "",
      vision_image: null,
      message_title_ar: "",
      message_title_en: "",
      message_description_ar: "",
      message_description_en: "",
      message_image: null,
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (aboutUsData?.data?.vision_sections?.[0]) {
      const v = aboutUsData.data.vision_sections[0];
      reset({
        vision_title_ar: v.vision_title?.ar || "",
        vision_title_en: v.vision_title?.en || "",
        vision_description_ar: v.vision_description?.ar || "",
        vision_description_en: v.vision_description?.en || "",
        vision_image: v.vision_image || null,
        message_title_ar: v.message_title?.ar || "",
        message_title_en: v.message_title?.en || "",
        message_description_ar: v.message_description?.ar || "",
        message_description_en: v.message_description?.en || "",
        message_image: v.message_image || null,
      });
    }
  }, [aboutUsData, reset]);

  const onSubmit = (values: VisionFormValues) => {
    updateVisionSection({
      vision_title: { ar: values.vision_title_ar, en: values.vision_title_en },
      vision_description: { ar: values.vision_description_ar, en: values.vision_description_en },
      vision_image: values.vision_image instanceof File ? values.vision_image : undefined,
      message_title: { ar: values.message_title_ar, en: values.message_title_en },
      message_description: { ar: values.message_description_ar, en: values.message_description_en },
      message_image: values.message_image instanceof File ? values.message_image : undefined,
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
        Failed to load Vision data.
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
            <Target className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-20">
        {/* Section: Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <Eye className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Our Vision</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="vision_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("vision_title")}
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
                name="vision_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      {t("vision_title")} ({t("en")})
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
                name="vision_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("vision_des")}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
              <Controller
                name="vision_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      {t("vision_des")} ({t("en")})
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <Controller
              name="vision_image"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-4">
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {t("vision_image")}
                  </FieldLabel>
                  
                  <div 
                    className={cn(
                      "relative aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all overflow-hidden bg-muted/5 flex flex-col items-center justify-center cursor-pointer group",
                      value ? "border-primary/20" : "border-border hover:border-primary/40"
                    )}
                    onClick={() => {
                      const input = document.getElementById('vision-image-input');
                      input?.click();
                    }}
                  >
                    {value ? (
                      <>
                        <img 
                          src={typeof value === 'string' ? value : URL.createObjectURL(value as Blob)} 
                          className="w-full h-full object-cover" 
                          alt="Vision" 
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
                      id="vision-image-input"
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

        {/* Section: Mission/Message */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t pt-16">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 border-s-4 border-primary ps-4">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Our Mission</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="message_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("message_title")}
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
                name="message_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      {t("message_title")} ({t("en")})
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
                name="message_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                      ({t("ar")}) {t("message_des")}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                      dir="rtl"
                    />
                  </Field>
                )}
              />
              <Controller
                name="message_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-base font-bold flex items-center gap-2">
                      {t("message_des")} ({t("en")})
                    </FieldLabel>
                    <Textarea
                      {...field}
                      className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <Controller
              name="message_image"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-4">
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {t("message_image")}
                  </FieldLabel>
                  
                  <div 
                    className={cn(
                      "relative aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all overflow-hidden bg-muted/5 flex flex-col items-center justify-center cursor-pointer group",
                      value ? "border-primary/20" : "border-border hover:border-primary/40"
                    )}
                    onClick={() => {
                      const input = document.getElementById('message-image-input');
                      input?.click();
                    }}
                  >
                    {value ? (
                      <>
                        <img 
                          src={typeof value === 'string' ? value : URL.createObjectURL(value as Blob)} 
                          className="w-full h-full object-cover" 
                          alt="Message" 
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
                      id="message-image-input"
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
      </div>

      <div className="flex justify-end pt-10 border-t">
        <Button
          type="submit"
          size="lg"
          disabled={isUpdatingVisionSection}
          className="px-12 rounded-[20px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
        >
          {isUpdatingVisionSection ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
