import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedRichTextField } from "../localized-rich-text-field";
import { Button } from "@/components/ui/button";
import { PhoneCall, Contact } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const contactSchema = z.object({
  title: localizedSchema,
  phone_number: z.string().min(1, { message: "validation.required" }),
  description: z
    .object({ ar: z.any().optional(), en: z.any().optional() })
    .optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

interface ContactSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: any;
}

export default function ContactSection({
  initialData,
  embedded,
  onDataChange,
}: ContactSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const { control, watch, getValues, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      phone_number: initialData?.phone_number || initialData?.phone || "",
      description: initialData?.description || { ar: null, en: null },
    },
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Arabic Contact Info */}
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
              errors.title?.ar?.message
                ? t(errors.title.ar.message as any)
                : undefined
            }
          />
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px] border rounded-2xl overflow-hidden shadow-inner bg-background">
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

        {/* English Contact Info */}
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
              errors.title?.en?.message
                ? t(errors.title.en.message as any)
                : undefined
            }
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px] border rounded-2xl overflow-hidden shadow-inner bg-background">
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

      {/* Shared Global Info (Phone) */}
      <div className="p-8 rounded-[32px] border bg-primary/5 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Contact className="w-8 h-8" />
        </div>
        <div className="flex-1 w-full">
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="flex items-center gap-2 font-bold mb-2">
                  <PhoneCall className="w-4 h-4 text-primary" />{" "}
                  {t("sections.fields.phone")}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="+966 XXXXXXXX"
                  dir="ltr"
                  className="h-14 rounded-2xl bg-background border-border/50 font-mono text-lg shadow-sm"
                />
                <FieldError
                  errors={[
                    {
                      message: errors.phone_number?.message
                        ? t(errors.phone_number.message as any)
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
  );
}
