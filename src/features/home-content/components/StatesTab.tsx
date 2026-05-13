import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, Hash, Loader2, Plus, Save, Trash2, Type } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStats } from "../hooks/useStats";

/**
 * Validation schema for the Statistics section
 */
const statesSchema = z.object({
  stats: z
    .array(
      z.object({
        id: z.number().optional(), // present for existing, absent for new
        number: z.string().min(1, "Required"),
        title_ar: z.string().min(1, "Required"),
        title_en: z.string().min(1, "Required"),
        des_ar: z.string().min(1, "Required"),
        des_en: z.string().min(1, "Required"),
      }),
    )
    .min(1, "At least one statistic is required"),
});

type StatesFormValues = z.infer<typeof statesSchema>;

/**
 * StatesTab Component
 *
 * Manages a dynamic list of statistics for the home page.
 * When the API returns stats, they are pre-populated in the form.
 */
export default function StatesTab() {
  const { t } = useTranslation("translation", { keyPrefix: "home_content.states" });

  const { getStats, updateStat, isPending } = useStats();
  const apiStats = getStats?.data?.data?.data;
  

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StatesFormValues>({
    resolver: zodResolver(statesSchema),
    // Populate from API when data is available, otherwise a blank row
    values: {
      stats:
        apiStats && apiStats.length > 0
          ? apiStats.map((s) => ({
              id: s.id,           // keep id so bulk-sync can update existing rows
              number: s.number,
              title_ar: s.title.ar,
              title_en: s.title.en,
              des_ar: s.description.ar,
              des_en: s.description.en,
            }))
          : [{ number: "",  title_ar: "", title_en: "", des_ar: "", des_en: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats",
  });

  const onSubmit = (data: StatesFormValues) => {
    const payload = data.stats.map((stat) => ({
      ...(stat.id ? { id: stat.id } : {}), // send id for existing, omit for new
      title: { ar: stat.title_ar, en: stat.title_en },
      number: stat.number,
      description: { ar: stat.des_ar, en: stat.des_en },
    }));
    updateStat(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hash className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            append({ number: "", title_ar: "", title_en: "", des_ar: "", des_en: "" })
          }
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          {t("add_stat")}
        </Button>
      </div>

      {/* Stats List */}
      <div className="space-y-8">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group relative bg-muted/5 rounded-[32px] border border-border/60 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
          >
            {/* Remove Button */}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="absolute -top-3 -right-3 rounded-full w-10 h-10 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Number/Value Column */}
              <div className="lg:col-span-3 space-y-6">
                <Controller
                  name={`stats.${index}.number`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        {t("number")} 
                      </FieldLabel>
                      <Input
                        {...field}
                        dir="rtl"
                        placeholder="مثال: 100+"
                        className="h-14 rounded-2xl bg-white border-border/60 focus:ring-2 focus:ring-primary/20 transition-all text-lg font-black text-primary"
                      />
                      <FieldError errors={[{ message: errors.stats?.[index]?.number?.message }]} />
                    </Field>
                  )}
                />

              </div>

              {/* Title & Description Column */}
              <div className="lg:col-span-9 space-y-6">
                {/* Titles AR & EN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`stats.${index}.title_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-end">
                          ({t("ar", { defaultValue: "AR" })}) {t("stat_title")}
                          <Type className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="rtl"
                          placeholder="العنوان بالعربية..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`stats.${index}.title_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <Type className="w-4 h-4 text-primary" />
                          {t("stat_title")} (EN)
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="Title in English..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                </div>

                {/* Descriptions AR & EN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`stats.${index}.des_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-end">
                          ({t("ar", { defaultValue: "AR" })}) {t("stat_description")}
                          <AlignLeft className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Textarea
                          {...field}
                          dir="rtl"
                          placeholder="الوصف بالعربية..."
                          className="min-h-[80px] rounded-xl bg-white border-border/60 resize-none"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`stats.${index}.des_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-primary" />
                          {t("stat_description")} (EN)
                        </FieldLabel>
                        <Textarea
                          {...field}
                          placeholder="Description in English..."
                          className="min-h-[80px] rounded-xl bg-white border-border/60 resize-none"
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t flex justify-end">
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
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
