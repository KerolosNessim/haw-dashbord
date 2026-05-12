import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import SolutionsSectionForm from "./solutions-section-form";

type SolutionsSectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SolutionsSectionDialog({ open, onOpenChange }: SolutionsSectionDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "solutions.section_dialog" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[28px] sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings2 className="h-5 w-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SolutionsSectionForm
          onSaved={() => onOpenChange(false)}
          submitLabel={t("save")}
          className="space-y-8 pt-2"
        />
      </DialogContent>
    </Dialog>
  );
}
