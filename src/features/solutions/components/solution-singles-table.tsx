import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllSolutionCategories } from "@/features/solution-categories/hooks/useAllSolutionCategories";
import { useDeleteSolutionSingle } from "@/features/solutions/hooks/useDeleteSolutionSingle";
import { useSolutionSinglesList } from "@/features/solutions/hooks/useSolutionSinglesList";
import {
  pickSolutionCategoryId,
  solutionCategoryLabel,
} from "@/features/solutions/lib/solution-category-utils";
import type { SolutionFeature } from "@/features/solutions/types";
import { Can } from "@/features/permissions/components/PermissionGate";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { cn } from "@/lib/utils";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type SolutionSinglesTableProps = {
  onEdit: (row: SolutionFeature) => void;
};

function slugPair(row: SolutionFeature): { ar: string; en: string } {
  const s = row.slug;
  if (s && typeof s === "object" && "ar" in s && "en" in s) {
    return { ar: String(s.ar ?? ""), en: String(s.en ?? "") };
  }
  if (typeof s === "string") {
    return { ar: s, en: s };
  }
  return { ar: "", en: "" };
}

function plainTextFromHtml(value: string | undefined | null): string {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = value;
  return (div.textContent ?? div.innerText ?? "").replace(/\s+/g, " ").trim();
}

export default function SolutionSinglesTable({ onEdit }: SolutionSinglesTableProps) {
  const { i18n } = useTranslation();
  const { t: apiT } = useTranslation("translation", { keyPrefix: "solutions.api" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "solutions.table" });
  const isRtl = i18n.language.startsWith("ar");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data, isLoading, isError, error } = useSolutionSinglesList();
  const { data: categoryRows = [] } = useAllSolutionCategories();
  const { deleteMutation, isPending: isDeleting } = useDeleteSolutionSingle();

  const rows = useMemo(() => (Array.isArray(data?.data) ? data!.data : []), [data]);

  const categoryById = useMemo(
    () => new Map(categoryRows.map((c) => [c.id, c])),
    [categoryRows],
  );

  const categories = useMemo(() => {
    const labelCat = (ar: string, en: string) => (isRtl ? ar || en : en || ar);
    return [
      { id: "all", label: tbl("filter_all") },
      ...categoryRows.map((row) => ({
        id: row.id,
        label: labelCat(row.nameAr, row.nameEn),
      })),
    ];
  }, [categoryRows, isRtl, tbl]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const categoryMatch =
        activeCategory === "all" ||
        pickSolutionCategoryId(r) === activeCategory ||
        String(pickSolutionCategoryId(r)) === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      const { ar, en } = slugPair(r);
      const categoryName = solutionCategoryLabel(r, isRtl, categoryById);
      const blob = [
        r.title?.ar,
        r.title?.en,
        plainTextFromHtml(r.description?.ar),
        plainTextFromHtml(r.description?.en),
        categoryName,
        ar,
        en,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search, activeCategory, isRtl, categoryById]);

  const titleLabel = (r: SolutionFeature) =>
    isRtl ? r.title?.ar || r.title?.en || "—" : r.title?.en || r.title?.ar || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 border whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-white text-muted-foreground border-border/60 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tbl("search_placeholder")}
            className="h-11 rounded-xl ps-10"
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive px-1">{getHttpErrorMessage(error) || apiT("load_error")}</p>
      )}

      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="min-w-[160px] py-5 ps-6 font-bold">{tbl("image")}</TableHead>
                <TableHead className="min-w-[200px] font-bold">{tbl("title")}</TableHead>
                <TableHead className="min-w-[140px] font-bold">{tbl("category")}</TableHead>
                <TableHead className="min-w-[120px] font-bold">{tbl("slug_ar")}</TableHead>
                <TableHead className="min-w-[120px] font-bold">{tbl("slug_en")}</TableHead>
                <TableHead className="min-w-[220px] font-bold">{tbl("description")}</TableHead>
                <TableHead className="font-bold">{tbl("status")}</TableHead>
                <TableHead className="min-w-[140px] py-5 pe-6 text-end font-bold">{tbl("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {[...Array(8)].map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading &&
                filtered.map((row) => {
                  const sl = slugPair(row);
                  const desc = plainTextFromHtml(
                    isRtl ? row.description?.ar || row.description?.en : row.description?.en || row.description?.ar,
                  );
                  return (
                    <TableRow key={String(row.id ?? sl.en ?? sl.ar)} className="border-border/40 hover:bg-muted/5">
                      <TableCell className="py-4 ps-6 align-middle">
                        <div className="h-12 w-12 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                          {row.image ? (
                            <img src={row.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle font-bold text-gray-900">{titleLabel(row)}</TableCell>
                      <TableCell className="align-middle text-sm text-muted-foreground">
                        {solutionCategoryLabel(row, isRtl, categoryById) || "—"}
                      </TableCell>
                      <TableCell className="align-middle">
                        {sl.ar ? (
                          <Badge variant="outline" className="max-w-[140px] truncate font-mono text-xs">
                            {sl.ar}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        {sl.en ? (
                          <Badge variant="outline" className="max-w-[140px] truncate font-mono text-xs">
                            {sl.en}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[280px] align-middle text-sm text-muted-foreground">
                        <span className="line-clamp-2">{desc || "—"}</span>
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant={row.is_active !== false ? "default" : "secondary"}>
                          {row.is_active !== false ? tbl("active") : tbl("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pe-6 text-end align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Can permission="solutions.update">
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
                          <Can permission="solutions.delete">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isDeleting || row.id == null}
                                className="h-9 w-9 rounded-xl text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>{apiT("delete_confirm_title")}</AlertDialogTitle>
                                <AlertDialogDescription>{apiT("delete_confirm")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">{apiT("cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() => row.id != null && void deleteMutation(row.id)}
                                >
                                  {apiT("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isLoading && filtered.length === 0 && !isError && (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                    {tbl("empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
