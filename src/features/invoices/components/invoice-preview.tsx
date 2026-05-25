import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../utils/invoice-math";
import { invoiceDisplayText } from "../utils/invoice-display-text";
import { printInvoiceElement } from "../utils/download-invoice";
import type { InvoiceLineItem } from "../types";

const BRAND_GREEN = "#99C23C";
const ROW_ALT = "#F2F2F2";
const LOGO_WATERMARK_OPACITY = 0.07;

const invoiceLogoSrc = () => {
  const path = `${import.meta.env.BASE_URL}logo.png`.replace(/\/+/g, "/");
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.href).href;
};

function InvoiceLogoWatermark({ placement }: { placement: "center" | "bottom" }) {
  const logoSrc = invoiceLogoSrc();
  const isCenter = placement === "center";

  return (
    <div
      className={
        isCenter
          ? "pointer-events-none absolute inset-0 flex items-center justify-center"
          : "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-10"
      }
      style={{ opacity: LOGO_WATERMARK_OPACITY }}
      aria-hidden
    >
      <img
        src={logoSrc}
        alt=""
        className={
          isCenter
            ? "max-h-[min(420px,72%)] w-auto max-w-[min(480px,88%)] object-contain select-none"
            : "h-20 w-auto max-w-[240px] object-contain select-none"
        }
      />
    </div>
  );
}

export type InvoicePreviewProps = {
  invoiceNumber: string;
  invoiceDateLabel: string;
  clientName: string;
  clientPhone: string;
  companyName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency?: string;
  className?: string;
  id?: string;
};

export default function InvoicePreview({
  invoiceNumber,
  invoiceDateLabel,
  clientName,
  clientPhone,
  companyName,
  lineItems,
  subtotal,
  discount,
  tax,
  total,
  currency = "",
  className = "",
  id,
}: InvoicePreviewProps) {
  const { t } = useTranslation("translation", { keyPrefix: "invoices" });
  const displayNumber = invoiceNumber ? `HWEY - ${invoiceNumber}` : "HWEY - —";
  const rows = lineItems.length > 0 ? lineItems : [];

  const handlePrint = () => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) printInvoiceElement(el);
  };

  return (
    <div
      id={id}
      className={`invoice-print-root relative mx-auto w-full max-w-[794px] overflow-hidden rounded-lg bg-white text-[#333] shadow-sm ${className}`}
      dir="rtl"
      lang="ar"
      style={{ fontFamily: "system-ui, 'Segoe UI', Tahoma, sans-serif" }}
    >
      <InvoiceLogoWatermark placement="center" />
      <InvoiceLogoWatermark placement="bottom" />

      <div className="relative z-1 px-8 pb-8 pt-10">
        {id ? (
          <div className="mb-4 flex justify-start print:hidden" data-print-hide>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#333] shadow-sm transition-colors hover:bg-[#f8f8f8]"
            >
              <Printer className="h-4 w-4" aria-hidden />
              {t("print")}
            </button>
          </div>
        ) : null}

        <header className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <img
              src={invoiceLogoSrc()}
              alt="Howeyah"
              className="h-16 w-auto max-w-[220px] object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-[#333]">فاتورة الخدمات الالكترونية</h1>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#333]">بيانات العميل (Bill To)</h2>
            <dl className="space-y-2.5 text-sm">
              <InvoiceFieldRow label="الاسم الكامل" value={invoiceDisplayText(clientName) || "—"} />
              <InvoiceFieldRow label="رقم الجوال" value={clientPhone || "—"} ltr />
              <InvoiceFieldRow label="اسم الشركة" value={invoiceDisplayText(companyName) || "—"} />
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-[#333]">بيانات الفاتورة</h2>
            <dl className="space-y-2.5 text-sm">
              <InvoiceFieldRow label="رقم الفاتورة" value={displayNumber} ltr />
              <InvoiceFieldRow label="تاريخ الفاتورة" value={invoiceDateLabel || "—"} />
            </dl>
          </section>
        </div>

        <h2 className="mb-2 text-sm font-bold text-[#333]">تفاصيل الفاتورة</h2>

        <table className="mb-6 w-full border-collapse text-sm" dir="rtl">
          <thead>
            <tr style={{ backgroundColor: BRAND_GREEN, color: "#fff" }}>
              <th className="px-4 py-3 text-right font-bold">الخدمة</th>
              <th className="px-4 py-3 text-center font-bold">اسم الموقع</th>
              <th className="px-4 py-3 text-left font-bold">التكلفة</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr style={{ backgroundColor: ROW_ALT }}>
                <td colSpan={3} className="px-4 py-6 text-center text-[#888]">
                  —
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.catalogKey}
                  style={{ backgroundColor: i % 2 === 0 ? ROW_ALT : "#fff" }}
                >
                  <td className="px-4 py-3 text-right text-[#666]">
                    {invoiceDisplayText(row.serviceNameAr || row.serviceNameEn) || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-[#666]">
                    {invoiceDisplayText(row.siteName)}
                  </td>
                  <td className="px-4 py-3 text-left text-[#666]" dir="ltr">
                    {formatMoney(row.cost, row.currency || currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div
              className="mb-3 rounded px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              ملاحظات / تعليمات الدفع
            </div>
            <p className="text-sm leading-relaxed text-[#333]">
              يتم سداد قيمة هذه الفاتورة حصراً عبر رابط الدفع الإلكتروني الخاص بـ بوابة دفع شركة
              هوية.
            </p>
          </div>

          <div className="space-y-0 text-sm">
            <TotalRow label="المجموع الفرعي" value={formatMoney(subtotal, currency)} alt />
            <TotalRow label="الخصم" value={formatMoney(discount, currency)} />
            <TotalRow label="الضريبة" value={formatMoney(tax, currency)} alt />
            <TotalRow
              label="الرصيد المستحق"
              value={formatMoney(total, currency)}
              highlight
            />
          </div>
        </div>

        <footer
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#ddd] pt-4 text-xs text-[#666]"
          dir="ltr"
        >
          <span dir="ltr">info@howeyah.com</span>
          <a href="https://howeyah.net" className="hover:underline" dir="ltr">
            https://howeyah.net
          </a>
          <span dir="ltr">(+966) 9520 4555</span>
        </footer>
      </div>
    </div>
  );
}

function InvoiceFieldRow({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2">
      <dt className="font-semibold text-[#555]">{label}:</dt>
      <dd
        className={`text-[#333] ${ltr ? "[unicode-bidi:isolate]" : ""}`}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function TotalRow({
  label,
  value,
  alt,
  highlight,
}: {
  label: string;
  value: string;
  alt?: boolean;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 font-bold text-white"
        style={{ backgroundColor: BRAND_GREEN }}
        dir="rtl"
      >
        <span>{label}</span>
        <span dir="ltr">{value}</span>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ backgroundColor: alt ? ROW_ALT : "#fff" }}
      dir="rtl"
    >
      <span className="font-semibold text-[#555]">{label}</span>
      <span dir="ltr" className="text-[#333]">
        {value}
      </span>
    </div>
  );
}
