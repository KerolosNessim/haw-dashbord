import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { useResourcePermissions } from "@/features/permissions/hooks/useResourcePermissions";
import { Can } from "@/features/permissions/components/PermissionGate";
import { useInvoiceCatalog } from "../hooks/useInvoiceCatalog";
import { useCreateInvoice } from "../hooks/useInvoices";
import { buildLineItemsFromKeys } from "../services/invoice-catalog-api";
import { normalizeInvoiceCurrency } from "../utils/invoice-currency";
import { generateInvoiceNumber } from "../utils/generate-invoice-number";
import { computeInvoiceTotals } from "../utils/invoice-math";
import InvoiceCatalogPicker from "./invoice-catalog-picker";
import InvoicePreview from "./invoice-preview";

const schema = z
  .object({
    client_name: z.string().min(1, { message: "validation.required" }),
    client_phone: z.string().min(1, { message: "validation.required" }),
    company_name: z.string().min(1, { message: "validation.required" }),
    package_keys: z.array(z.string()),
    service_keys: z.array(z.string()),
    course_keys: z.array(z.string()),
    discount: z.coerce.number().min(0).optional(),
    tax: z.coerce.number().min(0).optional(),
  })
  .refine(
    (v) => v.package_keys.length + v.service_keys.length + v.course_keys.length > 0,
    { message: "catalog_required", path: ["package_keys"] },
  );

type FormValues = z.infer<typeof schema>;

export default function InvoiceForm() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "invoices.form" });
  const { t: commonT } = useTranslation("translation");
  const navigate = useNavigate();
  const locale = i18n.language.startsWith("ar") ? "ar" : "en";
  const { data: catalog = [], isLoading: catalogLoading } = useInvoiceCatalog();
  const createMutation = useCreateInvoice();
  const invoicePerms = useResourcePermissions("invoices");

  const invoiceNumber = useMemo(() => generateInvoiceNumber(), []);
  const [lineCosts, setLineCosts] = useState<Record<string, number>>({});

  const syncLineCostsForKeys = useCallback(
    (keys: string[]) => {
      setLineCosts((prev) => {
        const next: Record<string, number> = {};
        for (const key of keys) {
          const opt = catalog.find((o) => o.key === key);
          next[key] = prev[key] ?? opt?.price ?? 0;
        }
        return next;
      });
    },
    [catalog],
  );

  const handleLineCostChange = useCallback((key: string, cost: number) => {
    setLineCosts((prev) => ({ ...prev, [key]: cost }));
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_name: "",
      client_phone: "",
      company_name: "",
      package_keys: [],
      service_keys: [],
      course_keys: [],
      discount: 0,
      tax: 0,
    },
  });

  const watched = watch();

  const allCatalogKeys = useMemo(
    () => [...watched.package_keys, ...watched.service_keys, ...watched.course_keys],
    [watched.package_keys, watched.service_keys, watched.course_keys],
  );

  const lineItems = useMemo(
    () =>
      buildLineItemsFromKeys(
        allCatalogKeys,
        catalog,
        watched.company_name,
        locale,
        lineCosts,
      ),
    [allCatalogKeys, catalog, watched.company_name, locale, lineCosts],
  );

  const { subtotal, discount, tax, total } = computeInvoiceTotals(
    lineItems,
    watched.discount ?? 0,
    watched.tax ?? 0,
  );

  const invoiceDateLabel = format(new Date(), "yyyy-MM-dd");

  const onSubmit = (values: FormValues) => {
    const keys = [...values.package_keys, ...values.service_keys, ...values.course_keys];
    if (keys.length === 0) {
      return;
    }

    const items = buildLineItemsFromKeys(
      keys,
      catalog,
      values.company_name,
      locale,
      lineCosts,
    );
    createMutation.mutate(
      {
        invoice_number: invoiceNumber,
        client_name: values.client_name.trim(),
        client_phone: values.client_phone.trim(),
        company_name: values.company_name.trim(),
        discount: values.discount ?? 0,
        tax: values.tax ?? 0,
        line_items: items.map((row) => ({
          type: row.type,
          id: row.id,
          cost: row.cost,
          currency: normalizeInvoiceCurrency(row.currency),
        })),
      },
      {
        onSuccess: () => navigate("/invoices"),
      },
    );
  };

  const catalogKeysError =
    errors.package_keys?.message === "catalog_required" ? t("catalog_required") : undefined;

  const dir = i18n.dir();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" dir={dir}>
      <div className="rounded-[32px] border border-border/40 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-6 text-sm text-muted-foreground">
          {t("invoice_number_hint")}{" "}
          <span className="font-mono font-bold text-foreground" dir="ltr">
            HWEY - {invoiceNumber}
          </span>
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="client_name"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("client_name")}</FieldLabel>
                <Input {...field} className="h-12 rounded-2xl" />
                <FieldError errors={[{ message: errors.client_name?.message && commonT(errors.client_name.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="client_phone"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("client_phone")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-2xl" />
                <FieldError errors={[{ message: errors.client_phone?.message && commonT(errors.client_phone.message) }]} />
              </Field>
            )}
          />
          <Controller
            name="company_name"
            control={control}
            render={({ field }) => (
              <Field className="md:col-span-2">
                <FieldLabel>{t("company_name")}</FieldLabel>
                <Input {...field} className="h-12 rounded-2xl" />
                <FieldError errors={[{ message: errors.company_name?.message && commonT(errors.company_name.message) }]} />
              </Field>
            )}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Controller
            name="package_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="package"
                label={t("packages")}
                placeholder={t("select_packages")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...keys,
                    ...watched.service_keys,
                    ...watched.course_keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
              />
            )}
          />
          <Controller
            name="service_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="service"
                label={t("services")}
                placeholder={t("select_services")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...watched.package_keys,
                    ...keys,
                    ...watched.course_keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
              />
            )}
          />
          <Controller
            name="course_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="course"
                label={t("courses")}
                placeholder={t("select_courses")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...watched.package_keys,
                    ...watched.service_keys,
                    ...keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
              />
            )}
          />
        </div>

        {catalogKeysError ? (
          <p className="mt-4 text-sm font-medium text-destructive">{catalogKeysError}</p>
        ) : null}

        <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("discount")}</FieldLabel>
                <Input {...field} type="number" min={0} step="0.01" className="h-11 rounded-xl" />
              </Field>
            )}
          />
          <Controller
            name="tax"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("tax")}</FieldLabel>
                <Input {...field} type="number" min={0} step="0.01" className="h-11 rounded-xl" />
              </Field>
            )}
          />
        </div>

        <div className={`mt-8 flex gap-3 ${dir === "rtl" ? "justify-start" : "justify-end"}`}>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/invoices")}>
            {t("cancel")}
          </Button>
          <Can permission="invoices.create">
            <Button
              type="submit"
              disabled={
                !invoicePerms.create ||
                createMutation.isPending ||
                allCatalogKeys.length === 0
              }
              className="rounded-xl px-8 font-bold"
            >
              {createMutation.isPending ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="me-2 h-4 w-4" />
              )}
              {t("save")}
            </Button>
          </Can>
        </div>
      </div>

      <section className="space-y-4" dir="rtl">
        <h2 className="text-right text-xl font-bold tracking-tight">{t("preview_title")}</h2>
        <InvoicePreview
          id="invoice-preview-draft"
          invoiceNumber={invoiceNumber}
          invoiceDateLabel={invoiceDateLabel}
          clientName={watched.client_name}
          clientPhone={watched.client_phone}
          companyName={watched.company_name}
          lineItems={lineItems}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          currency={lineItems[0]?.currency}
        />
      </section>
    </form>
  );
}
