import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { Pencil, X, Check, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SEO_PAGE_KEYS,
  type SeoPageKey,
  isSeoPageKey,
} from "../lib/seo-page-keys";
import { useSettings, useSaveSeo, useDeleteSeo } from "../hooks/useSettings";
import type { SeoSettings } from "../types";

function resolvePageKey(
  p: SeoSettings,
  pageLabel: (key: SeoPageKey, lng: "ar" | "en") => string,
): string {
  if (p.page_key && isSeoPageKey(p.page_key)) return p.page_key;
  for (const key of SEO_PAGE_KEYS) {
    if (p.name_ar === pageLabel(key, "ar") || p.name_en === pageLabel(key, "en")) {
      return key;
    }
  }
  return "";
}

export default function SeoSettingsRepeater() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "settings.seo" });
  const { t: commonT } = useTranslation("translation");

  const { data: settingsData, isLoading } = useSettings();
  const { mutateAsync: saveSeo, isPending: isSaving } = useSaveSeo();
  const { mutateAsync: deleteSeo, isPending: isDeleting } = useDeleteSeo();

  const [pages, setPages] = useState<SeoSettings[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editPageKey, setEditPageKey] = useState("");
  const [editDescriptions, setEditDescriptions] = useState<{
    description_ar: string;
    description_en: string;
  }>({ description_ar: "", description_en: "" });

  const pageLabel = (key: SeoPageKey, lng: "ar" | "en") =>
    t(`pages.${key}`, { lng });

  const usedPageKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const page of pages) {
      if (page.id === editingId) continue;
      const key = resolvePageKey(page, pageLabel);
      if (key) keys.add(key);
    }
    return keys;
  }, [pages, editingId, i18n.language]);

  useEffect(() => {
    if (settingsData?.data?.seo) {
      setPages(settingsData.data.seo);
    }
  }, [settingsData]);

  const handleSave = async (id: number | string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPageKey || !isSeoPageKey(editPageKey)) {
      toast.error(t("page_select_placeholder"));
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data: Partial<SeoSettings> = {
      page_key: editPageKey,
      name_ar: pageLabel(editPageKey, "ar"),
      name_en: pageLabel(editPageKey, "en"),
      metaTitle_ar: formData.get("metaTitle_ar") as string,
      metaTitle_en: formData.get("metaTitle_en") as string,
      description_ar: editDescriptions.description_ar.trim(),
      description_en: editDescriptions.description_en.trim(),
    };

    if (typeof id === "number") {
      data.id = id;
    }

    try {
      await saveSeo(data);
      toast.success(commonT("success_message", { defaultValue: "Saved successfully" }));
      setEditingId(null);
      setEditPageKey("");
      setEditDescriptions({ description_ar: "", description_en: "" });
    } catch (error) {
      toast.error(commonT("error_message", { defaultValue: "Something went wrong" }));
    }
  };

  const handleDelete = async (id: number | string) => {
    if (typeof id === "string") {
      setPages(pages.filter(p => p.id !== id));
      return;
    }

    try {
      await deleteSeo(id);
      toast.success(commonT("success_message", { defaultValue: "Deleted successfully" }));
    } catch (error) {
      toast.error(commonT("error_message", { defaultValue: "Something went wrong" }));
    }
  };

  const handleAdd = () => {
    const tempId = `temp-${Date.now()}`;
    const newPage: any = {
      id: tempId,
      name_ar: "",
      name_en: "",
      metaTitle_ar: "",
      metaTitle_en: "",
      description_ar: "",
      description_en: "",
    };
    setPages([newPage, ...pages]);
    setEditingId(tempId);
    setEditPageKey("");
    setEditDescriptions({ description_ar: "", description_en: "" });
  };

  const renderPageSelect = (lng: "ar" | "en") => (
    <Select value={editPageKey || undefined} onValueChange={setEditPageKey} required>
      <SelectTrigger className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all w-full">
        <SelectValue placeholder={t("page_select_placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {SEO_PAGE_KEYS.map((key) => (
          <SelectItem key={key} value={key} disabled={usedPageKeys.has(key)}>
            {pageLabel(key, lng)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        <Button 
          onClick={handleAdd}
          disabled={isSaving || isDeleting}
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
              <TableHead className="py-6 px-8 font-black text-foreground text-start w-[150px]">
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
                           {renderPageSelect("ar")}

                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="text-sm font-bold text-gray-600">{t("meta_title_ar")}</span>
                           </div>
                           <Input name="metaTitle_ar" defaultValue={p.metaTitle_ar} className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />
                           
                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                              <span className="text-sm font-bold text-gray-600">{t("description_ar")}</span>
                           </div>
                           <Textarea
                             value={editDescriptions.description_ar}
                             onChange={(e) =>
                               setEditDescriptions((d) => ({
                                 ...d,
                                 description_ar: e.target.value,
                               }))
                             }
                             dir="rtl"
                             className="min-h-[120px] rounded-xl bg-white border-border/40 resize-none"
                           />
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("page")}</span>
                           </div>
                           {renderPageSelect("en")}

                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("meta_title_en")}</span>
                           </div>
                           <Input name="metaTitle_en" defaultValue={p.metaTitle_en} className="h-12 rounded-xl bg-white border-border/40 focus:ring-primary/20 transition-all" required />
                           
                           <div className="flex items-center gap-2 mb-2 pt-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="text-sm font-bold text-gray-600">{t("description_en")}</span>
                           </div>
                           <Textarea
                             value={editDescriptions.description_en}
                             onChange={(e) =>
                               setEditDescriptions((d) => ({
                                 ...d,
                                 description_en: e.target.value,
                               }))
                             }
                             dir="ltr"
                             className="min-h-[120px] rounded-xl bg-white border-border/40 resize-none"
                           />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => {
                          if (typeof p.id === "string") {
                            setPages(pages.filter(page => page.id !== p.id));
                          }
                          setEditingId(null);
                          setEditPageKey("");
                          setEditDescriptions({ description_ar: "", description_en: "" });
                        }} className="h-11 px-6 rounded-xl font-bold text-gray-500">
                          <X className="w-4 h-4 mr-2" />
                          {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSaving} className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
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
                              <span className="font-black text-gray-900 text-base">
                                {(() => {
                                  const key = resolvePageKey(p, pageLabel);
                                  return key ? pageLabel(key as SeoPageKey, "ar") : p.name_ar;
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                              <span className="font-black text-gray-900 text-base uppercase tracking-tight">
                                {(() => {
                                  const key = resolvePageKey(p, pageLabel);
                                  return key ? pageLabel(key as SeoPageKey, "en") : p.name_en;
                                })()}
                              </span>
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
                            <span className="text-xs font-medium text-muted-foreground leading-relaxed italic line-clamp-2">
                              {plainTextFromHtml(p.description_ar)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-4">
                           <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                            <span className="text-xs font-medium text-muted-foreground leading-relaxed italic line-clamp-2">
                              {plainTextFromHtml(p.description_en)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-8 px-8 align-top">
                      <div className="flex items-center justify-start gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSaving || isDeleting}
                          className="w-11 h-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all shadow-sm bg-white"
                          onClick={() => {
                            setEditingId(p.id);
                            setEditPageKey(resolvePageKey(p, pageLabel));
                            setEditDescriptions({
                              description_ar: plainTextFromHtml(p.description_ar),
                              description_en: plainTextFromHtml(p.description_en),
                            });
                          }}
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSaving || isDeleting}
                          className="w-11 h-11 rounded-2xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shadow-sm bg-white"
                          onClick={() => handleDelete(p.id)}
                        >
                          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
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
    </div>
  );
}

