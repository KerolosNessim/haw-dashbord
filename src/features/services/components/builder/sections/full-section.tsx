import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import {
  bilingualSectionImageFromApi,
  hasBilingualSectionImage,
} from "@/lib/bilingual-section-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import type { SectionEmbeddedProps } from "../section-embedded-props";
import { CardItemOptionsFields } from "../card-item-options-fields";
import { LocalizedRichTextField } from "../localized-rich-text-field";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
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

const fullSectionSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
  image: bilingualImageSchema,
  image_alt: imageAltSchema,
  items: z
    .array(
      z.object({
        title: localizedSchema,
        description: localizedSchema,
        link: z.string().optional().default(""),
        icon: z.string().optional().default(""),
      }),
    )
    .optional(),
});

type FullSectionValues = z.infer<typeof fullSectionSchema>;

interface FullSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: any;
}

export default function FullSection({
  initialData,
  embedded,
  onDataChange,
}: FullSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const {
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FullSectionValues>({
    resolver: zodResolver(fullSectionSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      image: bilingualSectionImageFromApi(initialData?.image, initialData?.images),
      image_alt: bilingualImageAltFromApi(initialData?.image_alt),
      items: initialData?.items || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className=" space-y-4-6">
        {/* Localization Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arabic Content */}
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
                          ? t(errors.description.ar.message as any)
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
          </div>

          {/* English Content */}
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

        <div className="space-y-6">
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <BilingualSectionImageUpload
                value={field.value}
                onChange={field.onChange}
                aspectClass="min-h-[320px]"
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
      </div>

      {/* Additional Items Repeater */}
      <div className="pt-12 border-t space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />{" "}
            {t("sections.fields.items_list")}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full h-10 gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
            onClick={() =>
              append({
                title: { ar: "", en: "" },
                description: { ar: "", en: "" },
                link: "",
                icon: "",
              })
            }
          >
            <Plus className="w-4 h-4" /> {t("sections.fields.add_item")}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative group/item p-8 rounded-[32px] border bg-card/50 shadow-sm space-y-8 animate-in zoom-in-95 duration-500"
            >
              <div className="flex justify-between items-center">
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Step #{index + 1}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-lg hover:scale-110 transition-all"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <CardItemOptionsFields
                link={watch(`items.${index}.link`) ?? ""}
                icon={watch(`items.${index}.icon`) ?? ""}
                onLinkChange={(link) => setValue(`items.${index}.link`, link)}
                onIconChange={(icon) => setValue(`items.${index}.icon`, icon)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Arabic Item */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">
                    {t("arabic")}
                  </div>
                  <LocalizedRichTextField
                    control={control}
                    name={`items.${index}.title.ar`}
                    label={t("sections.fields.title")}
                    dir="rtl"
                    placeholder={t("placeholders.title")}
                    minHeightClass="min-h-[100px]"
                    labelClassName="text-xs"
                  />
                  <Controller
                    name={`items.${index}.description.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.content")}
                        </FieldLabel>
                        <div className="min-h-[120px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                            dir="rtl"
                            placeholder={t("placeholders.description")}
                          />
                        </div>
                      </Field>
                    )}
                  />
                </div>

                {/* English Item */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">
                    {t("english")}
                  </div>
                  <LocalizedRichTextField
                    control={control}
                    name={`items.${index}.title.en`}
                    label={t("sections.fields.title")}
                    dir="ltr"
                    placeholder={t("placeholders.title")}
                    minHeightClass="min-h-[100px]"
                    labelClassName="text-xs"
                  />
                  <Controller
                    name={`items.${index}.description.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.content")}
                        </FieldLabel>
                        <div className="min-h-[120px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
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
          ))}
        </div>
      </div>

    </div>
  );
}
