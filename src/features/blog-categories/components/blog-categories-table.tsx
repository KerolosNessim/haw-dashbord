import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBlogCategories } from "@/features/blog-categories/hooks/useBlogCategories";
import { useDeleteBlogCategory } from "@/features/blog-categories/hooks/useDeleteBlogCategory";
import { useDeleteBlogCategoriesBulk } from "@/features/blog-categories/hooks/useDeleteBlogCategoriesBulk";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function BlogCategoriesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blog_categories" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "blog_categories.table" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "blog_categories.api" });
  const { data: rows = [], isLoading, isError, error } = useBlogCategories();
  const { deleteMutation, isPending: isDeleting } = useDeleteBlogCategory();
  const { deleteCategoriesBulkMutation, isPending: isBulkDeleting } = useDeleteBlogCategoriesBulk();
  const isAr = i18n.language.startsWith("ar");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  const label = (nameAr: string, nameEn: string) => (isAr ? nameAr || nameEn : nameEn || nameAr);

  useEffect(() => {
    const allowed = new Set(rows.map((r) => r.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (allowed.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!allowed.has(id)) {
            return next;
          }
        }
        return prev;
      }
      return next;
    });
  }, [rows]);

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id)) && !allSelected;
  const selectedCount = selectedIds.size;

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(() => {
      if (checked) return new Set(rows.map((r) => r.id));
      return new Set();
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    await deleteCategoriesBulkMutation(ids);
    setSelectedIds(new Set());
    setBulkDialogOpen(false);
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

  return (
    <div className="space-y-4">
      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-white p-4 shadow-sm">
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="rounded-xl"
            disabled={isBulkDeleting}
            onClick={() => setBulkDialogOpen(true)}
          >
            {tbl("bulk_delete_selected", { count: selectedCount })}
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
        {isError && (
          <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error)?.message || t("load_error")}
          </p>
        )}
        <Table dir={isAr ? "rtl" : "ltr"}>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-16 min-w-15 text-start align-middle p-2">
                {/* Inner wrapper: base Table applies :pr-0 on checkbox cells — use ps-6 for inline-start (right in RTL, left in LTR). */}
                <div className="flex items-center justify-center ps-6 pe-2">
                  <Checkbox
                    disabled={rows.length === 0 || isLoading}
                    aria-label={tbl("select_all")}
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(value) => toggleSelectAll(value === true)}
                  />
                </div>
              </TableHead>
              <TableHead className="py-6 ps-8 text-start font-bold align-middle">{tbl("name")}</TableHead>
              <TableHead className="text-start font-bold align-middle">{tbl("slug")}</TableHead>
              <TableHead className="text-start font-bold align-middle">{tbl("active")}</TableHead>
              <TableHead className="w-[180px] py-6 pe-8 text-start font-bold align-middle">{tbl("actions")}</TableHead>
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
                  <TableCell className="w-16 min-w-15 p-2 align-middle">
                    <div className="flex items-center justify-center ps-6 pe-2">
                      <Checkbox
                        aria-label={tbl("select_row")}
                        checked={selectedIds.has(row.id)}
                        disabled={isBulkDeleting}
                        onCheckedChange={(v) => toggleRow(row.id, v === true)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-6 ps-8 text-start align-middle font-bold text-gray-900">
                    {label(row.nameAr, row.nameEn)}
                  </TableCell>
                  <TableCell className="max-w-[220px] text-start align-middle font-mono text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span dir="ltr" className="truncate" title={row.slugEn}>
                        {row.slugEn || "—"}
                      </span>
                      {row.slugAr ? (
                        <span dir="rtl" className="truncate text-muted-foreground/90" title={row.slugAr}>
                          {row.slugAr}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-start align-middle">
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
                  <TableCell className="py-6 pe-8 text-start align-middle">
                    <div className="flex items-center justify-start gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <Link to={`/blog-categories/edit/${row.id}`}>
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
                <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                  {tbl("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TypeToConfirmDeleteAlertDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        title={tbl("bulk_delete_title")}
        description={tbl("bulk_delete_description", { count: selectedCount })}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={tbl("bulk_delete_type_label")}
        inputPlaceholder={tbl("bulk_delete_placeholder")}
        inputDir="auto"
        cancelLabel={apiT("cancel")}
        deleteLabel={apiT("delete")}
        isPending={isBulkDeleting}
        onConfirm={handleBulkDelete}
      />

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
