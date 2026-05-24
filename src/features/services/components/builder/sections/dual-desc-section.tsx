import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedRichTextField } from "../localized-rich-text-field";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedEditorSchema = z.object({
  ar: z.any().refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z.any().optional(),
});

const dualDescSchema = z.object({
  title: localizedSchema,
  description: localizedEditorSchema,
  sub_title: localizedSchema.optional(),
  sub_description: localizedEditorSchema.optional(),
});

type DualDescValues = z.infer<typeof dualDescSchema>;

interface DualDescSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: any;
}

export default function DualDescSection({
  initialData,
  embedded,
  onDataChange,
}: DualDescSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const { control, watch, getValues, formState: { errors } } = useForm<DualDescValues>({
    resolver: zodResolver(dualDescSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: null, en: null },
      sub_title: initialData?.sub_title || { ar: "", en: "" },
      sub_description: initialData?.sub_description || { ar: null, en: null },
    },
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Primary Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Arabic Primary */}
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
              labelClassName="text-lg font-bold text-primary underline underline-offset-8 decoration-primary/20"
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
                  <div className="min-h-[250px] rounded-2xl overflow-hidden border shadow-inner">
                    <RichTextEditor value={field.value} onChange={(val) => field.onChange(editorOnChangeToHtml(val))} dir="rtl" placeholder={t("placeholders.description")} />
                  </div>
                  <FieldError errors={[{ message: errors.description?.ar?.message ? t(errors.description.ar.message as any) : undefined }]} />
                </Field>
              )}
            />
         </div>

         {/* English Primary */}
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
              labelClassName="text-lg font-bold text-primary underline underline-offset-8 decoration-primary/20"
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
                  <div className="min-h-[250px] rounded-2xl overflow-hidden border shadow-inner">
                    <RichTextEditor value={field.value} onChange={(val) => field.onChange(editorOnChangeToHtml(val))} dir="ltr" placeholder={t("placeholders.description")} />
                  </div>
                  <FieldError errors={[{ message: errors.description?.en?.message ? t(errors.description.en.message as any) : undefined }]} />
                </Field>
              )}
            />
         </div>
      </div>

      {/* Secondary Content Area */}
      <div className="pt-10 border-t border-dashed border-primary/20">
        <h3 className="text-sm font-bold opacity-30 uppercase tracking-[0.2em] mb-8 text-center">{t("sections.fields.sub_title")}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Arabic Secondary */}
            <div className="space-y-6 p-6 rounded-[24px] border bg-muted/5">
                <LocalizedRichTextField
                  control={control}
                  name="sub_title.ar"
                  label={`${t("arabic")} - ${t("sections.fields.sub_title")}`}
                  dir="rtl"
                  placeholder={t("placeholders.title")}
                  minHeightClass="min-h-[100px]"
                  labelClassName="text-md font-bold opacity-60 italic"
                />
                <Controller
                  name="sub_description.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("sections.fields.sub_content")}</FieldLabel>
                      <div className="min-h-[200px] rounded-2xl overflow-hidden border bg-background">
                        <RichTextEditor value={field.value} onChange={(val) => field.onChange(editorOnChangeToHtml(val))} dir="rtl" placeholder={t("placeholders.description")} />
                      </div>
                    </Field>
                  )}
                />
            </div>

            {/* English Secondary */}
            <div className="space-y-6 p-6 rounded-[24px] border bg-muted/5">
                <LocalizedRichTextField
                  control={control}
                  name="sub_title.en"
                  label={`${t("english")} - ${t("sections.fields.sub_title")}`}
                  dir="ltr"
                  placeholder={t("placeholders.title")}
                  minHeightClass="min-h-[100px]"
                  labelClassName="text-md font-bold opacity-60 italic"
                />
                <Controller
                  name="sub_description.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("sections.fields.sub_content")}</FieldLabel>
                      <div className="min-h-[200px] rounded-2xl overflow-hidden border bg-background">
                        <RichTextEditor value={field.value} onChange={(val) => field.onChange(editorOnChangeToHtml(val))} dir="ltr" placeholder={t("placeholders.description")} />
                      </div>
                    </Field>
                  )}
                />
            </div>
        </div>
      </div>

    </div>
  );
}
