import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { api } from "@/lib/api";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { COURSE_TAXONOMY_CATEGORIES_KEY } from "@/features/categories/query-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Save, Languages, Search, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const categorySchema = z.object({
  title_ar: z.string().min(1, { message: "validation.required" }),
  title_en: z.string().min(1, { message: "validation.required" }),
  slug_ar: z.string().min(1, { message: "validation.required" }),
  slug_en: z.string().min(1, { message: "validation.required" }),
  desc_ar: z.string().optional(),
  desc_en: z.string().optional(),
  meta_title_ar: z.string().optional(),
  meta_title_en: z.string().optional(),
  meta_desc_ar: z.string().optional(),
  meta_desc_en: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function assertApiEnvelopeSuccess(data: unknown): void {
  if (data == null || typeof data !== "object") return;
  const status = (data as { status?: unknown }).status;
  if (status === false || status === "false" || status === 0 || status === "0") {
    const message = (data as { message?: unknown }).message;
    throw new Error(typeof message === "string" && message.trim() ? message : "Request failed");
  }
}

export default function CreateCategoryForm() {
  const { t } = useTranslation("translation", { keyPrefix: "categories.form" });
  const { t: commonT } = useTranslation("translation");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title_ar: "",
      title_en: "",
      slug_ar: "",
      slug_en: "",
      desc_ar: "",
      desc_en: "",
      meta_title_ar: "",
      meta_title_en: "",
      meta_desc_ar: "",
      meta_desc_en: "",
    },
  });

  const watchTitleAr = watch("title_ar");
  const watchTitleEn = watch("title_en");

  const onSubmit = async (data: CategoryFormValues) => {
    const fd = new FormData();

    fd.append("type", "courses");
    fd.append("name[ar]", data.title_ar.trim());
    fd.append("name[en]", data.title_en.trim());
    fd.append("slug[ar]", data.slug_ar.trim());
    fd.append("slug[en]", data.slug_en.trim());
    appendLocalizedDescriptionHtml(fd, "description", data.desc_ar, data.desc_en);
    fd.append("meta_title[ar]", data.meta_title_ar?.trim() ?? "");
    fd.append("meta_title[en]", data.meta_title_en?.trim() ?? "");
    fd.append("meta_description[ar]", data.meta_desc_ar?.trim() ?? "");
    fd.append("meta_description[en]", data.meta_desc_en?.trim() ?? "");

    console.log("[CreateCategoryForm] valid submit payload:", data);
    console.log("[CreateCategoryForm] API request entries:", Object.fromEntries(fd.entries()));

    setIsSubmitting(true);
    try {
      const res = await api.post("/v1/admin/categories", fd);
      assertApiEnvelopeSuccess(res.data);
      console.log("[CreateCategoryForm] API success response:", res.data);
      void queryClient.invalidateQueries({ queryKey: COURSE_TAXONOMY_CATEGORIES_KEY });
      toast.success(resolveApiToastMessage(res.data, t("create_success")));
      navigate("/categories");
    } catch (error) {
      console.error("[CreateCategoryForm] API create failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("[CreateCategoryForm] API error response:", {
          status: error.response?.status,
          data: error.response?.data,
          request: Object.fromEntries(fd.entries()),
        });
        toast.error(axiosResponseErrorSummary(error.response?.data) || t("create_error"));
      } else {
        toast.error(error instanceof Error ? error.message : t("create_error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onValidationInvalid = (formErrors: FieldErrors<CategoryFormValues>) => {
    console.warn("[CreateCategoryForm] validation failed:", formErrors);
    toast.error(t("submit_validation_hint"));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onValidationInvalid)}
      className="space-y-10 animate-in fade-in duration-500"
      noValidate
    >
      <div >
        {/* Main Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">{commonT("blogs.form.basic_info")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="title_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("title_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all" />
                    <FieldError errors={[{ message: errors.title_ar?.message ? commonT(errors.title_ar.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="title_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("title_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all" />
                    <FieldError errors={[{ message: errors.title_en?.message ? commonT(errors.title_en.message) : undefined }]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartSlugField<CategoryFormValues>
                control={control}
                name="slug_ar"
                slugLocale="ar"
                titleEn={watchTitleAr ?? ""}
                trigger={trigger}
                syncFromTitleWhenLocked
                label={
                  <span className="flex items-center gap-2 font-bold">
                    <LinkIcon className="h-3 w-3" />
                    {t("slug_ar")}
                  </span>
                }
                placeholder={t("slug_placeholder_ar")}
                errorMessage={errors.slug_ar?.message ? commonT(errors.slug_ar.message) : undefined}
                inputClassName="rounded-xl"
              />
              <SmartSlugField<CategoryFormValues>
                control={control}
                name="slug_en"
                slugLocale="en"
                titleEn={watchTitleEn ?? ""}
                trigger={trigger}
                syncFromTitleWhenLocked
                label={
                  <span className="flex items-center gap-2 font-bold">
                    <LinkIcon className="h-3 w-3" />
                    {t("slug_en")}
                  </span>
                }
                placeholder={t("slug_placeholder")}
                errorMessage={errors.slug_en?.message ? commonT(errors.slug_en.message) : undefined}
                inputClassName="rounded-xl"
              />
              <p className="text-xs text-muted-foreground md:col-span-2">{t("slug_hint")}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Controller
                name="desc_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("desc_ar")}</FieldLabel>
                    <RichTextEditor
                      dir="rtl"
                      value={field.value}
                      placeholder={t("desc_ar")}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        field.onChange(html);
                      }}
                    />
                  </Field>
                )}
              />
              <Controller
                name="desc_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("desc_en")}</FieldLabel>
                    <RichTextEditor
                      dir="ltr"
                      value={field.value}
                      placeholder={t("desc_en")}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        field.onChange(html);
                      }}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white p-8 rounded-[32px] border shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{commonT("blogs.form.seo_label")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Controller
              name="meta_title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-gray-600 font-bold mb-2">{t("meta_title_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_desc_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-gray-600 font-bold mb-2">{t("meta_desc_ar")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[100px] rounded-xl bg-muted/10 border-border/40 focus:bg-white resize-none" />
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
                  <FieldLabel className="text-gray-600 font-bold mb-2">{t("meta_title_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_desc_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-gray-600 font-bold mb-2">{t("meta_desc_en")}</FieldLabel>
                  <Textarea {...field} dir="ltr" className="min-h-[100px] rounded-xl bg-muted/10 border-border/40 focus:bg-white resize-none" />
                </Field>
              )}
            />
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="px-8 h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Save className="w-5 h-5 mr-2" />
        {t("save")}
      </Button>
    </form>
  );
}
