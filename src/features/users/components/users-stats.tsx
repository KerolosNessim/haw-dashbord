import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, UserMinus, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserStatistics } from "../types/index";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
  isLoading?: boolean;
}

function StatsCard({ label, value, icon: Icon, colorClass, iconColorClass, isLoading }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${colorClass} transition-colors duration-300`}>
            <Icon className={`w-8 h-8 ${iconColorClass}`} />
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
            ) : (
              <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UsersStatsProps {
  statistics: UserStatistics | undefined;
  isLoading?: boolean;
}

export default function UsersStats({ statistics, isLoading }: UsersStatsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "users.stats" });

  const stats = [
    {
      label: t("total"),
      value: statistics?.total ?? 0,
      icon: Users,
      colorClass: "bg-blue-50/50",
      iconColorClass: "text-blue-600",
    },
    {
      label: t("active"),
      value: statistics?.active ?? 0,
      icon: UserCheck,
      colorClass: "bg-emerald-50/50",
      iconColorClass: "text-emerald-600",
    },
    // {
    //   label: t("suspended"),
    //   value: statistics?.suspended ?? 0,
    //   icon: UserMinus,
    //   colorClass: "bg-amber-50/50",
    //   iconColorClass: "text-amber-600",
    // },
    // {
    //   label: t("banned"),
    //   value: statistics?.banned ?? 0,
    //   icon: UserX,
    //   colorClass: "bg-rose-50/50",
    //   iconColorClass: "text-rose-600",
    // },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}
