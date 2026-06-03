import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Briefcase,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { AccreditationImageServicesSelect } from "@/features/home-content/components/AccreditationImageServicesSelect";
import { useAccreditationServiceOptions } from "@/features/home-content/hooks/useAccreditationServiceOptions";
import { linkedServicesFromIds } from "@/features/home-content/services/accreditation-form-data";
import type { AccreditationLinkedService } from "@/features/home-content/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  emptyItemFormValues,
  itemToFormValues,
  publicPortfolioItemPreviewUrl,
} from "../services/client-portfolio-api";
import { extractLaravelFieldErrors } from "../utils/form-errors";
import { isValidPortfolioLink } from "../utils/validation";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import type { PortfolioCategory, PortfolioItem, PortfolioItemFormValues } from "../types";

const CATEGORIES: PortfolioCategory[] = ["healthcare", "animals", "food_retail"];

type Props = {
  item: PortfolioItem | null;
  isSaving: boolean;
  saveError: unknown;
  onSave: (values: PortfolioItemFormValues) => void | Promise<void>;
  onCancel: () => void;
};

type FormErrors = Record<string, string>;

function FormSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/50 bg-white p-5 shadow-sm md:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function toLinkedServices(services: PortfolioItem["services"]): AccreditationLinkedService[] {
  return (services ?? []).map((s) => ({ id: s.id, title: s.title }));
}

