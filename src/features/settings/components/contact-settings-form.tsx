import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const contactSchema = z.object({
  whatsapp_turkey: z.string().min(1, { message: "validation.required" }),
  whatsapp_oman_1: z.string().min(1, { message: "validation.required" }),
  whatsapp_oman_2: z.string().min(1, { message: "validation.required" }),
  email: z.string().email({ message: "validation.invalid_email" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.contact" });
  const { t: commonT } = useTranslation("translation");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsapp_turkey: "(+90) 75 67 031 536",
      whatsapp_oman_1: "(+968) 4555 9520",
      whatsapp_oman_2: "(+968) 1971 9525",
      email: "info@howeyah.com",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log("Contact Settings:", data);
  };

  const fields = [
    { name: "whatsapp_turkey", label: t("whatsapp_turkey"), icon: "🇹🇷", dir: "ltr" },
    { name: "whatsapp_oman_1", label: t("whatsapp_oman_1"), icon: "🇴🇲", dir: "ltr" },
    { name: "whatsapp_oman_2", label: t("whatsapp_oman_2"), icon: "🇴🇲", dir: "ltr" },
    { name: "email", label: t("email"), icon: <Mail className="w-5 h-5 text-blue-500" />, dir: "ltr" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
         <div className="flex items-center gap-3 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {fields.map((f) => (
               <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  render={({ field }) => (
                     <Field>
                        <FieldLabel className="text-gray-600 font-bold mb-3">{f.label}</FieldLabel>
                        <div className="relative group">
                           <Input 
                              {...field} 
                              dir={f.dir}
                              className="h-14 rounded-2xl bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all pl-12" 
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-border/40 shadow-sm flex items-center justify-center text-2xl group-focus-within:border-primary/20 transition-all">
                              {f.icon}
                           </div>
                        </div>
                     </Field>
                  )}
               />
            ))}
         </div>
      </div>

      <div className="flex justify-start pt-6 border-t mt-12">
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
