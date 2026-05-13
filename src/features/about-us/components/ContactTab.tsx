import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignLeft,
  Languages,
  MessageCircle,
  Phone,
  Save,
  Loader2,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAboutUs } from "../hooks/useAboutUs";
import { useEffect } from "react";

interface ContactFormValues {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  phone: string;
}

/**
 * ContactTab Component for About Us
 */
export default function ContactTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about.contact",
  });

  const { getAboutUsQuery, updateContactSection, isUpdatingContactSection } = useAboutUs();
  const { data: aboutUsData, isLoading } = getAboutUsQuery;

  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    defaultValues: {
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      phone: "",
    },
  });

  // Sync data to form when fetched
  useEffect(() => {
    if (aboutUsData?.data?.contact_sections?.[0]) {
      const c = aboutUsData.data.contact_sections[0];
      reset({
        title_ar: c.title?.ar || "",
        title_en: c.title?.en || "",
        description_ar: c.description?.ar || "",
        description_en: c.description?.en || "",
        phone: c.phone || "",
      });
    }
  }, [aboutUsData, reset]);

  const onSubmit = (values: ContactFormValues) => {
    updateContactSection({
      contact_title: { ar: values.title_ar, en: values.title_en },
      contact_description: { ar: values.description_ar, en: values.description_en },
      contact_phone: values.phone,
    });
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }



  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                    ({t("ar")}) {t("sec_title")}
                    <Languages className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="..."
                    className="h-12 rounded-xl bg-muted/5 border-border/60 focus:bg-white transition-all"
                    dir="rtl"
                  />
                </Field>
              )}
            />
            <Controller
              name="title_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    {t("sec_title")} ({t("en")})
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="..."
                    className="h-12 rounded-xl bg-muted/5 border-border/60 focus:bg-white transition-all"
                  />
                </Field>
              )}
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="description_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 justify-start">
                    ({t("ar")}) {t("sec_des")}
                    <AlignLeft className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="..."
                    className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                    dir="rtl"
                  />
                </Field>
              )}
            />
            <Controller
              name="description_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-primary" />
                    {t("sec_des")} ({t("en")})
                  </FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="..."
                    className="min-h-[150px] rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-4"
                  />
                </Field>
              )}
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 space-y-6">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Contact Details</h3>
            </div>

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{t("phone")}</FieldLabel>
                  <Input
                  dir="ltr"
                    {...field}
                    placeholder="+20..."
                    className="h-14 rounded-2xl bg-white border-border/60 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 px-2">
                    Enter the phone number including country code.
                  </p>
                </Field>
              )}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-10 border-t">
        <Button
          type="submit"
          size="lg"
          disabled={isUpdatingContactSection}
          className="px-12 rounded-[20px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
        >
          {isUpdatingContactSection ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