export default function PortfolioItemForm({
  item,
  isSaving,
  saveError,
  onSave,
  onCancel,
}: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "client_portfolio.items" });
  const servicesQuery = useAccreditationServiceOptions();
  const serviceOptions = servicesQuery.data ?? [];

  const [form, setForm] = useState<PortfolioItemFormValues>(() =>
    item ? itemToFormValues(item) : emptyItemFormValues(),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [contentLang, setContentLang] = useState<"ar" | "en">("ar");

  const { control } = useForm<{ metrics: PortfolioItemFormValues["metrics"] }>({
    values: { metrics: form.metrics },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "metrics" });

  const serverErrors = useMemo(
    () => (saveError ? extractLaravelFieldErrors(saveError) : {}),
    [saveError],
  );

  const fieldErrors = useMemo(
    () => ({ ...serverErrors, ...errors }),
    [serverErrors, errors],
  );

  const setField = <K extends keyof PortfolioItemFormValues>(
    key: K,
    value: PortfolioItemFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!isValidPortfolioLink(form.full_case_study_link_ar)) {
      next.full_case_study_link_ar = t("validation.link");
    }
    if (!isValidPortfolioLink(form.full_case_study_link_en)) {
      next.full_case_study_link_en = t("validation.link");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const previewUrl = item?.id ? publicPortfolioItemPreviewUrl(item.id) : "";

  const localeFields = (lang: "ar" | "en") => {
    const suffix = lang;
    const dir = lang === "ar" ? "rtl" : "ltr";
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>{t("fields.client_tag")}</FieldLabel>
          <Input
            dir={dir}
            value={form[`client_tag_${suffix}`]}
            onChange={(e) => setField(`client_tag_${suffix}`, e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field>
          <FieldLabel>{t("fields.period")}</FieldLabel>
          <Input
            dir={dir}
            value={form[`period_${suffix}`]}
            onChange={(e) => setField(`period_${suffix}`, e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>{t("fields.headline")}</FieldLabel>
          <Textarea
            dir={dir}
            value={form[`headline_${suffix}`]}
            onChange={(e) => setField(`headline_${suffix}`, e.target.value)}
            className="min-h-[88px] rounded-xl"
          />
          {fieldErrors[`headline_${suffix}`] ? (
            <p className="text-sm text-destructive">{fieldErrors[`headline_${suffix}`]}</p>
          ) : null}
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>{t("fields.client")}</FieldLabel>
          <Input
            dir={dir}
            value={form[`client_${suffix}`]}
            onChange={(e) => setField(`client_${suffix}`, e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field>
          <FieldLabel>{t("fields.challenge")}</FieldLabel>
          <Textarea
            dir={dir}
            value={form[`challenge_${suffix}`]}
            onChange={(e) => setField(`challenge_${suffix}`, e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </Field>
        <Field>
          <FieldLabel>{t("fields.what_we_did")}</FieldLabel>
          <Textarea
            dir={dir}
            value={form[`what_we_did_${suffix}`]}
            onChange={(e) => setField(`what_we_did_${suffix}`, e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>{t("fields.results")}</FieldLabel>
          <Textarea
            dir={dir}
            value={form[`results_${suffix}`]}
            onChange={(e) => setField(`results_${suffix}`, e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </Field>
        <Field>
          <FieldLabel>{t("fields.full_case_study_link")}</FieldLabel>
          <Input
            dir={dir}
            value={form[`full_case_study_link_${suffix}`]}
            onChange={(e) => setField(`full_case_study_link_${suffix}`, e.target.value)}
            placeholder="/portfolio/..."
            className="h-11 rounded-xl"
          />
          {fieldErrors[`full_case_study_link_${suffix}`] ? (
            <p className="text-sm text-destructive">{fieldErrors[`full_case_study_link_${suffix}`]}</p>
          ) : null}
        </Field>
        <Field>
          <FieldLabel>{t("fields.read_case_study_button_text")}</FieldLabel>
          <Input
            dir={dir}
            value={form[`read_case_study_button_text_${suffix}`]}
            onChange={(e) => setField(`read_case_study_button_text_${suffix}`, e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    );
  };

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const genericSaveError =
    saveError && !hasFieldErrors
      ? getHttpErrorMessage(saveError, { default: "" }) || t("toast_error")
      : null;

  return (
    <div className="space-y-6">
      {genericSaveError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {genericSaveError}
        </div>
      ) : null}
      <FormSection title={t("dialog_sections.settings")} icon={Settings2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field>
            <FieldLabel>{t("fields.category")}</FieldLabel>
            <Select
              value={form.category}
              onValueChange={(v) => setField("category", v as PortfolioCategory)}
            >
              <SelectTrigger className="h-11 rounded-xl bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>{t("fields.sort_order")}</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => setField("sort_order", Number(e.target.value) || 0)}
              className="h-11 rounded-xl bg-background"
            />
          </Field>
          <div className="flex h-11 items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-4">
            <FieldLabel className="mb-0 font-semibold">{t("fields.is_active")}</FieldLabel>
            <Switch checked={form.is_active} onCheckedChange={(v) => setField("is_active", v)} />
          </div>
        </div>
      </FormSection>

      <FormSection title={t("dialog_sections.media")} icon={ImageIcon}>
        <BilingualSectionImageUpload
          value={form.image}
          onChange={(image) => setField("image", image)}
          keyPrefix="client_portfolio"
          required={false}
          errorMessage={fieldErrors.image}
          aspectClass="aspect-[4/3] min-h-[160px]"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>
              {t("fields.image_alt")} ({t("ar")})
            </FieldLabel>
            <Input
              dir="rtl"
              value={form.image_alt_ar}
              onChange={(e) => setField("image_alt_ar", e.target.value)}
              className="h-11 rounded-xl bg-background"
            />
            {fieldErrors.image_alt_ar ? (
              <p className="text-sm text-destructive">{fieldErrors.image_alt_ar}</p>
            ) : null}
          </Field>
          <Field>
            <FieldLabel>
              {t("fields.image_alt")} ({t("en")})
            </FieldLabel>
            <Input
              value={form.image_alt_en}
              onChange={(e) => setField("image_alt_en", e.target.value)}
              className="h-11 rounded-xl bg-background"
            />
            {fieldErrors.image_alt_en ? (
              <p className="text-sm text-destructive">{fieldErrors.image_alt_en}</p>
            ) : null}
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("dialog_sections.services")} icon={Briefcase}>
        <AccreditationImageServicesSelect
          value={form.serviceIds}
          onChange={(serviceIds) =>
            setForm((prev) => ({
              ...prev,
              serviceIds,
              linkedServices: linkedServicesFromIds(
                serviceIds,
                serviceOptions,
                prev.linkedServices as AccreditationLinkedService[],
              ),
            }))
          }
          services={serviceOptions}
          embeddedServices={toLinkedServices(form.linkedServices as PortfolioItem["services"])}
          i18nKeyPrefix="client_portfolio.items"
          disabled={isSaving}
          loading={servicesQuery.isLoading}
        />
      </FormSection>

      <FormSection title={t("dialog_sections.metrics")} icon={BarChart3}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("fields.metrics")}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-primary/30 font-bold text-primary hover:bg-primary/5"
            onClick={() => {
              append({ ar: "", en: "" });
              setForm((prev) => ({
                ...prev,
                metrics: [...prev.metrics, { ar: "", en: "" }],
              }));
            }}
          >
            <Plus className="me-1 h-4 w-4" />
            {t("add_metric")}
          </Button>
        </div>
        <div className="space-y-2">
          {form.metrics.map((metric, index) => (
            <div
              key={fields[index]?.id ?? index}
              className="grid grid-cols-1 gap-2 rounded-xl border border-dashed border-border/80 bg-muted/10 p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                dir="rtl"
                placeholder={t("metric_ar")}
                value={metric.ar}
                onChange={(e) => {
                  const metrics = [...form.metrics];
                  metrics[index] = { ...metrics[index], ar: e.target.value };
                  setField("metrics", metrics);
                }}
                className="h-10 rounded-lg bg-background"
              />
              <Input
                placeholder={t("metric_en")}
                value={metric.en}
                onChange={(e) => {
                  const metrics = [...form.metrics];
                  metrics[index] = { ...metrics[index], en: e.target.value };
                  setField("metrics", metrics);
                }}
                className="h-10 rounded-lg bg-background"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={form.metrics.length <= 1}
                onClick={() => {
                  remove(index);
                  setForm((prev) => ({
                    ...prev,
                    metrics: prev.metrics.filter((_, i) => i !== index),
                  }));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title={t("dialog_sections.content")} icon={FileText}>
        <Tabs value={contentLang} onValueChange={(v) => setContentLang(v as "ar" | "en")}>
          <TabsList className="mb-6 h-10 w-full rounded-xl bg-muted/50 p-1 sm:w-auto">
            <TabsTrigger
              value="ar"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t("ar")}
            </TabsTrigger>
            <TabsTrigger
              value="en"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t("en")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ar" className="mt-0 outline-none">
            {localeFields("ar")}
          </TabsContent>
          <TabsContent value="en" className="mt-0 outline-none">
            {localeFields("en")}
          </TabsContent>
        </Tabs>
        {previewUrl ? (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {t("preview_public")}
          </a>
        ) : null}
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-2 mt-4 flex justify-end gap-3 rounded-2xl border border-border/50 bg-white/95 px-4 py-4 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6 font-bold"
            onClick={onCancel}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            className="gap-2 rounded-xl px-8 font-bold"
            onClick={async () => {
              if (!validate()) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              await onSave(form);
            }}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("save")}
          </Button>
      </div>
    </div>
  );
}
