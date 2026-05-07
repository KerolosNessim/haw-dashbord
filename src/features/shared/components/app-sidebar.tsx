import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import LogoutBtn from "@/features/auth/components/logout-btn"
import { cn } from "@/lib/utils"
import { BookText, CircleQuestionMark, Home, Languages, LayoutDashboard, LayoutGrid, Server, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

export function AppSidebar() {
  const { i18n } = useTranslation()
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" })
  const dir = i18n.dir()
  const location = useLocation()

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('ar') ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
  }

  const Navlinks = [
    {
      title: s("home"),
      href: "/",
      icon: Home,
    },
    {
      title: s("home_content"),
      href: "/home-content",
      icon: Home,
    },
    {
      title: s("why_choose_us"),
      href: "/why-choose-us",
      icon: Home,
    },
    {
      title: s("solutions"),
      href: "/solutions",
      icon: Home,
    },
    {
      title: s("help_you"),
      href: "/help-you",
      icon: Home,
    },
    {
      title: s("categories"),
      href: "/categories",
      icon: LayoutGrid,
    },
    {
      title: s("services"),
      href: "/services",
      icon: Server,
    },
    {
      title: s("faq"),
      href: "/faq",
      icon: CircleQuestionMark,
    },
    {
      title: s("blogs"),
      href: "/blogs",
      icon: BookText,
    },
    {
      title: s("settings"),
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="w-5 h-5" />
          <span>{s("dashboard_title")}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {Navlinks.map((link) => (
                <SidebarMenuItem key={link.href} >
                  <SidebarMenuButton asChild className={cn(" hover:text-white hover:bg-primary", location.pathname === link.href && "bg-primary text-white")}>
                    <Link to={link.href} className="flex items-center gap-2 text-base!">
                      <link.icon />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleLanguage}>
              <Languages />
              <span>{i18n.language.startsWith("ar") ? "English" : "عربي"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <LogoutBtn />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
