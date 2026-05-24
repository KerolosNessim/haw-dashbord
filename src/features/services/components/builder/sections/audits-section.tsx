import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedRichTextField } from "../localized-rich-text-field";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const auditsSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
  items: z
    .array(
      z.object({
        title: localizedSchema,
        description: localizedSchema,
        button_text: localizedSchema,
      }),
    )
    .min(1),
});

type AuditsValues = z.infer<typeof auditsSchema>;

interface AuditsSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: Record<string, unknown>;
}

export default function AuditsSection({
  initialData,
  embedded,
  onDataChange,
}: AuditsSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const { control, watch, getValues, formState: { errors } } = useForm<AuditsValues>({
    resolver: zodResolver(auditsSchema),
    values: {
      title: (initialData?.title as AuditsValues["title"]) || { ar: "", en: "" },
      description: (initialData?.description as AuditsValues["description"]) || {
        ar: "",
        en: "",
      },
      items: (initialData?.items as AuditsValues["items"]) || [
        {
          title: { ar: "", en: "" },
          description: { ar: "", en: "" },
          button_text: { ar: "", en: "" },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(["ar", "en"] as const).map((locale) => (
          <div
            key={locale}
            className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5"
          >
            <div className="text-xs font-bold uppercase tracking-widest opacity-40">
              {locale === "ar" ? t("arabic") : t("english")}
            </div>
            <LocalizedRichTextField
              control={control}
              name={`title.${locale}`}
              label={`${t("sections.fields.title")} (${locale})`}
              dir={locale === "ar" ? "rtl" : "ltr"}
              placeholder={t("placeholders.title")}
            />
            <Controller
              name={`description.${locale}`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>audits_description ({locale})</FieldLabel>
                  <div className="min-h-[160px] rounded-xl border overflow-hidden">
                    <RichTextEditor
                      value={field.value}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        field.onChange(html);
                      }}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                </Field>
              )}
            />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-8 rounded-[32px] border bg-card/50 space-y-6">
            <div className="flex justify-between">
              <span className="text-xs font-bold opacity-50">Audit #{index + 1}</span>
              {fields.length > 1 && (
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(["ar", "en"] as const).map((locale) => (
                <div key={locale} className="space-y-4">
                  <LocalizedRichTextField
                    control={control}
                    name={`items.${index}.title.${locale}`}
                    label={`${t("sections.fields.title")} (${locale})`}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    minHeightClass="min-h-[100px]"
                  />
                  <Controller
                    name={`items.${index}.description.${locale}`}
                    control={control}
                    render={({ field: f }) => (
                      <Field>
                        <FieldLabel>description ({locale})</FieldLabel>
                        <div className="min-h-[160px] rounded-xl border overflow-hidden">
                          <RichTextEditor
                            value={f.value}
                            onChange={(val) => {
                              const html = editorOnChangeToHtml(val);
                              f.onChange(html);
                            }}
                            dir={locale === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                      </Field>
                    )}
                  />
                  <LocalizedRichTextField
                    control={control}
                    name={`items.${index}.button_text.${locale}`}
                    label={`Button (${locale})`}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    minHeightClass="min-h-[80px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              title: { ar: "", en: "" },
              description: { ar: "", en: "" },
              button_text: { ar: "", en: "" },
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" /> {t("sections.fields.add_item")}
        </Button>
      </div>
    </div>
  );
}
