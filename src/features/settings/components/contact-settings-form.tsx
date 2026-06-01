import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
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
import { Save, Mail, Phone, Plus, Trash2, Loader2, MessageCircle, GraduationCap, MapPin } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useSettings, useUpdateContactSettings } from "../hooks/useSettings";
import type { PhoneItem } from "../types";
import { toast } from "sonner";

const phoneTypes = ["phone", "mobile", "whatsapp"] as const;

function parsePhoneType(value: string): PhoneItem["type"] {
  return phoneTypes.includes(value as (typeof phoneTypes)[number])
    ? (value as PhoneItem["type"])
    : "phone";
}

const contactSchema = z.object({
  email: z
    .string()
    .refine((v) => !v.trim() || z.string().email().safeParse(v.trim()).success, {
      message: "validation.email_invalid",
    }),
  phones: z.array(
    z.object({
      label: z.string().min(1, { message: "validation.required" }),
      number: z.string().min(1, { message: "validation.required" }),
      type: z.enum(phoneTypes),
    }),
  ),
  courses_phone: z
    .string()
    .max(50, { message: "validation.max_length_50" })
    .optional()
    .or(z.literal("")),
  address_ar: z.string().optional().or(z.literal("")),
  address_en: z.string().optional().or(z.literal("")),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactSettingsForm() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.contact" });
  const { t: commonT } = useTranslation("translation");

  const { data: settingsData, isLoading } = useSettings();
  const { mutateAsync: updateContact, isPending } = useUpdateContactSettings();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phones: [],
      email: "",
      courses_phone: "",
      address_ar: "",
      address_en: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phones",
  });

  useEffect(() => {
    if (settingsData?.data?.contact) {
      const c = settingsData.data.contact;
      reset({
        email: c.email ?? "",
        courses_phone: c.courses_phone ?? "",
        address_ar: c.address_ar ?? "",
        address_en: c.address_en ?? "",
        phones: (c.phones ?? []).map((p) => ({
          label: p.label,
          number: p.number,
          type: parsePhoneType(p.type),
        })),
      });
    }
  }, [settingsData, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const email = data.email.trim();
      const coursesPhone = data.courses_phone?.trim() ?? "";
      await updateContact({
        email: email || null,
        phones: data.phones,
        courses_phone: coursesPhone || null,
        address_ar: data.address_ar?.trim() || null,
        address_en: data.address_en?.trim() || null,
      });
      toast.success(commonT("success_message") || "Saved successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <Button
            type="button"
            onClick={() => append({ label: "", number: "", type: "phone" })}
            className="rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("add_phone")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <div className="max-w-md">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-gray-600 font-bold mb-3">{t("email")}</FieldLabel>
                  <div className="relative group">
                    <Input
                      {...field}
                      type="email"
                      dir="ltr"
                      className="h-14 rounded-2xl bg-muted/5 border-border/40 focus:bg-white focus:border-primary/40 transition-all pl-16!"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-border/40 shadow-sm flex items-center justify-center group-focus-within:border-primary/20 transition-all">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <FieldError
                    errors={[
                      {
                        message: errors.email?.message
                          ? commonT(errors.email.message, { defaultValue: errors.email.message })
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
          </div>

          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-800">{t("courses_phone_section")}</h3>
            </div>
            <Controller
              name="courses_phone"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-gray-600 font-bold mb-2">{t("courses_phone")}</FieldLabel>
                  <Input
                    {...field}
                    dir="ltr"
                    maxLength={50}
                    placeholder="+966..."
                    className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all"
                  />
                  <FieldDescription className="text-xs text-muted-foreground mt-1">
                    {t("courses_phone_hint")}
                  </FieldDescription>
                  <FieldError
                    errors={[
                      {
                        message: errors.courses_phone?.message
                          ? commonT(errors.courses_phone.message)
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-800">{t("addresses_section")}</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="address_ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("address_ar")}</FieldLabel>
                    <Textarea
                      {...field}
                      dir="rtl"
                      rows={3}
                      className="min-h-[88px] rounded-xl resize-none bg-white border-border/40"
                    />
                  </Field>
                )}
              />
              <Controller
                name="address_en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("address_en")}</FieldLabel>
                    <Textarea
                      {...field}
                      rows={3}
                      className="min-h-[88px] rounded-xl resize-none bg-white border-border/40"
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-800">{t("phones_list")}</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-6 rounded-[24px] border border-dashed border-border/60 bg-muted/5 relative group animate-in slide-in-from-top-2 duration-300"
                >
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 inset-e-4 text-red-500 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Controller
                      name={`phones.${index}.label`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Field>
                          <FieldLabel className="text-gray-600 font-bold mb-2">{t("label")}</FieldLabel>
                          <Input
                            {...inputField}
                            placeholder="e.g. Primary, Support"
                            className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all"
                          />
                          <FieldError
                            errors={[
                              {
                                message: errors.phones?.[index]?.label?.message
                                  ? commonT(errors.phones[index].label.message)
                                  : undefined,
                              },
                            ]}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name={`phones.${index}.number`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Field>
                          <FieldLabel className="text-gray-600 font-bold mb-2">{t("number")}</FieldLabel>
                          <Input
                            {...inputField}
                            dir="ltr"
                            placeholder="+966..."
                            className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all"
                          />
                          <FieldError
                            errors={[
                              {
                                message: errors.phones?.[index]?.number?.message
                                  ? commonT(errors.phones[index].number.message)
                                  : undefined,
                              },
                            ]}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name={`phones.${index}.type`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Field>
                          <FieldLabel className="text-gray-600 font-bold mb-2">{t("type")}</FieldLabel>
                          <Select onValueChange={inputField.onChange} value={inputField.value}>
                            <SelectTrigger className="h-12 rounded-xl bg-white border-border/40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="phone">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{t("phone_type")}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="mobile">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{t("mobile_type")}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="whatsapp">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{t("whatsapp_type")}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError
                            errors={[
                              {
                                message: errors.phones?.[index]?.type?.message
                                  ? commonT(errors.phones[index].type.message)
                                  : undefined,
                              },
                            ]}
                          />
                        </Field>
                      )}
                    />
                  </div>
                </div>
              ))}
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
