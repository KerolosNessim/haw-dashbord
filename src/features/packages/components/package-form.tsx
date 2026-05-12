import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePackageCategories } from "@/features/package-categories/hooks/usePackageCategories";
import { useSavePackage } from "@/features/packages/hooks/useSavePackage";
import type { IconPreset, PackageFormValues } from "@/features/packages/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Plus, Save, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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

const featureRowSchema = z.object({
  title: localizedRequired,
  is_included: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
});

const packageFormSchema = z.object({
  package_category_id: z.string().min(1, { message: "validation.required" }),
  title: localizedRequired,
  description: localizedRequired,
  button_text: localizedRequired,
  details_url: z.string().optional(),
  slug: z.string().optional(),
  canonical_url: z.string().optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  price: z.string().optional(),
  currency: z.string().optional(),
  icon_preset: z.enum(["target", "gem", "rocket", "none"]),
  meta_title: localizedOptional,
  meta_description: localizedOptional,
  meta_keywords: localizedOptional,
  features: z.array(featureRowSchema),
});

type FormValues = z.infer<typeof packageFormSchema>;

function defaultFormValues(): PackageFormValues {
  return {
    package_category_id: "",
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    button_text: { ar: "", en: "" },
    details_url: "",
    slug: "",
    canonical_url: "",
    is_featured: false,
    is_active: true,
    price: "",
    currency: "",
    icon_preset: "none",
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    meta_keywords: { ar: "", en: "" },
    features: [],
  };
}

type PackageFormProps = {
  mode: "create" | "edit";
  packageId?: string;
  initialValues?: PackageFormValues | null;
  isInitialLoading?: boolean;
};

