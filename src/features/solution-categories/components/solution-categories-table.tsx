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
import { useSolutionCategoriesPaged } from "@/features/solution-categories/hooks/useSolutionCategoriesPaged";
import type { SolutionCategoryRow } from "@/features/solution-categories/types";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { Pencil, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type SolutionCategoriesTableProps = {
  onEdit: (row: SolutionCategoryRow) => void;
};

export default function SolutionCategoriesTable({ onEdit }: SolutionCategoriesTableProps) {
  const { i18n } = useTranslation();
  const { t: apiT } = useTranslation("translation", { keyPrefix: "solution_categories.api" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "solution_categories.table" });
  const isRtl = i18n.language.startsWith("ar");
  const [listFilter, setListFilter] = useState({ page: 1, search: "" });
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchInput.trim();
      setListFilter((f) => (f.search === trimmed ? f : { page: 1, search: trimmed }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error } = useSolutionCategoriesPaged({
    page: listFilter.page,
    search: listFilter.search,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  };

  const serverTotal = meta.total;
  const perPage = meta.perPage > 0 ? meta.perPage : Math.max(rows.length, 1);
  const rangeStart = serverTotal === 0 ? 0 : (meta.currentPage - 1) * perPage + 1;
  const rangeEnd =
    serverTotal === 0 ? 0 : Math.min(rangeStart + rows.length - 1, serverTotal);
  const paginationMeta: LaravelPaginationMeta = {
    current_page: meta.currentPage || listFilter.page,
    last_page: meta.lastPage || 1,
    per_page: perPage,
    total: serverTotal,
    from: rangeStart || null,
    to: rangeEnd || null,
    path: "",
  };

  const label = (row: SolutionCategoryRow) =>
    isRtl ? row.nameAr || row.nameEn || "—" : row.nameEn || row.nameAr || "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={tbl("search_placeholder")}
            className="h-11 rounded-xl ps-10"
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive px-1">
          {(error as Error)?.message || apiT("load_error")}
        </p>
      )}

      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="min-w-[180px] py-5 ps-6 font-bold">{tbl("name")}</TableHead>
                <TableHead className="min-w-[120px] font-bold">{tbl("slug_ar")}</TableHead>
                <TableHead className="min-w-[120px] font-bold">{tbl("slug_en")}</TableHead>
                <TableHead className="font-bold">{tbl("singles_count")}</TableHead>
                <TableHead className="min-w-[120px] py-5 pe-6 text-end font-bold">{tbl("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {[...Array(5)].map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading &&
                rows.map((row) => (
                  <TableRow key={row.id} className="border-border/40 hover:bg-muted/5">
                    <TableCell className="py-4 ps-6 align-middle font-bold text-gray-900">{label(row)}</TableCell>
                    <TableCell className="align-middle font-mono text-sm text-muted-foreground">
                      {row.slugAr || "—"}
                    </TableCell>
                    <TableCell className="align-middle font-mono text-sm text-muted-foreground">
                      {row.slugEn || "—"}
                    </TableCell>
                    <TableCell className="align-middle">{row.singlesCount}</TableCell>
                    <TableCell className="py-4 pe-6 text-end align-middle">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && rows.length === 0 && !isError && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    {tbl("empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border/40 px-4 py-3">
          <LaravelResourcePagination
            meta={paginationMeta}
            onPageChange={(p) => setListFilter((f) => ({ ...f, page: p }))}
            isRtl={isRtl}
            disabled={isFetching}
            hideWhenSinglePage={false}
          />
        </div>
      </div>
    </div>
  );
}
