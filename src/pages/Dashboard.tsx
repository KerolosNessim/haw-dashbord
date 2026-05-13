import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats"
import { Users, FileText, Handshake, Briefcase, BookOpen, MessageSquare, Quote, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function Dashboard() {
  const { t } = useTranslation()
  const { data: statsResponse, isLoading, error } = useDashboardStats()

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive font-medium">{t("error_loading_stats", "Error loading dashboard statistics.")}</p>
      </div>
    )
  }

  const stats = statsResponse?.data

  const statCards = [
    {
      title: t("stats_users", "Total Users"),
      value: stats?.users.total ?? 0,
      icon: Users,
      description: `${t("active", "Active")}: ${stats?.users.active ?? 0} | ${t("suspended", "Suspended")}: ${stats?.users.suspended ?? 0}`,
    },
    {
      title: t("stats_blogs", "Blogs"),
      value: stats?.blogs.total ?? 0,
      icon: FileText,
      description: `${t("published", "Published")}: ${stats?.blogs.published ?? 0} | ${t("draft", "Draft")}: ${stats?.blogs.draft ?? 0}`,
    },
    {
      title: t("stats_partners", "Partners"),
      value: stats?.partners.total ?? 0,
      icon: Handshake,
      description: `${t("active", "Active")}: ${stats?.partners.active ?? 0}`,
    },
    {
      title: t("stats_services", "Services"),
      value: stats?.services.total ?? 0,
      icon: Briefcase,
      description: `${t("active", "Active")}: ${stats?.services.active ?? 0}`,
    },
    {
      title: t("stats_courses", "Courses"),
      value: stats?.courses.total ?? 0,
      icon: BookOpen,
      description: `${t("active", "Active")}: ${stats?.courses.active ?? 0}`,
    },
    {
      title: t("stats_faqs", "FAQs"),
      value: stats?.faqs.total ?? 0,
      icon: MessageSquare,
      description: `${t("active", "Active")}: ${stats?.faqs.active ?? 0}`,
    },
    {
      title: t("stats_testimonials", "Testimonials"),
      value: stats?.testimonials.total ?? 0,
      icon: Quote,
      description: `${t("active", "Active")}: ${stats?.testimonials.active ?? 0}`,
    },
  ]

  return (
    <div className="space-y-8 p-4">
      <div className="relative">
        <div className="absolute -left-4 top-0 h-full w-1 bg-primary rounded-full opacity-50" />
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {t("welcome_dashboard", "Dashboard")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          {t("dashboard_description", "Welcome back! Here's what's happening with your platform today.")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-sm bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card, i) => (
              <Card 
                key={i} 
                className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-xl transition-all duration-500 bg-card hover:-translate-y-1.5"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {card.title}
                  </CardTitle>
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 shadow-sm">
                    <card.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="text-4xl font-black tracking-tighter transition-all duration-300 group-hover:scale-[1.02] origin-left">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-4 flex items-center gap-2 font-semibold">
                    <span className="flex h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:animate-pulse" />
                    {card.description}
                  </p>
                </CardContent>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Card>
            ))}
      </div>
    </div>
  )
}
