import { SmartSlugField } from "@/components/form/smart-slug-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useAdminCountries } from "@/features/countries/hooks/useCountries";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { resolveImagePreviewFromUnknown } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  FileText,
  Globe,
  ImagePlus,
  Layout,
  Monitor,
  Search,
  X,
} from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import {
  normalizeOgType,
  normalizeTwitterCard,
} from "../../constants/social-meta-options";
import { BLOG_SLUG_REDIRECT_CODES } from "@/lib/http-redirect-codes";
import { normalizeServiceTagsFromApi } from "../../lib/service-tags";
import { ServiceTagsField } from "../service-tags-field";
import { useAdminService } from "../../hooks/useAdminService";
import { useServiceFormDraft } from "../../hooks/useServiceFormDraft";
import { deserializeBasicInfoFromDraft } from "../../utils/service-draft-serializer";
import { LocalizedRichTextField } from "./localized-rich-text-field";
import ServiceSocialMetaDialog from "./service-social-meta-dialog";
import { getServiceResourceScope } from "../../services/service-resource-config";
import { slugify, slugifyAr } from "@/lib/slugify";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedEditorSchema = z
  .object({
    ar: z.any().optional(),
    en: z.any().optional(),
  })
  .optional();

const serviceImageSchema = z
  .object({
    ar: z.any().nullable().optional(),
    en: z.any().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.ar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.cover_ar_required",
        path: ["ar"],
      });
    }
    if (!val.en) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.cover_en_required",
        path: ["en"],
      });
    }
  });

const optionalLocalizedSchema = z.object({
  ar: z.string().optional(),
  en: z.string().optional(),
});

const optionalLocalizedEditorSchema = z.object({
  ar: z.any().optional(),
  en: z.any().optional(),
});

const serviceTagInputSchema = z.object({
  name: z.string().default(""),
  index: z.boolean().default(true),
  follow: z.boolean().default(true),
});

const slugRedirectCodeOptional = z.object({
  ar: z
    .string()
    .optional()
    .default("")
    .refine((v) => v === "" || (BLOG_SLUG_REDIRECT_CODES as readonly string[]).includes(v), {
      message: "validation.invalid_redirect_code",
    }),
  en: z
    .string()
    .optional()
    .default("")
    .refine((v) => v === "" || (BLOG_SLUG_REDIRECT_CODES as readonly string[]).includes(v), {
      message: "validation.invalid_redirect_code",
    }),
});

/**
 * A single repeatable content section.
 * Each item has an optional label (used as a section heading in the UI)
 * plus AR/EN rich-text bodies.
 */
const sectionItemSchema = z.object({
  /** Optional user-defined label shown as the section title in the card header */
  label: z.string().optional().default(""),
  ar: z.any().optional(),
  en: z.any().optional(),
});

const optionalSlugSchema = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

const optionalTitleSchema = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

function buildBasicInfoSchema(isAiScope: boolean) {
  return z.object({
    slug: isAiScope ? optionalSlugSchema : localizedSchema,
    slug_redirect_code: slugRedirectCodeOptional,
  country_ids: z.array(z.string()).min(1, { message: "validation.country_required" }),
  package_ids: z.array(z.string()).optional(),
  is_active: z.boolean(),
  title: isAiScope ? optionalTitleSchema : localizedSchema,
  single_page_title: optionalLocalizedEditorSchema.optional(),
  tags: z
    .array(serviceTagInputSchema)
    .default([])
    .transform((rows) =>
      rows
        .map((r) => ({ ...r, name: r.name.trim() }))
        .filter((r) => r.name.length > 0),
    ),
  page_script: z.string().optional().default(""),
  description: localizedSchema,
  highlight_description: localizedEditorSchema,
  /**
   * Repeatable sections — replaces the old single `inside_desc` field.
   * Shape: Array<{ label?: string; ar?: any; en?: any }>
   */
  sections: z.array(sectionItemSchema).optional().default([]),
  meta_title: localizedSchema,
  meta_description: localizedSchema,
  image: serviceImageSchema,
  image_alt: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
  show_footer: z.boolean(),
  og_title: optionalLocalizedSchema.optional(),
  og_description: optionalLocalizedSchema.optional(),
  og_type: z.enum(["website", "article", "product"]).default("website"),
  og_image: z.any().optional(),
  twitter_card: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  twitter_title: optionalLocalizedSchema.optional(),
  twitter_description: optionalLocalizedSchema.optional(),
  twitter_image: z.any().optional(),
  });
}

