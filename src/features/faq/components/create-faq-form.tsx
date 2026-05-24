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
import { Globe, HelpCircle, Save, Loader2, Pencil } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useFaqItem } from "../hooks/useFaqItem";
import type { FaqItem } from "../types";
import { useEffect } from "react";

const faqSchema = z.object({
  question: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().optional().default(""),
  }),
  answer: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().optional().default(""),
  }),
  status: z.string().min(1, { message: "validation.required" }),
});

type FaqFormValues = z.infer<typeof faqSchema>;

interface FaqFormProps {
  editData?: FaqItem | null;
  onSuccess?: () => void;
}

export default function CreateFaqForm({ editData, onSuccess }: FaqFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "faq.form" });
  const { t: commonT } = useTranslation("translation");
  const { createItem, isCreating, updateItem, isUpdating } = useFaqItem(editData?.id);

  const isEditing = !!editData;
  const isLoading = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: { ar: "", en: "" },
      answer: { ar: "", en: "" },
      status: "published",
    },
  });

  // Reset form when editData changes
  useEffect(() => {
    if (editData) {
      reset({
        question: editData.question,
        answer: editData.answer,
        status: editData.is_active ? "published" : "draft",
      });
    } else {
      reset({
        question: { ar: "", en: "" },
        answer: { ar: "", en: "" },
        status: "published",
      });
    }
  }, [editData, reset]);

  const onSubmit = (values: FaqFormValues) => {
    const payload = {
      question: values.question,
      answer: values.answer,
      is_active: values.status === "published",
    };

    if (isEditing) {
      updateItem(payload, {
        onSuccess: () => onSuccess?.()
      });
    } else {
      createItem(payload, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        }
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 animate-in fade-in duration-500"
    >
      <div className="p-8 rounded-[32px] border bg-card shadow-sm space-y-12">
        {/* Section: Basic Info */}
        <div className="space-y-8">
          <div className="flex items-center gap-4  pb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {isEditing ? <Pencil className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-bold">
              {isEditing ? t("edit_question") : t("add_new_question")}
            </h2>
          </div>
        </div>

        {/* Section: Content (AR/EN) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ">
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
                  <Input
                    {...field}
                    dir="rtl"
                    className="h-12 rounded-2xl bg-background border-border/50"
                  />
                  <FieldError
                    errors={[
                      {
                        message: errors.question?.ar?.message
                          ? commonT(errors.question.ar.message)
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
            <Controller
              name="answer.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("answer_ar")}</FieldLabel>
                  <Textarea
                    {...field}
                    dir="rtl"
                    className="min-h-[120px] rounded-2xl bg-background border-border/50 resize-none"
                  />
                  <FieldError
                    errors={[
                      {
                        message: errors.answer?.ar?.message
                          ? commonT(errors.answer.ar.message)
                          : undefined,
                      },
                    ]}
                  />
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
                  <Input
                    {...field}
                    dir="ltr"
                    className="h-12 rounded-2xl bg-background border-border/50"
                  />
                  <FieldError
                    errors={[
                      {
                        message: errors.question?.en?.message
                          ? commonT(errors.question.en.message)
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
            <Controller
              name="answer.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("answer_en")}</FieldLabel>
                  <Textarea
                    {...field}
                    dir="ltr"
                    className="min-h-[120px] rounded-2xl bg-background border-border/50 resize-none"
                  />
                  <FieldError
                    errors={[
                      {
                        message: errors.answer?.en?.message
                          ? commonT(errors.answer.en.message)
                          : undefined,
                      },
                    ]}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{commonT("faq.status")}</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="published">
                      {commonT("faq.published")}
                    </SelectItem>
                    <SelectItem value="draft">
                      {commonT("faq.draft")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  errors={[
                    {
                      message: errors.status?.message
                        ? commonT(errors.status.message)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
          <div /> 
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="rounded-full px-12 font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {isEditing ? t("update_faq") : t("save_faq")}
        </Button>
      </div>
    </form>
  );
}
