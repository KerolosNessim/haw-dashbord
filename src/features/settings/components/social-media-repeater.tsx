import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTwitter } from "react-icons/fa";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SocialPlatform {
  id: string;
  name: string;
  link: string;
  isActive: boolean;
  icon: any;
  color: string;
}

export default function SocialMediaRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.social" });
  const { t: commonT } = useTranslation("translation");

  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: "1",
      name: "فيسبوك",
      link: "https://facebook.com/yourpage",
      isActive: true,
      icon: FaFacebook,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "2",
      name: "انستقرام",
      link: "https://instagram.com/yourpage",
      isActive: true,
      icon: FaInstagram,
      color: "text-pink-600 bg-pink-50",
    },
    {
      id: "3",
      name: "لينكدان",
      link: "https://linkedin.com/company/yourpage",
      isActive: true,
      icon: FaLinkedin,
      color: "text-blue-700 bg-blue-50",
    },
    {
      id: "4",
      name: "يوتيوب",
      link: "https://youtube.com/@yourpage",
      isActive: true,
      icon: FaYoutube,
      color: "text-red-600 bg-red-50",
    },
    {
      id: "5",
      name: "(تويتر) X",
      link: "https://x.com/yourpage",
      isActive: false,
      icon: FaTwitter,
      color: "text-black bg-gray-50",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      link: formData.get("link") as string,
    };

    if (editingPlatform) {
      setPlatforms(platforms.map(p => p.id === editingPlatform.id ? { ...p, ...data } : p));
    } else {
      setPlatforms([...platforms, { 
        id: Date.now().toString(), 
        ...data, 
        isActive: true, 
        icon: GlobeIcon, 
        color: "text-primary bg-primary/5" 
      }]);
    }
    
    setIsOpen(false);
    setEditingPlatform(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingPlatform(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-5 h-5 mr-2" />
              {t("add_button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">{editingPlatform ? t("edit") : t("add_button")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              <Field>
                <FieldLabel>{t("platform")}</FieldLabel>
                <Input name="name" defaultValue={editingPlatform?.name} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white" required />
              </Field>
              <Field>
                <FieldLabel>{t("link")}</FieldLabel>
                <Input name="link" defaultValue={editingPlatform?.link} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white" required dir="ltr" />
              </Field>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold">{t("save")}</Button>
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsOpen(false)}>{t("cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[24px] border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-bold text-foreground text-start w-[250px]">{t("platform")}</TableHead>
              <TableHead className="font-bold text-foreground text-start">{t("link")}</TableHead>
              <TableHead className="font-bold text-foreground text-center w-[120px]">{t("status")}</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center w-[150px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms.map((p) => (
              <TableRow key={p.id} className="group border-border/40 transition-colors hover:bg-muted/5">
                <TableCell className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", p.color)}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-start">
                  <span className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20 hover:text-primary transition-colors cursor-pointer dir-ltr inline-block">
                    {p.link}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Switch 
                    dir="ltr" 
                    checked={p.isActive} 
                    onCheckedChange={(val) => {
                      setPlatforms(platforms.map(plat => plat.id === p.id ? { ...plat, isActive: val } : plat));
                    }}
                  />
                </TableCell>
                <TableCell className="py-5 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                      onClick={() => {
                        setEditingPlatform(p);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                      onClick={() => {
                         if(confirm(commonT("settings.offices.delete_confirm"))) {
                            setPlatforms(platforms.filter(plat => plat.id !== p.id));
                         }
                      }}
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

      <div className="flex items-center gap-8 text-sm font-bold pt-4 px-2">
         <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("follow")}
         </div>
         <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            {t("unfollow")}
         </div>
      </div>
    </div>
  );
}

function GlobeIcon(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <circle cx="12" cy="12" r="10" />
       <path d="M12 2a14.5 14.5 0 0 0 0 20" />
       <path d="M2 12h20" />
     </svg>
   )
 }
