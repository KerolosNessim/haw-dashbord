import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Search,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const mockBlogs = [
  {
    id: 1,
    title: "كم لتر من المياه يحتاجه جسمك يوميا",
    subtitle: "تعرف على العلاقة بين الترطيب الجيد وصفاء...",
    category: "أكسسوارات",
    publisher: "معاد",
    tags: ["test", "testw43"],
    views: 87,
    isActive: true,
    createdAt: "مارس 11, 2026 08:13:58",
    image: "https://api.placeholder.com/40/40",
  },
  {
    id: 2,
    title: "فوائد شرب الماء على الريق",
    subtitle: "اكتشف كيف يغير الماء حياتك الصحية...",
    category: "برد",
    publisher: "أحمد",
    tags: ["صحة", "ماء"],
    views: 124,
    isActive: true,
    createdAt: "مارس 12, 2026 10:20:00",
    image: "https://api.placeholder.com/40/40",
  },
];

export default function BlogsTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blogs" });
  const isRtl = i18n.language.startsWith("ar");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: t("categories.all") },
    { id: "accessories", label: t("categories.accessories") },
    { id: "chilled", label: t("categories.chilled") },
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs / Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 border whitespace-nowrap",
              activeCategory === cat.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-white text-muted-foreground border-border/60 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            <Input
              placeholder={t("table.search_placeholder") || "Search..."}
              className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start py-5 px-6 font-bold text-foreground min-w-[200px]">{t("table.title")}</TableHead>
                <TableHead className="text-start font-bold text-foreground min-w-[200px]">{t("table.subtitle")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.category")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.publisher")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.tags")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.image")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.views")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("table.status")}</TableHead>
                <TableHead className="text-center font-bold text-foreground min-w-[150px]">{t("table.created_at")}</TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBlogs.map((blog) => (
                <TableRow key={blog.id} className="group border-border/40 transition-colors hover:bg-muted/5">
                  <TableCell className="py-5 px-6 font-bold text-gray-900">
                    <span className="line-clamp-1">{blog.title}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic">
                    <span className="line-clamp-1">{blog.subtitle}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                       {blog.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium text-muted-foreground">{blog.publisher}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="w-10 h-10 rounded-xl border border-border/60 overflow-hidden mx-auto shadow-sm">
                      <img src={"/blog.webp"} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-primary tabular-nums">{blog.views}</TableCell>
                  <TableCell className="text-center">
                    <Switch dir="ltr" checked={blog.isActive} />
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                    {blog.createdAt}
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/10 border-t border-border/40 gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
             {t("showing_info", { start: 1, end: 2, total: 42 }) || "Showing 1 - 2 of 42"}
          </p>
          <div className="order-1 md:order-2">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    text={""}
                    href="#" 
                    className={cn("rounded-xl border-border/60 h-9 px-3", isRtl && "rotate-180")} 
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="rounded-xl h-9 w-9 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="rounded-xl h-9 w-9 hover:bg-muted font-bold">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    text={""}
                    href="#" 
                    className={cn("rounded-xl border-border/60 h-9 px-3", isRtl && "rotate-180")} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
