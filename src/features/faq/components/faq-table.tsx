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
import {
  HelpCircle,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useFaqItem } from "../hooks/useFaqItem";
import type { FaqItem } from "../types";

interface FaqTableProps {
  data: FaqItem[];
  isLoading?: boolean;
}

export default function FaqTable({ data, isLoading }: FaqTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "faq" });
  const currentLang = i18n.language as "ar" | "en";
  const [searchQuery, setSearchQuery] = useState("");
  const { deleteItem, isDeleting } = useFaqItem();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const qAr = item.question.ar.toLowerCase();
      const qEn = item.question.en.toLowerCase();
      return qAr.includes(query) || qEn.includes(query);
    });
  }, [data, searchQuery]);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteItem(id, {
      onSettled: () => setDeletingId(null)
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-border/40 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center animate-pulse">
          <HelpCircle className="w-6 h-6 text-primary/20" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border/40">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
                {t("status")}
              </TableHead>
              <TableHead className=" py-5 px-6 font-bold text-foreground text-start">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((faq) => (
              <TableRow
                key={faq.id}
                className="group border-border/40 transition-colors hover:bg-muted/5"
              >
                <TableCell className="py-5 px-6 font-medium text-gray-900 max-w-md text-start">
                  {faq.question[currentLang]}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={`rounded-full px-4 py-1 font-medium border-none ${
                      faq.is_active
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100/80"
                    }`}
                  >
                    {faq.is_active ? t("published") : t("draft")}
                  </Badge>
                </TableCell>
                <TableCell className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <Link to={`/faq/edit/${faq.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting && deletingId === faq.id}
                      onClick={() => handleDelete(faq.id)}
                      className="w-9 h-9 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      {isDeleting && deletingId === faq.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-20 text-center text-muted-foreground font-medium">
                   {searchQuery ? `No results found for "${searchQuery}"` : "No questions found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Info bar */}
        {filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/10 border-t border-border/40 gap-4">
            <p className="text-sm text-muted-foreground order-2 md:order-1 font-medium">
              Showing {filteredData.length} questions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
