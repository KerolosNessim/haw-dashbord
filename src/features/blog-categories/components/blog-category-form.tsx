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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartSlugField } from "@/components/form/smart-slug-field";
import RichTextEditor from "@/features/shared/components/editor";
import { useSaveBlogCategory } from "@/features/blog-categories/hooks/useSaveBlogCategory";
import type { BlogCategoryFormValues, BlogCategoryRow } from "@/features/blog-categories/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Search,
  Layers,
  LayoutGrid,
  ArrowUpDown,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localizedSlugRequired } from "@/lib/zod-localized-slug";
import * as z from "zod";

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedSoft = z.object({
  ar: z.string().default(""),
  en: z.string().default(""),
});

const blogCategorySchema = z.object({
  name: localizedRequired,
  description: localizedSoft,
  slug: localizedSlugRequired,
  parent_id: z.string().default(""),
  order_priority: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_searchable: z.boolean().default(true),
  meta_title: localizedSoft,
  meta_description: localizedSoft,
});

type SchemaValues = z.infer<typeof blogCategorySchema>;

function CharCounter({ current, limit }: { current: number; limit: number }) {
  return (
    <span
      className={`font-mono text-[10px] ${current > limit ? "text-destructive" : "text-muted-foreground"}`}
    >
      {current}/{limit}
    </span>
  );
}

const EMPTY_VALUES: BlogCategoryFormValues = {
  name: { ar: "", en: "" },
  description: { ar: "", en: "" },
  slug: { ar: "", en: "" },
  parent_id: "",
  order_priority: 0,
  is_active: true,
  is_featured: false,
  is_searchable: true,
  meta_title: { ar: "", en: "" },
  meta_description: { ar: "", en: "" },
};

type BlogCategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues?: BlogCategoryFormValues | null;
  isInitialLoading?: boolean;
  existingCategories?: BlogCategoryRow[];
};

const ROOT_PARENT_VALUE = "__root__";

