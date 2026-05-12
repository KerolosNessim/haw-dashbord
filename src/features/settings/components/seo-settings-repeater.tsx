import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Save, X, Check, Search, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeoPage {
  id: string;
  name_ar: string;
  name_en: string;
  metaTitle_ar: string;
  metaTitle_en: string;
  description_ar: string;
  description_en: string;
}

export default function SeoSettingsRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.seo" });

  const [pages, setPages] = useState<SeoPage[]>([
    {
      id: "home",
      name_ar: "الرئيسية",
      name_en: "Home",
      metaTitle_ar: "الصفحة الرئيسية | حلول احترافية",
      metaTitle_en: "Home | Professional Solutions",
      description_ar: "حلول احترافية وخدمات متميزة",
      description_en: "Professional solutions and outstanding services",
    },
    {
      id: "about",
      name_ar: "من نحن",
      name_en: "About Us",
      metaTitle_ar: "من نحن | رؤيتنا ورسالتنا",
      metaTitle_en: "About Us | Our Vision & Mission",
      description_ar: "تعرف على رؤيتنا ورسالتنا وفريقنا",
      description_en: "Get to know our vision, mission, and team",
    },
    {
      id: "portfolio",
      name_ar: "نماذج العملاء",
      name_en: "Portfolio",
      metaTitle_ar: "نماذج العملاء | نجاحات حقيقية",
      metaTitle_en: "Portfolio | Real Successes",
      description_ar: "اكتشف نماذج من أعمالنا الناجحة",
      description_en: "Discover some of our successful works",
    },
    {
      id: "blog",
      name_ar: "المدونة",
      name_en: "Blog",
      metaTitle_ar: "المدونة | مقالات وأخبار",
      metaTitle_en: "Blog | Articles & News",
      description_ar: "أحدث المقالات والأخبار في مجالنا",
      description_en: "Latest articles and news in our field",
    },
    {
      id: "courses",
      name_ar: "الدورات",
      name_en: "Courses",
      metaTitle_ar: "الدورات | طور مهاراتك",
      metaTitle_en: "Courses | Develop Your Skills",
      description_ar: "تصفح على دوراتنا وطور مهاراتك",
      description_en: "Browse our courses and develop your skills",
    },
    {
      id: "faq",
      name_ar: "الأسئلة الشائعة",
      name_en: "FAQ",
      metaTitle_ar: "الأسئلة الشائعة | إجابات سريعة",
      metaTitle_en: "FAQ | Quick Answers",
      description_ar: "إجابات على أكثر الأسئلة شيوعاً",
      description_en: "Answers to the most common questions",
    },
    {
      id: "contact",
      name_ar: "اتصل بنا",
      name_en: "Contact Us",
      metaTitle_ar: "اتصل بنا | تواصل معنا",
      metaTitle_en: "Contact Us | Get in Touch",
      description_ar: "تواصل معنا وسنرد عليك في أقرب وقت",
      description_en: "Contact us and we will respond as soon as possible",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name_ar: formData.get("name_ar") as string,
      name_en: formData.get("name_en") as string,
      metaTitle_ar: formData.get("metaTitle_ar") as string,
      metaTitle_en: formData.get("metaTitle_en") as string,
      description_ar: formData.get("description_ar") as string,
      description_en: formData.get("description_en") as string,
    };

    setPages(pages.map(p => p.id === id ? { ...p, ...data } : p));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {

      setPages(pages.filter(p => p.id !== id));
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setPages([{
      id: newId,
      name_ar: "",
      name_en: "",
      metaTitle_ar: "",
      metaTitle_en: "",
      description_ar: "",
      description_en: "",
    }, ...pages]);
    setEditingId(newId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        <Button 
          onClick={handleAdd}
          className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("add_button")}
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-6 px-8 font-black text-foreground text-start w-[220px]">
                {t("page")}
              </TableHead>
              <TableHead className="font-black text-foreground text-start">
                {t("meta_title_ar")} / {t("meta_title_en")}
              </TableHead>
              <TableHead className="font-black text-foreground text-start">
                {t("description_ar")} / {t("description_en")}
              </TableHead>
              <TableHead className="py-6 px-8 font-black text-foreground text-center w-[150px]">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((p) => (
              <TableRow
                key={p.id}
                className={`group border-border/40 transition-all duration-300 ${
                  editingId === p.id ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-muted/5"
                }`}
              >
                {editingId === p.id ? (
                  <TableCell colSpan={4} className="p-0">
                    <form onSubmit={(e) => handleSave(p.id, e)} className="p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="text-sm font-bold text-gray-600">{t("page")}</span>
                           </div>
                           <Input name="name_ar" defaultValue={p.name_ar} placeholder="اسم الصفحة بالعربية" className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />

                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="text-sm font-bold text-gray-600">{t("meta_title_ar")}</span>
                           </div>
                           <Input name="metaTitle_ar" defaultValue={p.metaTitle_ar} className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />
                           
                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="text-sm font-bold text-gray-600">{t("description_ar")}</span>
                           </div>
                           <Textarea name="description_ar" defaultValue={p.description_ar} className="min-h-[100px] rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all resize-none" required />
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("page")}</span>
                           </div>
                           <Input name="name_en" defaultValue={p.name_en} placeholder="Page name in English" className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />

                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("meta_title_en")}</span>
                           </div>
                           <Input name="metaTitle_en" defaultValue={p.metaTitle_en} className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />
                           
                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("description_en")}</span>
                           </div>
                           <Textarea name="description_en" defaultValue={p.description_en} className="min-h-[100px] rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all resize-none" required />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => {
                          if (!p.name_ar && !p.name_en) {
                            setPages(pages.filter(page => page.id !== p.id));
                          }
                          setEditingId(null);
                        }} className="h-11 px-6 rounded-xl font-bold text-gray-500">
                          <X className="w-4 h-4 mr-2" />
                          {t("cancel")}
                        </Button>
                        <Button type="submit" className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                          <Check className="w-4 h-4 mr-2" />
                          {t("save")}
                        </Button>
                      </div>
                    </form>
                  </TableCell>
                ) : (
                  <>
                    <TableCell className="py-8 px-8 text-start align-top">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Search className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="font-black text-gray-900 text-base">{p.name_ar}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="font-black text-gray-900 text-base uppercase tracking-tight">{p.name_en}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-start align-top py-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                            <span className="text-sm font-black text-gray-900">{p.metaTitle_ar}</span>
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                            <span className="text-sm font-black text-gray-900">{p.metaTitle_en}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-start align-top py-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                            <span className="text-xs font-medium text-muted-foreground leading-relaxed italic line-clamp-2">{p.description_ar}</span>
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-4">
                           <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                            <span className="text-xs font-medium text-muted-foreground leading-relaxed italic line-clamp-2">{p.description_en}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-8 px-8 align-top">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-11 h-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all shadow-sm bg-white"
                          onClick={() => setEditingId(p.id)}
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-11 h-11 rounded-2xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shadow-sm bg-white"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
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
    </div>
  );
}
