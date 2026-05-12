import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Image as ImageIcon, Save, Loader2, Languages, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useSettings, useUpdateGeneralSettings } from "../hooks/useSettings";
import { toast } from "sonner";

const generalSchema = z.object({
  site_name_ar: z.string().min(1, { message: "validation.required" }),
  site_name_en: z.string().min(1, { message: "validation.required" }),
  site_description_ar: z.string().min(1, { message: "validation.required" }),
  site_description_en: z.string().min(1, { message: "validation.required" }),
  timezone: z.string().min(1, { message: "validation.required" }),
  default_language: z.enum(["ar", "en"]),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export default function GeneralSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.general" });
  const { t: commonT } = useTranslation("translation");
  
   const { data: settingsData, isLoading } = useSettings();
   
  const { mutateAsync: updateGeneral, isPending } = useUpdateGeneralSettings();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      site_name_ar: "",
      site_name_en: "",
      site_description_ar: "",
      site_description_en: "",
      timezone: "UTC",
      default_language: "ar",
    },
  });

  useEffect(() => {
    if (settingsData?.data?.general) {
      const g = settingsData.data.general;
      reset({
        site_name_ar: g.site_name_ar,
        site_name_en: g.site_name_en,
        site_description_ar: g.site_description_ar,
        site_description_en: g.site_description_en,
        timezone: g.timezone || "UTC",
        default_language: (g.default_language as "ar" | "en") || "ar",
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoPreview(g.logo);
      setFaviconPreview(g.favicon);
    }
  }, [settingsData, reset]);

  const onSubmit = async (values: GeneralFormValues) => {
    try {
      const formData = new FormData();
      formData.append("site_name_ar", values.site_name_ar);
      formData.append("site_name_en", values.site_name_en);
      formData.append("site_description_ar", values.site_description_ar);
      formData.append("site_description_en", values.site_description_en);
      formData.append("timezone", values.timezone);
      formData.append("default_language", values.default_language);
      
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);

      await updateGeneral(formData);
      toast.success(commonT("success_message") || "Saved successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  const timezones = [
    "UTC", "Asia/Riyadh", "Africa/Cairo", "Europe/Istanbul", "Asia/Dubai", "Asia/Muscat"
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
         <div className="flex items-center gap-3 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
         </div>

         {/* Site Names */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
               name="site_name_ar"
               control={control}
               render={({ field }) => (
                  <Field >
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("site_name_ar")}</FieldLabel>
                     <Input {...field} className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all" />
                     <FieldError errors={[{ message: errors.site_name_ar?.message ? commonT(errors.site_name_ar.message) : undefined }]} />
                  </Field>
               )}
            />
            <Controller
               name="site_name_en"
               control={control}
               render={({ field }) => (
                  <Field >
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("site_name_en")}</FieldLabel>
                     <Input {...field} className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all" />
                     <FieldError errors={[{ message: errors.site_name_en?.message ? commonT(errors.site_name_en.message) : undefined }]} />
                  </Field>
               )}
            />
         </div>

         {/* Site Descriptions */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
               name="site_description_ar"
               control={control}
               render={({ field }) => (
                  <Field >
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("site_description_ar")}</FieldLabel>
                     <Textarea {...field} className="min-h-[120px] rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all resize-none" />
                     <FieldError errors={[{ message: errors.site_description_ar?.message ? commonT(errors.site_description_ar.message) : undefined }]} />
                  </Field>
               )}
            />
            <Controller
               name="site_description_en"
               control={control}
               render={({ field }) => (
                  <Field >
                     <FieldLabel className="text-gray-600 font-bold mb-2">{t("site_description_en")}</FieldLabel>
                     <Textarea {...field} className="min-h-[120px] rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all resize-none" />
                     <FieldError errors={[{ message: errors.site_description_en?.message ? commonT(errors.site_description_en.message) : undefined }]} />
                  </Field>
               )}
            />
         </div>

         {/* Timezone & Language */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
            <Controller
               name="timezone"
               control={control}
               render={({ field }) => (
                  <Field >
                     <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-gray-600 font-bold mb-0">{t("timezone")}</FieldLabel>
                     </div>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                        </SelectContent>
                     </Select>
                     <FieldError errors={[{ message: errors.timezone?.message ? commonT(errors.timezone.message) : undefined }]} />
                  </Field>
               )}
            />
            <Controller
               name="default_language"
               control={control}
               render={({ field }) => (
                  <Field >
                     <div className="flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-gray-600 font-bold mb-0">{t("default_language")}</FieldLabel>
                     </div>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/10 border-border/40 focus:bg-white transition-all">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="ar">العربية (Arabic)</SelectItem>
                           <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                     </Select>
                     <FieldError errors={[{ message: errors.default_language?.message ? commonT(errors.default_language.message) : undefined }]} />
                  </Field>
               )}
            />
         </div>

         {/* Logo Selection */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12  py-4 border-t border-dashed">
            <div className="space-y-4">
               <FieldLabel className="text-gray-600 font-bold">{t("logo")}</FieldLabel>
               <div className="flex items-center justify-between p-6 rounded-2xl border bg-muted/5 group hover:bg-white transition-all">
                  <input
                    type="file"
                    id="logo-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="rounded-xl px-6 bg-white shadow-sm hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => document.getElementById('logo-input')?.click()}
                  >
                     {t("change_logo")}
                  </Button>
                  <div className="w-16 h-16 rounded-xl border bg-white flex items-center justify-center overflow-hidden shadow-sm relative group">
                     {logoPreview ? (
                       <img src={logoPreview} className="w-full h-full object-contain" />
                     ) : (
                       <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                     )}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <FieldLabel className="text-gray-600 font-bold">{t("favicon")}</FieldLabel>
               <div className="flex items-center justify-between p-6 rounded-2xl border bg-muted/5 group hover:bg-white transition-all">
                  <input
                    type="file"
                    id="favicon-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFaviconFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setFaviconPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="rounded-xl px-6 bg-white shadow-sm hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => document.getElementById('favicon-input')?.click()}
                  >
                     {t("change_favicon")}
                  </Button>
                  <div className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center overflow-hidden shadow-sm">
                     {faviconPreview ? (
                       <img src={faviconPreview} className="w-full h-full object-contain" />
                     ) : (
                       <Globe className="w-6 h-6 text-muted-foreground opacity-20" />
                     )}
                  </div>
               </div>
            </div>
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


