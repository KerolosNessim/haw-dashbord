import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSavePackageCategory } from "@/features/package-categories/hooks/useSavePackageCategory";
import type { PackageCategoryFormValues } from "@/features/package-categories/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Link as LinkIcon, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localizedSlugRequired } from "@/lib/zod-localized-slug";
import * as z from "zod";

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const packageCategorySchema = z.object({
  title: localizedRequired,
  slug: localizedSlugRequired,
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof packageCategorySchema>;

const emptyValues: PackageCategoryFormValues = {
  title: { ar: "", en: "" },
  slug: { ar: "", en: "" },
  sort_order: 0,
  is_active: true,
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
    watch,
    trigger,
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

  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");

  const onSubmit = (data: FormValues) => {
    void saveMutation({
      title: { ar: data.title.ar, en: data.title.en },
      slug: { ar: data.slug.ar, en: data.slug.en },
      sort_order: data.sort_order,
      is_active: data.is_active,
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SmartSlugField<FormValues>
            control={control}
            name="slug.ar"
            slugLocale="ar"
            titleEn={watchTitleAr ?? ""}
            trigger={trigger}
            label={
              <span className="flex items-center gap-2 font-bold text-gray-600">
                <LinkIcon className="h-3 w-3" />
                {t("slug_ar")}
              </span>
            }
            errorMessage={translateError(errors.slug?.ar?.message)}
            inputClassName="bg-muted/10 border-border/40"
            syncFromTitleWhenLocked={mode === "create"}
          />
          <SmartSlugField<FormValues>
            control={control}
            name="slug.en"
            slugLocale="en"
            titleEn={watchTitleEn ?? ""}
            trigger={trigger}
            label={
              <span className="flex items-center gap-2 font-bold text-gray-600">
                <LinkIcon className="h-3 w-3" />
                {t("slug_en")}
              </span>
            }
            errorMessage={translateError(errors.slug?.en?.message)}
            inputClassName="bg-muted/10 border-border/40"
            syncFromTitleWhenLocked={mode === "create"}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex min-h-12 flex-col justify-end gap-2">
                <FieldLabel className="font-bold text-gray-600">{t("is_active")}</FieldLabel>
                <div className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/5 px-4">
                  <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} className="shrink-0" />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20">
        <Save className="mr-2 h-5 w-5" />
        {t("save")}
      </Button>
    </form>
  );
}
