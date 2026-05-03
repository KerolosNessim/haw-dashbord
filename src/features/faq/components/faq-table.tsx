import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  Filter,
  Pencil,
  Search,
  Trash2
} from "lucide-react";
import { useTranslation } from "react-i18next";

const mockFaqs = [
  {
    id: 1,
    question: "كيف يمكنني إنشاء حساب جديد؟",
    category: "حساب",
    status: "published",
    modifiedAt: "اليوم، 10:30 ص",
  },
  {
    id: 2,
    question: "ما هي طرق الدفع المتاحة؟",
    category: "الطلبات",
    status: "published",
    modifiedAt: "أمس، 04:15 م",
  },
  {
    id: 3,
    question: "كيف أسترد مبلغاً مدفوعاً؟",
    category: "الطلبات",
    status: "published",
    modifiedAt: "2024/05/20",
  },
  {
    id: 4,
    question: "هل يمكنني تغيير بياناتي؟",
    category: "حساب",
    status: "draft",
    modifiedAt: "2024/05/18",
  },
  {
    id: 5,
    question: "كيف أتواصل مع الدعم؟",
    category: "الدعم",
    status: "published",
    modifiedAt: "2024/05/15",
  },
];

export default function FaqTable() {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl gap-2 h-11 border-border/60"
              >
                <Filter className="w-4 h-4 opacity-60" />
                <span>{t("all_categories")}</span>
                <ChevronDown className="w-4 h-4 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-xl">
              <DropdownMenuItem>{t("categories.all")}</DropdownMenuItem>
              <DropdownMenuItem>{t("categories.account")}</DropdownMenuItem>
              <DropdownMenuItem>{t("categories.orders")}</DropdownMenuItem>
              <DropdownMenuItem>{t("categories.support")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            <Input
              placeholder={t("search_placeholder")}
              className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 ">
            <TableRow className="hover:bg-transparent border-none ">
              <TableHead className=" py-5 px-6 font-bold text-foreground text-start">
                {t("question")}
              </TableHead>
              <TableHead className="text-center font-bold text-foreground">
                {t("category")}
              </TableHead>
              <TableHead className="text-center font-bold text-foreground">
                {t("status")}
              </TableHead>
              <TableHead className="text-center font-bold text-foreground">
                {t("last_modified")}
              </TableHead>
              <TableHead className=" py-5 px-6 font-bold text-foreground text-start">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFaqs.map((faq) => (
              <TableRow
                key={faq.id}
                className="group border-border/40 transition-colors hover:bg-muted/5"
              >
                <TableCell className="py-5 px-6 font-medium text-gray-900 max-w-md">
                  {faq.question}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {faq.category}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={`rounded-full px-4 py-1 font-medium border-none ${
                      faq.status === "published"
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100/80"
                    }`}
                  >
                    {faq.status === "published" ? t("published") : t("draft")}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground tabular-nums">
                  {faq.modifiedAt}
                </TableCell>
                <TableCell className="py-5 px-6">
                  <div className="flex items-center  gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/10 border-t border-border/40 gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            {t("showing_info", { start: 1, end: 5, total: 110 })}
          </p>
          <div className="order-1 md:order-2">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    text={""}
                    href="#"
                    className="rounded-xl border-border/60 h-9 px-3 rtl:rotate-180"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    className="rounded-xl h-9 w-9 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="rounded-xl h-9 w-9 hover:bg-muted"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="rounded-xl h-9 w-9 hover:bg-muted"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    text={""}
                    href="#"
                    className="rounded-xl border-border/60 h-9 px-3 rtl:rotate-180"
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
