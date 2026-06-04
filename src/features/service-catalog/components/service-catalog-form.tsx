import { FormImageField } from "@/components/form/form-image-field";
import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSaveServiceCatalog } from "@/features/service-catalog/hooks/useSaveServiceCatalog";
import { useResourcePermissions } from "@/features/permissions/hooks/useResourcePermissions";
import type { ServiceCatalogFormValues } from "@/features/service-catalog/types";
import RichTextEditor from "@/features/shared/components/editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Languages, Link as LinkIcon, Save } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localizedSlugRequired } from "@/lib/zod-localized-slug";
import * as z from "zod";

const localizedRequired = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedOptional = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

const serviceCatalogSchema = z.object({
  title: localizedRequired,
  subtitle: localizedOptional,
  description: localizedRequired,
  slug: localizedSlugRequired,
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

type FormShape = z.infer<typeof serviceCatalogSchema>;

function richEditorHtml(value: unknown): string {
  const html = (value as { html?: unknown })?.html;
  return typeof html === "string" ? html : "";
}

function defaultValues(): ServiceCatalogFormValues {
  return {
    title: { ar: "", en: "" },
    subtitle: { ar: "", en: "" },
    description: { ar: "", en: "" },
    slug: { ar: "", en: "" },
    sort_order: 0,
    is_active: true,
  };
}

type ServiceCatalogFormProps = {
  mode: "create" | "edit";
  itemId?: string;
  initialValues?: ServiceCatalogFormValues | null;
  initialCoverUrl?: string | null;
  isInitialLoading?: boolean;
};

export default function ServiceCatalogForm({
  mode,
  itemId,
  initialValues,
  initialCoverUrl,
  isInitialLoading,
}: ServiceCatalogFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "service_catalog.form" });
  const { t: commonT } = useTranslation("translation");
  const { saveMutation, isPending } = useSaveServiceCatalog(mode, itemId);
  const catalogPerms = useResourcePermissions("service-catalog");
  const canSave = mode === "create" ? catalogPerms.create : catalogPerms.update;
  const coverInputId = useId();
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(serviceCatalogSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title,
        subtitle: initialValues.subtitle,
        description: initialValues.description,
        slug: initialValues.slug ?? { ar: "", en: "" },
        sort_order: initialValues.sort_order ?? 0,
        is_active: initialValues.is_active ?? true,
      });
      setCoverFile(null);
    }
  }, [initialValues, reset]);

  const coverPreviewValue: File | string | null =
    coverFile ?? (initialCoverUrl?.trim() ? initialCoverUrl : null);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);
  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");

  const onSubmit = (data: FormShape) => {
    const payload: ServiceCatalogFormValues = {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      slug: { ar: data.slug.ar.trim(), en: data.slug.en.trim() },
      sort_order: data.sort_order,
      is_active: data.is_active,
    };
    void saveMutation({ values: payload, imageFile: coverFile });
  };

  if (isInitialLoading && mode === "edit") {
    return (
      <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in space-y-10 duration-500">
      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Languages className="h-5 w-5" />
          <h2 className="text-lg font-bold">{t("basic_section")}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("title_ar")}</FieldLabel>
                <Input {...field} className="rounded-xl" dir="rtl" />
                <FieldError>{translateError(errors.title?.ar?.message)}</FieldError>
              </Field>
            )}
          />
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("title_en")}</FieldLabel>
                <Input {...field} className="rounded-xl" dir="ltr" />
                <FieldError>{translateError(errors.title?.en?.message)}</FieldError>
              </Field>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            name="subtitle.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("subtitle_ar")}</FieldLabel>
                <Input {...field} className="rounded-xl" dir="rtl" />
                <FieldError>{translateError(errors.subtitle?.ar?.message)}</FieldError>
              </Field>
            )}
          />
          <Controller
            name="subtitle.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("subtitle_en")}</FieldLabel>
                <Input {...field} className="rounded-xl" dir="ltr" />
                <FieldError>{translateError(errors.subtitle?.en?.message)}</FieldError>
              </Field>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SmartSlugField<FormShape>
            control={control}
            name="slug.ar"
            slugLocale="ar"
            titleEn={watchTitleAr ?? ""}
            trigger={trigger}
            label={
              <span className="flex items-center gap-2 font-bold">
                <LinkIcon className="h-3 w-3" />
                {t("slug_ar")}
              </span>
            }
            placeholder={t("slug_placeholder_ar")}
            errorMessage={translateError(errors.slug?.ar?.message)}
            inputClassName="rounded-xl"
            syncFromTitleWhenLocked={mode === "create"}
          />
          <SmartSlugField<FormShape>
            control={control}
            name="slug.en"
            slugLocale="en"
            titleEn={watchTitleEn ?? ""}
            trigger={trigger}
            label={
              <span className="flex items-center gap-2 font-bold">
                <LinkIcon className="h-3 w-3" />
                {t("slug_en")}
              </span>
            }
            placeholder={t("slug_placeholder")}
            errorMessage={translateError(errors.slug?.en?.message)}
            inputClassName="rounded-xl"
            syncFromTitleWhenLocked={mode === "create"}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            name="sort_order"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sort_order")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  className="rounded-xl"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </Field>
            )}
          />
          <div className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 self-end">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                  />
                  {t("is_active")}
                </label>
              )}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("description_ar")}</FieldLabel>
                <RichTextEditor
                  dir="rtl"
                  value={field.value}
                  placeholder={t("description_ar")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />
                <FieldError>{translateError(errors.description?.ar?.message)}</FieldError>
              </Field>
            )}
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("description_en")}</FieldLabel>
                <RichTextEditor
                  dir="ltr"
                  value={field.value}
                  placeholder={t("description_en")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />
                <FieldError>{translateError(errors.description?.en?.message)}</FieldError>
              </Field>
            )}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <ImageIcon className="h-5 w-5" />
          <h2 className="text-lg font-bold">{t("image_section")}</h2>
        </div>
        <FormImageField
          inputId={coverInputId}
          label={t("image")}
          previewValue={coverPreviewValue}
          onFileChange={setCoverFile}
          emptyHint={t("image_hint")}
        />
      </div>

      {canSave ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-12 gap-2 rounded-full px-10 font-bold"
          >
            <Save className="h-5 w-5" />
            {mode === "create" ? t("create") : t("save")}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