export default function BlogCategoryForm({
  mode,
  categoryId,
  initialValues,
  isInitialLoading,
  existingCategories = [],
}: BlogCategoryFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blog_categories.form" });
  const { t: commonT, i18n } = useTranslation("translation");
  const { saveMutation, isPending } = useSaveBlogCategory(mode, categoryId);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SchemaValues>({
    resolver: zodResolver(blogCategorySchema) as Resolver<SchemaValues>,
    defaultValues: EMPTY_VALUES,
  });

  const watchNameAr = watch("name.ar");
  const watchNameEn = watch("name.en");

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        parent_id: initialValues.parent_id ?? "",
        order_priority: initialValues.order_priority ?? 0,
      });
    }
  }, [initialValues, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const catLabel = (row: BlogCategoryRow) =>
    i18n.language.startsWith("ar") ? row.nameAr || row.nameEn : row.nameEn || row.nameAr;

  const parentOptions =
    categoryId ? existingCategories.filter((c) => c.id !== categoryId) : existingCategories;

  const defaultTab = i18n.language.startsWith("ar") ? "ar" : "en";

  const onSubmit = (data: SchemaValues) => {
    const payload: BlogCategoryFormValues = {
      name: data.name,
      description: data.description,
      slug: data.slug,
      parent_id: data.parent_id?.trim() ? data.parent_id.trim() : "",
      order_priority: Number.isFinite(data.order_priority) ? data.order_priority : 0,
      is_active: data.is_active,
      is_featured: data.is_featured,
      is_searchable: data.is_searchable,
      meta_title: { ar: data.meta_title.ar ?? "", en: data.meta_title.en ?? "" },
      meta_description: {
        ar: data.meta_description.ar ?? "",
        en: data.meta_description.en ?? "",
      },
    };
    void saveMutation(payload);
  };

  if (isInitialLoading && mode === "edit") {
    return (
      <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in space-y-8 pb-10 duration-500"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-4">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{t("basic_info")}</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="name.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("name_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-12 rounded-2xl" />
                    <FieldError errors={[{ message: translateError(errors.name?.ar?.message) }]} />
                  </Field>
                )}
              />
              <Controller
                name="name.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("name_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-12 rounded-2xl" />
                    <FieldError errors={[{ message: translateError(errors.name?.en?.message) }]} />
                  </Field>
                )}
              />

              <SmartSlugField<SchemaValues>
                control={control}
                name="slug.ar"
                slugLocale="ar"
                titleEn={watchNameAr ?? ""}
                trigger={trigger}
                syncFromTitleWhenLocked={mode === "create"}
                label={
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" />
                    {t("slug_ar")}
                  </span>
                }
                errorMessage={translateError(errors.slug?.ar?.message)}
                inputClassName="h-12 rounded-2xl"
              />
              <SmartSlugField<SchemaValues>
                control={control}
                name="slug.en"
                slugLocale="en"
                titleEn={watchNameEn ?? ""}
                trigger={trigger}
                syncFromTitleWhenLocked={mode === "create"}
                label={
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" />
                    {t("slug_en")}
                  </span>
                }
                errorMessage={translateError(errors.slug?.en?.message)}
                inputClassName="h-12 rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-4">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{t("category_content")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t("desc_rich_hint")}</p>

            <Tabs defaultValue={defaultTab} className="w-full" dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}>
              <TabsList className="mb-6 grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/20">
                <TabsTrigger value="ar" className="rounded-xl font-bold">
                  {t("tab_ar")}
                </TabsTrigger>
                <TabsTrigger value="en" className="rounded-xl font-bold">
                  {t("tab_en")}
                </TabsTrigger>
              </TabsList>

              {(["ar", "en"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <Controller
                    name={lang === "ar" ? "description.ar" : "description.en"}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{lang === "ar" ? t("description_ar") : t("description_en")}</FieldLabel>
                        <RichTextEditor
                          dir={lang === "ar" ? "rtl" : "ltr"}
                          value={field.value}
                          placeholder={t("desc_placeholder")}
                          onChange={(val: unknown) => {
                            const html = (val as { html?: string })?.html ?? "";
                            field.onChange(typeof html === "string" ? html : "");
                          }}
                        />
                      </Field>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-6 rounded-[32px] border bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-lg font-bold">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              {t("hierarchy")}
            </div>

            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs">{t("parent_category")}</FieldLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === ROOT_PARENT_VALUE ? "" : v)}
                    value={field.value?.trim() ? field.value : ROOT_PARENT_VALUE}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("select_parent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ROOT_PARENT_VALUE}>{t("no_parent")}</SelectItem>
                      {parentOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {catLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="order_priority"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs">{t("display_order")}</FieldLabel>
                  <Input
                    type="number"
                    className="h-11 rounded-xl"
                    value={Number.isFinite(field.value) ? field.value : 0}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = parseInt(v, 10);
                      field.onChange(v === "" || Number.isNaN(n) ? 0 : n);
                    }}
                  />
                </Field>
              )}
            />

            <hr className="opacity-50" />

            <div className="space-y-3">
              {(
                [
                  { key: "is_active" as const, label: t("active_status"), dot: "bg-green-500" },
                  { key: "is_featured" as const, label: t("featured_category"), dot: "bg-blue-500" },
                  { key: "is_searchable" as const, label: t("google_indexing"), dot: "bg-orange-500" },
                ] as const
              ).map((item) => (
                <Controller
                  key={item.key}
                  name={item.key}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-xl border bg-muted/5 p-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${field.value ? item.dot : "bg-gray-300"}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} dir="ltr" />
                    </div>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Search className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-bold">{t("seo_advanced")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {(["ar", "en"] as const).map((lang) => (
            <div key={lang} className="space-y-4 rounded-2xl border bg-muted/5 p-6">
              <p className="text-xs font-black uppercase text-muted-foreground">
                {t("meta_tags_for", { lang: lang.toUpperCase() })}
              </p>

              <Controller
                name={lang === "ar" ? "meta_title.ar" : "meta_title.en"}
                control={control}
                render={({ field }) => (
                  <Field>
                    <div className="mb-1 flex justify-between gap-2">
                      <FieldLabel className="text-xs">{t("meta_title_short")}</FieldLabel>
                      <CharCounter current={field.value?.length ?? 0} limit={60} />
                    </div>
                    <Input
                      {...field}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      className="h-10 rounded-xl text-sm"
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
                      <FieldLabel className="text-xs">{t("meta_description_short")}</FieldLabel>
                      <CharCounter current={field.value?.length ?? 0} limit={160} />
                    </div>
                    <Textarea
                      {...field}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      rows={3}
                      className="resize-none rounded-xl text-sm"
                    />
                  </Field>
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-8">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-14 rounded-full px-16 text-lg font-black shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]"
        >
          <Save className="mr-2 h-5 w-5" />
          {isPending ? t("saving") : t("save_category")}
        </Button>
      </div>
    </form>
  );
}
