import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContactHeaders } from "../hooks/useContactHeaders";
import type { ContactHeader } from "../types";

type ContactHeadersTableProps = {
  onEdit: (row: ContactHeader) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
};

function localizedLabel(
  value: { ar: string; en: string },
  lang: "ar" | "en",
): string {
  return (lang === "ar" ? value.ar || value.en : value.en || value.ar).trim() || "—";
}

function countriesLabel(row: ContactHeader, lang: "ar" | "en"): string {
  if (row.countries?.length) {
    return row.countries
      .map((c) => (lang === "ar" ? c.name.ar || c.name.en : c.name.en || c.name.ar))
      .filter(Boolean)
      .join(", ");
  }
  if (row.country_ids.length) return row.country_ids.join(", ");
  return "—";
}

export default function ContactHeadersTable({
  onEdit,
  onDelete,
  isDeleting,
}: ContactHeadersTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "contact_headers" });
  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const isRtl = lang === "ar";
  const { data: rows = [], isLoading, isError, refetch } = useContactHeaders();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium text-destructive">{t("load_error")}</p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table dir={isRtl ? "rtl" : "ltr"}>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="min-w-[60px] py-5 ps-6 font-bold">#</TableHead>
              <TableHead className="min-w-[200px] font-bold">{t("table.title")}</TableHead>
              <TableHead className="min-w-[160px] font-bold">{t("table.countries")}</TableHead>
              <TableHead className="font-bold">{t("table.sort_order")}</TableHead>
              <TableHead className="font-bold">{t("table.status")}</TableHead>
              <TableHead className="min-w-[120px] py-5 pe-6 text-end font-bold">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-lg font-medium text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="border-border/40 hover:bg-muted/5">
                  <TableCell className="py-4 ps-6 font-bold text-muted-foreground">
                    {row.id}
                  </TableCell>
                  <TableCell className="py-4 font-bold text-gray-900">
                    {localizedLabel(row.title, lang)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {countriesLabel(row, lang)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{row.sort_order}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full border-none px-3 py-0.5 font-bold ${
                        row.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.is_active ? t("status_active") : t("status_inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 pe-6">
                    <div className="flex items-center justify-end gap-2">
                      <Can resource="contact-headers" action="update">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => onEdit(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Can>
                      {/* <Can resource="contact-headers" action="delete">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                          disabled={isDeleting}
                          onClick={() => onDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
