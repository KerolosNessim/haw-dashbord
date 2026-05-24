import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Globe,
  Save,
  Image as ImageIcon,
  Search,
  Info,
  Settings2,
  FileText,
  Trash2,
  Plus,
  Link as LinkIcon,
  Share2,
  EyeOff,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Controller, useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SmartSlugField } from "@/components/form/smart-slug-field";
import RichTextEditor from "@/features/shared/components/editor";
import { useBlogCategories } from "@/features/blog-categories/hooks/useBlogCategories";
import { blogSchema } from "@/features/blogs/blog-form-schema";
import type { BlogFormValues } from "@/features/blogs/blog-form-schema";
import { useCreateBlog } from "@/features/blogs/hooks/useCreateBlog";
import { useUpdateBlog } from "@/features/blogs/hooks/useUpdateBlog";

type Mode = "create" | "edit";

interface BlogFormProps {
  mode: Mode;
  blogId?: string | number;
  initialValues?: BlogFormValues | null;
  initialImageUrl?: string | null;
  isInitialLoading?: boolean;
}

/** SEO snippet length hints (best-effort guidance, not enforced). */
function CharCounter({ current, limit }: { current: number; limit: number }) {
  return (
    <span
      className={`font-mono text-[10px] ${current > limit ? "text-destructive" : "text-muted-foreground"}`}
    >
      {current}/{limit}
    </span>
  );
}

const DEFAULT_VALUES: BlogFormValues = {
  title: { ar: "", en: "" },
  subtitle: { ar: "", en: "" },
  description: { ar: "", en: "" },
  content: { ar: "", en: "" },
  faq: { ar: "", en: "" },
  publisher_name: "",
  tags: "",
  category_id: "",
  image_alt: { ar: "", en: "" },
  is_active: true,
  is_searchable: true,
  status: "draft",
  published_at: "",
  slug: { ar: "", en: "" },
  canonical_url: "",
  meta_title: { ar: "", en: "" },
  meta_description: { ar: "", en: "" },
};

function articleLangTabFromErrors(errors: FieldErrors<BlogFormValues>): "ar" | "en" | null {
  if (errors.title?.ar?.message || errors.description?.ar?.message || errors.content?.ar?.message)
    return "ar";
  if (errors.title?.en?.message || errors.description?.en?.message || errors.content?.en?.message)
    return "en";
  return null;
}

function firstResolvedBlogValidationMessage(
  errors: FieldErrors<BlogFormValues>,
  translateKey: (key: string) => string,
): string | null {
  const candidates = [
    errors.slug?.ar?.message,
    errors.slug?.en?.message,
    errors.category_id?.message as string | undefined,
    errors.publisher_name?.message as string | undefined,
    errors.title?.ar?.message,
    errors.title?.en?.message,
    errors.description?.ar?.message,
    errors.description?.en?.message,
    errors.content?.ar?.message,
    errors.content?.en?.message,
    errors.canonical_url?.message as string | undefined,
  ];
  for (const m of candidates) {
    if (typeof m === "string" && m.trim()) return translateKey(m);
  }
  return null;
}

