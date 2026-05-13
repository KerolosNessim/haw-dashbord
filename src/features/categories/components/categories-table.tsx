import { Badge } from "@/components/ui/badge";
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
import { useCourseCategoriesPaged } from "@/features/categories/hooks/useCourseCategoriesPaged";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CategoriesTable() {
  const { i18n } = useTranslation();
  const { t: pageT } = useTranslation("translation", { keyPrefix: "categories" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "categories.table" });
  const isRtl = i18n.language.startsWith("ar");
  const [listFilter, setListFilter] = useState({ page: 1, search: "" });
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setListFilter((current) =>
        current.search === trimmed ? current : { page: 1, search: trimmed },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error } = useCourseCategoriesPaged({
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
  const rangeEnd = serverTotal === 0 ? 0 : Math.min(rangeStart + rows.length - 1, serverTotal);
  const paginationMeta: LaravelPaginationMeta = {
    current_page: meta.currentPage || listFilter.page,
    last_page: meta.lastPage || 1,
    per_page: perPage,
    total: serverTotal,
    from: rangeStart || null,
    to: rangeEnd || null,
    path: "",
  };

  const label = (ar: string, en: string) => (isRtl ? ar || en || "—" : en || ar || "—");

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
        <p className="px-1 text-sm text-destructive">
          {(error as Error)?.message || pageT("load_error")}
        </p>
      )}

      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="min-w-[180px] py-6 ps-8 font-bold text-foreground text-start">
                  {tbl("name")}
                </TableHead>
                <TableHead className="min-w-[140px] font-bold text-foreground">{tbl("slug_ar")}</TableHead>
                <TableHead className="min-w-[140px] font-bold text-foreground">{tbl("slug_en")}</TableHead>
                <TableHead className="font-bold text-foreground">{tbl("courses_count")}</TableHead>
                <TableHead className="py-6 pe-8 font-bold text-foreground">{tbl("status")}</TableHead>
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
                rows.map((cat) => (
                  <TableRow key={cat.id} className="group border-border/40 transition-colors hover:bg-muted/5">
                    <TableCell className="py-6 ps-8">
                      <span className="text-lg font-black text-gray-900 transition-colors group-hover:text-primary">
                        {label(cat.nameAr, cat.nameEn)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{cat.slugAr || "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{cat.slugEn || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg border-primary/10 bg-primary/5 px-3 py-1 font-bold text-primary">
                        {cat.coursesCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="pe-8">
                      <Badge
                        variant="secondary"
                        className={
                          cat.isActive
                            ? "rounded-lg border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-bold text-emerald-600"
                            : "rounded-lg border-rose-500/20 bg-rose-50 px-3 py-1 font-bold text-rose-600"
                        }
                      >
                        {tbl(`status_badge.${cat.isActive ? "active" : "inactive"}`)}
                      </Badge>
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
            onPageChange={(page) => setListFilter((current) => ({ ...current, page }))}
            isRtl={isRtl}
            disabled={isFetching}
            hideWhenSinglePage={false}
          />
        </div>
      </div>
    </div>
  );
}
