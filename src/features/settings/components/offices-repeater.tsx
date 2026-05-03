import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Office {
  id: string;
  title: string;
  address: string;
  flag: string;
}

export default function OfficesRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.offices" });
  const { t: commonT } = useTranslation("translation");
  
  const [offices, setOffices] = useState<Office[]>([
    {
      id: "1",
      title: "مكتب تركيا",
      address: "اسطنبول - بليك دوزو - جمهوريات مهلسي - مجمع الاكاروس",
      flag: "🇹🇷",
    },
    {
      id: "2",
      title: "مكتب سلطنة عمان",
      address: "مسقط - السيب - الخوض\nمبنى 304 - مجمع رقم 333 - رقم الطريق 1002",
      flag: "🇴🇲",
    },
    {
      id: "3",
      title: "مكتب جمهورية مصر العربية",
      address: "القاهرة - 6 أكتوبر - الحي الأول - المجاورة الأولى",
      flag: "🇪🇬",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const officeData = {
      title: formData.get("title") as string,
      address: formData.get("address") as string,
      flag: "📍", // Default placeholder
    };

    if (editingOffice) {
      setOffices(offices.map(o => o.id === editingOffice.id ? { ...o, ...officeData } : o));
    } else {
      setOffices([...offices, { id: Date.now().toString(), ...officeData }]);
    }
    
    setIsOpen(false);
    setEditingOffice(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("delete_confirm"))) {
      setOffices(offices.filter(o => o.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingOffice(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-5 h-5 mr-2" />
              {t("add_button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">{editingOffice ? t("edit") : t("add_button")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              <Field>
                <FieldLabel>{t("office_title")}</FieldLabel>
                <Input name="title" defaultValue={editingOffice?.title} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white" required />
              </Field>
              <Field>
                <FieldLabel>{t("address")}</FieldLabel>
                <Textarea name="address" defaultValue={editingOffice?.address} className="min-h-[100px] rounded-xl bg-muted/5 border-border/40 focus:bg-white resize-none" required />
              </Field>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold">{t("save")}</Button>
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsOpen(false)}>{t("cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {offices.map((office) => (
          <div 
            key={office.id} 
            className="group flex items-center justify-between p-6 rounded-[24px] border bg-white hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          >

            <div className="w-16 h-16 rounded-2xl bg-muted/5 flex items-center justify-center text-3xl shadow-inner border border-border/20 group-hover:scale-110 transition-transform duration-500">
               {office.flag}
            </div>
            <div className="flex-1 px-8 text-start">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{office.title}</h3>
              <p className="text-muted-foreground font-medium whitespace-pre-line leading-relaxed italic opacity-80">
                {office.address}
              </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                    onClick={() => handleDelete(office.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                    onClick={() => {
                      setEditingOffice(office);
                      setIsOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
