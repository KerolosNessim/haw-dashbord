import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, HelpCircle, Save, Search } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const faqSchema = z.object({
  question: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().min(1, { message: "validation.required" }),
  }),
  answer: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().min(1, { message: "validation.required" }),
  }),
  category_id: z.string().min(1, { message: "validation.required" }),
  status: z.string().min(1, { message: "validation.required" }),
  meta_title: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
  meta_description: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
});

type FaqFormValues = z.infer<typeof faqSchema>;

export default function CreateFaqForm() {
  const { t } = useTranslation("translation", { keyPrefix: "faq.form" });
  const { t: commonT } = useTranslation("translation");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: { ar: "", en: "" },
      answer: { ar: "", en: "" },
      category_id: "",
      status: "published",
      meta_title: { ar: "", en: "" },
      meta_description: { ar: "", en: "" },
    },
  });

  const onSubmit = (data: FaqFormValues) => {
    console.log("FAQ Data:", data);
    // Here you would call your API mutation
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="p-8 rounded-[32px] border bg-card shadow-sm space-y-12">
        {/* Section: Basic Info */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b pb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{t("add_new_question")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{commonT("faq.category")}</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                      <SelectValue placeholder={t("category_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1">{commonT("faq.categories.account")}</SelectItem>
                      <SelectItem value="2">{commonT("faq.categories.orders")}</SelectItem>
                      <SelectItem value="3">{commonT("faq.categories.support")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[{ message: errors.category_id?.message ? commonT(errors.category_id.message) : undefined }]} />
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{commonT("faq.status")}</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="published">{commonT("faq.published")}</SelectItem>
                      <SelectItem value="draft">{commonT("faq.draft")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[{ message: errors.status?.message ? commonT(errors.status.message) : undefined }]} />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section: Content (AR/EN) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t">
          {/* Arabic Content */}
          <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
            <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
               <Globe className="w-4 h-4" /> {commonT("services.form.arabic")}
            </div>
            <Controller
              name="question.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("question_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-2xl bg-background border-border/50" />
                  <FieldError errors={[{ message: errors.question?.ar?.message ? commonT(errors.question.ar.message) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="answer.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("answer_ar")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[120px] rounded-2xl bg-background border-border/50 resize-none" />
                  <FieldError errors={[{ message: errors.answer?.ar?.message ? commonT(errors.answer.ar.message) : undefined }]} />
                </Field>
              )}
            />
          </div>

          {/* English Content */}
          <div className="space-y-8 p-6 rounded-[24px] border border-dashed bg-muted/5">
            <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
               <Globe className="w-4 h-4" /> {commonT("services.form.english")}
            </div>
            <Controller
              name="question.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("question_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-2xl bg-background border-border/50" />
                  <FieldError errors={[{ message: errors.question?.en?.message ? commonT(errors.question.en.message) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="answer.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("answer_en")}</FieldLabel>
                  <Textarea {...field} dir="ltr" className="min-h-[120px] rounded-2xl bg-background border-border/50 resize-none" />
                  <FieldError errors={[{ message: errors.answer?.en?.message ? commonT(errors.answer.en.message) : undefined }]} />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section: SEO */}
        <div className="space-y-8 pt-8 border-t">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">{commonT("services.form.seo_settings")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6 p-6 rounded-2xl bg-muted/5 border">
               <div className="text-xs font-bold opacity-40 uppercase mb-4">{commonT("services.form.arabic")} SEO</div>
               <Controller
                name="meta_title.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_title_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-11 rounded-xl bg-background border-border/50" />
                  </Field>
                )}
              />
              <Controller
                name="meta_description.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_description_ar")}</FieldLabel>
                    <Textarea {...field} dir="rtl" className="h-24 rounded-xl bg-background border-border/50 resize-none" />
                  </Field>
                )}
              />
            </div>

            <div className="space-y-6 p-6 rounded-2xl bg-muted/5 border">
               <div className="text-xs font-bold opacity-40 uppercase mb-4">{commonT("services.form.english")} SEO</div>
               <Controller
                name="meta_title.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_title_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-11 rounded-xl bg-background border-border/50" />
                  </Field>
                )}
              />
              <Controller
                name="meta_description.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("meta_description_en")}</FieldLabel>
                    <Textarea {...field} dir="ltr" className="h-24 rounded-xl bg-background border-border/50 resize-none" />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-12 font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Save className="w-5 h-5 mr-2" />
          {t("save_faq")}
        </Button>
      </div>
    </form>
  );
}
