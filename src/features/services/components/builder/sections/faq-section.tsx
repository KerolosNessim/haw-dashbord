import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, HelpCircle, Save, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { saveFAQSection } from "@/features/services/services/section-api";
import { toast } from "sonner";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedOptionalSchema = z.object({
  ar: z.string().optional().default(""),
  en: z.string().optional().default(""),
});

const faqSchema = z.object({
  title: localizedSchema,
  description: localizedOptionalSchema,
  items: z.array(z.object({
    question: localizedSchema,
    answer: localizedSchema,
  })).min(1),
});

type FAQValues = z.infer<typeof faqSchema>;

interface FAQSectionProps {
  serviceId: number;
  initialData?: any;
}

export default function FAQSection({ serviceId, initialData }: FAQSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FAQValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      items: initialData?.items || [{ question: { ar: "", en: "" }, answer: { ar: "", en: "" } }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FAQValues) => {
    setIsSubmitting(true);
    try {
      const res = await saveFAQSection(serviceId, data);
      toast.success(res?.data?.message || "Section Saved!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error saving section");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in duration-500"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arabic Main Info */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("arabic")}
          </div>
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.title")}</FieldLabel>
                <Input
                  {...field}
                  dir="rtl"
                  placeholder={t("placeholders.title")}
                  className="h-12 rounded-xl bg-background border-border/50"
                />
                <FieldError
                  errors={[
                    {
                      message: errors.title?.ar?.message
                        ? t(errors.title.ar.message as any)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <Input
                  {...field}
                  dir="rtl"
                  placeholder={t("placeholders.description")}
                  className="h-12 rounded-xl bg-background border-border/50"
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
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.title")}</FieldLabel>
                <Input
                  {...field}
                  dir="ltr"
                  placeholder={t("placeholders.title")}
                  className="h-12 rounded-xl bg-background border-border/50"
                />
                <FieldError
                  errors={[
                    {
                      message: errors.title?.en?.message
                        ? t(errors.title.en.message as any)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <Input
                  {...field}
                  dir="ltr"
                  placeholder={t("placeholders.description")}
                  className="h-12 rounded-xl bg-background border-border/50"
                />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />{" "}
            {t("sections.fields.faq_list")}
          </h3>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative group p-8 rounded-[32px] border bg-card/50 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-center">
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Question #{index + 1}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Arabic Q&A */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">
                    {t("arabic")}
                  </div>
                  <Controller
                    name={`items.${index}.question.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.question")}
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="rtl"
                          className="h-11 rounded-xl bg-muted/5 font-bold"
                        />
                        <FieldError
                          errors={[
                            {
                              message: errors.items?.[index]?.question?.ar
                                ?.message
                                ? t(
                                    errors.items[index].question.ar
                                      .message as any,
                                  )
                                : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.answer.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.answer")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          dir="rtl"
                          className="rounded-xl bg-muted/5 border-border/40 min-h-[100px]"
                          placeholder={t("placeholders.description")}
                        />
                        <FieldError
                          errors={[
                            {
                              message: errors.items?.[index]?.answer?.ar
                                ?.message
                                ? t(
                                    errors.items[index].answer.ar
                                      .message as any,
                                  )
                                : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                </div>

                {/* English Q&A */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">
                    {t("english")}
                  </div>
                  <Controller
                    name={`items.${index}.question.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.question")}
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="ltr"
                          className="h-11 rounded-xl bg-muted/5 font-bold"
                        />
                        <FieldError
                          errors={[
                            {
                              message: errors.items?.[index]?.question?.en
                                ?.message
                                ? t(
                                    errors.items[index].question.en
                                      .message as any,
                                  )
                                : undefined,
                            },
                          ]}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.answer.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">
                          {t("sections.fields.answer")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          dir="ltr"
                          className="rounded-xl bg-muted/5 border-border/40 min-h-[100px]"
                          placeholder={t("placeholders.description")}
                        />
                        <FieldError
                          errors={[
                            {
                              message: errors.items?.[index]?.answer?.en
                                ?.message
                                ? t(
                                    errors.items[index].answer.en
                                      .message as any,
                                  )
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
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
          onClick={() =>
            append({ question: { ar: "", en: "" }, answer: { ar: "", en: "" } })
          }
        >
          <Plus className="w-4 h-4" /> {t("sections.fields.add_question")}
        </Button>
      </div>

      <div className="flex justify-end pt-8 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full h-14 px-12 font-bold text-lg gap-3 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {t("save_section")}
        </Button>
      </div>
    </form>
  );
}
