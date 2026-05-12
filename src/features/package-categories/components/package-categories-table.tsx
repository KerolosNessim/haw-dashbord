import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
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
import { useDeletePackageCategory } from "@/features/package-categories/hooks/useDeletePackageCategory";
import { usePackageCategories } from "@/features/package-categories/hooks/usePackageCategories";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function PackageCategoriesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "package_categories" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "package_categories.table" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "package_categories.api" });
  const { data: rows = [], isLoading, isError, error } = usePackageCategories();
  const { deleteMutation, isPending: isDeleting } = useDeletePackageCategory();
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const isAr = i18n.language.startsWith("ar");

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
            <TableHead className="text-center font-bold">{tbl("sort")}</TableHead>
            <TableHead className="text-center font-bold">{tbl("active")}</TableHead>
            <TableHead className="text-center font-bold">{tbl("default")}</TableHead>
            <TableHead className="w-[180px] py-6 pe-8 text-center font-bold">{tbl("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`s-${i}`}>
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
                <TableCell className="py-6 ps-8 font-bold text-gray-900">{label(row.titleAr, row.titleEn)}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{row.slug || "—"}</TableCell>
                <TableCell className="text-center">{row.sort_order}</TableCell>
                <TableCell className="text-center">
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
                <TableCell className="text-center">
                  <Badge variant={row.is_default ? "default" : "outline"} className="font-bold">
                    {row.is_default ? tbl("yes") : tbl("no")}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 pe-8">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                      <Link to={`/package-categories/edit/${row.id}`}>
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
              <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                {tbl("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
