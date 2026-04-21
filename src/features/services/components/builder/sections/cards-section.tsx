import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/features/shared/components/editor";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { saveCardsSection } from "@/features/services/services/section-api";
import { toast } from "sonner";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedEditorSchema = z.object({
  ar: z
    .any()
    .refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z
    .any()
    .refine((val) => val && !val.isEmpty, { message: "validation.required" }),
});

const cardsSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
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

interface CardsSectionProps {
  serviceId: number;
  initialData?: any;
}

export default function CardsSection({
  serviceId,
  initialData,
}: CardsSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CardsValues>({
    resolver: zodResolver(cardsSchema),
    defaultValues: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      items: initialData?.items || [
        { title: { ar: "", en: "" }, description: { ar: null, en: null } },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: CardsValues) => {
    setIsSubmitting(true);
    try {
      const finalData = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          description: {
            ar: item.description.ar?.html || "",
            en: item.description.en?.html || "",
          },
        })),
      };
      const res = await saveCardsSection(serviceId, finalData);
      toast.success(res?.data?.message || "Section Saved!");
    } catch (error) {
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
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          {t("sections.types.cards")}
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
                      <Controller
                        name={`items.${index}.title.ar`}
                        control={control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase opacity-40">
                              {t("arabic")} - Title
                            </FieldLabel>
                            <Input
                              {...field}
                              dir="rtl"
                              className="h-11 rounded-xl bg-muted/5"
                            />
                          </Field>
                        )}
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
                                onChange={field.onChange}
                                dir="rtl"
                              />
                            </div>
                          </Field>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <Controller
                        name={`items.${index}.title.en`}
                        control={control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase opacity-40">
                              {t("english")} - Title
                            </FieldLabel>
                            <Input
                              {...field}
                              dir="ltr"
                              className="h-11 rounded-xl bg-muted/5"
                            />
                          </Field>
                        )}
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
                                onChange={field.onChange}
                                dir="ltr"
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
