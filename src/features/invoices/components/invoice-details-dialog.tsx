import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileText, Loader2 } from "lucide-react";
import { Can } from "@/features/permissions/components/PermissionGate";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInvoiceDetail } from "../hooks/useInvoices";
import { downloadInvoiceHtml, printInvoiceElement } from "../utils/download-invoice";
import { computeInvoiceTotals } from "../utils/invoice-math";
import { downloadInvoicePdfFromApi } from "../services/invoices-api";
import InvoicePreview from "./invoice-preview";

type Props = {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function InvoiceDetailsDialog({ invoiceId, isOpen, onClose }: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "invoices" });
  const previewRef = useRef<HTMLDivElement>(null);
  const { data: invoice, isLoading } = useInvoiceDetail(isOpen ? invoiceId : null);

  const lineItems = invoice?.line_items ?? [];
  const totals = computeInvoiceTotals(
    lineItems,
    invoice?.discount ?? 0,
    invoice?.tax ?? 0,
  );

  const handleDownload = async () => {
    if (!invoice) return;
    const blob = await downloadInvoicePdfFromApi(invoice.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const el = previewRef.current?.querySelector("#invoice-preview-detail") as HTMLElement | null;
    if (el) downloadInvoiceHtml(el, `invoice-${invoice.invoice_number}`);
  };

  const handlePrint = () => {
    const el = previewRef.current?.querySelector("#invoice-preview-detail") as HTMLElement | null;
    if (!el || !invoice) return;
    printInvoiceElement(el, `invoice-${invoice.invoice_number}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[32px] p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black">
            <FileText className="h-7 w-7 text-primary" />
            {t("details_title")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6" ref={previewRef}>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoice ? (
            <InvoicePreview
              id="invoice-preview-detail"
              invoiceNumber={invoice.invoice_number}
              invoiceDateLabel={invoice.created_at}
              clientName={invoice.client_name}
              clientPhone={invoice.client_phone}
              companyName={invoice.company_name}
              lineItems={lineItems}
              subtotal={totals.subtotal}
              discount={totals.discount}
              tax={totals.tax}
              total={totals.total}
              currency={invoice.currency}
            />
          ) : (
            <p className="py-10 text-center text-muted-foreground">{t("not_found")}</p>
          )}
        </div>

        {invoice ? (
          <div className="flex justify-end gap-3 border-t p-6">
            <Button variant="outline" className="rounded-xl" onClick={onClose}>
              {t("close")}
            </Button>
            <Can permission="invoices.view">
              <Button variant="outline" className="rounded-xl" onClick={handlePrint}>
                {t("print")}
              </Button>
            </Can>
            <Can permission="invoices.view">
              <Button className="rounded-xl" onClick={handleDownload}>
                <Download className="me-2 h-4 w-4" />
                {t("download")}
              </Button>
            </Can>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
