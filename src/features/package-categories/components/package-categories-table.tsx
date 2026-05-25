import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePackageCategory } from "@/features/package-categories/hooks/useDeletePackageCategory";
import { usePackageCategoriesPaged } from "@/features/package-categories/hooks/usePackageCategoriesPaged";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Link } from "react-router-dom";

export default function PackageCategoriesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "package_categories" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "package_categories.table" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "package_categories.api" });
  const [page, setPage] = useState(1);
  const { rows, meta, isLoading, isFetching, isError, error } = usePackageCategoriesPaged({ page });
  const { deleteMutation, isPending: isDeleting } = useDeletePackageCategory();
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const isAr = i18n.language.startsWith("ar");

  useEffect(() => {
    if (meta.lastPage > 0 && page > meta.lastPage) {
      setPage(meta.lastPage);
    }
  }, [meta.lastPage, page]);

  const serverTotal = meta.total;
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

  const label = (titleAr: string, titleEn: string) => (isAr ? titleAr || titleEn : titleEn || titleAr);

  const handleSingleDeleteConfirm = async () => {
    if (!singleDeleteId) return;
    try {
      await deleteMutation(singleDeleteId);
      setSingleDeleteId(null);
    } catch {
      /* toast from mutation */
    }
  };

  return (
    <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
      {isError && (
        <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error)?.message || t("load_error")}
        </p>
      )}
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 ps-8 font-bold">{tbl("name")}</TableHead>
            <TableHead className="font-bold">{tbl("slug")}</TableHead>
            <TableHead className="font-bold">{tbl("sort")}</TableHead>
            <TableHead className="font-bold">{tbl("active")}</TableHead>
            <TableHead className="w-[180px] py-6 pe-8 font-bold">{tbl("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`s-${i}`}>
                {[...Array(5)].map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            rows.map((row) => (
              <TableRow key={row.id} className="border-border/40">
                <TableCell className="py-6 ps-8 font-bold text-gray-900">{label(row.titleAr, row.titleEn)}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{row.slug || "—"}</TableCell>
                <TableCell>{row.sort_order}</TableCell>
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
                    <Can permission="package-categories.update">
                      <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <Link to={`/package-categories/edit/${row.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </Can>
                    <Can permission="package-categories.delete">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-rose-600 hover:bg-rose-50"
                        disabled={isDeleting}
                        onClick={() => setSingleDeleteId(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-16 text-start text-muted-foreground">
                {tbl("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/40 bg-muted/10 p-6">
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
