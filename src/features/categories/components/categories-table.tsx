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
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  blogsCount: number;
  status: "active" | "inactive";
}

export default function CategoriesTable() {
  const { t } = useTranslation("translation", { keyPrefix: "categories.table" });

  const [categories] = useState<Category[]>([
    { id: "1", name: "تطوير الويب", blogsCount: 12, status: "active" },
    { id: "2", name: "التسويق الرقمي", blogsCount: 8, status: "active" },
    { id: "3", name: "تصميم واجهة المستخدم", blogsCount: 5, status: "inactive" },
    { id: "4", name: "الأمن السيبراني", blogsCount: 3, status: "active" },
  ]);

  return (
    <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="py-6 px-8 font-bold text-foreground text-start">{t("name")}</TableHead>
            <TableHead className="font-bold text-foreground text-center">{t("blogs_count")}</TableHead>
            <TableHead className="font-bold text-foreground text-center">{t("status")}</TableHead>
            <TableHead className="py-6 px-8 font-bold text-foreground text-center w-[200px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id} className="group border-border/40 transition-colors hover:bg-muted/5">
              <TableCell className="py-6 px-8">
                <span className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors">{cat.name}</span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className={`rounded-lg px-3 py-1 font-bold ${cat.status === 'active' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {cat.blogsCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className={`rounded-lg px-3 py-1 font-bold ${cat.status === 'active' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-500/20'}`}>
                    {t(`status_badge.${cat.status}`)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="py-6 px-8">
                <div className="flex items-center justify-center gap-2 ">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
