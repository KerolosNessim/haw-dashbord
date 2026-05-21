import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/features/shared/components/editor";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedEditorSchema = z.object({
  ar: z.any().refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z.any().refine((val) => val && !val.isEmpty, { message: "validation.required" }),
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
            <Controller
              name="title.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-lg font-bold text-primary underline underline-offset-8 decoration-primary/20">
                    {t("sections.fields.title")}
                  </FieldLabel>
                  <Input {...field} dir="rtl" placeholder={t("placeholders.title")} className="h-12 rounded-xl bg-background border-border/50 text-lg font-semibold" />
                  <FieldError errors={[{ message: errors.title?.ar?.message ? t(errors.title.ar.message as any) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                  <div className="min-h-[250px] rounded-2xl overflow-hidden border shadow-inner">
                    <RichTextEditor value={field.value} onChange={field.onChange} dir="rtl" placeholder={t("placeholders.description")} />
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
            <Controller
              name="title.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-lg font-bold text-primary underline underline-offset-8 decoration-primary/20">
                    {t("sections.fields.title")}
                  </FieldLabel>
                  <Input {...field} dir="ltr" placeholder={t("placeholders.title")} className="h-12 rounded-xl bg-background border-border/50 text-lg font-semibold" />
                  <FieldError errors={[{ message: errors.title?.en?.message ? t(errors.title.en.message as any) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                  <div className="min-h-[250px] rounded-2xl overflow-hidden border shadow-inner">
                    <RichTextEditor value={field.value} onChange={field.onChange} dir="ltr" placeholder={t("placeholders.description")} />
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
                <Controller
                  name="sub_title.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-md font-bold opacity-60 italic">{t("arabic")} - {t("sections.fields.sub_title")}</FieldLabel>
                      <Input {...field} dir="rtl" placeholder={t("placeholders.title")} className="h-11 rounded-xl bg-background border-border/40" />
                    </Field>
                  )}
                />
                <Controller
                  name="sub_description.ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("sections.fields.sub_content")}</FieldLabel>
                      <div className="min-h-[200px] rounded-2xl overflow-hidden border bg-background">
                        <RichTextEditor value={field.value} onChange={field.onChange} dir="rtl" placeholder={t("placeholders.description")} />
                      </div>
                    </Field>
                  )}
                />
            </div>

            {/* English Secondary */}
            <div className="space-y-6 p-6 rounded-[24px] border bg-muted/5">
                <Controller
                  name="sub_title.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-md font-bold opacity-60 italic">{t("english")} - {t("sections.fields.sub_title")}</FieldLabel>
                      <Input {...field} dir="ltr" placeholder={t("placeholders.title")} className="h-11 rounded-xl bg-background border-border/40" />
                    </Field>
                  )}
                />
                <Controller
                  name="sub_description.en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("sections.fields.sub_content")}</FieldLabel>
                      <div className="min-h-[200px] rounded-2xl overflow-hidden border bg-background">
                        <RichTextEditor value={field.value} onChange={field.onChange} dir="ltr" placeholder={t("placeholders.description")} />
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
