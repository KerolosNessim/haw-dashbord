import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import { bilingualSectionImageFromApi } from "@/lib/bilingual-section-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import type { SectionEmbeddedProps } from "../section-embedded-props";
import { LocalizedRichTextField } from "../localized-rich-text-field";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

function editorNotEmpty(val: unknown): boolean {
  if (val == null || val === "") return false;
  if (typeof val === "string") {
    const text = val.replace(/<[^>]*>/g, "").trim();
    return text.length > 0;
  }
  if (typeof val === "object" && val !== null && "isEmpty" in val) {
    return !(val as { isEmpty?: boolean }).isEmpty;
  }
  return false;
}

const localizedEditorSchema = z.object({
  ar: z.any().refine(editorNotEmpty, { message: "validation.required" }),
  en: z.any().optional(),
});

const optionalBilingualImageSchema = z
  .object({
    ar: z.any().nullable().optional(),
    en: z.any().nullable().optional(),
  })
  .optional();

const cardsSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
  image: optionalBilingualImageSchema,
  image_alt: z
    .object({ ar: z.string().optional(), en: z.string().optional() })
    .optional(),
  items: z
    .array(
      z.object({
        title: localizedSchema,
        description: localizedEditorSchema,
      }),
    )
    .min(1),
});

type CardsValues = z.infer<typeof cardsSchema>;

interface CardsSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: any;
}

export default function CardsSection({
  initialData,
  embedded,
  onDataChange,
}: CardsSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CardsValues>({
    resolver: zodResolver(cardsSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      image: bilingualSectionImageFromApi(initialData?.image, initialData?.images),
      image_alt: bilingualImageAltFromApi(initialData?.image_alt),
      items:
        (Array.isArray(initialData?.items) ? initialData.items : null) || [
          { title: { ar: "", en: "" }, description: { ar: null, en: null } },
        ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arabic Main Info */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("arabic")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.ar"
            label={t("sections.fields.title")}
            dir="rtl"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.ar?.message ? t(errors.title.ar.message as any) : undefined
            }
          />
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[160px]">
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
                        ? t(errors.description.ar.message as any)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>

        {/* English Main Info */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("english")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.en"
            label={t("sections.fields.title")}
            dir="ltr"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.en?.message ? t(errors.title.en.message as any) : undefined
            }
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[160px]">
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
                        ? t(errors.description.en.message as any)
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
            required={false}
          />
        )}
      />
      <Controller
        name="image_alt"
        control={control}
        render={({ field }) => (
          <BilingualImageAltFields
            value={field.value ?? { ar: "", en: "" }}
            onChange={field.onChange}
            keyPrefix="services.form"
          />
        )}
      />

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          {t("sections.types.offerings")}
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative group p-6 rounded-[32px] border bg-card/50 space-y-8 animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-center">
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Card #{index + 1}
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg hover:scale-110 transition-all"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>


                {/* Localized Card Title */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <LocalizedRichTextField
                        control={control}
                        name={`items.${index}.title.ar`}
                        label={`${t("arabic")} - ${t("sections.fields.title")}`}
                        dir="rtl"
                        minHeightClass="min-h-[100px]"
                        labelClassName="text-[10px] uppercase opacity-40"
                      />
                      <Controller
                        name={`items.${index}.description.ar`}
                        control={control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase opacity-40">
                              {t("arabic")} - Content
                            </FieldLabel>
                            <div className="min-h-[150px]">
                              <RichTextEditor
                                value={field.value}
                                onChange={(val) => {
                                  const html = editorOnChangeToHtml(val);
                                  if (field.value !== html) field.onChange(html || null);
                                }}
                                dir="rtl"
                                placeholder={t("placeholders.description")}
                              />
                            </div>
                          </Field>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <LocalizedRichTextField
                        control={control}
                        name={`items.${index}.title.en`}
                        label={`${t("english")} - ${t("sections.fields.title")}`}
                        dir="ltr"
                        minHeightClass="min-h-[100px]"
                        labelClassName="text-[10px] uppercase opacity-40"
                      />
                      <Controller
                        name={`items.${index}.description.en`}
                        control={control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase opacity-40">
                              {t("english")} - Content
                            </FieldLabel>
                            <div className="min-h-[150px]">
                              <RichTextEditor
                                value={field.value}
                                onChange={(val) => {
                                  const html = editorOnChangeToHtml(val);
                                  if (field.value !== html) field.onChange(html || null);
                                }}
                                dir="ltr"
                                placeholder={t("placeholders.description")}
                              />
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="rounded-[32px] border-dashed h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all border-2"
            onClick={() =>
              append({
                title: { ar: "", en: "" },
                description: { ar: null, en: null },
              })
            }
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest opacity-60">
              {t("sections.fields.add_item")}
            </span>
          </Button>
        </div>
      </div>

    </div>
  );
}
