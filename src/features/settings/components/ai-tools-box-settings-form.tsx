import { AccreditationImageServicesSelect } from "@/features/home-content/components/AccreditationImageServicesSelect";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import { useAiToolsBox, useToolsBoxServices, useUpdateAiToolsBox } from "../hooks/useSettings";
import { aiToolsBoxToFormValues, defaultAiToolsBoxSettings } from "../services/ai-tools-box-api";
import type { AiToolsBoxFormValues } from "../types";

const schema = z.object({
  description_ar: z.string().min(1, { message: "validation.required" }),
  description_en: z.string().optional().default(""),
  challenge_label_ar: z.string().min(1, { message: "validation.required" }),
  challenge_label_en: z.string().optional().default(""),
  email_label_ar: z.string().min(1, { message: "validation.required" }),
  email_label_en: z.string().optional().default(""),
  consent_label_ar: z.string().min(1, { message: "validation.required" }),
  consent_label_en: z.string().optional().default(""),
  button_text_ar: z.string().min(1, { message: "validation.required" }),
  button_text_en: z.string().optional().default(""),
  service_ids: z.array(z.number()).default([]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: AiToolsBoxFormValues = {
  description_ar: "",
  description_en: "",
  challenge_label_ar: "",
  challenge_label_en: "",
  email_label_ar: "",
  email_label_en: "",
  consent_label_ar: "",
  consent_label_en: "",
  button_text_ar: "",
  button_text_en: "",
  service_ids: [],
  is_active: true,
};

export default function AiToolsBoxSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.ai_tools_box" });
  const { t: commonT } = useTranslation("translation");
  const { data, isLoading, isError } = useAiToolsBox();
  const { data: services = [], isLoading: servicesLoading } = useToolsBoxServices();
  const { mutateAsync: save, isPending } = useUpdateAiToolsBox();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (data) reset(aiToolsBoxToFormValues(data));
    else if (isError) reset(aiToolsBoxToFormValues(defaultAiToolsBoxSettings()));
  }, [data, isError, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const onSubmit = async (values: FormValues) => {
    try {
      await save(values);
      toast.success(t("toast_saved"));
    } catch {
      toast.error(commonT("toasts.generic_update_failed"));
    }
  };

  if (isLoading && !isError) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in space-y-8 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3 rounded-xl border px-4 py-2">
              <FieldLabel className="mb-0 text-sm font-bold">{t("is_active")}</FieldLabel>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>

      <Tabs defaultValue="ar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ar">{t("tab_ar")}</TabsTrigger>
          <TabsTrigger value="en">{t("tab_en")}</TabsTrigger>
        </TabsList>

        <TabsContent value="ar" className="mt-0 space-y-5 rounded-2xl border p-6">
          <Controller
            name="description_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.description")}</FieldLabel>
                <Textarea {...field} dir="rtl" rows={3} className="rounded-xl" />
                <FieldError errors={[{ message: translateError(errors.description_ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="challenge_label_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.challenge_label")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                <FieldError errors={[{ message: translateError(errors.challenge_label_ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="email_label_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.email_label")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                <FieldError errors={[{ message: translateError(errors.email_label_ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="consent_label_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.consent_label")}</FieldLabel>
                <Textarea {...field} dir="rtl" rows={3} className="rounded-xl" />
                <FieldError errors={[{ message: translateError(errors.consent_label_ar?.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="button_text_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.button_text")}</FieldLabel>
                <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                <FieldError errors={[{ message: translateError(errors.button_text_ar?.message) }]} />
              </Field>
            )}
          />
        </TabsContent>

        <TabsContent value="en" className="mt-0 space-y-5 rounded-2xl border p-6">
          <Controller
            name="description_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.description")}</FieldLabel>
                <Textarea {...field} dir="ltr" rows={3} className="rounded-xl" />
              </Field>
            )}
          />
          <Controller
            name="challenge_label_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.challenge_label")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-11 rounded-xl" />
              </Field>
            )}
          />
          <Controller
            name="email_label_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.email_label")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-11 rounded-xl" />
              </Field>
            )}
          />
          <Controller
            name="consent_label_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.consent_label")}</FieldLabel>
                <Textarea {...field} dir="ltr" rows={3} className="rounded-xl" />
              </Field>
            )}
          />
          <Controller
            name="button_text_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("fields.button_text")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-11 rounded-xl" />
              </Field>
            )}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-2xl border bg-muted/10 p-6">
        <Controller
          name="service_ids"
          control={control}
          render={({ field }) => (
            <AccreditationImageServicesSelect
              value={field.value}
              onChange={field.onChange}
              services={services}
              loading={servicesLoading}
              disabled={isPending}
              i18nKeyPrefix="settings.ai_tools_box.services"
            />
          )}
        />
      </div>

      <div className="flex justify-start border-t pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 rounded-xl px-12 font-bold shadow-xl shadow-primary/20"
        >
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {t("save_changes")}
        </Button>
      </div>
    </form>
  );
}
