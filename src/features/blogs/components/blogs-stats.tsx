import { Card, CardContent } from "@/components/ui/card";
import { BookText, CheckCircle2, FileX2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
  unit: string;
}

function StatsCard({ label, value, icon: Icon, colorClass, iconColorClass, unit }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${colorClass} transition-colors duration-300`}>
            <Icon className={`w-7 h-7 ${iconColorClass}`} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <h3 className="text-3xl font-bold tracking-tight">
              {value} <span className="text-muted-foreground text-sm lowercase">{unit}</span>
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlogsStats() {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });

  const stats = [
    {
      label: t("all_blogs"),
      value: "42",
      icon: BookText,
      colorClass: "bg-indigo-50",
      iconColorClass: "text-indigo-600",
    },
    {
      label: t("active_blogs"),
      value: "35",
      icon: CheckCircle2,
      colorClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
    },
    {
      label: t("inactive_blogs"),
      value: "7",
      icon: FileX2,
      colorClass: "bg-rose-50",
      iconColorClass: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} unit={t("title")} />
      ))}
    </div>
  );
}
