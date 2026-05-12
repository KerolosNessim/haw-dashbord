import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Save, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useSettings, useUpdateWorkingHours } from "../hooks/useSettings";
import { toast } from "sonner";

const workingHoursSchema = z.object({
  from_day: z.string().min(1, { message: "validation.required" }),
  to_day: z.string().min(1, { message: "validation.required" }),
  from_hour: z.string().min(1, { message: "validation.required" }),
  to_hour: z.string().min(1, { message: "validation.required" }),
  show_on_site: z.boolean(),
});

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

export default function WorkingHoursForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.working_hours" });
  const { t: commonT } = useTranslation("translation");

  const { data: settingsData, isLoading } = useSettings();
  const { mutateAsync: updateWorkingHours, isPending } = useUpdateWorkingHours();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      from_day: "",
      to_day: "",
      from_hour: "",
      to_hour: "",
      show_on_site: true,
    },
  });

  useEffect(() => {
    if (settingsData?.data?.working_hours) {
      reset(settingsData.data.working_hours);
    }
  }, [settingsData, reset]);

  const onSubmit = async (data: WorkingHoursFormValues) => {
    try {
      await updateWorkingHours(data);
      toast.success(commonT("success_message") || "Saved successfully");
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  const days = [
    { value: "sunday", label: "الأحد" },
    { value: "monday", label: "الاثنين" },
    { value: "tuesday", label: "الثلاثاء" },
    { value: "wednesday", label: "الأربعاء" },
    { value: "thursday", label: "الخميس" },
    { value: "friday", label: "الجمعة" },
    { value: "saturday", label: "السبت" },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
         <div className="flex items-center gap-3 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
            {/* Days Selection */}
            <Controller
               name="from_day"
               control={control}
               render={({ field }) => (
                  <Field>
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("from_day")}</FieldLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/5 border-border/40">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           {days.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                        </SelectContent>
                     </Select>
                     <FieldError errors={[{ message: errors.from_day?.message ? commonT(errors.from_day.message) : undefined }]} />
                  </Field>
               )}
            />
            <Controller
               name="to_day"
               control={control}
               render={({ field }) => (
                  <Field>
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("to_day")}</FieldLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/5 border-border/40">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           {days.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                        </SelectContent>
                     </Select>
                     <FieldError errors={[{ message: errors.to_day?.message ? commonT(errors.to_day.message) : undefined }]} />
                  </Field>
               )}
            />

            {/* Hours Selection */}
            <Controller
               name="from_hour"
               control={control}
               render={({ field }) => (
                  <Field>
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("from_hour")}</FieldLabel>
                     <div className="relative group">
                        <Input {...field} className="h-12 rounded-xl bg-muted/5 border-border/40 pl-10 focus:bg-white" />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
                     </div>
                     <FieldError errors={[{ message: errors.from_hour?.message ? commonT(errors.from_hour.message) : undefined }]} />
                  </Field>
               )}
            />
            <Controller
               name="to_hour"
               control={control}
               render={({ field }) => (
                  <Field>
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("to_hour")}</FieldLabel>
                     <div className="relative group">
                        <Input {...field} className="h-12 rounded-xl bg-muted/5 border-border/40 pl-10 focus:bg-white" />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
                     </div>
                     <FieldError errors={[{ message: errors.to_hour?.message ? commonT(errors.to_hour.message) : undefined }]} />
                  </Field>
               )}
            />

            <Controller
               name="show_on_site"
               control={control}
               render={({ field }) => (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-dashed md:col-span-2 max-w-sm">
                    <FieldLabel className="m-0 font-bold text-gray-600">{t("show_on_site")}</FieldLabel>
                    <Switch dir="ltr" checked={field.value} onCheckedChange={field.onChange} />
                  </div>
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
