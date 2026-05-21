import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCountries } from "@/features/countries/hooks/useCountries";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  FileText,
  Globe,
  ImagePlus,
  Layout,
  Loader2,
  Monitor,
  Search,
  X,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useAdminService } from "../../hooks/useAdminService";
import { useEffect } from "react";

// --- Static Schema Definition (Outside) ---
const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedEditorSchema = z.object({
  ar: z.any().optional(),
  en: z.any().optional(),
}).optional();

const serviceImageSchema = z
  .object({
    ar: z.any().nullable().optional(),
    en: z.any().nullable().optional(),
  })
  .refine((val) => !!(val.ar || val.en), {
    message: "validation.cover_required",
  });

const optionalLocalizedSchema = z.object({
  ar: z.string().optional(),
  en: z.string().optional(),
});

const basicInfoSchema = z.object({
  slug: localizedSchema,
  country_ids: z
    .array(z.string())
    .min(1, { message: "validation.country_required" }),
  package_ids: z.array(z.string()).optional(),
  is_active: z.boolean(),
  title: localizedSchema,
  description: localizedSchema,
  highlight_description: localizedEditorSchema,
  meta_title: localizedSchema,
  meta_description: localizedSchema,
  image: serviceImageSchema,
  image_alt: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
  show_footer: z.boolean(),
  sort_order: z.coerce.number().optional(),
  media_url: z.string().optional(),
  media_type: z.string().optional(),
  og_title: optionalLocalizedSchema.optional(),
  og_description: optionalLocalizedSchema.optional(),
  og_type: z.string().optional(),
  og_image: z.any().optional(),
  twitter_card: z.string().optional(),
  twitter_title: optionalLocalizedSchema.optional(),
  twitter_description: optionalLocalizedSchema.optional(),
  twitter_image: z.any().optional(),
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

function pickLocalizedFromService(
  service: Record<string, unknown>,
  key: string,
): { ar: string; en: string } {
  const field = service[key];
  if (!field || typeof field !== "object") return { ar: "", en: "" };
  const o = field as { ar?: string; en?: string };
  return { ar: o.ar ?? "", en: o.en ?? "" };
}

export interface BasicInfoFormHandle {
  validate: () => Promise<BasicInfoValues | null>;
}

interface BasicInfoFormProps {
  initialId?: number;
  /** When true, parent owns submit (unified page save). */
  embedded?: boolean;
}

const BasicInfoForm = forwardRef<BasicInfoFormHandle, BasicInfoFormProps>(
  function BasicInfoForm({ initialId, embedded }, ref) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.form" });
  const { data: countriesData } = useAdminCountries();
  const countries = countriesData?.data ?? [];
  
  const { service, isLoading: isFetching } = useAdminService(initialId);

  const [coverPreviewAr, setCoverPreviewAr] = useState<string | null>(null);
  const [coverPreviewEn, setCoverPreviewEn] = useState<string | null>(null);
  const coverInputRefAr = useRef<HTMLInputElement>(null);
  const coverInputRefEn = useRef<HTMLInputElement>(null);

  const {
    control,
    getValues,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      slug: { ar: "", en: "" },
      country_ids: [],
      is_active: true,
      show_footer: true,
      title: { ar: "", en: "" },
      description: { ar: "", en: "" },
      highlight_description: { ar: null, en: null },
      meta_title: { ar: "", en: "" },
      meta_description: { ar: "", en: "" },
      image: { ar: null, en: null },
      image_alt: { ar: "", en: "" },
      package_ids: [],
      sort_order: 0,
      media_url: "",
      media_type: "",
      og_title: { ar: "", en: "" },
      og_description: { ar: "", en: "" },
      og_type: "website",
      og_image: null,
      twitter_card: "summary_large_image",
      twitter_title: { ar: "", en: "" },
      twitter_description: { ar: "", en: "" },
      twitter_image: null,
    },
  });

  // Populate form when service data is loaded (edit mode)
  useEffect(() => {
    if (service) {
      reset({
        slug: {
          ar: service.slug?.ar ?? "",
          en: service.slug?.en ?? "",
        },
        country_ids: service.countries?.map((c: any) => String(c.id)) ?? [],
        is_active: service.is_active ?? true,
        show_footer: service.show_footer ?? true,
        title: {
          ar: service.title?.ar ?? "",
          en: service.title?.en ?? "",
        },
        description: {
          ar: service.description?.ar ?? "",
          en: service.description?.en ?? "",
        },
        highlight_description: {
          ar: service.highlight_description?.ar ?? null,
          en: service.highlight_description?.en ?? null,
        },
        meta_title: {
          ar: service.meta_title?.ar ?? "",
          en: service.meta_title?.en ?? "",
        },
        meta_description: {
          ar: service.meta_description?.ar ?? "",
          en: service.meta_description?.en ?? "",
        },
        image: {
          ar: service.image?.ar ?? null,
          en: service.image?.en ?? null,
        },
        image_alt: {
          ar: service.image_alt?.ar ?? "",
          en: service.image_alt?.en ?? "",
        },
        package_ids:
          (service as { package_ids?: number[] }).package_ids?.map(String) ?? [],
        sort_order: service.sort_order ?? 0,
        media_url: service.media_url ?? "",
        media_type: service.media_type ?? "",
        og_title: pickLocalizedFromService(service as Record<string, unknown>, "og_title"),
        og_description: pickLocalizedFromService(
          service as Record<string, unknown>,
          "og_description",
        ),
        og_type: (service as { og_type?: string }).og_type ?? "website",
        og_image: (service as { og_image?: string | null }).og_image ?? null,
        twitter_card:
          (service as { twitter_card?: string }).twitter_card ?? "summary_large_image",
        twitter_title: pickLocalizedFromService(
          service as Record<string, unknown>,
          "twitter_title",
        ),
        twitter_description: pickLocalizedFromService(
          service as Record<string, unknown>,
          "twitter_description",
        ),
        twitter_image:
          (service as { twitter_image?: string | null }).twitter_image ?? null,
      });

      setCoverPreviewAr(service.image?.ar ?? null);
      setCoverPreviewEn(service.image?.en ?? null);
    }
  }, [service, reset]);

  const handleImageChange = (
    locale: "ar" | "en",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const current = watch("image") ?? { ar: null, en: null };
    setValue(
      "image",
      { ...current, [locale]: file },
      { shouldValidate: true },
    );

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (locale === "ar") setCoverPreviewAr(preview);
      else setCoverPreviewEn(preview);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (locale: "ar" | "en") => {
    const current = watch("image") ?? { ar: null, en: null };
    setValue(
      "image",
      { ...current, [locale]: null },
      { shouldValidate: true },
    );
    if (locale === "ar") {
      setCoverPreviewAr(null);
      if (coverInputRefAr.current) coverInputRefAr.current.value = "";
    } else {
      setCoverPreviewEn(null);
      if (coverInputRefEn.current) coverInputRefEn.current.value = "";
    }
  };

  const normalizeValues = (data: BasicInfoValues): BasicInfoValues => ({
    ...data,
    highlight_description: {
      ar: editorOnChangeToHtml(data.highlight_description?.ar),
      en: editorOnChangeToHtml(data.highlight_description?.en),
    },
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const valid = await trigger();
      if (!valid) return null;
      return normalizeValues(getValues());
    },
  }));

  /**
   * Helper to translate error messages if they are keys
   */
  const translateError = (error: unknown) => {
    if (!error || typeof error !== "object") return undefined;
    
    // For array fields, the error might be a Merge type. 
    // We try to get the top-level message if it exists.
    const message = (error as Record<string, unknown>).message;
    
    if (!message || typeof message !== "string") return undefined;
    // If the message is a translation key (e.g. contains 'validation.'), translate it
    return message.includes("validation.") ? t(message) : message;
  };

  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-8 rounded-[32px] border bg-card shadow-sm space-y-12">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Layout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{t("basic_info")}</h2>
        </div>

        {/* Global Settings: Slug, Active Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
            <SmartSlugField<BasicInfoValues>
              control={control}
              name="slug.ar"
              slugLocale="ar"
              titleEn={watchTitleAr ?? ""}
              trigger={trigger}
              label={
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 opacity-40" /> {t("slug")} (AR)
                </span>
              }
              placeholder={t("placeholders.slug")}
              errorMessage={translateError(errors.slug?.ar)}
              inputClassName="rounded-2xl bg-background border-border/50 text-right"
            />
            <SmartSlugField<BasicInfoValues>
              control={control}
              name="slug.en"
              slugLocale="en"
              titleEn={watchTitleEn ?? ""}
              trigger={trigger}
              label={
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 opacity-40" /> {t("slug")} (EN)
                </span>
              }
              placeholder={t("placeholders.slug")}
              errorMessage={translateError(errors.slug?.en)}
              inputClassName="rounded-2xl bg-background border-border/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-1">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between p-4 rounded-2xl bg-background border border-dashed border-border/50">
                  <div className="space-y-0.5">
                    <FieldLabel className="flex items-center gap-2 m-0 text-sm">
                      <Activity className="w-4 h-4 opacity-40" /> {t("is_active")}
                    </FieldLabel>
                  </div>
                  <Switch
                    dir="ltr"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
            <Controller
              name="show_footer"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between p-4 rounded-2xl bg-background border border-dashed border-border/50">
                  <div className="space-y-0.5">
                    <FieldLabel className="flex items-center gap-2 m-0 text-sm">
                      <Layout className="w-4 h-4 opacity-40" /> {t("show_footer")}
                    </FieldLabel>
                  </div>
                  <Switch
                    dir="ltr"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>



          <div className="md:col-span-2">
            <Controller
              name="country_ids"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("country")}</FieldLabel>
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                    multiple
                  >
                    <ComboboxChips className="min-h-12 rounded-2xl bg-background border-border/50 p-2">
                      {Array.isArray(field.value) &&
                        field.value.map((val: string) => {
                          const country = countries.find(
                            (c) => String(c.id) === val,
                          );
                          const countryName = country ? (i18n.language === "ar" ? country.name.ar : country.name.en) : val;
                          return (
                            <ComboboxChip key={val} value={val}>
                              {countryName}
                            </ComboboxChip>
                          );
                        })}
                      <ComboboxChipsInput
                        placeholder={
                          field.value.length === 0 ? t("country_placeholder") : ""
                        }
                        className="bg-transparent border-none focus:ring-0"
                      />
                    </ComboboxChips>
                    <ComboboxContent className="w-[--anchor-width]">
                      <ComboboxList>
                        {countries.map((country) => (
                          <ComboboxItem
                            key={country.id}
                            value={String(country.id)}
                          >
                            {i18n.language === "ar" ? country.name.ar : country.name.en}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError
                    errors={[{ message: translateError(errors.country_ids) }]}
                  />
                </Field>
              )}
            />
          </div>

        {/* Content Section (AR/EN) */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Arabic Content */}
            <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
              <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                {t("arabic")}
              </div>
              <Controller
                name="title.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("title_ar")}</FieldLabel>
                    <Input
                      {...field}
                      dir="rtl"
                      placeholder={t("placeholders.title")}
                      className="h-12 rounded-2xl bg-background border-border/50"
                    />
                    <FieldError
                      errors={[{ message: translateError(errors.title?.ar) }]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="description.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("description_ar")}</FieldLabel>
                    <Textarea
                      {...field}
                      dir="rtl"
                      placeholder={t("placeholders.description")}
                      className="min-h-[100px] rounded-2xl bg-background border-border/50 resize-none"
                    />
                    <FieldError
                      errors={[
                        { message: translateError(errors.description?.ar) },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>

            {/* English Content */}
            <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
              <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                {t("english")}
              </div>
              <Controller
                name="title.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("title_en")}</FieldLabel>
                    <Input
                      {...field}
                      dir="ltr"
                      placeholder={t("placeholders.title")}
                      className="h-12 rounded-2xl bg-background border-border/50"
                    />
                    <FieldError
                      errors={[{ message: translateError(errors.title?.en) }]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="description.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("description_en")}</FieldLabel>
                    <Textarea
                      {...field}
                      dir="ltr"
                      placeholder={t("placeholders.description")}
                      className="min-h-[100px] rounded-2xl bg-background border-border/50 resize-none"
                    />
                    <FieldError
                      errors={[
                        { message: translateError(errors.description?.en) },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Highlights (Rich Text) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
            <Controller
              name="highlight_description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4 opacity-40" />{" "}
                    {t("highlight_description")} (AR)
                  </FieldLabel>
                  <div className="min-h-[200px]">
                    <RichTextEditor
                      value={field.value}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        if (field.value !== html) field.onChange(html);
                      }}
                      dir="rtl"
                      placeholder={t("placeholders.highlight")}
                    />
                  </div>
                  <FieldError
                    errors={[
                      {
                        message: translateError(
                          errors.highlight_description?.ar,
                        ),
                      },
                    ]}
                  />
                </Field>
              )}
            />
            <Controller
              name="highlight_description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4 opacity-40" />{" "}
                    {t("highlight_description")} (EN)
                  </FieldLabel>
                  <div className="min-h-[200px]">
                    <RichTextEditor
                      value={field.value}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        if (field.value !== html) field.onChange(html);
                      }}
                      dir="ltr"
                      placeholder={t("placeholders.highlight")}
                    />
                  </div>
                  <FieldError
                    errors={[
                      {
                        message: translateError(
                          errors.highlight_description?.en,
                        ),
                      },
                    ]}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Media Settings (Dual Uploaders) */}
        <div className="space-y-8 border-t pt-8">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">{t("media_settings")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(["ar", "en"] as const).map((locale) => {
              const preview = locale === "ar" ? coverPreviewAr : coverPreviewEn;
              const inputRef = locale === "ar" ? coverInputRefAr : coverInputRefEn;
              return (
                <div key={locale} className="space-y-3">
                  <FieldLabel className="text-xs font-bold uppercase tracking-wider opacity-40">
                    {locale === "ar" ? t("cover_ar") : t("cover_en")}
                  </FieldLabel>
                  <div
                    className={cn(
                      "relative aspect-21/9 rounded-3xl border-2 border-dashed transition-all overflow-hidden bg-muted/10 flex flex-col items-center justify-center cursor-pointer",
                      preview
                        ? "border-primary/20"
                        : "border-border hover:border-primary/40",
                    )}
                    onClick={() => !preview && inputRef.current?.click()}
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                          <Button
                            type="button"
                            size="icon"
                            className="rounded-full h-10 w-10 shadow-xl bg-red-500 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(locale);
                            }}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-8">
                        <ImagePlus className="w-10 h-10 opacity-20" />
                        <p className="text-xs font-bold opacity-30">
                          {t("upload_cover")}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={inputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageChange(locale, e)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <FieldError errors={[{ message: translateError(errors.image) }]} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="image_alt.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("image_alt_ar")}</FieldLabel>
                  <Input
                    {...field}
                    dir="rtl"
                    className="h-12 rounded-2xl bg-background border-border/50"
                  />
                </Field>
              )}
            />
            <Controller
              name="image_alt.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("image_alt_en")}</FieldLabel>
                  <Input
                    {...field}
                    dir="ltr"
                    className="h-12 rounded-2xl bg-background border-border/50"
                  />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="media_url"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>media_url</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-2xl" />
                </Field>
              )}
            />
            <Controller
              name="media_type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>media_type</FieldLabel>
                  <Input
                    {...field}
                    placeholder="video | image"
                    className="h-12 rounded-2xl"
                  />
                </Field>
              )}
            />
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>sort_order</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-12 rounded-2xl"
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="space-y-8 border-t pt-8">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">{t("seo_settings")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Controller
                name="meta_title.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_title")} (AR)</FieldLabel>
                    <Input
                      {...field}
                      dir="rtl"
                      placeholder={t("placeholders.meta_title")}
                      className="h-12 rounded-2xl bg-background border-border/50"
                    />
                    <FieldError
                      errors={[
                        { message: translateError(errors.meta_title?.ar) },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="meta_description.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_description")} (AR)</FieldLabel>
                    <Textarea
                      {...field}
                      dir="rtl"
                      placeholder={t("placeholders.meta_description")}
                      className="h-28 rounded-2xl bg-muted/5 border-border/50 resize-none"
                    />
                    <FieldError
                      errors={[
                        {
                          message: translateError(errors.meta_description?.ar),
                        },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
            <div className="space-y-6">
              <Controller
                name="meta_title.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_title")} (EN)</FieldLabel>
                    <Input
                      {...field}
                      dir="ltr"
                      placeholder={t("placeholders.meta_title")}
                      className="h-12 rounded-2xl bg-background border-border/50"
                    />
                    <FieldError
                      errors={[
                        { message: translateError(errors.meta_title?.en) },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="meta_description.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_description")} (EN)</FieldLabel>
                    <Textarea
                      {...field}
                      dir="ltr"
                      placeholder={t("placeholders.meta_description")}
                      className="h-28 rounded-2xl bg-muted/5 border-border/50 resize-none"
                    />
                    <FieldError
                      errors={[
                        {
                          message: translateError(errors.meta_description?.en),
                        },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="space-y-6 border-t pt-6">
            <h4 className="font-bold text-sm opacity-60">Open Graph / Twitter</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["og_title", "og_description", "twitter_title", "twitter_description"] as const).map(
                (name) => (
                  <div key={name} className="grid grid-cols-2 gap-4 md:col-span-2">
                    <Controller
                      name={`${name}.ar`}
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>{name} (AR)</FieldLabel>
                          <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                        </Field>
                      )}
                    />
                    <Controller
                      name={`${name}.en`}
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>{name} (EN)</FieldLabel>
                          <Input {...field} dir="ltr" className="h-11 rounded-xl" />
                        </Field>
                      )}
                    />
                  </div>
                ),
              )}
              <Controller
                name="og_type"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>og_type</FieldLabel>
                    <Input {...field} placeholder="website" className="h-11 rounded-xl" />
                  </Field>
                )}
              />
              <Controller
                name="twitter_card"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>twitter_card</FieldLabel>
                    <Input
                      {...field}
                      placeholder="summary_large_image"
                      className="h-11 rounded-xl"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});

export default BasicInfoForm;
