import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, Loader2, Save, Type } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSolutions } from "../hooks/useSolutions";

const generalSchema = z.object({
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().min(1, "Required"),
});

export type SolutionsSectionFormValues = z.infer<typeof generalSchema>;

type SolutionsSectionFormProps = {
  /** Called after successful save (e.g. close dialog). */
  onSaved?: () => void;
  submitLabel?: string;
  className?: string;
};

export default function SolutionsSectionForm({ onSaved, submitLabel, className }: SolutionsSectionFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "solutions.general" });
  const { getSolutionsQuery, updateSolutions, isPending } = useSolutions();
  const apiData = getSolutionsQuery?.data?.data;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SolutionsSectionFormValues>({
    resolver: zodResolver(generalSchema),
    values: {
      title_ar: apiData?.title?.ar ?? "",
      title_en: apiData?.title?.en ?? "",
      des_ar: apiData?.subtitle?.ar ?? apiData?.description?.ar ?? "",
      des_en: apiData?.subtitle?.en ?? apiData?.description?.en ?? "",
    },
  });

  const onSubmit = (data: SolutionsSectionFormValues) => {
    const formData = new FormData();
    formData.append("title[ar]", data.title_ar);
    formData.append("title[en]", data.title_en);
    formData.append("subtitle[ar]", data.des_ar);
    formData.append("subtitle[en]", data.des_en);
    updateSolutions(formData, { onSuccess: () => onSaved?.() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className ?? "space-y-8"}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="title_ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-end">
                (AR) {t("sec_title")}
                <Type className="w-4 h-4 text-primary" />
              </FieldLabel>
              <Input {...field} dir="rtl" placeholder="..." className="h-12 rounded-2xl" />
              <FieldError errors={[{ message: errors.title_ar?.message }]} />
            </Field>
          )}
        />
        <Controller
          name="title_en"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                {t("sec_title")} (EN)
              </FieldLabel>
              <Input {...field} placeholder="..." className="h-12 rounded-2xl" />
              <FieldError errors={[{ message: errors.title_en?.message }]} />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="des_ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-end">
                (AR) {t("sec_des")}
                <AlignLeft className="w-4 h-4 text-primary" />
              </FieldLabel>
              <Textarea
                {...field}
                dir="rtl"
                placeholder="..."
                className="min-h-[120px] rounded-2xl resize-none"
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
              <FieldLabel className="text-sm font-bold flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-primary" />
                {t("sec_des")} (EN)
              </FieldLabel>
              <Textarea {...field} placeholder="..." className="min-h-[120px] rounded-2xl resize-none" />
              <FieldError errors={[{ message: errors.des_en?.message }]} />
            </Field>
          )}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="rounded-2xl h-12 px-8 font-bold gap-2 shadow-lg shadow-primary/20"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {submitLabel ?? t("save")}
      </Button>
    </form>
  );
}
