import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Globe,
  Languages,
  Layout,
  Loader2,
  Save,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Can } from "@/features/permissions/components/PermissionGate";
import ContactHeaderCountriesField from "./contact-header-countries-field";
import { CONTACT_HEADERS_QUERY_KEY } from "../query-keys";
import { useUpsertContactHeader } from "../hooks/useUpsertContactHeader";
import {
  emptyContactHeaderFormValues,
  fetchContactHeaderById,
  headerToFormValues,
} from "../services/contact-headers-api";
import type { ContactHeader, ContactHeaderFormValues } from "../types";

const baseSchema = z.object({
  country_ids: z.array(z.string()).default([]),
  title_ar: z.string().min(1, { message: "validation.required" }),
  title_en: z.string().optional().default(""),
  description_ar: z.string().optional().default(""),
  description_en: z.string().optional().default(""),
});

const createSchema = baseSchema.extend({
  country_ids: z.array(z.string()).min(1, { message: "validation.country_required" }),
});

type DialogValues = z.infer<typeof baseSchema>;

type ContactHeaderFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial: ContactHeader | null;
};

function normalizeOptionalRichText(value: string): string {
  const html = editorOnChangeToHtml(value);
  return plainTextFromHtml(html) ? html : "";
}

function dialogToApiValues(data: DialogValues): ContactHeaderFormValues {
  return {
    country_ids: data.country_ids,
    title: { ar: data.title_ar.trim(), en: data.title_en.trim() },
    description: {
      ar: normalizeOptionalRichText(data.description_ar),
      en: normalizeOptionalRichText(data.description_en),
    },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    sort_order: 0,
    is_active: true,
  };
}

function headerToDialogValues(header: ContactHeader): DialogValues {
  const v = headerToFormValues(header);
  return {
    country_ids: v.country_ids,
    title_ar: v.title.ar,
    title_en: v.title.en,
    description_ar: v.description.ar,
    description_en: v.description.en,
  };
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-[28px] border border-border/50 bg-muted/10 p-6 md:p-7">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function ContactHeaderFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: ContactHeaderFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "contact_headers.form" });
  const { t: commonT } = useTranslation("translation", { keyPrefix: "validation" });
  const { upsertMutation, isPending } = useUpsertContactHeader();

  const detailQuery = useQuery({
    queryKey: [...CONTACT_HEADERS_QUERY_KEY, "detail", initial?.id],
    queryFn: () => fetchContactHeaderById(initial!.id),
    enabled: open && mode === "edit" && initial?.id != null,
  });

  const schema = mode === "create" ? createSchema : baseSchema;

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<DialogValues>({
    resolver: zodResolver(schema) as Resolver<DialogValues>,
    defaultValues: {
      ...headerToDialogValues({
        id: 0,
        ...emptyContactHeaderFormValues(),
        country_ids: [],
        countries: [],
      }),
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      reset({
        country_ids: [],
        title_ar: "",
        title_en: "",
        description_ar: "",
        description_en: "",
      });
      return;
    }
    if (detailQuery.data) {
      reset(headerToDialogValues(detailQuery.data));
    } else if (initial) {
      reset(headerToDialogValues(initial));
    }
  }, [open, mode, initial, detailQuery.data, reset]);

  const translateError = (message?: string) =>
    message?.includes("validation.") ? commonT(message.replace("validation.", "")) : message;

  const onSubmit = async (data: DialogValues) => {
    try {
      await upsertMutation({
        values: dialogToApiValues(data),
        headerId: mode === "edit" ? initial?.id : null,
      });
      onOpenChange(false);
    } catch {
      /* toast from mutation */
    }
  };

  const isLoadingDetail = mode === "edit" && detailQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl! gap-0 overflow-y-auto no-scrollbar rounded-[32px] border-none p-0 shadow-2xl">
        <div className="border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background px-8 py-7">
          <DialogHeader className="text-start">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Layout className="h-6 w-6" />
              </div>
              <div className="space-y-1 pe-8">
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {mode === "create" ? t("create_title") : t("edit_title")}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium leading-relaxed">
                  {t("description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {isLoadingDetail ? (
          <div className="flex items-center justify-center gap-3 bg-white py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-medium">{t("loading")}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6  bg-white p-6 md:p-8"
          >
            <FormSection icon={Globe} title={t("section_countries")}>
              <Controller
                name="country_ids"
                control={control}
                render={({ field }) => (
                  <ContactHeaderCountriesField
                    value={field.value ?? []}
                    onChange={field.onChange}
                    label={t("countries")}
                    hint={t("countries_hint")}
                    required={mode === "create"}
                    error={
                      errors.country_ids?.message
                        ? commonT(errors.country_ids.message.replace("validation.", ""))
                        : undefined
                    }
                  />
                )}
              />
            </FormSection>

            <FormSection icon={Languages} title={t("section_content")}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                  name="title_ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold">{t("title_ar")} *</FieldLabel>
                      <Input
                        {...field}
                        dir="rtl"
                        className="h-12 rounded-2xl border-border/50 bg-background"
                        placeholder={t("title_ar_placeholder")}
                      />
                      <FieldError errors={[{ message: translateError(errors.title_ar?.message) }]} />
                    </Field>
                  )}
                />
                <Controller
                  name="title_en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold">{t("title_en")}</FieldLabel>
                      <Input
                        {...field}
                        dir="ltr"
                        className="h-12 rounded-2xl border-border/50 bg-background"
                        placeholder={t("title_en_placeholder")}
                      />
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t("description_label")}
                </div>
                <LocalizedDescriptionFields
                  control={control}
                  nameAr="description_ar"
                  nameEn="description_en"
                  labelAr={t("description_ar")}
                  labelEn={t("description_en")}
                  placeholder={t("description_placeholder")}
                  translateError={translateError}
                  clearErrors={clearErrors}
                  trigger={trigger}
                  minHeightClass="min-h-[200px] rounded-2xl border border-border/50 overflow-hidden bg-background"
                />
              </div>
            </FormSection>



            <DialogFooter className="sticky bottom-0 gap-3 border-t border-border/40 bg-white/95 px-0 pt-4 backdrop-blur-sm sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6 font-bold"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Can resource="contact-headers" action={mode === "create" ? "create" : "update"}>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
                >
                  {isPending ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="me-2 h-4 w-4" />
                  )}
                  {t("save")}
                </Button>
              </Can>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
