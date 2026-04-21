import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/features/shared/components/editor";
import { Button } from "@/components/ui/button";
import { PhoneCall, Save, Loader2, Contact } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { saveContactSection } from "@/features/services/services/section-api";
import { toast } from "sonner";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const contactSchema = z.object({
  title: localizedSchema,
  phone_number: z.string().min(1, { message: "validation.required" }),
  description: z
    .object({ ar: z.any().optional(), en: z.any().optional() })
    .optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

interface ContactSectionProps {
  serviceId: number;
  initialData?: any;
}

export default function ContactSection({ serviceId, initialData }: ContactSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      title: initialData?.title || { ar: "", en: "" },
      phone_number: initialData?.phone_number || initialData?.phone || "",
      description: initialData?.description || undefined,
    },
  });

  const onSubmit = async (data: ContactValues) => {
    setIsSubmitting(true);
    try {
      const finalData = {
        title: data.title,
        phone_number: data.phone_number,
        description: {
          ar: data.description?.ar?.html || "",
          en: data.description?.en?.html || "",
        },
      };
      const res = await saveContactSection(serviceId, finalData);
      console.log(res);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Arabic Contact Info */}
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
                  className="h-12 rounded-xl bg-background border-border/50 font-bold"
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
                <div className="min-h-[200px] border rounded-2xl overflow-hidden shadow-inner bg-background">
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
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
                  className="h-12 rounded-xl bg-background border-border/50 font-bold"
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
                <div className="min-h-[200px] border rounded-2xl overflow-hidden shadow-inner bg-background">
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
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
