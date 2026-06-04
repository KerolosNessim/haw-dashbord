import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { emptyBilingualImageAlt } from "@/lib/bilingual-image-alt";
import { usePackageCategories } from "@/features/package-categories/hooks/usePackageCategories";
import CountriesMultiSelectField from "@/features/shared/components/countries-multi-select-field";
import { useSavePackage } from "@/features/packages/hooks/useSavePackage";
import type { PackageFormValues } from "@/features/packages/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Link as LinkIcon, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { localizedSlugRequired } from "@/lib/zod-localized-slug";
import { localizedRichTextRequired, richTextValueToString } from "@/lib/zod-rich-text";
import * as z from "zod";

function normalizeSelectLabel(value: string | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const featureRowSchema = z.object({
  title: localizedRequired,
  is_included: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
});

const imageAltSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

const packageFormSchema = z.object({
  country_ids: z.array(z.string()).min(1, { message: "validation.country_required" }),
  package_category_id: z.string().min(1, { message: "validation.required" }),
  title: localizedRequired,
  description: localizedRichTextRequired,
  button_text: localizedRequired,
  slug: localizedSlugRequired,
  is_featured: z.boolean(),
  is_active: z.boolean(),
  price: z.string().optional(),
  currency: z.string().optional(),
  icon_alt: imageAltSchema,
  features: z.array(featureRowSchema),
});

type FormValues = z.infer<typeof packageFormSchema>;

function defaultFormValues(): PackageFormValues {
  return {
    country_ids: [],
    package_category_id: "",
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    button_text: { ar: "", en: "" },
    slug: { ar: "", en: "" },
    is_featured: false,
    is_active: true,
    price: "",
    currency: "",
    icon_alt: emptyBilingualImageAlt(),
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
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: defaultFormValues(),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  useEffect(() => {
    if (initialValues) {
      const { existing_icon_url, ...rest } = initialValues;
      reset({
        ...defaultFormValues(),
        ...rest,
        country_ids: rest.country_ids?.length ? rest.country_ids : [],
        package_category_id: rest.package_category_id ? String(rest.package_category_id).trim() : "",
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

  useEffect(() => {
    if (mode !== "edit" || categoriesLoading) return;
    let categoryId = String(initialValues?.package_category_id ?? "").trim();

    if (!categoryId) {
      const fallbackLabels = [
        initialValues?.categoryTitleAr,
        initialValues?.categoryTitleEn,
      ].map(normalizeSelectLabel).filter(Boolean);

      const matchedCategory = categories.find((category) => {
        const labels = [category.titleAr, category.titleEn]
          .map(normalizeSelectLabel)
          .filter(Boolean);
        return labels.some((label) => fallbackLabels.includes(label));
      });

      categoryId = matchedCategory ? String(matchedCategory.id).trim() : "";
    }

    if (!categoryId) return;
    setValue("package_category_id", categoryId, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [
    categories,
    categoriesLoading,
    initialValues?.categoryTitleAr,
    initialValues?.categoryTitleEn,
    initialValues?.package_category_id,
    mode,
    setValue,
  ]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");
  const watchCategoryId = watch("package_category_id");

  const categoryItems = useMemo(() => {
    const items = categories.map((c) => ({
      id: String(c.id),
      label: i18n.language.startsWith("ar") ? c.titleAr || c.titleEn : c.titleEn || c.titleAr,
    }));
    const selectedId = (watchCategoryId || initialValues?.package_category_id || "").trim();
    const hasSelected = selectedId ? items.some((item) => item.id === selectedId) : true;
    if (selectedId && !hasSelected) {
      const fallbackLabel = i18n.language.startsWith("ar")
        ? initialValues?.categoryTitleAr || initialValues?.categoryTitleEn
        : initialValues?.categoryTitleEn || initialValues?.categoryTitleAr;
      items.unshift({
        id: selectedId,
        label: fallbackLabel || selectedId,
      });
    }
    return items;
  }, [categories, i18n.language, initialValues, watchCategoryId]);

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
    const slugAr = data.slug.ar.trim() || data.title.ar.trim();
    const slugEn = data.slug.en.trim() || data.title.en.trim();

    const payload: PackageFormValues = {
      country_ids: data.country_ids,
      package_category_id: data.package_category_id,
      title: data.title,
      description: {
        ar: richTextValueToString(data.description.ar),
        en: richTextValueToString(data.description.en),
      },
      button_text: data.button_text,
      slug: { ar: slugAr, en: slugEn },
      is_featured: data.is_featured,
      is_active: data.is_active,
      price: data.price ?? "",
      currency: data.currency ?? "",
      features: data.features,
    };
    void saveMutation({ values: payload, iconFile }).catch(() => {
      /* Errors surfaced via useSavePackage onError toast */
    });
  };

  const onValidationInvalid = () => {
    toast.error(t("submit_validation_hint"));
  };

  if (isInitialLoading && mode === "edit") {
    return <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">{t("loading")}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationInvalid)} className="animate-in fade-in space-y-10 duration-500" noValidate>
      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">{t("basic_section")}</h2>
        </div>

        <Controller
          name="country_ids"
          control={control}
          render={({ field }) => (
            <CountriesMultiSelectField
              value={field.value ?? []}
              onChange={field.onChange}
              label={t("countries")}
              hint={t("countries_hint")}
              required
              error={
                errors.country_ids?.message
                  ? commonT(errors.country_ids.message)
                  : undefined
              }
            />
          )}
        />

        <Controller
          name="package_category_id"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="font-bold text-gray-600">{t("category")}</FieldLabel>
              <Select
                value={
                  String(field.value ?? "").trim() ||
                  String(initialValues?.package_category_id ?? "").trim()
                }
                onValueChange={(v) => field.onChange(v)}
                disabled={categoriesLoading && categoryItems.length === 0}
              >
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

        <LocalizedDescriptionFields
          control={control}
          nameAr="description.ar"
          nameEn="description.en"
          labelAr={t("short_desc_ar")}
          labelEn={t("short_desc_en")}
          translateError={translateError}
          clearErrors={clearErrors}
          trigger={trigger}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="button_text.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("button_text_ar")}</FieldLabel>
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
                <FieldLabel>{t("button_text_en")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-muted/10" />
                <FieldError errors={[{ message: translateError(errors.button_text?.en?.message) }]} />
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
                <LinkIcon className="h-3.5 w-3.5" />
                {t("slug_ar")}
              </span>
            }
            errorMessage={translateError(errors.slug?.ar?.message)}
            inputClassName="bg-muted/10"
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
                <LinkIcon className="h-3.5 w-3.5" />
                {t("slug_en")}
              </span>
            }
            errorMessage={translateError(errors.slug?.en?.message)}
            inputClassName="bg-muted/10"
            syncFromTitleWhenLocked={mode === "create"}
          />
        </div>

        <Field className="space-y-4">
          <FieldLabel>{t("package_image")}</FieldLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="rounded-xl" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 inline h-4 w-4" />
                {t("choose_package_image")}
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
            <img
              src={iconPreview}
              alt={watch("icon_alt.ar") || watch("icon_alt.en") || t("package_image")}
              className="mt-1 max-h-32 max-w-full rounded-xl border object-contain"
            />
          )}
          <Controller
            name="icon_alt"
            control={control}
            render={({ field }) => (
              <BilingualImageAltFields
                value={field.value}
                onChange={field.onChange}
                keyPrefix="packages.form"
                arLabelKey="image_alt_ar"
                enLabelKey="image_alt_en"
                placeholderKey="image_alt_placeholder"
              />
            )}
          />
        </Field>

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

      <Button type="submit" disabled={isPending} className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20">
        <Save className="mr-2 h-5 w-5" />
        {t("save")}
      </Button>
    </form>
  );
}
