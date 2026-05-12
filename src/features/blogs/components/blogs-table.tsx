import { BulkDeleteConfirmationDialog } from "@/components/bulk-delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBlogCategories } from "@/features/blog-categories/hooks/useBlogCategories";
import { useAdminBlogs } from "@/features/blogs/hooks/useAdminBlogs";
import { useDeleteBlog } from "@/features/blogs/hooks/useDeleteBlog";
import { useDeleteBlogsBulk } from "@/features/blogs/hooks/useDeleteBlogsBulk";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { cn } from "@/lib/utils";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function BlogsTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blogs" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "blogs.api" });
  const isRtl = i18n.language.startsWith("ar");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const { blogs, isLoading, isError, error } = useAdminBlogs();
  const { deleteBlogMutation, isPending: isDeleting } = useDeleteBlog();
  const { deleteBlogsBulkMutation, isPending: isBulkDeleting } = useDeleteBlogsBulk();
  const { data: categoryRows = [] } = useBlogCategories();

  const categories = useMemo(() => {
    const labelCat = (ar: string, en: string) => (isRtl ? ar || en : en || ar);
    return [
      { id: "all", label: t("categories.all") },
      ...categoryRows.map((row) => ({ id: row.id, label: labelCat(row.nameAr, row.nameEn) })),
    ];
  }, [categoryRows, isRtl, t]);

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const categoryMatch =
        activeCategory === "all" || b.categoryId === activeCategory || String(b.categoryId) === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      return [b.title, b.subtitle, b.category, b.publisher, b.status, ...b.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [blogs, activeCategory, search]);

  const total = filteredBlogs.length;

  useEffect(() => {
    const allowed = new Set(filteredBlogs.map((b) => String(b.id)));
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
  }, [filteredBlogs]);

  const allFilteredSelected =
    filteredBlogs.length > 0 && filteredBlogs.every((b) => selectedIds.has(String(b.id)));
  const someFilteredSelected =
    filteredBlogs.some((b) => selectedIds.has(String(b.id))) && !allFilteredSelected;
  const selectedCount = selectedIds.size;
  const confirmWord = t("table.bulk_delete_word");

  const toggleHeaderSelectAll = (checked: boolean) => {
    const ids = filteredBlogs.map((b) => String(b.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleRow = (blogId: string | number, checked: boolean) => {
    const id = String(blogId);
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
    await deleteBlogsBulkMutation(ids);
    setSelectedIds(new Set());
    setBulkDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
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

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:flex-1">
          {selectedCount > 0 ? (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="rounded-xl shrink-0"
              disabled={isBulkDeleting}
              onClick={() => setBulkDialogOpen(true)}
            >
              {t("table.bulk_delete_selected", { count: selectedCount })}
            </Button>
          ) : null}
          <div className="relative w-full md:flex-1 md:max-w-sm md:min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            <Input
              placeholder={t("table.search_placeholder") || "Search..."}
              className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive px-2">
          {getHttpErrorMessage(error) || apiT("load_error")}
        </p>
      )}

      <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-16 min-w-15 text-start align-middle p-2">
                  {/* Inner wrapper: base Table applies :pr-0 on checkbox cells — use ps-6 for inline-start (right in RTL, left in LTR). */}
                  <div className="flex items-center justify-center ps-6 pe-2">
                    <Checkbox
                      disabled={filteredBlogs.length === 0 || isLoading}
                      aria-label={t("table.select_all")}
                      checked={allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false}
                      onCheckedChange={(value) => toggleHeaderSelectAll(value === true)}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground min-w-[200px]">
                  {t("table.title")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground min-w-[200px]">
                  {t("table.subtitle")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.category")}</TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.publisher")}</TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.tags")}</TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.image")}</TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.views")}</TableHead>
                <TableHead className="text-start font-bold text-foreground">{t("table.status")}</TableHead>
                <TableHead className="text-start font-bold text-foreground min-w-[150px]">
                  {t("table.created_at")}
                </TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {[...Array(11)].map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-8 rounded-lg bg-muted/40 animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading &&
                filteredBlogs.map((blog) => (
                  <TableRow key={String(blog.id)} className="group border-border/40 transition-colors hover:bg-muted/5">
                    <TableCell className="w-16 min-w-15 p-2 align-middle">
                      <div className="flex items-center justify-center ps-6 pe-2">
                        <Checkbox
                          aria-label={t("table.select_row")}
                          checked={selectedIds.has(String(blog.id))}
                          disabled={isBulkDeleting}
                          onCheckedChange={(v) => toggleRow(blog.id, v === true)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 font-bold text-gray-900 text-start align-middle">
                      <span className="line-clamp-1">{blog.title}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground italic text-start align-middle">
                      <span className="line-clamp-1">{blog.subtitle}</span>
                    </TableCell>
                    <TableCell className="text-start align-middle">
                      <span className="inline-flex px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                        {blog.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-start font-medium text-muted-foreground align-middle">{blog.publisher}</TableCell>
                    <TableCell className="text-start align-middle">
                      <div className="flex flex-wrap gap-1 justify-start">
                        {blog.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-start align-middle">
                      <div className="w-10 h-10 rounded-xl border border-border/60 overflow-hidden shadow-sm">
                        <img
                          src={blog.imageUrl || "/blog.webp"}
                          alt=""
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-start font-bold text-primary tabular-nums align-middle">{blog.views}</TableCell>
                    <TableCell className="text-start align-middle">
                      <Badge
                        variant={blog.status === "published" ? "default" : blog.status === "draft" ? "outline" : "secondary"}
                        className="font-bold"
                      >
                        {t(`status.${blog.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-start text-xs text-muted-foreground tabular-nums align-middle">{blog.createdAt}</TableCell>
                    <TableCell className="py-5 px-6 text-start align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                          asChild
                        >
                          <Link to={`/blogs/edit/${blog.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{apiT("delete_confirm_title")}</AlertDialogTitle>
                              <AlertDialogDescription>{apiT("delete_confirm")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{apiT("cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => void deleteBlogMutation(blog.id)}
                              >
                                {apiT("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && filteredBlogs.length === 0 && !isError && (
                <TableRow>
                  <TableCell colSpan={11} className="py-16 text-center text-muted-foreground">
                    —
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/10 border-t border-border/40 gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            {t("showing_info", { start: total ? 1 : 0, end: total, total })}
          </p>
          <div className="order-1 md:order-2">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious text={""} href="#" className={cn("rounded-xl border-border/60 h-9 px-3", isRtl && "rotate-180")} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="rounded-xl h-9 w-9 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold">
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext text={""} href="#" className={cn("rounded-xl border-border/60 h-9 px-3", isRtl && "rotate-180")} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <BulkDeleteConfirmationDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        title={t("table.bulk_delete_title")}
        description={t("table.bulk_delete_description", { count: selectedCount })}
        confirmationPhrase={confirmWord}
        typePhraseLabel={t("table.bulk_delete_type_label", { word: confirmWord })}
        cancelLabel={apiT("cancel")}
        deleteLabel={apiT("delete")}
        isPending={isBulkDeleting}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
