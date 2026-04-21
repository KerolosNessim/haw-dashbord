import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("welcome_dashboard", "Dashboard")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard_description", "Welcome back to your dashboard. Here is your overview.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("stats_users", "Total Users")}</CardTitle>
            <CardDescription>{t("stats_users_desc", "Active users this month")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">1,204</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
