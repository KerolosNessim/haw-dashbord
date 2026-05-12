import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const contactSchema = z.object({
  phones: z.array(z.object({
    value: z.string().min(1, { message: "validation.required" }),
  })),
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
      phones: [
        { value: "(+90) 75 67 031 536" },
        { value: "(+968) 4555 9520" },
        { value: "(+968) 1971 9525" },
      ],
      email: "info@howeyah.com",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log("Contact Settings:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
         <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
            <Button
              type="button"
              onClick={() => append({ value: "" })}
              className="rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("add_phone")}
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Phones List */}
            <div className="space-y-6 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative group animate-in slide-in-from-top-2 duration-300">
                    <Controller
                      name={`phones.${index}.value`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Field>
                          <div className="flex items-center justify-between mb-3">
                            <FieldLabel className="text-gray-600 font-bold">{t("phone")} {index + 1}</FieldLabel>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="relative group">
                            <Input 
                              {...inputField} 
                              dir="ltr"
                              className="h-14 rounded-2xl bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all pl-16!" 
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-border/40 shadow-sm flex items-center justify-center text-xl group-focus-within:border-primary/20 transition-all text-primary">
                              <Phone className="w-5 h-5" />
                            </div>
                          </div>
                          <FieldError errors={[{ message: errors.phones?.[index]?.value?.message ? commonT(errors.phones[index].value.message) : undefined }]} />
                        </Field>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div className="md:col-span-1">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-3">{t("email")}</FieldLabel>
                    <div className="relative group">
                      <Input 
                        {...field} 
                        dir="ltr"
                        className="h-14 rounded-2xl bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all pl-16!" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-border/40 shadow-sm flex items-center justify-center group-focus-within:border-primary/20 transition-all">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <FieldError errors={[{ message: errors.email?.message ? commonT(errors.email.message) : undefined }]} />
                  </Field>
                )}
              />
            </div>
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
