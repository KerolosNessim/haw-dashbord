import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { User } from "../types/index";
import { useTranslation } from "react-i18next";
import { Mail, Phone, Calendar, User as UserIcon, Shield, Globe, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsDialog({
  user,
  isOpen,
  onClose,
}: UserDetailsDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "users" });

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header with Background Gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 pb-12 relative">
          <DialogHeader className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-start space-y-2">
                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  {user.name}
                  <Badge
                    className={`rounded-full px-4 py-1 font-bold border-none ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : user.status === "suspended"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {t(`status.${user.status}`)}
                  </Badge>
                </DialogTitle>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-8 -mt-6 bg-white rounded-t-[40px] relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              {t("account_info")}
            </h4>
            <div className="grid gap-4">
              <InfoRow
                icon={Shield}
                label={t("email_verified")}
                value={user.emailVerified ? t("verified") : t("not_verified")}
                valueClass={user.emailVerified ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}
              />
              <InfoRow
                icon={Calendar}
                label={t("created_at")}
                value={user.createdAt}
              />
              <InfoRow
                icon={Clock}
                label={t("last_login")}
                value={user.lastLoginAt ?? t("never")}
              />
            </div>
          </div>

          {/* Preferences & Locale */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-primary">
              <Globe className="w-5 h-5" />
              {t("preferences")}
            </h4>
            <div className="grid gap-4">
              <InfoRow
                icon={Globe}
                label={t("locale")}
                value={user.locale.toUpperCase()}
              />
              <InfoRow
                icon={MapPin}
                label={t("timezone")}
                value={user.timezone}
              />
              <InfoRow
                icon={UserIcon}
                label={t("user_id")}
                value={user.id}
                valueClass="text-[10px] font-mono break-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border/40 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="rounded-xl px-8 font-bold">
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: any;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/40 transition-colors hover:bg-muted/10">
      <div className="w-10 h-10 rounded-xl bg-white border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-5 h-5 text-primary/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className={`text-sm font-semibold truncate ${valueClass ?? "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
