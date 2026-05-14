import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Loader2, Code2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useScripts, useUpdateScripts } from "../hooks/useSettings";
import { toast } from "sonner";

const scriptsSchema = z.object({
  custom_head_scripts: z.string().optional().default(""),
  custom_body_scripts: z.string().optional().default(""),
  robots_txt: z.string().optional().default(""),
});

type ScriptsFormValues = z.infer<typeof scriptsSchema>;

export default function ScriptsSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.scripts" });
  const { t: commonT } = useTranslation("translation");
  
  const { data: scriptsData, isLoading } = useScripts();
  const { mutateAsync: updateScripts, isPending } = useUpdateScripts();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScriptsFormValues>({
    resolver: zodResolver(scriptsSchema),
    defaultValues: {
      custom_head_scripts: "",
      custom_body_scripts: "",
      robots_txt: "",
    },
  });

  useEffect(() => {
    if (scriptsData?.data) {
      reset({
        custom_head_scripts: scriptsData.data.custom_head_scripts || "",
        custom_body_scripts: scriptsData.data.custom_body_scripts || "",
        robots_txt: scriptsData.data.robots_txt || "",
      });
    }
  }, [scriptsData, reset]);

  const onSubmit = async (data: ScriptsFormValues) => {
    try {
      await updateScripts(data);
      toast.success(commonT("toasts.generic_updated") || "Saved successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(commonT("toasts.generic_update_failed") || "Something went wrong");
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-4xl">
          {/* Custom Head Scripts */}
          <Controller
            name="custom_head_scripts"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-gray-600 font-bold mb-3">{t("custom_head_scripts")}</FieldLabel>
                <Textarea 
                  {...field} 
                  dir="ltr"
                  rows={6}
                  placeholder={t("custom_head_placeholder")}
                  className="rounded-2xl font-mono text-sm bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all p-4" 
                />
                <FieldError errors={[{ message: errors.custom_head_scripts?.message ? commonT(errors.custom_head_scripts.message) : undefined }]} />
              </Field>
            )}
          />

          {/* Custom Body Scripts */}
          <Controller
            name="custom_body_scripts"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-gray-600 font-bold mb-3">{t("custom_body_scripts")}</FieldLabel>
                <Textarea 
                  {...field} 
                  dir="ltr"
                  rows={6}
                  placeholder={t("custom_body_placeholder")}
                  className="rounded-2xl font-mono text-sm bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all p-4" 
                />
                <FieldError errors={[{ message: errors.custom_body_scripts?.message ? commonT(errors.custom_body_scripts.message) : undefined }]} />
              </Field>
            )}
          />

          {/* Robots.txt */}
          <Controller
            name="robots_txt"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-gray-600 font-bold mb-3">{t("robots_txt")}</FieldLabel>
                <Textarea 
                  {...field} 
                  dir="ltr"
                  rows={6}
                  placeholder={t("robots_placeholder")}
                  className="rounded-2xl font-mono text-sm bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all p-4" 
                />
                <FieldError errors={[{ message: errors.robots_txt?.message ? commonT(errors.robots_txt.message) : undefined }]} />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="flex justify-start pt-6 border-t mt-12">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="rounded-xl px-12 h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {t("save_changes")}
        </Button>
      </div>
    </form>
  );
}
