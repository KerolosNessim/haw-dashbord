import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSavePackageCategory } from "@/features/package-categories/hooks/useSavePackageCategory";
import type { PackageCategoryFormValues } from "@/features/package-categories/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Save, Search } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedOptional = z.object({
  ar: z.string().optional(),
  en: z.string().optional(),
});

const packageCategorySchema = z.object({
  title: localizedRequired,
  slug: z.string().min(1, { message: "validation.required" }),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  is_default: z.boolean(),
  meta_title: localizedOptional,
  meta_description: localizedOptional,
  meta_keywords: localizedOptional,
});

type FormValues = z.infer<typeof packageCategorySchema>;

const emptyValues: PackageCategoryFormValues = {
  title: { ar: "", en: "" },
  slug: "",
  sort_order: 0,
  is_active: true,
  is_default: false,
  meta_title: { ar: "", en: "" },
  meta_description: { ar: "", en: "" },
  meta_keywords: { ar: "", en: "" },
};

type PackageCategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues?: PackageCategoryFormValues | null;
  isInitialLoading?: boolean;
};

export default function PackageCategoryForm({
  mode,
  categoryId,
  initialValues,
  isInitialLoading,
}: PackageCategoryFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "package_categories.form" });
  const { t: commonT } = useTranslation("translation");
  const { saveMutation, isPending } = useSavePackageCategory(mode, categoryId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(packageCategorySchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const onSubmit = (data: FormValues) => {
    void saveMutation({
      title: { ar: data.title.ar, en: data.title.en },
      slug: data.slug,
      sort_order: data.sort_order,
      is_active: data.is_active,
      is_default: data.is_default,
      meta_title: {
        ar: data.meta_title?.ar ?? "",
        en: data.meta_title?.en ?? "",
      },
      meta_description: {
        ar: data.meta_description?.ar ?? "",
        en: data.meta_description?.en ?? "",
      },
      meta_keywords: {
        ar: data.meta_keywords?.ar ?? "",
        en: data.meta_keywords?.en ?? "",
      },
    });
  };

  if (isInitialLoading && mode === "edit") {
    return (
      <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">{t("loading")}</div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in space-y-10 duration-500">
      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{t("basic_section")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="font-bold text-gray-600">{t("title_ar")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-12 rounded-xl bg-muted/10 border-border/40" />
                <FieldError errors={[{ message: translateError(errors.title?.ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="font-bold text-gray-600">{t("title_en")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10 border-border/40" />
                <FieldError errors={[{ message: translateError(errors.title?.en?.message) }]} />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="font-bold text-gray-600">{t("slug")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10 border-border/40" />
                <FieldError errors={[{ message: translateError(errors.slug?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="sort_order"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="font-bold text-gray-600">{t("sort_order")}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  className="h-12 rounded-xl bg-muted/10 border-border/40"
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </Field>
            )}
          />
          <div className="flex flex-col justify-end gap-4 md:flex-row md:items-stretch md:justify-end md:gap-8">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex min-h-12 w-full min-w-0 items-center justify-between gap-4 md:w-[min(100%,280px)]">
                  <FieldLabel className="mb-0 min-w-0 flex-1 font-bold text-gray-600">
                    {t("is_active")}
                  </FieldLabel>
                  <Switch
                    dir="ltr"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="shrink-0"
                  />
                </div>
              )}
            />
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <div className="flex min-h-12 w-full items-center justify-between gap-4 md:w-[min(100%,280px)]">
                  <FieldLabel className="mb-0 min-w-0 flex-1 text-start font-bold text-gray-600">
                    {t("is_default")}
                  </FieldLabel>
                  <Switch
                    dir="ltr"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="shrink-0"
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{t("seo_section")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6 rounded-2xl border border-dashed bg-muted/5 p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-primary/40">{t("seo_ar")}</div>
            <Controller
              name="meta_title.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_title_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_ar")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[100px] resize-none rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_keywords.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_keywords_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
          </div>

          <div className="space-y-6 rounded-2xl border border-dashed bg-muted/5 p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-primary/40">{t("seo_en")}</div>
            <Controller
              name="meta_title.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_title_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_en")}</FieldLabel>
                  <Textarea {...field} dir="ltr" className="min-h-[100px] resize-none rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_keywords.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_keywords_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-xl bg-white border-border/40" />
                </Field>
              )}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20">
        <Save className="mr-2 h-5 w-5" />
        {t("save")}
      </Button>
    </form>
  );
}
