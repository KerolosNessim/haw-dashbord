import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, Loader2, Save, Type } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWhyUs } from "../hooks/useWhyUs";

const generalSchema = z.object({
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().min(1, "Required"),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export default function GeneralTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "why_choose_us.general",
  });
  const { getWhyUsQuery, updateWhyUs, isPending } = useWhyUs();
  const apiData = getWhyUsQuery?.data?.data;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    values: {
      title_ar: apiData?.content?.title?.ar ?? "",
      title_en: apiData?.content?.title?.en ?? "",
      des_ar: apiData?.content?.description?.ar ?? "",
      des_en: apiData?.content?.description?.en ?? "",
    },
  });

  const onSubmit = (data: GeneralFormValues) => {
    const formData = new FormData();
    formData.append("title[ar]", data.title_ar);
    formData.append("title[en]", data.title_en);
    formData.append("description[ar]", data.des_ar);
    formData.append("description[en]", data.des_en);
    
    updateWhyUs(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header Info */}
      <div className="border-b pb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Type className="w-6 h-6 text-primary" />
          {t("title", { defaultValue: "General Settings" })}
        </h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          {t("description", { defaultValue: "Manage the main title and description of the Why Choose Us section." })}
        </p>
      </div>

      <div className="space-y-10">
        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="title_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                  (AR) {t("sec_title", { defaultValue: "Section Title" })}
                  <Type className="w-4 h-4 text-primary" />
                </FieldLabel>
                <Input
                  {...field}
                  dir="rtl"
                  placeholder="..."
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                />
                <FieldError errors={[{ message: errors.title_ar?.message }]} />
              </Field>
            )}
          />
          <Controller
            name="title_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  {t("sec_title", { defaultValue: "Section Title" })} (EN)
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="..."
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                />
                <FieldError errors={[{ message: errors.title_en?.message }]} />
              </Field>
            )}
          />
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="des_ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                  (AR) {t("sec_des", { defaultValue: "Section Description" })}
                  <AlignLeft className="w-4 h-4 text-primary" />
                </FieldLabel>
                <Textarea
                  {...field}
                  dir="rtl"
                  placeholder="..."
                  className="min-h-[140px] rounded-[24px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-5"
                />
                <FieldError errors={[{ message: errors.des_ar?.message }]} />
              </Field>
            )}
          />
          <Controller
            name="des_en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-primary" />
                  {t("sec_des", { defaultValue: "Section Description" })} (EN)
                </FieldLabel>
                <Textarea
                  {...field}
                  placeholder="..."
                  className="min-h-[140px] rounded-[24px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-5"
                />
                <FieldError errors={[{ message: errors.des_en?.message }]} />
              </Field>
            )}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="rounded-2xl h-14 px-12 font-black text-lg gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {t("save", { defaultValue: "Save Changes" })}
      </Button>
    </form>
  );
}
