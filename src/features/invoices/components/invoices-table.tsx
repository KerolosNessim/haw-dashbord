import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Eye, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { Can } from "@/features/permissions/components/PermissionGate";
import { useDeleteInvoice, useInvoices } from "../hooks/useInvoices";
import {
  downloadInvoicePdfFromApi,
  fetchInvoiceById,
} from "../services/invoices-api";
import { downloadInvoiceHtml } from "../utils/download-invoice";
import { formatMoney } from "../utils/invoice-math";
import InvoiceDetailsDialog from "./invoice-details-dialog";
import InvoicePreview from "./invoice-preview";
import { computeInvoiceTotals } from "../utils/invoice-math";

export default function InvoicesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "invoices" });
  const { t: tbl } = useTranslation("translation", {
    keyPrefix: "invoices.table",
  });
  const isRtl = i18n.language.startsWith("ar");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { rows, meta, isLoading, isError, error } = useInvoices({
    page,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteInvoice();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const paginationMeta = {
    current_page: meta.current_page,
    last_page: meta.last_page,
    per_page: meta.per_page,
    total: meta.total,
    path: "",
    from: meta.total === 0 ? null : (meta.current_page - 1) * meta.per_page + 1,
    to:
      meta.total === 0
        ? null
        : Math.min(meta.current_page * meta.per_page, meta.total),
  };

  const openDetails = (id: string) => {
    setDetailsId(id);
    setDetailsOpen(true);
  };

  const handleDownloadRow = async (row: (typeof rows)[0]) => {
    const blob = await downloadInvoicePdfFromApi(row.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${row.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const detail = await fetchInvoiceById(row.id);
    const lineItems = detail?.line_items ?? [];
    const totals = computeInvoiceTotals(lineItems, row.discount, row.tax);

    const host = document.createElement("div");
    host.className = "sr-only";
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(
      <InvoicePreview
        invoiceNumber={row.invoice_number}
        invoiceDateLabel={row.created_at}
        clientName={row.client_name}
        clientPhone={row.client_phone}
        companyName={row.company_name}
        lineItems={lineItems}
        subtotal={detail?.subtotal ?? totals.subtotal}
        discount={row.discount}
        tax={row.tax}
        total={row.total}
        currency={row.currency}
      />,
    );

    await new Promise((r) => setTimeout(r, 80));
    const el = host.firstElementChild as HTMLElement | null;
    if (el) downloadInvoiceHtml(el, `invoice-${row.invoice_number}`);
    root.unmount();
    host.remove();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <>
      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
        <div className="border-b border-border/40 bg-muted/20 p-4 md:p-6">
          <div className="relative max-w-md">
            <Search
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isRtl ? "inset-e-3" : "inset-s-3"}`}
            />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (page !== 1) setPage(1);
              }}
              placeholder={tbl("search_placeholder")}
              className={`h-11 rounded-xl bg-white ${isRtl ? "pe-10" : "ps-10"}`}
              type="search"
            />
          </div>
        </div>

        {isError ? (
          <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error)?.message || t("load_error")}
          </p>
        ) : null}

        <Table dir={isRtl ? "rtl" : "ltr"}>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-6 ps-8 font-bold">
                {tbl("invoice_number")}
              </TableHead>
              <TableHead className="font-bold">{tbl("client")}</TableHead>
              <TableHead className="font-bold">{tbl("company")}</TableHead>
              <TableHead className="font-bold">{tbl("total")}</TableHead>
              <TableHead className="font-bold">{tbl("date")}</TableHead>
              <TableHead className="w-[140px] py-6 pe-8 font-bold">
                {tbl("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j} className="py-5">
                      <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-16 text-center text-muted-foreground"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/40 hover:bg-muted/5"
                >
                  <TableCell
                    className="py-5 ps-8 font-mono text-sm font-bold"
                    dir="ltr"
                  >
                    HWEY - {row.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{row.client_name}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {row.client_phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.company_name}
                  </TableCell>
                  <TableCell dir="ltr" className="font-bold">
                    {formatMoney(row.total, row.currency)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.created_at}
                  </TableCell>
                  <TableCell className="py-5 pe-8">
                    <div className="flex items-center gap-1">
                      <Can permission="invoices.view">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => openDetails(row.id)}
                          title={tbl("view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Can>
                      <Can permission="invoices.view">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => handleDownloadRow(row)}
                          title={tbl("download")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </Can>
                      <Can permission="invoices.delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && rows.length > 0 ? (
          <div className="border-t border-border/40 p-6">
            <LaravelResourcePagination
              meta={paginationMeta}
              onPageChange={setPage}
              isRtl={isRtl}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        ) : null}
      </div>

      <InvoiceDetailsDialog
        invoiceId={detailsId}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-[32px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
