import { SmartSlugField } from "@/components/form/smart-slug-field";
import { FormImageField } from "@/components/form/form-image-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { useCreateSolutionSingle } from "@/features/solutions/hooks/useCreateSolutionSingle";
import { useUpdateSolutionSingle } from "@/features/solutions/hooks/useUpdateSolutionSingle";
import type { SolutionFeature } from "@/features/solutions/types";
import { solutionImageAltFromApi } from "@/features/solutions/services/solution-singles-api";
import { emptyBilingualImageAlt, type BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { AlignLeft, Link as LinkIcon, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const schema = z.object({
  title_ar: z.string().min(1, { message: "validation.required" }),
  title_en: z.string().optional().default(""),
  des_ar: z.string().min(1, { message: "validation.required" }),
  des_en: z.string().optional().default(""),
  slug_ar: z.string().min(1, { message: "validation.required" }),
  slug_en: z.string().optional().default(""),
  is_active: z.boolean(),
  image: z.any().optional(),
});

export type SolutionSingleFormValues = z.infer<typeof schema>;

function normalizeSlug(feature: SolutionFeature | null): { ar: string; en: string } {
  if (!feature?.slug) return { ar: "", en: "" };
  const slug = feature.slug;
  if (typeof slug === "object" && slug !== null && "ar" in slug && "en" in slug) {
    return { ar: String(slug.ar ?? ""), en: String(slug.en ?? "") };
  }
  if (typeof slug === "string") {
    return { ar: slug, en: slug };
  }
  return { ar: "", en: "" };
}

type SolutionSingleFormProps = {
  mode: "create" | "edit";
  initial?: SolutionFeature | null;
  onSaved?: () => void;
};

export default function SolutionSingleForm({ mode, initial = null, onSaved }: SolutionSingleFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "solutions.dialog" });
  const { t: contentT } = useTranslation("translation", { keyPrefix: "solutions.content" });
  const { t: commonT } = useTranslation("translation");
  const { createMutation, isPending: isCreating } = useCreateSolutionSingle();
  const { updateMutation, isPending: isUpdating } = useUpdateSolutionSingle();
  const isPending = isCreating || isUpdating;
  const [imageAlt, setImageAlt] = useState<BilingualImageAlt>(emptyBilingualImageAlt);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SolutionSingleFormValues>({
    resolver: zodResolver(schema) as Resolver<SolutionSingleFormValues>,
    defaultValues: {
      title_ar: "",
      title_en: "",
      des_ar: "",
      des_en: "",
      slug_ar: "",
      slug_en: "",
      is_active: true,
      image: null,
    },
  });

  const watchTitleAr = watch("title_ar");
  const watchTitleEn = watch("title_en");

  useEffect(() => {
    if (mode === "edit" && initial) {
      const slug = normalizeSlug(initial);
      reset({
        title_ar: initial.title?.ar ?? "",
        title_en: initial.title?.en ?? "",
        des_ar: initial.description?.ar ?? "",
        des_en: initial.description?.en ?? "",
        slug_ar: slug.ar,
        slug_en: slug.en,
        is_active: initial.is_active !== false,
        image: initial.image ?? null,
      });
      setImageAlt(solutionImageAltFromApi((initial as { image_alt?: unknown }).image_alt));
      return;
    }

    if (mode === "create") {
      setImageAlt(emptyBilingualImageAlt());
      reset({
        title_ar: "",
        title_en: "",
        des_ar: "",
        des_en: "",
        slug_ar: "",
        slug_en: "",
        is_active: true,
        image: null,
      });
    }
  }, [mode, initial, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const onSubmit = async (data: SolutionSingleFormValues) => {
    const payload = {
      title: { ar: data.title_ar, en: data.title_en },
      description: { ar: data.des_ar, en: data.des_en },
      slug: { ar: data.slug_ar, en: data.slug_en },
      is_active: data.is_active,
      image_alt: imageAlt,
    };
    const imageFile = data.image instanceof File ? data.image : null;

    try {
      if (mode === "create") {
        await createMutation({ payload, imageFile });
      } else if (initial?.id != null) {
        await updateMutation({ id: initial.id, payload, imageFile });
      }
      onSaved?.();
    } catch {
      /* toast in hook */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 rounded-[32px] border bg-white p-8 shadow-sm lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Controller
            name="image"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormImageField
                inputId={`solution-page-image-${mode}`}
                label={contentT("image")}
                value={value}
                onChange={onChange}
                emptyHint={contentT("upload_image")}
                aspectClassName="aspect-square"
                disabled={isPending}
                imageAlt={imageAlt}
                onImageAltChange={setImageAlt}
                altKeyPrefix="solutions.content"
              />
            )}
          />
        </div>

        <div className="space-y-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">(AR) {contentT("feature_title")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                  <FieldError errors={[{ message: translateError(errors.title_ar?.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="title_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{contentT("feature_title")} (EN)</FieldLabel>
                  <Input {...field} className="h-11 rounded-xl" />
                  <FieldError errors={[{ message: translateError(errors.title_en?.message) }]} />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SmartSlugField<SolutionSingleFormValues>
              control={control}
              name="slug_ar"
              slugLocale="ar"
              titleEn={watchTitleAr ?? ""}
              trigger={trigger}
              label={
                <span className="flex items-center gap-2 text-sm font-bold">
                  <LinkIcon className="h-3 w-3" />
                  {contentT("slug_ar")}
                </span>
              }
              slugPrefix={<span className="hidden sm:inline">{contentT("slug_prefix")}</span>}
              errorMessage={translateError(errors.slug_ar?.message)}
              inputClassName="h-11 rounded-xl"
            />
            <SmartSlugField<SolutionSingleFormValues>
              control={control}
              name="slug_en"
              slugLocale="en"
              titleEn={watchTitleEn ?? ""}
              trigger={trigger}
              label={
                <span className="flex items-center gap-2 text-sm font-bold">
                  <LinkIcon className="h-3 w-3" />
                  {contentT("slug_en")}
                </span>
              }
              slugPrefix={<span className="hidden sm:inline">{contentT("slug_prefix")}</span>}
              errorMessage={translateError(errors.slug_en?.message)}
              inputClassName="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold flex items-center gap-2">
                    <AlignLeft className="h-3.5 w-3.5 text-primary" />
                    (AR) {contentT("feature_description")}
                  </FieldLabel>
                  <RichTextEditor
                    dir="rtl"
                    value={field.value}
                    placeholder={contentT("feature_description")}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      field.onChange(html);
                    }}
                  />
                  <FieldError errors={[{ message: translateError(errors.des_ar?.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="des_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold flex items-center gap-2">
                    <AlignLeft className="h-3.5 w-3.5 text-primary" />
                    {contentT("feature_description")} (EN)
                  </FieldLabel>
                  <RichTextEditor
                    dir="ltr"
                    value={field.value}
                    placeholder={contentT("feature_description")}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      field.onChange(html);
                    }}
                  />
                  <FieldError errors={[{ message: translateError(errors.des_en?.message) }]} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/10 px-4 py-3">
                <FieldLabel className="text-sm font-bold">{t("is_active")}</FieldLabel>
                <Switch checked={field.value} onCheckedChange={field.onChange} dir="ltr" disabled={isPending} />
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="rounded-xl gap-2 font-bold">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t("save")}
      </Button>
    </form>
  );
}
