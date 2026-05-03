import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, CheckCircle2, FileX2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
  question: string;
}

function StatsCard({ label, value, icon: Icon, colorClass, iconColorClass, question }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <div className={`p-3 rounded-2xl ${colorClass} transition-colors duration-300`}>
            <Icon className={`w-6 h-6 ${iconColorClass}`} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value} <span className="text-muted-foreground text-sm">{question}</span></h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FaqStats() {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });

  const stats = [
    {
      label: t("all_faq"),
      value: "24",
      icon: HelpCircle,
      colorClass: "bg-blue-50",
      iconColorClass: "text-blue-600",
    },
    {
      label: t("active_faq"),
      value: "18",
      icon: CheckCircle2,
      colorClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
    },
    {
      label: t("inactive_faq"),
      value: "6",
      icon: FileX2,
      colorClass: "bg-amber-50",
      iconColorClass: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} question={t("question")} />
      ))}
    </div>
  );
}
