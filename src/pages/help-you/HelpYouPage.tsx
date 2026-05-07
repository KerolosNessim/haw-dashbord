import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentTab from "@/features/help-you/components/ContentTab";

export default function HelpYouPage() {
  const { t } = useTranslation("translation", {
    keyPrefix: "help_you",
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <HelpCircle className="w-7 h-7" />
          </div>
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-medium text-lg ms-16">
          {t("description")}
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-border/60 p-8 md:p-12 shadow-sm">
        <ContentTab />
      </div>
    </div>
  );
}
