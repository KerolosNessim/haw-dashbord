import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Mail, MessageSquare, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContactSubmission } from "../types/index";

interface SubmissionDetailsDialogProps {
  submission: ContactSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionDetailsDialog({
  submission,
  isOpen,
  onClose,
}: SubmissionDetailsDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "contact" });

  if (!submission) return null;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            {t("submission_details")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider">{t("name")}</p>
                  <p className="text-foreground font-bold">{submission.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider">{t("email")}</p>
                  <p className="text-foreground font-bold">{submission.email}</p>
                </div>
              </div>
            </div>

            {/* Contact & Date Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider">{t("phone")}</p>
                  <p className="text-foreground font-bold" dir="ltr">{submission.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider">{t("submitted_at")}</p>
                  <p className="text-foreground font-bold">{submission.created_at}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/30 rounded-2xl border border-border/40">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {t("message")}
            </p>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {submission.message}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
              {t("close")}
            </Button>
            {/* <Button asChild className="rounded-xl px-6 flex items-center gap-2">
              <a href={`mailto:${submission.email}?subject=Re: ${submission.message ? submission.message.slice(0, 30) : t("submission_details")}`}>
                <Reply className="w-4 h-4" />
                {t("reply_via_email")}
              </a>
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
