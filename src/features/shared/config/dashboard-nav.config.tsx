import type { LucideIcon } from "lucide-react"
import {
  BookText,
  Boxes,
  BriefcaseBusiness,
  CircleQuestionMark,
  Globe,
  GraduationCap,
  HandHelping,
  Home,
  Info,
  LayoutGrid,
  LayoutPanelTop,
  LayoutTemplate,
  LibraryBig,
  Puzzle,
  Quote,
  Settings,
  Shapes,
  Sparkles,
  Tags,
  Scale,
  ShieldCheck,
  FileText,
  Receipt,
  Handshake,
  MessageSquare,
  Users,
  MessageCircle,
  Package,
  Shield,
  UserCog,
  PenSquare,
} from "lucide-react"


export type NavLinkDef = {
  titleKey: string
  href: string
  icon: LucideIcon
}

export type NavGroupId = "landing" | "catalog" | "content" | "legal"

export type NavGroupDef = {
  id: NavGroupId
  titleKey: string
  icon: LucideIcon
  links: readonly NavLinkDef[]
}

export function routeMatches(href: string, pathname: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export const DASHBOARD_HOME_LINK: NavLinkDef = {
  titleKey: "home",
  href: "/",
  icon: Home,
}

export const DASHBOARD_SETTINGS_LINK: NavLinkDef = {
  titleKey: "settings",
  href: "/settings",
  icon: Settings,
}
export const DASHBOARD_USERS_LINK: NavLinkDef = {
  titleKey: "site_users",
  href: "/users",
  icon: Users,
}
export const DASHBOARD_TEAM_LINK: NavLinkDef = {
  titleKey: "team",
  href: "/team",
  icon: UserCog,
}
export const DASHBOARD_ROLES_LINK: NavLinkDef = {
  titleKey: "roles",
  href: "/roles",
  icon: Shield,
}
export const DASHBOARD_CONSULTATION_LINK: NavLinkDef = {
  titleKey: "consultation",
  href: "/service-bookings",
  icon: MessageCircle,
}

export const DASHBOARD_INVOICES_LINK: NavLinkDef = {
  titleKey: "invoices",
  href: "/invoices",
  icon: Receipt,
}

export const DASHBOARD_NAV_GROUPS: readonly NavGroupDef[] = [
  {
    id: "landing",
    titleKey: "group_landing",
    icon: LayoutTemplate,
    links: [
      {
        titleKey: "home_content",
        href: "/home-content",
        icon: LayoutPanelTop,
      },
      {
        titleKey: "why_choose_us",
        href: "/why-choose-us",
        icon: Sparkles,
      },
      { titleKey: "solutions", href: "/solution-singles", icon: Puzzle },
      {
        titleKey: "solution_categories",
        href: "/solution-categories",
        icon: Tags,
      },
      { titleKey: "help_you", href: "/help-you", icon: HandHelping },
    ],
  },
  {
    id: "catalog",
    titleKey: "group_catalog",
    icon: Boxes,
    links: [
      {
        titleKey: "package_categories",
        href: "/package-categories",
        icon: Shapes,
      },
      { titleKey: "packages", href: "/packages", icon: Boxes },
      { titleKey: "courses", href: "/courses", icon: GraduationCap },
      // Course category taxonomy page.
      // { titleKey: "categories", href: "/categories", icon: LayoutGrid },
      { titleKey: "countries", href: "/countries", icon: Globe },
      {
        titleKey: "services",
        href: "/services",
        icon: BriefcaseBusiness,
      },
      {
        titleKey: "service_catalog",
        href: "/service-catalog",
        icon: BriefcaseBusiness,
      },
      {
        titleKey: "service_pricing",
        href: "/services/pricing",
        icon: Package,
      },
      {
        titleKey: "ai_services",
        href: "/ai-services",
        icon: BriefcaseBusiness,
      },
      {
        titleKey: "ai_service_pricing",
        href: "/ai-services/pricing",
        icon: Package,
      },
      DASHBOARD_INVOICES_LINK,
    ],
  },
  {
    id: "content",
    titleKey: "group_content",
    icon: LibraryBig,
    links: [
      { titleKey: "faq", href: "/faq", icon: CircleQuestionMark },
      { titleKey: "author", href: "/author", icon: PenSquare },
      { titleKey: "jobs", href: "/jobs", icon: BriefcaseBusiness },
      {
        titleKey: "blog_categories",
        href: "/blog-categories",
        icon: LayoutGrid,
      },
      { titleKey: "blogs", href: "/blogs", icon: BookText },
      { titleKey: "testimonials", href: "/testimonials", icon: Quote },
      { titleKey: "about_us", href: "/about", icon: Info },
      {
        titleKey: "contact_submissions",
        href: "/contact-submissions",
        icon: MessageSquare,
      },
    ],


  },
  {
    id: "legal",
    titleKey: "legal.title",
    icon: Scale,
    links: [
      {
        titleKey: "legal.privacy-policy",
        href: "/privacy-policy",
        icon: ShieldCheck,
      },
      {
        titleKey: "legal.terms-of-use",
        href: "/terms-of-use",
        icon: FileText,
      },
      {
        titleKey: "legal.refund-policy",
        href: "/refund-policy",
        icon: Handshake,
      },
    ],
  },
] satisfies readonly NavGroupDef[]

export function groupMatchingPathname(
  pathname: string,
): Partial<Record<NavGroupId, boolean>> {
  const next: Partial<Record<NavGroupId, boolean>> = {}
  for (const g of DASHBOARD_NAV_GROUPS) {
    if (g.links.some((l) => routeMatches(l.href, pathname))) {
      next[g.id] = true
    }
  }
  return next
}