export default function BlogForm({
  mode,
  blogId,
  initialValues,
  initialImageUrl,
  isInitialLoading,
}: BlogFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blogs.form" });
  const { t: commonT, i18n } = useTranslation("translation");
  const { t: apiT } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { createBlogMutation, isPending: isCreating } = useCreateBlog();
  const { updateBlogMutation, isPending: isUpdating } = useUpdateBlog(blogId);
  const isPending = mode === "create" ? isCreating : isUpdating;

  const { data: blogCategories = [], isLoading: categoriesLoading } = useBlogCategories();
  const catLabel = (nameAr: string, nameEn: string) =>
    i18n.language.startsWith("ar") ? nameAr || nameEn : nameEn || nameAr;

  const [articleLangTab, setArticleLangTab] = useState<"ar" | "en">(() =>
    i18n.language.startsWith("ar") ? "ar" : "en",
  );

  const [faqLangTab, setFaqLangTab] = useState<"ar" | "en">(() =>
    i18n.language.startsWith("ar") ? "ar" : "en",
  );

  const [faqExpanded, setFaqExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema) as Resolver<BlogFormValues>,
    defaultValues: DEFAULT_VALUES,
    shouldFocusError: true,
  });

  useEffect(() => {
    const lang = i18n.language.startsWith("ar") ? "ar" : "en";
    setArticleLangTab(lang);
    setFaqLangTab(lang);
  }, [i18n.language]);

  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");

  const [preview, setPreview] = useState<string | null>(initialImageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  /** Radix Select shows no value until items exist; categories often load after blog detail. */
  useEffect(() => {
    if (mode !== "edit" || categoriesLoading || blogCategories.length === 0) return;
    const id = String(initialValues?.category_id ?? "").trim();
    if (!id) return;
    if (!blogCategories.some((c) => String(c.id) === id)) return;
    setValue("category_id", id, { shouldDirty: false, shouldValidate: false });
  }, [blogCategories, categoriesLoading, initialValues?.category_id, mode, setValue]);

  useEffect(() => {
    if (initialImageUrl && !imageFile) setPreview(initialImageUrl);
  }, [initialImageUrl, imageFile]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    }
    e.target.value = "";
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return mode === "edit" && initialImageUrl ? initialImageUrl : null;
    });
  };

  const onSubmit = async (data: BlogFormValues) => {
    try {
      if (mode === "create") await createBlogMutation({ values: data, imageFile });
      else await updateBlogMutation({ values: data, imageFile });
    } catch {
      /* Toasts handled in mutation onError */
    }
  };

  const onValidationInvalid = (errs: FieldErrors<BlogFormValues>) => {
    const tab = articleLangTabFromErrors(errs);
    if (tab) setArticleLangTab(tab);
    const msg = firstResolvedBlogValidationMessage(errs, commonT);
    toast.error(msg ?? t("submit_validation_hint"));
    requestAnimationFrame(() => {
      if (articleLangTabFromErrors(errs)) {
        document.getElementById("blog-article-editor-anchor")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (errs.slug?.ar?.message ?? errs.slug?.en?.message) {
        document
          .querySelector('[data-slot="seo-advanced-anchor"]')
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  if (isInitialLoading && mode === "edit") {
    return (
      <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">
        {apiT("loading")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onValidationInvalid)}
      className="duration-700 animate-in fade-in slide-in-from-bottom-4 space-y-10"
      noValidate
    >
      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-8">
          {/* ── Basic Info ─────────────────────────────────────────────────── */}
          <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">{t("basic_info")}</h2>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <Controller
                name="subtitle.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("subtitle_ar")}</FieldLabel>
                    <Input
                      {...field}
                      dir="rtl"
                      className="h-12 rounded-2xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                  </Field>
                )}
              />
              <Controller
                name="subtitle.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("subtitle_en")}</FieldLabel>
                    <Input
                      {...field}
                      dir="ltr"
                      className="h-12 rounded-2xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("category")}</FieldLabel>
                    <Select
                      key={`blog-category-select-${blogCategories.length}-${String(field.value ?? "").trim()}`}
                      disabled={categoriesLoading}
                      onValueChange={field.onChange}
                      value={
                        String(field.value ?? "").trim() !== ""
                          ? String(field.value).trim()
                          : undefined
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-muted/10">
                        <SelectValue placeholder={t("category_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {blogCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {catLabel(c.nameAr, c.nameEn)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={[
                        {
                          message: errors.category_id?.message
                            ? commonT(errors.category_id.message)
                            : undefined,
                        },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="publisher_name"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("publisher")}</FieldLabel>
                    <Input
                      {...field}
                      className="h-12 rounded-2xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                    <FieldError
                      errors={[
                        {
                          message: errors.publisher_name?.message
                            ? commonT(errors.publisher_name.message)
                            : undefined,
                        },
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("tags")}</FieldLabel>
                    <Input
                      {...field}
                      placeholder={t("tags_hint")}
                      className="h-12 rounded-2xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* ── Content Editor ─────────────────────────────────────────────── */}
          <div
            id="blog-article-editor-anchor"
            className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm"
          >
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{t("content_editor")}</h2>
              </div>
            </div>

            <Tabs
              value={articleLangTab}
              onValueChange={(v) => setArticleLangTab(v === "en" ? "en" : "ar")}
              className="w-full"
              dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}
            >
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/20">
                <TabsTrigger value="ar" className="rounded-xl font-bold">
                  {t("tab_ar")}
                </TabsTrigger>
                <TabsTrigger value="en" className="rounded-xl font-bold">
                  {t("tab_en")}
                </TabsTrigger>
              </TabsList>

              {(["ar", "en"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="mt-6 space-y-6">
                  <Controller
                    name={lang === "ar" ? "title.ar" : "title.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>
                          {lang === "ar" ? t("title_ar") : t("title_en")}
                          {lang === "en" ? (
                            <span className="ms-1 font-normal text-muted-foreground">
                              {t("optional_suffix")}
                            </span>
                          ) : null}
                        </FieldLabel>
                        <Input
                          {...field}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          className="h-12 rounded-2xl border-border/40 bg-muted/10 focus:bg-white"
                        />
                        <FieldError
                          errors={[
                            {
                              message:
                                lang === "ar"
                                  ? errors.title?.ar?.message
                                    ? commonT(errors.title.ar.message)
                                    : undefined
                                  : errors.title?.en?.message
                                    ? commonT(errors.title.en.message)
                                    : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={lang === "ar" ? "description.ar" : "description.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>
                          {lang === "ar" ? t("description_ar") : t("description_en")}
                          {lang === "en" ? (
                            <span className="ms-1 font-normal text-muted-foreground">
                              {t("optional_suffix")}
                            </span>
                          ) : null}
                        </FieldLabel>
                        <RichTextEditor
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          value={field.value}
                          placeholder={t("description_excerpt_placeholder")}
                          onChange={(val: unknown) => {
                            const html = (val as { html?: string })?.html ?? "";
                            field.onChange(typeof html === "string" ? html : "");
                          }}
                        />
                        <FieldError
                          errors={[
                            {
                              message:
                                lang === "ar"
                                  ? errors.description?.ar?.message
                                    ? commonT(errors.description.ar.message)
                                    : undefined
                                  : errors.description?.en?.message
                                    ? commonT(errors.description.en.message)
                                    : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={lang === "ar" ? "content.ar" : "content.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>
                          {lang === "ar" ? t("content_ar") : t("content_en")}
                          {lang === "en" ? (
                            <span className="ms-1 font-normal text-muted-foreground">
                              {t("optional_suffix")}
                            </span>
                          ) : null}
                        </FieldLabel>
                        <RichTextEditor
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          value={field.value}
                          placeholder={lang === "ar" ? t("content_ar") : t("content_en")}
                          onChange={(val: unknown) => {
                            const html = (val as { html?: string })?.html ?? "";
                            field.onChange(typeof html === "string" ? html : "");
                          }}
                        />
                        <FieldError
                          errors={[
                            {
                              message:
                                lang === "ar"
                                  ? errors.content?.ar?.message
                                    ? commonT(errors.content.ar.message)
                                    : undefined
                                  : errors.content?.en?.message
                                    ? commonT(errors.content.en.message)
                                    : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* ── FAQ Editor ─────────────────────────────────────────────────── */}
          <div
            id="blog-faq-editor-anchor"
            className="space-y-0 rounded-[32px] border bg-white shadow-sm overflow-hidden"
          >
            {/* Collapsible header */}
            <button
              type="button"
              onClick={() => setFaqExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3 p-8 text-start hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t("faq_section_title", { defaultValue: "FAQ" })}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("faq_section_hint", { defaultValue: "Frequently asked questions — supports rich formatting" })}
                  </p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border bg-muted/10 text-muted-foreground shrink-0">
                {faqExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Collapsible body */}
            {faqExpanded && (
              <div className="px-8 pb-8 space-y-6 border-t pt-6">
                <Tabs
                  value={faqLangTab}
                  onValueChange={(v) => setFaqLangTab(v === "en" ? "en" : "ar")}
                  className="w-full"
                  dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}
                >
                  <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/20">
                    <TabsTrigger value="ar" className="rounded-xl font-bold">
                      {t("tab_ar")}
                    </TabsTrigger>
                    <TabsTrigger value="en" className="rounded-xl font-bold">
                      {t("tab_en")}
                    </TabsTrigger>
                  </TabsList>

                  {(["ar", "en"] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="mt-6 space-y-6">
                      <Controller
                        name={lang === "ar" ? "faq.ar" : "faq.en"}
                        control={control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>
                              {lang === "ar"
                                ? t("faq_label_ar", { defaultValue: "FAQ (Arabic)" })
                                : t("faq_label_en", { defaultValue: "FAQ (English)" })}
                              {lang === "en" ? (
                                <span className="ms-1 font-normal text-muted-foreground">
                                  {t("optional_suffix")}
                                </span>
                              ) : null}
                            </FieldLabel>
                            <p className="text-[11px] text-muted-foreground -mt-1 mb-1">
                              {lang === "ar"
                                ? t("faq_hint_ar", {
                                    defaultValue:
                                      "استخدم العناوين للأسئلة والفقرات للأجوبة. يدعم التنسيق الغني.",
                                  })
                                : t("faq_hint_en", {
                                    defaultValue:
                                      "Use headings for questions and paragraphs for answers. Rich formatting supported.",
                                  })}
                            </p>
                            <RichTextEditor
                              dir={lang === "ar" ? "rtl" : "ltr"}
                              value={field.value}
                              placeholder={
                                lang === "ar"
                                  ? t("faq_placeholder_ar", {
                                      defaultValue: "أضف الأسئلة والأجوبة هنا…",
                                    })
                                  : t("faq_placeholder_en", {
                                      defaultValue: "Add questions and answers here…",
                                    })
                              }
                              onChange={(val: unknown) => {
                                const html = (val as { html?: string })?.html ?? "";
                                field.onChange(typeof html === "string" ? html : "");
                              }}
                            />
                            <FieldError
                              errors={[
                                {
                                  message:
                                    lang === "ar"
                                      ? (errors as any).faq?.ar?.message
                                        ? commonT((errors as any).faq.ar.message)
                                        : undefined
                                      : (errors as any).faq?.en?.message
                                        ? commonT((errors as any).faq.en.message)
                                        : undefined,
                                },
                              ]}
                            />
                          </Field>
                        )}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>

          {/* ── SEO Advanced ────────────────────────────────────────────────── */}
          <div
            data-slot="seo-advanced-anchor"
            className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm"
          >
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">{t("seo_advanced")}</h2>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:*:min-w-0">
              <SmartSlugField<BlogFormValues>
                control={control}
                name="slug.ar"
                slugLocale="ar"
                titleEn={watchTitleAr ?? ""}
                trigger={trigger}
                label={
                  <span className="flex items-center gap-2">
                    {t("slug_label_ar")}
                    <LinkIcon className="h-3 w-3 shrink-0 opacity-60" />
                  </span>
                }
                slugPrefix={<span className="hidden sm:inline">{t("slug_prefix")}</span>}
                placeholder={t("slug_placeholder_ar")}
                errorMessage={
                  errors.slug?.ar?.message ? commonT(errors.slug.ar.message) : undefined
                }
              />
              <SmartSlugField<BlogFormValues>
                control={control}
                name="slug.en"
                slugLocale="en"
                titleEn={watchTitleEn ?? ""}
                trigger={trigger}
                label={
                  <span className="flex items-center gap-2">
                    {t("slug_label_en")}
                    <LinkIcon className="h-3 w-3 shrink-0 opacity-60" />
                  </span>
                }
                slugPrefix={<span className="hidden sm:inline">{t("slug_prefix")}</span>}
                placeholder={t("slug_placeholder")}
                errorMessage={
                  errors.slug?.en?.message ? commonT(errors.slug.en.message) : undefined
                }
              />

              {(["ar", "en"] as const).map((lang) => (
                <div key={lang} className="space-y-4 rounded-2xl border bg-muted/5 p-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase text-muted-foreground">
                      {t("meta_tags_for", { lang: lang.toUpperCase() })}
                    </Label>
                    <Globe className="h-3 w-3 opacity-30" />
                  </div>

                  <Controller
                    name={lang === "ar" ? "meta_title.ar" : "meta_title.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <div className="mb-1 flex justify-between gap-2">
                          <FieldLabel className="text-xs">{t("meta_title")}</FieldLabel>
                          <CharCounter current={field.value?.length ?? 0} limit={60} />
                        </div>
                        <Input
                          {...field}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          className="h-10 text-sm"
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    name={lang === "ar" ? "meta_description.ar" : "meta_description.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <div className="mb-1 flex justify-between gap-2">
                          <FieldLabel className="text-xs">{t("meta_description")}</FieldLabel>
                          <CharCounter current={field.value?.length ?? 0} limit={160} />
                        </div>
                        <Textarea
                          {...field}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          className="min-h-[80px] resize-none text-sm"
                        />
                      </Field>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border bg-muted/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                  {t("canonical_url")}
                </Label>
                <LinkIcon className="h-3.5 w-3.5 shrink-0 opacity-30" />
              </div>
              <p className="text-start text-[10px] leading-relaxed text-muted-foreground">
                {t("canonical_hint")}
              </p>
              <Controller
                name="canonical_url"
                control={control}
                render={({ field }) => (
                  <Field className="space-y-2">
                    <Input
                      {...field}
                      dir="ltr"
                      placeholder="https://"
                      className="h-12 w-full rounded-2xl border-border/40 bg-background text-sm focus:bg-white md:max-w-3xl"
                    />
                    <FieldError
                      errors={[
                        {
                          message: errors.canonical_url?.message
                            ? commonT(errors.canonical_url.message)
                            : undefined,
                        },
                      ]}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-4">
          <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Settings2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">{t("visibility")}</h2>
            </div>

            <div className="space-y-4">
              <Controller
                name="is_searchable"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 text-sm font-bold">
                        <EyeOff className="h-4 w-4" />
                        {t("indexable")}
                      </Label>
                      <p className="text-[10px] text-muted-foreground">{t("indexable_hint")}</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} dir="ltr" />
                  </div>
                )}
              />

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/10 p-4">
                    <Label className="cursor-pointer text-sm font-bold" htmlFor="is_active">
                      {t("is_active_short")}
                    </Label>
                    <Switch
                      dir="ltr"
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 gap-2"
                    dir="ltr"
                  >
                    {(["draft", "published", "scheduled"] as const).map((status) => (
                      <div
                        key={status}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/10"
                      >
                        <RadioGroupItem value={status} id={`status-${status}`} />
                        <Label
                          htmlFor={`status-${status}`}
                          className="flex-1 cursor-pointer font-medium capitalize"
                        >
                          {commonT(`blogs.status.${status}`)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />

              <Controller
                name="published_at"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm">{t("published_at")}</FieldLabel>
                    <p className="mb-1 text-[10px] text-muted-foreground">
                      {t("published_at_hint")}
                    </p>
                    <Input
                      {...field}
                      type="datetime-local"
                      dir="ltr"
                      className="h-11 rounded-xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">{t("featured_image")}</h2>
            </div>

            <div
              className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed border-primary/20 bg-primary/5 transition-all hover:bg-primary/10"
              onClick={() => document.getElementById("blog-image-input")?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document.getElementById("blog-image-input")?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {preview ? (
                <>
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {commonT("services.form.remove_image")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-primary/60">{t("upload_thumbnail")}</p>
                </div>
              )}
              <input
                type="file"
                id="blog-image-input"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Controller
                name="image_alt.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("image_alt_ar")}</FieldLabel>
                    <Input
                      {...field}
                      dir="rtl"
                      className="h-11 rounded-xl border-border/40 bg-muted/10 focus:bg-white"
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
                      className="h-11 rounded-xl border-border/40 bg-muted/10 focus:bg-white"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-stretch justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4 shrink-0" />
          <span>{t("social_preview_note")}</span>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-14 rounded-full px-12 text-lg font-black shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]"
        >
          <Save className="mr-2 h-5 w-5" />
          {isPending ? apiT("saving") : t("publish_now")}
        </Button>
      </div>
    </form>
  );
}