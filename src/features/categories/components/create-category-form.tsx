import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Languages, Search } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const categorySchema = z.object({
  title_ar: z.string().min(1, { message: "validation.required" }),
  title_en: z.string().min(1, { message: "validation.required" }),
  desc_ar: z.string().optional(),
  desc_en: z.string().optional(),
  meta_title_ar: z.string().optional(),
  meta_title_en: z.string().optional(),
  meta_desc_ar: z.string().optional(),
  meta_desc_en: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CreateCategoryForm() {
  const { t } = useTranslation("translation", { keyPrefix: "categories.form" });
  const { t: commonT } = useTranslation("translation");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title_ar: "",
      title_en: "",
      desc_ar: "",
      desc_en: "",
      meta_title_ar: "",
      meta_title_en: "",
      meta_desc_ar: "",
      meta_desc_en: "",
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    console.log("Category Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-500">
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
              <Controller
                name="desc_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("desc_ar")}</FieldLabel>
                    <Textarea {...field} dir="rtl" className="min-h-[120px] rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all resize-none" />
                  </Field>
                )}
              />
              <Controller
                name="desc_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("desc_en")}</FieldLabel>
                    <Textarea {...field} dir="ltr" className="min-h-[120px] rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all resize-none" />
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
      <Button type="submit" className="px-8 h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
        <Save className="w-5 h-5 mr-2" />
        {t("save")}
      </Button>
    </form>
  );
}
