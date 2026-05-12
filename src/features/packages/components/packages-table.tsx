import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useDeletePackage } from "@/features/packages/hooks/useDeletePackage";
import { usePackages } from "@/features/packages/hooks/usePackages";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function PackagesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "packages" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "packages.table" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "packages.api" });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { rows, meta, isLoading, isFetching, isError, error } = usePackages({
    page,
    search: debouncedSearch || undefined,
  });
  const { deleteMutation, isPending: isDeleting } = useDeletePackage();
  const isAr = i18n.language.startsWith("ar");

  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (meta.lastPage > 0 && page > meta.lastPage) {
      setPage(meta.lastPage);
    }
  }, [meta.lastPage, page]);

  const serverTotal = meta.total > 0 ? meta.total : rows.length;
  const perPage = meta.perPage > 0 ? meta.perPage : Math.max(rows.length, 1);
  const rangeStart = serverTotal === 0 ? 0 : (meta.currentPage - 1) * perPage + 1;
  const rangeEnd =
    serverTotal === 0 ? 0 : Math.min(rangeStart + rows.length - 1, serverTotal);
  const paginationMeta: LaravelPaginationMeta = {
    current_page: meta.currentPage || 1,
    last_page: meta.lastPage || 1,
    per_page: perPage,
    total: serverTotal,
    from: rangeStart || null,
    to: rangeEnd || null,
    path: "",
  };

  const handleSingleDeleteConfirm = async () => {
    if (!singleDeleteId) return;
    try {
      await deleteMutation(singleDeleteId);
      setSingleDeleteId(null);
    } catch {
      /* toast from mutation */
    }
  };

  const titleLabel = (ar: string, en: string) => (isAr ? ar || en : en || ar);

  return (
    <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
      <div className="border-b border-border/40 bg-muted/20 p-4 md:p-6">
        <div className="relative max-w-md">
          <Search
            className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isAr ? "inset-e-3" : "inset-s-3"}`}
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={tbl("search_placeholder")}
            className={`h-11 rounded-xl bg-white ${isAr ? "pe-10" : "ps-10"}`}
            dir={isAr ? "rtl" : "ltr"}
            type="search"
            autoComplete="off"
          />
        </div>
      </div>
      {isError && (
        <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error)?.message || t("load_error")}
        </p>
      )}
      <Table dir={isAr ? "rtl" : "ltr"}>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 ps-8 font-bold">{tbl("title")}</TableHead>
            <TableHead className="font-bold">{tbl("category")}</TableHead>
            <TableHead className="font-bold">{tbl("slug")}</TableHead>
            <TableHead className="font-bold">{tbl("featured")}</TableHead>
            <TableHead className="font-bold">{tbl("active")}</TableHead>
            <TableHead className="w-[180px] py-6 pe-8 font-bold">{tbl("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                {[...Array(6)].map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            rows.map((row) => (
              <TableRow key={row.id} className="border-border/40">
                <TableCell className="py-6 ps-8 font-bold text-gray-900">
                  {titleLabel(row.titleAr, row.titleEn)}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.categoryTitle || "—"}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{row.slug || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={row.is_featured ? "default" : "outline"}
                    className="font-bold"
                  >
                    {row.is_featured ? tbl("yes") : tbl("no")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      row.is_active
                        ? "border border-emerald-500/20 bg-emerald-500/5 font-bold text-emerald-600"
                        : "border border-rose-500/20 bg-rose-50 font-bold text-rose-600"
                    }
                  >
                    {row.is_active ? tbl("yes") : tbl("no")}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 pe-8">
                  <div className="flex items-center justify-start gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                      <Link to={`/packages/edit/${row.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-rose-600 hover:bg-rose-50"
                      disabled={isDeleting}
                      onClick={() => setSingleDeleteId(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-start text-muted-foreground">
                {tbl("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 bg-muted/10 p-6 md:flex-row">
        <p className="order-2 text-sm text-muted-foreground md:order-1">
          {t("showing_info", {
            start: rangeStart,
            end: rangeEnd,
            total: serverTotal,
          })}
        </p>
        <div className="order-1 md:order-2">
          <LaravelResourcePagination
            meta={paginationMeta}
            onPageChange={setPage}
            disabled={isLoading || isFetching}
            isRtl={isAr}
            showSummary={false}
            previousLabel=""
            nextLabel=""
          />
        </div>
      </div>

      <TypeToConfirmDeleteAlertDialog
        open={singleDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setSingleDeleteId(null);
        }}
        title={tbl("single_delete_title")}
        description={tbl("single_delete_description")}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={tbl("single_delete_type_label")}
        inputPlaceholder={tbl("single_delete_placeholder")}
        inputDir="auto"
        cancelLabel={apiT("cancel")}
        deleteLabel={apiT("delete")}
        isPending={isDeleting}
        onConfirm={handleSingleDeleteConfirm}
      />
    </div>
  );
}
