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
import RichTextEditor from "@/features/shared/components/editor";
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
  Save,
  Search,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useBasicForm } from "../../hooks/useBasicForm";
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

const basicInfoSchema = z.object({
  slug: z.string().min(1, { message: "validation.slug_required" }),
  country_ids: z
    .array(z.string())
    .min(1, { message: "validation.country_required" }),
  is_active: z.boolean(),
  title: localizedSchema,
  slug: localizedSchema,
  description: localizedSchema,
  highlight_description: localizedEditorSchema,
  meta_title: localizedSchema,
  meta_description: localizedSchema,
  image: z
    .any()
    .refine((val) => !!val, { message: "validation.cover_image_required" }),
  show_footer: z.boolean(),
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  onSuccess?: (id: number) => void;
  initialId?: number;
}

export default function BasicInfoForm({ onSuccess, initialId }: BasicInfoFormProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.form" });
  const { data: countriesData } = useAdminCountries();
  const countries = countriesData?.data ?? [];
  
  const { service, isLoading: isFetching } = useAdminService(initialId);
  const { basicFormMutation, isPending } = useBasicForm(initialId);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
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
      image: null,
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
        image: service.image ?? null,
      });

      if (service.image) {
        setCoverPreview(service.image);
      }
    }
  }, [service]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const onSubmit = async (data: BasicInfoValues) => {
    // Transform highlight_description - handle both string (from API) and object (from editor)
    const getHtml = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") return val; // already HTML string from API
      return val?.html || "";
    };

    const finalData = {
      ...data,
      highlight_description: {
        ar: getHtml(data.highlight_description?.ar),
        en: getHtml(data.highlight_description?.en),
      },
    };
    const res = await basicFormMutation(finalData);
    onSuccess?.(res?.data?.id);
  };

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 animate-in fade-in duration-500 "
    >
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
                      onChange={field.onChange}
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
                      onChange={field.onChange}
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

          {/* Cover */}
          <div className=" space-y-4">
            <FieldLabel className="text-xs font-bold uppercase tracking-wider opacity-40">
              {t("media_url_cover")}
            </FieldLabel>
            <div
              className={cn(
                "relative h-full aspect-21/9 md:aspect-auto rounded-3xl border-2 border-dashed transition-all overflow-hidden bg-muted/10 flex flex-col items-center justify-center cursor-pointer",
                coverPreview
                  ? "border-primary/20"
                  : "border-border hover:border-primary/40",
              )}
              onClick={() => !coverPreview && coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full h-10 w-10 shadow-xl bg-red-500 text-white"
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
                  <p className="text-xs font-bold opacity-30">
                    {t("upload_cover")}
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={coverInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e)}
              />
            </div>
            <FieldError errors={[{ message: translateError(errors.image) }]} />
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
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-fit h-12 rounded-full px-12 font-bold text-base gap-3 shadow-2xl shadow-primary/40 pointer-events-auto hover:scale-105 active:scale-95 transition-all"
      >
        {isPending || isFetching ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Save className="size-5" />
        )}
        {t("save")}
      </Button>
    </form>
  );
}
