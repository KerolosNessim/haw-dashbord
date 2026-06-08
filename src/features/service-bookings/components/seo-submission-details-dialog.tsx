import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Globe,
  Mail,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ApplicationSeoSubmission } from "../types/application-seo-submission";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { ReactNode } from "react";

interface SeoSubmissionDetailsDialogProps {
  submission: ApplicationSeoSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SeoSubmissionDetailsDialog({
  submission,
  isOpen,
  onClose,
}: SeoSubmissionDetailsDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "consultation.seo" });

  if (!submission) return null;

  const serviceTitle = plainTextFromHtml(submission.service_title) || "—";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 pb-10">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Search className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {t("submission_details")}
              </DialogTitle>
            </div>
            <p className="text-muted-foreground font-medium">{serviceTitle}</p>
          </DialogHeader>
        </div>

        <div className="p-8 -mt-6 bg-white rounded-t-[40px] relative z-20 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard icon={Briefcase} label={t("service")} value={serviceTitle} />
            <InfoCard
              icon={Globe}
              label={t("website")}
              value={
                submission.website_url ? (
                  <a
                    href={submission.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                    dir="ltr"
                  >
                    {submission.website_url}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <InfoCard icon={Mail} label={t("email")} value={submission.email} dir="ltr" />
            <InfoCard icon={Calendar} label={t("date")} value={submission.created_at} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">{t("status_label")}</span>
              <Badge
                className={`rounded-full px-3 py-0.5 font-bold border-none ${
                  submission.status === "new"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {t(`status.${submission.status}`, { defaultValue: submission.status })}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">{t("consent")}</span>
              <Badge
                className={`rounded-full px-3 py-0.5 font-bold border-none ${
                  submission.consent
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 me-1" />
                {submission.consent ? t("consent_yes") : t("consent_no")}
              </Badge>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onClose} className="rounded-xl px-8 font-bold">
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="p-5 bg-muted/30 rounded-2xl border border-border/40 space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </p>
      <div className="font-bold text-foreground" dir={dir}>
        {value}
      </div>
    </div>
  );
}
