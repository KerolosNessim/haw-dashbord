import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Image as ImageIcon, Save } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const generalSchema = z.object({
  site_name_ar: z.string().min(1, { message: "validation.required" }),
  site_name_en: z.string().min(1, { message: "validation.required" }),
  site_description_ar: z.string().min(1, { message: "validation.required" }),
  site_description_en: z.string().min(1, { message: "validation.required" }),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export default function GeneralSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.general" });
  const { t: commonT } = useTranslation("translation");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      site_name_ar: "هوية",
      site_name_en: "Howeyah",
      site_description_ar: "",
      site_description_en: ""
    },
  });

  const onSubmit = (data: GeneralFormValues) => {
    console.log("General Settings:", data);
  };

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

      <div className="flex justify-start pt-6">
        <Button
          type="submit"
          size="lg"
          className="rounded-xl px-12 h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save className="w-5 h-5 mr-2" />
          {t("save_changes")}
        </Button>
      </div>
    </form>
  );
}