type BasicInfoSchema = ReturnType<typeof buildBasicInfoSchema>;
export type BasicInfoValues = z.infer<BasicInfoSchema>;
export type SectionItem = z.infer<typeof sectionItemSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickLocalizedFromService(
  service: Record<string, unknown>,
  key: string,
): { ar: string; en: string } {
  const field = service[key];
  if (!field || typeof field !== "object") return { ar: "", en: "" };
  const o = field as { ar?: string; en?: string };
  return { ar: o.ar ?? "", en: o.en ?? "" };
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export interface BasicInfoFormHandle {
  validate: () => Promise<BasicInfoValues | null>;
  openSocialMetaDialog: () => void;
}

interface BasicInfoFormProps {
  initialId?: number;
  embedded?: boolean;
  onBasicDraftChange?: (payload: {
    basic: BasicInfoValues;
    coverPreviewAr: string | null;
    coverPreviewEn: string | null;
  }) => void;
}

const BasicInfoForm = forwardRef<BasicInfoFormHandle, BasicInfoFormProps>(
  function BasicInfoForm({ initialId, embedded, onBasicDraftChange }, ref) {
    const { t, i18n } = useTranslation("translation", { keyPrefix: "services.form" });
    const { t: commonT } = useTranslation("translation", { keyPrefix: "validation" });
    const isAiScope = getServiceResourceScope() === "service_ais";
    const basicInfoSchema = buildBasicInfoSchema(isAiScope);
    const [socialMetaOpen, setSocialMetaOpen] = useState(false);
    const { data: countriesData } = useAdminCountries();
    const countries = countriesData?.data ?? [];
    const { draft, hydrated } = useServiceFormDraft(initialId);
    const restoredDraftRef = useRef(false);
    const onBasicDraftChangeRef = useRef(onBasicDraftChange);
    onBasicDraftChangeRef.current = onBasicDraftChange;

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
        slug_redirect_code: { ar: "", en: "" },
        country_ids: [],
        is_active: true,
        show_footer: true,
        title: { ar: "", en: "" },
        single_page_title: { ar: null, en: null },
        tags: [],
        page_script: "",
        description: { ar: "", en: "" },
        highlight_description: { ar: null, en: null },
        sections: [],
        meta_title: { ar: "", en: "" },
        meta_description: { ar: "", en: "" },
        image: { ar: null, en: null },
        image_alt: { ar: "", en: "" },
        package_ids: [],
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

    // ---------------------------------------------------------------------------
    // Draft restore (create mode)
    // ---------------------------------------------------------------------------
    useEffect(() => {
      if (initialId != null || !hydrated || restoredDraftRef.current || !draft?.basic) return;
      restoredDraftRef.current = true;
      reset(deserializeBasicInfoFromDraft(draft.basic));
      setCoverPreviewAr(draft.coverPreviewAr ?? null);
      setCoverPreviewEn(draft.coverPreviewEn ?? null);
      toast.info(t("draft_restored"));
    }, [initialId, hydrated, draft, reset, t]);

    // ---------------------------------------------------------------------------
    // Populate from API (edit mode)
    // ---------------------------------------------------------------------------
    useEffect(() => {
      if (!hydrated || restoredDraftRef.current) return;
      if (service) {
        const rawSections = (service as { sections?: unknown[] }).sections;
        const sections: SectionItem[] =
          Array.isArray(rawSections) && rawSections.length > 0
            ? rawSections.map((s: any) => ({
                label: s.label ?? "",
                ar: s.ar ?? null,
                en: s.en ?? null,
              }))
            : // Backwards-compat: if the API still returns the old single inside_desc,
              // convert it to one section so nothing is lost
              (() => {
                const oldAr = (service as any).inside_desc?.ar ?? null;
                const oldEn = (service as any).inside_desc?.en ?? null;
                if (oldAr || oldEn) return [{ label: "", ar: oldAr, en: oldEn }];
                return [];
              })();

        const rec = service as Record<string, unknown>;
        const rawRedirect = rec.slug_redirect_code ?? rec.slugRedirectCode;
        const slugRedirect = { ar: "", en: "" };
        if (rawRedirect && typeof rawRedirect === "object") {
          const o = rawRedirect as { ar?: unknown; en?: unknown };
          slugRedirect.ar = String(o.ar ?? "").trim();
          slugRedirect.en = String(o.en ?? "").trim();
        }

        reset({
          slug: { ar: service.slug?.ar ?? "", en: service.slug?.en ?? "" },
          slug_redirect_code: slugRedirect,
          country_ids: service.countries?.map((c: any) => String(c.id)) ?? [],
          is_active: service.is_active ?? true,
          show_footer: service.show_footer ?? true,
          title: { ar: service.title?.ar ?? "", en: service.title?.en ?? "" },
          single_page_title: {
            ar: pickLocalizedFromService(rec, "single_page_title").ar || null,
            en: pickLocalizedFromService(rec, "single_page_title").en || null,
          },
          tags: normalizeServiceTagsFromApi(rec.tags ?? rec.article_tags),
          page_script: String(rec.page_script ?? ""),
          description: {
            ar: service.description?.ar ?? "",
            en: service.description?.en ?? "",
          },
          highlight_description: {
            ar: service.highlight_description?.ar ?? null,
            en: service.highlight_description?.en ?? null,
          },
          sections,
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
          og_title: pickLocalizedFromService(
            service as Record<string, unknown>,
            "og_title",
          ),
          og_description: pickLocalizedFromService(
            service as Record<string, unknown>,
            "og_description",
          ),
          og_type: normalizeOgType((service as { og_type?: string }).og_type),
          og_image: (service as { og_image?: string | null }).og_image ?? null,
          twitter_card: normalizeTwitterCard(
            (service as { twitter_card?: string }).twitter_card,
          ),
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

        setCoverPreviewAr(resolveImagePreviewFromUnknown(service.image?.ar) ?? null);
        setCoverPreviewEn(resolveImagePreviewFromUnknown(service.image?.en) ?? null);
      }
    }, [service, reset, hydrated]);

    // ---------------------------------------------------------------------------
    // Persist draft to local storage
    // ---------------------------------------------------------------------------
    useEffect(() => {
      if (!hydrated) return;
      onBasicDraftChangeRef.current?.({
        basic: getValues(),
        coverPreviewAr,
        coverPreviewEn,
      });
      const subscription = watch(() => {
        onBasicDraftChangeRef.current?.({
          basic: getValues(),
          coverPreviewAr,
          coverPreviewEn,
        });
      });
      return () => subscription.unsubscribe();
    }, [hydrated, watch, getValues, coverPreviewAr, coverPreviewEn]);

    // ---------------------------------------------------------------------------
    // Image handlers
    // ---------------------------------------------------------------------------
    const handleImageChange = (
      locale: "ar" | "en",
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const current = watch("image") ?? { ar: null, en: null };
      setValue("image", { ...current, [locale]: file }, { shouldValidate: true });
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
      setValue("image", { ...current, [locale]: null }, { shouldValidate: true });
      if (locale === "ar") {
        setCoverPreviewAr(null);
        if (coverInputRefAr.current) coverInputRefAr.current.value = "";
      } else {
        setCoverPreviewEn(null);
        if (coverInputRefEn.current) coverInputRefEn.current.value = "";
      }
    };

    // ---------------------------------------------------------------------------
    // Normalize + expose ref
    // ---------------------------------------------------------------------------
    const normalizeValues = (data: BasicInfoValues): BasicInfoValues => {
      const resolvedTitle = isAiScope
        ? {
            ar:
              plainTextFromHtml(data.title?.ar ?? "") ||
              editorOnChangeToHtml(data.single_page_title?.ar) ||
              data.description?.ar ||
              "",
            en:
              plainTextFromHtml(data.title?.en ?? "") ||
              editorOnChangeToHtml(data.single_page_title?.en) ||
              data.description?.en ||
              "",
          }
        : data.title;
      const titleArPlain = plainTextFromHtml(resolvedTitle?.ar ?? "");
      const titleEnPlain = plainTextFromHtml(resolvedTitle?.en ?? "");
      const slug = isAiScope
        ? {
            ar: data.slug.ar?.trim() || slugifyAr(titleArPlain) || slugify(titleEnPlain),
            en: data.slug.en?.trim() || slugify(titleEnPlain),
          }
        : data.slug;

      return {
      ...data,
      slug,
      tags: isAiScope ? [] : data.tags,
      title: {
        ar: editorOnChangeToHtml(resolvedTitle?.ar),
        en: editorOnChangeToHtml(resolvedTitle?.en),
      },
      single_page_title: data.single_page_title
        ? {
            ar: editorOnChangeToHtml(data.single_page_title.ar),
            en: editorOnChangeToHtml(data.single_page_title.en),
          }
        : data.single_page_title,
      highlight_description: isAiScope
        ? { ar: null, en: null }
        : {
        ar: editorOnChangeToHtml(data.highlight_description?.ar),
        en: editorOnChangeToHtml(data.highlight_description?.en),
      },
      sections: (data.sections ?? []).map((s) => ({
        label: s.label ?? "",
        ar: editorOnChangeToHtml(s.ar),
        en: editorOnChangeToHtml(s.en),
      })),
      meta_title: {
        ar: editorOnChangeToHtml(data.meta_title?.ar),
        en: editorOnChangeToHtml(data.meta_title?.en),
      },
      meta_description: {
        ar: editorOnChangeToHtml(data.meta_description?.ar),
        en: editorOnChangeToHtml(data.meta_description?.en),
      },
      og_title: data.og_title
        ? {
            ar: editorOnChangeToHtml(data.og_title.ar),
            en: editorOnChangeToHtml(data.og_title.en),
          }
        : data.og_title,
      og_description: data.og_description
        ? {
            ar: editorOnChangeToHtml(data.og_description.ar),
            en: editorOnChangeToHtml(data.og_description.en),
          }
        : data.og_description,
      twitter_title: data.twitter_title
        ? {
            ar: editorOnChangeToHtml(data.twitter_title.ar),
            en: editorOnChangeToHtml(data.twitter_title.en),
          }
        : data.twitter_title,
      twitter_description: data.twitter_description
        ? {
            ar: editorOnChangeToHtml(data.twitter_description.ar),
            en: editorOnChangeToHtml(data.twitter_description.en),
          }
        : data.twitter_description,
      };
    };

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const valid = await trigger();
        if (!valid) return null;
        return normalizeValues(getValues());
      },
      openSocialMetaDialog: () => setSocialMetaOpen(true),
    }));

    const translateError = (error: unknown) => {
      if (!error || typeof error !== "object") return undefined;
      const message = (error as Record<string, unknown>).message;
      if (!message || typeof message !== "string") return undefined;
      return message.includes("validation.") ? t(message) : message;
    };

    const watchTitleAr = plainTextFromHtml(watch("title.ar") ?? "");
    const watchTitleEn = plainTextFromHtml(watch("title.en") ?? "");

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="p-8 rounded-[32px] border bg-card shadow-sm space-y-12">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 border-b pb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Layout className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{t("basic_info")}</h2>
          </div>

          {/* ── Slug + redirect codes ───────────────────────────────────── */}
          {!isAiScope ? (
          <div className="grid grid-cols-1 gap-6 md:col-span-2 lg:grid-cols-2">
            <div className="space-y-4">
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
              <Controller
                name="slug_redirect_code.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs">{t("slug_redirect_code_label")}</FieldLabel>
                    <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                      {t("slug_redirect_code_hint")}
                    </p>
                    <Select
                      value={field.value === "" ? "__none__" : field.value}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder={t("slug_redirect_code_none")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t("slug_redirect_code_none")}</SelectItem>
                        {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {t(`slug_redirect_code_${code}`, { defaultValue: code })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={[
                        {
                          message: errors.slug_redirect_code?.ar?.message
                            ? commonT(errors.slug_redirect_code.ar.message)
                            : undefined,
                        },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
            <div className="space-y-4">
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
              <Controller
                name="slug_redirect_code.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs">{t("slug_redirect_code_label")}</FieldLabel>
                    <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                      {t("slug_redirect_code_hint")}
                    </p>
                    <Select
                      value={field.value === "" ? "__none__" : field.value}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder={t("slug_redirect_code_none")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t("slug_redirect_code_none")}</SelectItem>
                        {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {t(`slug_redirect_code_${code}`, { defaultValue: code })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={[
                        {
                          message: errors.slug_redirect_code?.en?.message
                            ? commonT(errors.slug_redirect_code.en.message)
                            : undefined,
                        },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
          ) : null}

          {!isAiScope ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-1">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between p-4 rounded-2xl bg-background border border-dashed border-border/50">
                  <FieldLabel className="flex items-center gap-2 m-0 text-sm">
                    <Activity className="w-4 h-4 opacity-40" /> {t("is_active")}
                  </FieldLabel>
                  <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              name="show_footer"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between p-4 rounded-2xl bg-background border border-dashed border-border/50">
                  <FieldLabel className="flex items-center gap-2 m-0 text-sm">
                    <Layout className="w-4 h-4 opacity-40" /> {t("show_footer")}
                  </FieldLabel>
                  <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </div>
          ) : null}

          {/* ── Countries ───────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <Controller
              name="country_ids"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("country")}</FieldLabel>
                  <Combobox value={field.value} onValueChange={field.onChange} multiple>
                    <ComboboxChips className="min-h-12 rounded-2xl bg-background border-border/50 p-2">
                      {Array.isArray(field.value) &&
                        field.value.map((val: string) => {
                          const country = countries.find((c) => String(c.id) === val);
                          const countryName = country
                            ? i18n.language === "ar"
                              ? country.name.ar
                              : country.name.en
                            : val;
                          return (
                            <ComboboxChip key={val} value={val}>
                              {countryName}
                            </ComboboxChip>
                          );
                        })}
                      <ComboboxChipsInput
                        placeholder={field.value.length === 0 ? t("country_placeholder") : ""}
                        className="bg-transparent border-none focus:ring-0"
                      />
                    </ComboboxChips>
                    <ComboboxContent className="w-[--anchor-width]">
                      <ComboboxList>
                        {countries.map((country) => (
                          <ComboboxItem key={country.id} value={String(country.id)}>
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

          {/* ── Title + Description (AR / EN) ───────────────────────────── */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Arabic */}
              <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
                <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                  {t("arabic")}
                </div>
                {!isAiScope ? (
                <Controller
                  name="title.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("title_ar")}</FieldLabel>
                      <div className="min-h-[120px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="rtl"
                          placeholder={t("placeholders.title")}
                        />
                      </div>
                      <FieldError
                        errors={[{ message: translateError(errors.title?.ar) }]}
                      />
                    </Field>
                  )}
                />
                ) : null}
                <Controller
                  name="single_page_title.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("single_page_title_ar")}</FieldLabel>
                      <p className="mb-2 text-[10px] text-muted-foreground">
                        {t("single_page_title_hint")}
                      </p>
                      <div className="min-h-[100px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="rtl"
                          placeholder={t("placeholders.single_page_title")}
                        />
                      </div>
                    </Field>
                  )}
                />
                <Controller
                  name="description.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("description_ar")}</FieldLabel>
                      <div className="min-h-[160px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="rtl"
                          placeholder={t("placeholders.description")}
                        />
                      </div>
                      <FieldError
                        errors={[{ message: translateError(errors.description?.ar) }]}
                      />
                    </Field>
                  )}
                />
              </div>

              {/* English */}
              <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
                <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                  {t("english")}
                </div>
                {!isAiScope ? (
                <Controller
                  name="title.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("title_en")}</FieldLabel>
                      <div className="min-h-[120px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="ltr"
                          placeholder={t("placeholders.title")}
                        />
                      </div>
                      <FieldError
                        errors={[{ message: translateError(errors.title?.en) }]}
                      />
                    </Field>
                  )}
                />
                ) : null}
                <Controller
                  name="single_page_title.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("single_page_title_en")}</FieldLabel>
                      <p className="mb-2 text-[10px] text-muted-foreground">
                        {t("single_page_title_hint")}
                      </p>
                      <div className="min-h-[100px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="ltr"
                          placeholder={t("placeholders.single_page_title")}
                        />
                      </div>
                    </Field>
                  )}
                />
                <Controller
                  name="description.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("description_en")}</FieldLabel>
                      <div className="min-h-[160px]">
                        <RichTextEditor
                          value={field.value}
                          onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                          dir="ltr"
                          placeholder={t("placeholders.description")}
                        />
                      </div>
                      <FieldError
                        errors={[{ message: translateError(errors.description?.en) }]}
                      />
                    </Field>
                  )}
                />
              </div>
            </div>

            {!isAiScope ? (
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <ServiceTagsField value={field.value ?? []} onChange={field.onChange} />
              )}
            />
            ) : null}

            <Controller
              name="page_script"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("page_script_label")}</FieldLabel>
                  <p className="mb-2 text-[11px] text-muted-foreground">{t("page_script_hint")}</p>
                  <Textarea
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={6}
                    placeholder={t("page_script_placeholder")}
                    className="min-h-[120px] rounded-2xl border-border/40 font-mono text-xs"
                  />
                </Field>
              )}
            />

            {/* ── Highlight description ───────────────────────────────── */}
            {!isAiScope ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
              <Controller
                name="highlight_description.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 opacity-40" />
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
                        { message: translateError(errors.highlight_description?.ar) },
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
                      <FileText className="w-4 h-4 opacity-40" />
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
                        { message: translateError(errors.highlight_description?.en) },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
            ) : null}

          </div>

          {/* ── Media ───────────────────────────────────────────────────── */}
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
                            referrerPolicy="no-referrer"
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
                          <p className="text-xs font-bold opacity-30">{t("upload_cover")}</p>
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
                    <FieldError
                      errors={[
                        {
                          message: translateError(
                            (errors.image as { ar?: { message?: string } } | undefined)?.ar,
                          ),
                        },
                      ]}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{t("cover_per_locale_hint")}</p>

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
          </div>

          {/* ── SEO ─────────────────────────────────────────────────────── */}
          <div className="space-y-8 border-t pt-8">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">{t("seo_settings")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <LocalizedRichTextField
                  control={control}
                  name="meta_title.ar"
                  label={`${t("meta_title")} (AR)`}
                  dir="rtl"
                  placeholder={t("placeholders.meta_title")}
                  minHeightClass="min-h-[100px]"
                  errorMessage={translateError(errors.meta_title?.ar)}
                />
                <LocalizedRichTextField
                  control={control}
                  name="meta_description.ar"
                  label={`${t("meta_description")} (AR)`}
                  dir="rtl"
                  placeholder={t("placeholders.meta_description")}
                  errorMessage={translateError(errors.meta_description?.ar)}
                />
              </div>
              <div className="space-y-6">
                <LocalizedRichTextField
                  control={control}
                  name="meta_title.en"
                  label={`${t("meta_title")} (EN)`}
                  dir="ltr"
                  placeholder={t("placeholders.meta_title")}
                  minHeightClass="min-h-[100px]"
                  errorMessage={translateError(errors.meta_title?.en)}
                />
                <LocalizedRichTextField
                  control={control}
                  name="meta_description.en"
                  label={`${t("meta_description")} (EN)`}
                  dir="ltr"
                  placeholder={t("placeholders.meta_description")}
                  errorMessage={translateError(errors.meta_description?.en)}
                />
              </div>
            </div>
          </div>
        </div>

        <ServiceSocialMetaDialog
          open={socialMetaOpen}
          onOpenChange={setSocialMetaOpen}
          control={control}
        />
      </div>
    );
  },
);

export default BasicInfoForm;
