import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import type { LegalPage, LegalPageValues, LegalPageType } from "../types";
import { useLegalPage } from "../hooks/useLegalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Loader2, Save, X, Globe, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const legalSchema = z.object({
  description_ar: z.string().min(1, { message: "validation.required" }),
  description_en: z.string().optional().default(""),
  meta_title_ar: z.string().min(1, { message: "validation.required" }),
  meta_title_en: z.string().optional().default(""),
  meta_description_ar: z.string().min(1, { message: "validation.required" }),
  meta_description_en: z.string().optional().default(""),
  slug: z.string().optional(),
  image: z.any().optional(),
});

interface LegalPageFormProps {
  type: LegalPageType;
}

export default function LegalPageForm({ type }: LegalPageFormProps) {
  const { t, i18n } = useTranslation("translation");
  const { data: pageData, isLoading, updatePage, isUpdating } = useLegalPage(type);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LegalPageValues>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      description_ar: "",
      description_en: "",
      meta_title_ar: "",
      meta_title_en: "",
      meta_description_ar: "",
      meta_description_en: "",
      slug: "",
    },
  });

  const parseBilingual = (raw: any) => {
    if (!raw) return { ar: "", en: "" };
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return { ar: parsed.ar || "", en: parsed.en || "" };
      } catch {
        return { ar: raw, en: raw };
      }
    }
    return { ar: raw.ar || "", en: raw.en || "" };
  };

  useEffect(() => {
    if (pageData) {
      const desc = parseBilingual(pageData.description);
      const title = parseBilingual(pageData.meta_title);
      const metaDesc = parseBilingual(pageData.meta_description);

      reset({
        description_ar: desc.ar,
        description_en: desc.en,
        meta_title_ar: title.ar,
        meta_title_en: title.en,
        meta_description_ar: metaDesc.ar,
        meta_description_en: metaDesc.en,
        slug: pageData.slug || "",
      });
      if (pageData.image) {
        setImagePreview(pageData.image);
      }
    }
  }, [pageData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const onSubmit = (values: LegalPageValues) => {
    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel PUT workaround
    const descAr = localizedHtmlForApi(values.description_ar);
    const descEn = localizedHtmlForApi(values.description_en);
    if (descAr) formData.append("description[ar]", descAr);
    if (descEn) formData.append("description[en]", descEn);
    formData.append("meta_title[ar]", values.meta_title_ar);
    formData.append("meta_title[en]", values.meta_title_en);
    formData.append("meta_description[ar]", values.meta_description_ar);
    formData.append("meta_description[en]", values.meta_description_en);
    if (values.slug) formData.append("slug", values.slug);
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    updatePage(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t(`legal.${type}`)}</h1>
        <Button type="submit" disabled={isUpdating} className="gap-2 px-8 rounded-full">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("legal.form.save")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Tabs for AR/EN */}
          <Tabs defaultValue={i18n.language.startsWith("ar") ? "ar" : "en"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl mb-6">
              <TabsTrigger value="ar" className="rounded-xl">{t("services.form.arabic")}</TabsTrigger>
              <TabsTrigger value="en" className="rounded-xl">{t("services.form.english")}</TabsTrigger>
            </TabsList>

            <TabsContent value="ar" className="space-y-6">
              <Controller
                name="meta_title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Search className="w-4 h-4 opacity-40" /> {t("legal.form.meta_title_ar")}
                    </FieldLabel>
                    <Input {...field} dir="rtl" className="h-12 rounded-2xl bg-background border-border/50" />
                    <FieldError errors={[{ message: t(errors.meta_title_ar?.message || "") }]} />
                  </Field>
                )}
              />
              <Controller
                name="meta_description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 opacity-40" /> {t("legal.form.meta_description_ar")}
                    </FieldLabel>
                    <Textarea {...field} dir="rtl" className="min-h-[100px] rounded-2xl bg-background border-border/50 resize-none" />
                    <FieldError errors={[{ message: t(errors.meta_description_ar?.message || "") }]} />
                  </Field>
                )}
              />
              <Controller
                name="description_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("legal.form.description_ar")}</FieldLabel>
                    <div className="min-h-[400px]">
                      <RichTextEditor
                        value={field.value}
                        onChange={(val) => {
                          const html = editorOnChangeToHtml(val);
                          field.onChange(html);
                        }}
                        dir="rtl"
                      />
                    </div>
                    <FieldError errors={[{ message: t(errors.description_ar?.message || "") }]} />
                  </Field>
                )}
              />
            </TabsContent>

            <TabsContent value="en" className="space-y-6">
              <Controller
                name="meta_title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Search className="w-4 h-4 opacity-40" /> {t("legal.form.meta_title_en")}
                    </FieldLabel>
                    <Input {...field} dir="ltr" className="h-12 rounded-2xl bg-background border-border/50" />
                    <FieldError errors={[{ message: t(errors.meta_title_en?.message || "") }]} />
                  </Field>
                )}
              />
              <Controller
                name="meta_description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 opacity-40" /> {t("legal.form.meta_description_en")}
                    </FieldLabel>
                    <Textarea {...field} dir="ltr" className="min-h-[100px] rounded-2xl bg-background border-border/50 resize-none" />
                    <FieldError errors={[{ message: t(errors.meta_description_en?.message || "") }]} />
                  </Field>
                )}
              />
              <Controller
                name="description_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("legal.form.description_en")}</FieldLabel>
                    <div className="min-h-[400px]">
                      <RichTextEditor
                        value={field.value}
                        onChange={(val) => {
                          const html = editorOnChangeToHtml(val);
                          field.onChange(html);
                        }}
                        dir="ltr"
                      />
                    </div>
                    <FieldError errors={[{ message: t(errors.description_en?.message || "") }]} />
                  </Field>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-[2rem] border border-dashed bg-muted/5 space-y-6">
            <FieldLabel className="text-xs font-bold uppercase tracking-wider opacity-40">
              {t("legal.form.image")}
            </FieldLabel>
            <div
              className={cn(
                "relative aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden bg-background flex flex-col items-center justify-center cursor-pointer",
                imagePreview ? "border-primary/20" : "border-border hover:border-primary/40",
              )}
              onClick={() => !imagePreview && imageInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-red-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-8">
                  <ImagePlus className="w-10 h-10 opacity-20" />
                  <p className="text-xs font-bold opacity-30 text-center">{t("services.form.upload_image")}</p>
                </div>
              )}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Field className="p-6 rounded-[2rem] border border-dashed bg-muted/5">
                <FieldLabel className="flex items-center gap-2">
                  <Globe className="w-4 h-4 opacity-40" /> {t("legal.form.slug")}
                </FieldLabel>
                <Input {...field} className="h-12 rounded-2xl bg-background border-border/50" />
                <FieldError errors={[{ message: t(errors.slug?.message || "") }]} />
              </Field>
            )}
          />
        </div>
      </div>
    </form>
  );
}
