import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import { bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import {
  bilingualSectionImageFromApi,
  hasBilingualSectionImage,
} from "@/lib/bilingual-section-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import type { SectionEmbeddedProps } from "../section-embedded-props";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedRichTextField } from "../localized-rich-text-field";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedEditorSchema = z.object({
  ar: z
    .any()
    .refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z.any().optional(),
});

const imageAltSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

const bilingualImageSchema = z
  .object({
    ar: z.any().nullable().optional(),
    en: z.any().nullable().optional(),
  })
  .refine((v) => hasBilingualSectionImage(v), { message: "validation.required" });

const imageTextSchema = z.object({
  title: localizedSchema,
  description: localizedEditorSchema,
  image: bilingualImageSchema,
  image_alt: imageAltSchema,
});

type ImageTextValues = z.infer<typeof imageTextSchema>;

interface ImageTextSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  index: number;
  initialData?: Record<string, unknown>;
}

export default function ImageTextSection({
  initialData,
  embedded,
  onDataChange,
}: ImageTextSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ImageTextValues>({
    resolver: zodResolver(imageTextSchema),
    values: {
      title: (initialData?.title as ImageTextValues["title"]) || { ar: "", en: "" },
      description:
        (initialData?.description as ImageTextValues["description"]) || { ar: null, en: null },
      image: bilingualSectionImageFromApi(initialData?.image, initialData?.images),
      image_alt: bilingualImageAltFromApi(initialData?.image_alt),
    },
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="animate-in fade-in space-y-12 duration-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-[24px] border border-dashed bg-muted/5 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
            {t("arabic")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.ar"
            label={t("sections.fields.title")}
            dir="rtl"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.ar?.message
                ? t(errors.title.ar.message as "validation.required")
                : undefined
            }
          />
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px]">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="rtl"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: errors.description?.ar?.message
                        ? t(errors.description.ar.message as "validation.required")
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>

        <div className="space-y-6 rounded-[24px] border border-dashed bg-muted/5 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
            {t("english")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.en"
            label={t("sections.fields.title")}
            dir="ltr"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.en?.message
                ? t(errors.title.en.message as "validation.required")
                : undefined
            }
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px]">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="ltr"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: errors.description?.en?.message
                        ? t(errors.description.en.message as "validation.required")
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <BilingualSectionImageUpload
            value={field.value}
            onChange={field.onChange}
            errorMessage={
              errors.image?.message
                ? t(errors.image.message as "validation.required")
                : undefined
            }
          />
        )}
      />

      <Controller
        name="image_alt"
        control={control}
        render={({ field }) => (
          <BilingualImageAltFields
            value={field.value}
            onChange={field.onChange}
            keyPrefix="services.form"
          />
        )}
      />
    </div>
  );
}
