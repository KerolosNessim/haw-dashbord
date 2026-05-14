import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import LogoutBtn from "@/features/auth/components/logout-btn"
import {
  DASHBOARD_HOME_LINK,
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_SETTINGS_LINK,
  groupMatchingPathname,
  routeMatches,
  type NavGroupId,
  type NavLinkDef,
  DASHBOARD_USERS_LINK,
  DASHBOARD_CONSULTATION_LINK,
} from "@/features/shared/config/dashboard-nav.config"
import { cn } from "@/lib/utils"
import { ChevronDown, Languages, LayoutDashboard } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

export function AppSidebar() {
  const { i18n } = useTranslation()
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" })
  const dir = i18n.dir()
  const location = useLocation()

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar"
    i18n.changeLanguage(nextLang)
  }

  const routeActive = (href: string) => routeMatches(href, location.pathname)

  const [openGroups, setOpenGroups] = useState<Record<NavGroupId, boolean>>(
    () => {
      const fromPath = groupMatchingPathname(location.pathname)
      const hasMatch = Object.keys(fromPath).length > 0
      return {
        landing: hasMatch ? Boolean(fromPath.landing) : true,
        catalog: hasMatch ? Boolean(fromPath.catalog) : true,
        content: hasMatch ? Boolean(fromPath.content) : true,
        legal: hasMatch ? Boolean(fromPath.legal) : true,
        ...fromPath,
      }
    },
  )

  useEffect(() => {
    const bump = groupMatchingPathname(location.pathname)
    setOpenGroups((prev) => ({ ...prev, ...bump }))
  }, [location.pathname])

  const sidebarGlassSurface = cn(
    "group-data-[variant=floating]:rounded-[1.35rem]",
    "relative overflow-hidden rounded-[inherit] border-sidebar-border/40 bg-sidebar/[0.94] backdrop-blur-[22px] backdrop-saturate-150 ring-1 ring-white/72 supports-[backdrop-filter]:bg-sidebar/88",
    "shadow-[inset_0_1px_0_rgb(255_255_255/75%),0_14px_48px_-26px_rgb(28_52_38/42%),0_28px_80px_-40px_rgb(77_52%_34%/22%)]",
    "dark:border-white/14 dark:bg-sidebar/[0.48] dark:ring-white/12 dark:backdrop-saturate-125",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/12%),0_22px_60px_-26px_rgb(0_0_0/55%)]",
    "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/45 before:via-transparent before:to-sidebar-primary/[0.11] dark:before:from-white/[0.045] dark:before:to-sidebar-primary/[0.15]",
    "after:pointer-events-none after:absolute after:inset-x-[12%] after:top-0 after:h-[1px] after:bg-linear-to-r after:from-transparent after:via-white/70 after:to-transparent dark:after:via-white/28",
    "transition-[background-color,border-color,box-shadow] duration-300",
  )

  const linkButtonClass = (active: boolean) =>
    cn(
      "h-[2.5625rem] rounded-[calc(0.75rem)] border border-transparent text-start text-[0.9rem] text-sidebar-foreground antialiased outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      dir === "rtl" && "flex-row-reverse text-right",
      active
        ? [
            "border-sidebar-primary/45 bg-sidebar-primary text-sidebar-primary-foreground",
            "shadow-[0_12px_32px_-16px_hsl(77_52%_26%/52%),inset_0_1px_0_rgb(255_255_255/22%)]",
            "hover:brightness-[1.03]",
            "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground",
            "[&_svg]:text-sidebar-primary-foreground [&_svg]:opacity-100",
          ]
        : [
            "bg-transparent text-sidebar-foreground/95",
            "hover:border-sidebar-primary/22 hover:bg-gradient-to-br hover:from-sidebar-accent/85 hover:to-sidebar-accent/[0.58]",
            "hover:text-sidebar-accent-foreground hover:shadow-[0_8px_22px_-16px_hsl(77_52%_30%/38%)]",
            "dark:hover:border-white/[0.09] dark:hover:from-sidebar-accent/40 dark:hover:to-sidebar-accent/[0.26]",
            "active:translate-y-[0.5px] [&_svg]:text-sidebar-primary/88",
          ],
    )

  const homeLink: NavLinkDef = DASHBOARD_HOME_LINK
  const settingsLink: NavLinkDef = DASHBOARD_SETTINGS_LINK
  const usersLink: NavLinkDef = DASHBOARD_USERS_LINK
  const consultationLink: NavLinkDef = DASHBOARD_CONSULTATION_LINK

  const HomeIcon = homeLink.icon
  const SettingsIcon = settingsLink.icon
  const UsersIcon = usersLink.icon
  const ConsultationIcon = consultationLink.icon

  const logoPublicSrc = `${import.meta.env.BASE_URL}logo.png`.replace(
    /\/+/g,
    "/",
  )

  return (
    <Sidebar
      side={dir === "rtl" ? "right" : "left"}
      variant="floating"
      className="z-30"
      sidebarInnerClassName={sidebarGlassSurface}
    >
      {/* <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-3 bottom-[6.25rem] z-0 flex max-h-[10.5rem] min-h-[6rem] items-end justify-center sm:bottom-[6.75rem]",
          "[mask-image:linear-gradient(to_bottom,transparent,black_62%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_62%)]",
        )}
      >
        <img
          src={logoPublicSrc}
          alt=""
          width={416}
          height={160}
          className="max-h-[9.75rem] w-[min(88%,13.5rem)] object-contain object-bottom opacity-[0.31] saturate-110 contrast-[1.06] brightness-[1.04] grayscale-25 select-none sepia-[12%] mix-blend-multiply dark:opacity-[0.44] dark:mix-blend-plus-lighter dark:grayscale-[10%]"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div> */}
      <SidebarHeader className="relative z-10 shrink-0 border-none px-3.5 pb-2.5 pt-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-[calc(1.125rem)] border border-white/72 bg-linear-to-br from-white/92 via-white/58 to-sidebar-accent/[0.14] px-3 py-3 shadow-[0_14px_40px_-30px_rgb(28_52_38/72%),inset_0_1px_0_rgb(255_255_255/90%)] backdrop-blur-2xl dark:border-white/14 dark:from-sidebar-accent/45 dark:via-sidebar-accent/[0.2] dark:to-transparent dark:shadow-[inset_0_1px_0_rgb(255_255_255/10%),0_12px_40px_-34px_rgb(0_0_0/72%)]",
            dir === "rtl" && "flex-row-reverse text-right",
          )}
        >
          {/* <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[calc(0.75rem)] bg-linear-to-br from-sidebar-primary via-[hsl(77_52%_36%)] to-[hsl(77_42%_30%)] text-sidebar-primary-foreground shadow-[0_12px_32px_-12px_hsl(77_52%_26%/72%)] ring-[3px] ring-sidebar-primary/25 ring-offset-2 ring-offset-white/95 dark:to-[hsl(77_42%_24%)] dark:ring-sidebar-primary/35 dark:ring-offset-transparent"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[1px] rounded-[calc(0.6875rem)] bg-linear-to-br from-white/45 to-transparent opacity-95"
            />
            <LayoutDashboard className="relative z-[1] h-[1.16rem] w-[1.16rem] opacity-[0.98]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
              Howeyah
            </p>
            <p className="truncate text-[1.02rem] font-semibold tracking-tight text-sidebar-foreground">
              {s("dashboard_title")}
            </p>
          </div> */}
          <img src="/logo.png" alt="logo" className="w-full h-12 mx-auto object-contain" />
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 min-h-0 flex-1 px-2.5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-1 pb-2">
            <SidebarMenu className="gap-[0.5625rem] space-y-0">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={routeActive(homeLink.href)}
                  size="lg"
                  className={cn(
                    "group/nav h-[2.75rem] rounded-[calc(0.8125rem)] text-[0.95rem]",
                    linkButtonClass(routeActive(homeLink.href)),
                  )}
                >
                  <Link
                    to={homeLink.href}
                    className="flex w-full items-center gap-[0.7rem] font-semibold leading-snug [&_svg]:size-[1.125rem]"
                  >
                    <HomeIcon className="shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      {s(homeLink.titleKey)}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {DASHBOARD_NAV_GROUPS.map((group) => {
                const Icon = group.icon
                const isOpen = openGroups[group.id]
                const activeInGroup = group.links.some((l) =>
                  routeActive(l.href),
                )

                return (
                  <SidebarMenuItem key={group.id}>
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(next) =>
                        setOpenGroups((prev) => ({ ...prev, [group.id]: next }))
                      }
                      className="group/collapsible w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          size="lg"
                          type="button"
                          className={cn(
                            "group/trigger relative h-[2.75rem] w-full cursor-pointer rounded-[calc(0.8125rem)] border border-sidebar-border/45 bg-linear-to-b from-sidebar-accent/65 via-sidebar-accent/48 to-sidebar-accent/[0.36] px-px text-sidebar-foreground shadow-[0_12px_32px_-30px_rgb(28_52_38/60%),inset_0_1px_0_rgb(255_255_255/60%)] backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-200 ease-out dark:border-white/12 dark:from-sidebar-accent/28 dark:via-sidebar-accent/[0.18] dark:to-sidebar-accent/10 dark:shadow-[inset_0_1px_0_rgb(255_255_255/7%)]",
                            "hover:border-sidebar-primary/32 hover:bg-linear-to-b hover:from-sidebar-accent/92 hover:to-sidebar-accent/72 hover:shadow-[0_16px_40px_-32px_rgb(77_52%_30%/52%)]",
                            dir === "rtl" && "flex-row-reverse text-right",
                            activeInGroup &&
                              "border-sidebar-primary/38 bg-linear-to-br from-sidebar-primary/[0.22] via-sidebar-primary/[0.09] to-transparent font-semibold text-sidebar-primary shadow-[inset_0_0_0_1px_hsl(77_52%_38%/35%),inset_0_1px_0_rgb(255_255_255/50%)] dark:from-sidebar-primary/28 dark:to-transparent dark:text-sidebar-primary",
                          )}
                        >
                          <Icon
                            className="shrink-0 text-sidebar-primary drop-shadow-[0_1px_0_rgb(255_255_255/42%)] me-2"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 truncate text-start font-semibold tracking-tight">
                            {s(group.titleKey)}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 text-sidebar-primary/68 opacity-80 transition-[transform,color,opacity] duration-300 ease-out group-hover/trigger:text-sidebar-primary group-hover/trigger:opacity-100",
                              isOpen && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                        <SidebarMenu
                          className={cn(
                            "mx-[3px] mb-2 mt-[0.5625rem] gap-1.5 rounded-[calc(0.8125rem)]  py-2.5 pe-[0.7875rem] ps-4 ",
                            " dark:border-white/12 dark:from-sidebar-accent/15 dark:to-transparent dark:shadow-[inset_0_1px_0_rgb(255_255_255/6%)]",
                          )}
                        >
                          {group.links.map((link) => {
                            const LIcon = link.icon
                            const active = routeActive(link.href)
                            return (
                              <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={active}
                                  size="lg"
                                  className={linkButtonClass(active)}
                                >
                                  <Link
                                    to={link.href}
                                    className="flex w-full items-center gap-2.5 font-semibold tracking-tight [&_svg]:size-4"
                                  >
                                    <LIcon className="shrink-0" aria-hidden />
                                    <span className="min-w-0 flex-1 truncate">
                                      {s(link.titleKey)}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )
                          })}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={routeActive(consultationLink.href)}
                  size="lg"
                  className={cn(
                    "group/nav h-[2.75rem] rounded-[calc(0.8125rem)] text-[0.95rem]",
                    linkButtonClass(routeActive(consultationLink.href)),
                  )}
                >
                  <Link
                    to={consultationLink.href}
                    className="flex w-full items-center gap-[0.7rem] font-semibold leading-snug [&_svg]:size-[1.125rem]"
                  >
                    <ConsultationIcon className="shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      {s(consultationLink.titleKey)}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={routeActive(usersLink.href)}
                  size="lg"
                  className={cn(
                    "group/nav h-[2.75rem] rounded-[calc(0.8125rem)] text-[0.95rem]",
                    linkButtonClass(routeActive(usersLink.href)),
                  )}
                >
                  <Link
                    to={usersLink.href}
                    className="flex w-full items-center gap-[0.7rem] font-semibold leading-snug [&_svg]:size-[1.125rem]"
                  >
                    <UsersIcon className="shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      {s(usersLink.titleKey)}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={routeActive(settingsLink.href)}
                  size="lg"
                  className={cn(
                    "group/nav h-[2.75rem] rounded-[calc(0.8125rem)] text-[0.95rem]",
                    linkButtonClass(routeActive(settingsLink.href)),
                  )}
                >
                  <Link
                    to={settingsLink.href}
                    className="flex w-full items-center gap-[0.7rem] font-semibold leading-snug [&_svg]:size-[1.125rem]"
                  >
                    <SettingsIcon className="shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">
                      {s(settingsLink.titleKey)}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative z-10 mt-auto shrink-0 gap-0 border-transparent px-[1.0625rem] pb-6 pt-[0.625rem] before:pointer-events-none before:absolute before:inset-x-10 before:-top-[1px] before:h-[1px] before:bg-linear-to-r before:from-transparent before:via-sidebar-border/55 before:to-transparent dark:before:via-white/22">
        <SidebarMenu className="gap-3 pt-3">
          {/* <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleLanguage}
              type="button"
              className={cn(
                "h-[2.75rem] cursor-pointer rounded-[calc(0.8125rem)] border border-sidebar-border/50 bg-linear-to-b from-sidebar-accent/[0.82] via-sidebar-accent/[0.55] to-sidebar-accent/[0.4] font-semibold text-sidebar-foreground shadow-[0_10px_32px_-24px_rgb(28_52_38/70%),inset_0_1px_0_rgb(255_255_255/55%)] backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,border-color,filter] duration-200 hover:border-sidebar-primary/32 hover:bg-linear-to-b hover:from-sidebar-accent hover:via-sidebar-accent/92 hover:to-sidebar-accent/82 hover:text-sidebar-accent-foreground hover:shadow-[0_14px_36px_-22px_rgb(77_52%_28%/52%)] dark:border-white/[0.09] dark:from-sidebar-accent/22 dark:to-sidebar-accent/12 dark:hover:border-sidebar-primary/25",
                dir === "rtl" && "flex-row-reverse text-right",
              )}
            >
              <Languages className="text-sidebar-primary" aria-hidden />
              <span className="font-medium">
                {i18n.language.startsWith("ar") ? "English" : "عربي"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-0">
              <LogoutBtn />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
