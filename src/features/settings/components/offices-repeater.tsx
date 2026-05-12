import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2, MapPin, X, Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Office {
  id: string;
  title_ar: string;
  title_en: string;
  address_ar: string;
  address_en: string;
  flag: string;
}

export default function OfficesRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.offices" });
  
  const [offices, setOffices] = useState<Office[]>([
    {
      id: "1",
      title_ar: "مكتب تركيا",
      title_en: "Turkey Office",
      address_ar: "اسطنبول - بليك دوزو - جمهوريات مهلسي - مجمع الاكاروس",
      address_en: "Istanbul - Beylikduzu - Cumhuriyet Mahallesi - Alkaros Complex",
      flag: "🇹🇷",
    },
    {
      id: "2",
      title_ar: "مكتب سلطنة عمان",
      title_en: "Oman Office",
      address_ar: "مسقط - السيب - الخوض\nمبنى 304 - مجمع رقم 333 - رقم الطريق 1002",
      address_en: "Muscat - Seeb - Al Khoudh\nBuilding 304 - Complex 333 - Road 1002",
      flag: "🇴🇲",
    },
    {
      id: "3",
      title_ar: "مكتب جمهورية مصر العربية",
      title_en: "Egypt Office",
      address_ar: "القاهرة - 6 أكتوبر - الحي الأول - المجاورة الأولى",
      address_en: "Cairo - 6th of October - First District - First Neighborhood",
      flag: "🇪🇬",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const officeData = {
      title_ar: formData.get("title_ar") as string,
      title_en: formData.get("title_en") as string,
      address_ar: formData.get("address_ar") as string,
      address_en: formData.get("address_en") as string,
    };

    setOffices(offices.map(o => o.id === id ? { ...o, ...officeData } : o));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    
      setOffices(offices.filter(o => o.id !== id));
  };

  const handleAdd = () => {
    const newId = Date.now().toString();
    setOffices([{
      id: newId,
      title_ar: "",
      title_en: "",
      address_ar: "",
      address_en: "",
      flag: "📍",
    }, ...offices]);
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

      <div className="space-y-6">
        {offices.map((office) => (
          <div 
            key={office.id} 
            className={`p-6 rounded-[32px] border transition-all duration-500 ${
              editingId === office.id 
              ? "bg-white border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5" 
              : "bg-white hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            }`}
          >
            {editingId === office.id ? (
              <form onSubmit={(e) => handleSave(office.id, e)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("office_title_ar")}</FieldLabel>
                    <Input name="title_ar" defaultValue={office.title_ar} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white transition-all" required />
                  </Field>
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("office_title_en")}</FieldLabel>
                    <Input name="title_en" defaultValue={office.title_en} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white transition-all" required />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("address_ar")}</FieldLabel>
                    <Textarea name="address_ar" defaultValue={office.address_ar} className="min-h-[100px] rounded-xl bg-muted/5 border-border/40 focus:bg-white resize-none transition-all" required />
                  </Field>
                  <Field>
                    <FieldLabel className="text-gray-600 font-bold mb-2">{t("address_en")}</FieldLabel>
                    <Textarea name="address_en" defaultValue={office.address_en} className="min-h-[100px] rounded-xl bg-muted/5 border-border/40 focus:bg-white resize-none transition-all" required />
                  </Field>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => {
                    if (!office.title_ar && !office.title_en) {
                      setOffices(offices.filter(o => o.id !== office.id));
                    }
                    setEditingId(null);
                  }} className="h-11 px-6 rounded-xl font-bold text-gray-500">
                    <X className="w-4 h-4 mr-2" />
                    {t("cancel")}
                  </Button>
                  <Button type="submit" className="h-11 px-8 rounded-xl font-bold">
                    <Check className="w-4 h-4 mr-2" />
                    {t("save")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-3xl border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {office.flag || <MapPin className="w-8 h-8 text-primary/40" />}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 border-r pr-8">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">AR</span>
                       <h3 className="text-xl font-black text-gray-900">{office.title_ar}</h3>
                    </div>
                    <p className="text-gray-600 font-medium whitespace-pre-line leading-relaxed italic opacity-80 text-sm">
                      {office.address_ar}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-wider">EN</span>
                       <h3 className="text-xl font-black text-gray-900">{office.title_en}</h3>
                    </div>
                    <p className="text-gray-600 font-medium whitespace-pre-line leading-relaxed italic opacity-80 text-sm">
                      {office.address_en}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                    onClick={() => setEditingId(office.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                    onClick={() => handleDelete(office.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