export default function PackageForm({ mode, packageId, initialValues, isInitialLoading }: PackageFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "packages.form" });
  const { t: commonT } = useTranslation("translation");
  const { i18n } = useTranslation();
  const { saveMutation, isPending } = useSavePackage(mode, packageId);
  const { data: categories = [], isLoading: categoriesLoading } = usePackageCategories();

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (iconPreview?.startsWith("blob:")) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: defaultFormValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  useEffect(() => {
    if (initialValues) {
      const { existing_icon_url, ...rest } = initialValues;
      reset({
        ...rest,
        features: initialValues.features?.length ? initialValues.features : [],
      });
      setIconFile(null);
      const fromServer = typeof existing_icon_url === "string" ? existing_icon_url.trim() : "";
      setIconPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return fromServer || null;
      });
    }
  }, [initialValues, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const categoryItems = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: i18n.language.startsWith("ar") ? c.titleAr || c.titleEn : c.titleEn || c.titleAr,
      })),
    [categories, i18n.language],
  );

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    e.target.value = "";
  };

  const clearIcon = () => {
    setIconFile(null);
    setIconPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onSubmit = (data: FormValues) => {
    const payload: PackageFormValues = {
      package_category_id: data.package_category_id,
      title: data.title,
      description: data.description,
      button_text: data.button_text,
      details_url: data.details_url?.trim() ?? "",
      slug: data.slug?.trim() ?? "",
      canonical_url: data.canonical_url?.trim() ?? "",
      is_featured: data.is_featured,
      is_active: data.is_active,
      price: data.price ?? "",
      currency: data.currency ?? "",
      icon_preset: data.icon_preset as IconPreset,
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
      features: data.features,
    };
    void saveMutation({ values: payload, iconFile });
  };

  if (isInitialLoading && mode === "edit") {
    return <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">{t("loading")}</div>;
  }

  const iconPresets: { value: IconPreset; label: string }[] = [
    { value: "none", label: t("icon_none") },
    { value: "target", label: t("icon_target") },
    { value: "gem", label: t("icon_gem") },
    { value: "rocket", label: t("icon_rocket") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in space-y-10 duration-500">
      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{t("basic_section")}</h2>
        </div>

        <Controller
          name="package_category_id"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="font-bold text-gray-600">{t("category")}</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={categoriesLoading}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder={t("category_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categoryItems.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[{ message: translateError(errors.package_category_id?.message) }]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("title_ar")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-12 rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.title?.ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("title_en")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.title?.en?.message) }]} />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("short_desc_ar")}</FieldLabel>
                <Textarea {...field} dir="rtl" className="min-h-[100px] resize-none rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.description?.ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("short_desc_en")}</FieldLabel>
                <Textarea {...field} dir="ltr" className="min-h-[100px] resize-none rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.description?.en?.message) }]} />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="button_text.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("button_ar")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-12 rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.button_text?.ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="button_text.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("button_en")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.button_text?.en?.message) }]} />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="details_url"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("details_url")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" placeholder="https://..." />
              </Field>
            )}
          />
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("slug")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
              </Field>
            )}
          />
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <Field className="flex flex-row items-center gap-3">
                <FieldLabel className="font-bold">{t("is_featured")}</FieldLabel>
                <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Field className="flex flex-row items-center gap-3">
                <FieldLabel className="font-bold">{t("is_active")}</FieldLabel>
                <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("price")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
              </Field>
            )}
          />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("currency")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" placeholder="$" />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field>
            <FieldLabel>{t("icon_upload")}</FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" className="rounded-xl" asChild>
                <label className="cursor-pointer">
                  <Upload className="mr-2 inline h-4 w-4" />
                  {t("choose_icon")}
                  <input type="file" accept="image/*,.svg" className="hidden" onChange={onFile} />
                </label>
              </Button>
              {iconPreview && (
                <Button type="button" variant="ghost" size="sm" onClick={clearIcon}>
                  {t("remove_icon")}
                </Button>
              )}
            </div>
            {iconPreview && (
              <img src={iconPreview} alt="" className="mt-3 h-16 w-16 rounded-full border object-cover" />
            )}
          </Field>

          <Controller
            name="icon_preset"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("icon_preset")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconPresets.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">{t("features_section")}</h2>
          </div>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => append({ title: { ar: "", en: "" }, is_included: true, sort_order: fields.length })}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add_feature")}
          </Button>
        </div>

        {fields.length === 0 && <p className="text-sm text-muted-foreground">{t("features_empty")}</p>}

        <div className="space-y-6">
          {fields.map((f, index) => (
            <div key={f.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-dashed bg-muted/5 p-6 md:grid-cols-[1fr_1fr_auto_140px_auto] md:items-end">
              <Controller
                name={`features.${index}.title.ar` as const}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("feature_title_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                    <FieldError
                      errors={[
                        { message: translateError(errors.features?.[index]?.title?.ar?.message) },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name={`features.${index}.title.en` as const}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("feature_title_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-11 rounded-xl" />
                    <FieldError
                      errors={[
                        { message: translateError(errors.features?.[index]?.title?.en?.message) },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name={`features.${index}.is_included` as const}
                control={control}
                render={({ field }) => (
                  <Field className="flex flex-row items-center gap-3">
                    <FieldLabel>{t("feature_included")}</FieldLabel>
                    <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
              <Controller
                name={`features.${index}.sort_order` as const}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("feature_sort_order")}</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      dir="ltr"
                      className="h-11 rounded-xl"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </Field>
                )}
              />
              <Button type="button" variant="ghost" size="icon" className="text-rose-600" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{t("seo_section")}</h2>
        </div>

        <Controller
          name="canonical_url"
          control={control}
          render={({ field }) => (
            <Field className="max-w-3xl">
              <FieldLabel>{t("canonical_url")}</FieldLabel>
              <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6 rounded-2xl border border-dashed bg-muted/5 p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-primary/40">{t("seo_ar")}</div>
            <Controller
              name="meta_title.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_title_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-xl bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_ar")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[100px] resize-none rounded-xl bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_keywords.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_keywords_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-xl bg-white" />
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
                  <Input {...field} dir="ltr" className="h-12 rounded-xl bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_en")}</FieldLabel>
                  <Textarea {...field} dir="ltr" className="min-h-[100px] resize-none rounded-xl bg-white" />
                </Field>
              )}
            />
            <Controller
              name="meta_keywords.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_keywords_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-xl bg-white" />
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
