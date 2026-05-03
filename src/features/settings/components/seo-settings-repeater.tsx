import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Save } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeoPage {
  id: string;
  nameKey: string;
  metaTitle: string;
  description: string;
}

export default function SeoSettingsRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.seo" });

  const [pages, setPages] = useState<SeoPage[]>([
    {
      id: "home",
      nameKey: "pages.home",
      metaTitle: "الصفحة الرئيسية | حلول احترافية",
      description: "حلول احترافية وخدمات متميزة",
    },
    {
      id: "about",
      nameKey: "pages.about",
      metaTitle: "من نحن | رؤيتنا ورسالتنا",
      description: "تعرف على رؤيتنا ورسالتنا وفريقنا",
    },
    {
      id: "portfolio",
      nameKey: "pages.portfolio",
      metaTitle: "نماذج العملاء | نجاحات حقيقية",
      description: "اكتشف نماذج من أعمالنا الناجحة",
    },
    {
      id: "blog",
      nameKey: "pages.blog",
      metaTitle: "المدونة | مقالات وأخبار",
      description: "أحدث المقالات والأخبار في مجالنا",
    },
    {
      id: "courses",
      nameKey: "pages.courses",
      metaTitle: "الدورات | طور مهاراتك",
      description: "تصفح على دوراتنا وطور مهاراتك",
    },
    {
      id: "faq",
      nameKey: "pages.faq",
      metaTitle: "الأسئلة الشائعة | إجابات سريعة",
      description: "إجابات على أكثر الأسئلة شيوعاً",
    },
    {
      id: "contact",
      nameKey: "pages.contact",
      metaTitle: "اتصل بنا | تواصل معنا",
      description: "تواصل معنا وسنرد عليك في أقرب وقت",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      metaTitle: formData.get("metaTitle") as string,
      description: formData.get("description") as string,
    };

    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...data } : p));
    }
    
    setIsOpen(false);
    setEditingPage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
      </div>

      <div className="bg-white rounded-[24px] border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-bold text-foreground text-start w-[200px]">
                {t("page")}
              </TableHead>
              <TableHead className="font-bold text-foreground text-start w-[300px]">
                {t("meta_title")}
              </TableHead>
              <TableHead className="font-bold text-foreground text-start">
                {t("description")}
              </TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center w-[100px]">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((p) => (
              <TableRow
                key={p.id}
                className="group border-border/40 transition-colors hover:bg-muted/5"
              >
                <TableCell className="py-5 px-6 text-start">
                  <span className="font-black text-primary text-lg">
                    {t(p.nameKey)}
                  </span>
                </TableCell>

                <TableCell className="text-start">
                  <span className="font-bold text-gray-700 leading-relaxed">
                    {p.metaTitle}
                  </span>
                </TableCell>

                <TableCell className="text-start">
                  <span className="text-muted-foreground font-medium leading-relaxed opacity-80">
                    {p.description}
                  </span>
                </TableCell>

                <TableCell className="py-5 px-6">
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                      onClick={() => {
                        setEditingPage(p);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-start pt-6 border-t mt-12">
        <Button
          size="lg"
          className="rounded-xl px-12 h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save className="w-5 h-5 mr-2" />
          {t("save")}
        </Button>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);
          if (!val) setEditingPage(null);
        }}
      >
        <DialogContent className="rounded-[32px] max-w-xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">
              {t("edit")} - {editingPage && t(editingPage.nameKey)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <Field>
              <FieldLabel>{t("meta_title")}</FieldLabel>
              <Input
                name="metaTitle"
                defaultValue={editingPage?.metaTitle}
                className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white"
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <Textarea
                name="description"
                defaultValue={editingPage?.description}
                className="min-h-[120px] rounded-xl bg-muted/5 border-border/40 focus:bg-white resize-none"
              />
            </Field>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl font-bold"
              >
                {t("save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => setIsOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
