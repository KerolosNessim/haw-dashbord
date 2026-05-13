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
  Trash2,
  Loader2,
  Globe,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTwitter } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings, useSaveSocial, useDeleteSocial } from "../hooks/useSettings";
import { toast } from "sonner";
import type { SocialMedia } from "../types";

const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return FaFacebook;
  if (p.includes("instagram")) return FaInstagram;
  if (p.includes("linkedin")) return FaLinkedin;
  if (p.includes("youtube")) return FaYoutube;
  if (p.includes("twitter") || p === "x") return FaTwitter;
  return Globe;
};

const getPlatformColor = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return "text-blue-600 bg-blue-50";
  if (p.includes("instagram")) return "text-pink-600 bg-pink-50";
  if (p.includes("linkedin")) return "text-blue-700 bg-blue-50";
  if (p.includes("youtube")) return "text-red-600 bg-red-50";
  if (p.includes("twitter") || p === "x") return "text-black bg-gray-50";
  return "text-primary bg-primary/5";
};

export default function SocialMediaRepeater() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.social" });
  const { t: commonT } = useTranslation("translation");

  const { data: settingsData, isLoading } = useSettings();
  const { mutateAsync: saveSocial, isPending: isSaving } = useSaveSocial();
  const { mutateAsync: deleteSocial, isPending: isDeleting } = useDeleteSocial();

  const [platforms, setPlatforms] = useState<SocialMedia[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<SocialMedia | null>(null);

  useEffect(() => {
    if (settingsData?.data?.social_media) {
      setPlatforms(settingsData.data.social_media);
    }
  }, [settingsData]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<SocialMedia> = {
      platform: formData.get("platform") as string,
      link: formData.get("link") as string,
      is_active: editingPlatform ? editingPlatform.is_active : true,
    };

    if (editingPlatform) {
      data.id = editingPlatform.id;
    }

    try {
      await saveSocial(data);
      toast.success(commonT("success_message") || "Saved successfully");
      setIsOpen(false);
      setEditingPlatform(null);
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  const handleToggle = async (platform: SocialMedia, active: boolean) => {
    try {
      await saveSocial({ ...platform, is_active: active });
      toast.success(commonT("success_message") || "Status updated");
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSocial(id);
      toast.success(commonT("success_message") || "Deleted successfully");
    } catch (error) {
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        
        <Button 
          onClick={() => { setEditingPlatform(null); setIsOpen(true); }}
          disabled={isSaving || isDeleting}
          className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("add_button")}
        </Button>

        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setEditingPlatform(null); }}>
          <DialogContent className="rounded-[32px] max-w-xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">{editingPlatform ? t("edit") : t("add_button")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              <Field>
                <FieldLabel>{t("platform")}</FieldLabel>
                <Input name="platform" defaultValue={editingPlatform?.platform} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white" required />
              </Field>
              <Field>
                <FieldLabel>{t("link")}</FieldLabel>
                <Input name="link" defaultValue={editingPlatform?.link} className="h-12 rounded-xl bg-muted/5 border-border/40 focus:bg-white" required dir="ltr" />
              </Field>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("save")}
                </Button>
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
              <TableHead className="font-bold text-foreground text-start w-[120px]">{t("status")}</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-start w-[150px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms.map((p) => {
              const Icon = getPlatformIcon(p.platform);
              return (
                <TableRow key={p.id} className="group border-border/40 transition-colors hover:bg-muted/5">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", getPlatformColor(p.platform))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-900">{p.platform}</span>
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
                      checked={p.is_active} 
                      onCheckedChange={(val) => handleToggle(p, val)}
                      disabled={isSaving}
                    />
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={isSaving || isDeleting}
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
                        disabled={isSaving || isDeleting}
                        className="w-10 h-10 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                        onClick={() => handleDelete(p.id)}
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
