import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, Calendar, Mail, MessageSquare, Phone, User, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ServiceBooking } from "../types/index";
import { bookingServiceTitle } from "../services/bookingService";

interface BookingDetailsDialogProps {
  booking: ServiceBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDetailsDialog({
  booking,
  isOpen,
  onClose,
}: BookingDetailsDialogProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "consultation" });
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";

  if (!booking) return null;



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 pb-10">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {t("booking_details")}
              </DialogTitle>
            </div>
            <p className="text-muted-foreground font-medium">
              {bookingServiceTitle(booking, currentLang) || "—"}
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 -mt-6 bg-white rounded-t-[40px] relative z-20 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              icon={User}
              label={t("name")}
              value={booking.name}
            />
            <InfoCard
              icon={Mail}
              label={t("email")}
              value={booking.email}
            />
            <InfoCard
              icon={Phone}
              label={t("phone")}
              value={booking.phone}
              dir="ltr"
            />
            <InfoCard
              icon={Calendar}
              label={t("date")}
              value={booking.created_at}
            />
          </div>

          <div className="p-6 bg-muted/30 rounded-2xl border border-border/40">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t("message")}
            </p>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">
              {booking.message}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="rounded-xl px-8 font-bold">
              {t("close")}
            </Button>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ icon: Icon, label, value, dir }: { icon: LucideIcon; label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/40">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-border/40 shadow-sm shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground truncate" dir={dir}>{value}</p>
      </div>
    </div>
  );
}
