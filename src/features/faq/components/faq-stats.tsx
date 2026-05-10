import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, CheckCircle2, FileX2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FaqItem } from "../types";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
  question: string;
  isLoading?: boolean;
}

function StatsCard({ label, value, icon: Icon, colorClass, iconColorClass, question, isLoading }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${colorClass} transition-colors duration-300`}>
            <Icon className={`w-8 h-8 ${iconColorClass}`} />
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-black tracking-tight">
                {value} <span className="text-muted-foreground text-xs font-medium lowercase">{question}</span>
              </h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FaqStatsProps {
  data: FaqItem[];
  isLoading?: boolean;
}

export default function FaqStats({ data, isLoading }: FaqStatsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });

  const total = data?.length || 0;
  const published = data?.filter(item => item.is_active).length || 0;
  const drafts = total - published;

  const stats = [
    {
      label: t("all_faq"),
      value: total,
      icon: HelpCircle,
      colorClass: "bg-blue-50/50",
      iconColorClass: "text-blue-600",
    },
    {
      label: t("active_faq"),
      value: published,
      icon: CheckCircle2,
      colorClass: "bg-emerald-50/50",
      iconColorClass: "text-emerald-600",
    },
    {
      label: t("inactive_faq"),
      value: drafts,
      icon: FileX2,
      colorClass: "bg-amber-50/50",
      iconColorClass: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, index) => (
        <StatsCard 
          key={index} 
          {...stat} 
          question={t("question")} 
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
