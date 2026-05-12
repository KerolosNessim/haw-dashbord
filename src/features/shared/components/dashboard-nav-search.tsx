import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DASHBOARD_HOME_LINK,
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_SETTINGS_LINK,
} from "@/features/shared/config/dashboard-nav.config"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

function hrefSearchTokens(href: string) {
  if (href === "/" || href === "") return "home dashboard root"
  return href.slice(1).replaceAll("-", " ")
}

export function DashboardNavSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { t: nb } = useTranslation("translation", { keyPrefix: "navbar" })
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" })
  const dir = i18n.dir()

  const HomeIcon = DASHBOARD_HOME_LINK.icon
  const SettingsIcon = DASHBOARD_SETTINGS_LINK.icon

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const isMac =
    typeof navigator !== "undefined" &&
    (/Mac|iPhone|iPad|iPod/i.test(navigator.platform) ||
      navigator.userAgent.includes("Mac"))

  const shortcutDisplay = `${isMac ? "⌘" : "Ctrl"}+K`

  const navigateTo = (href: string) => {
    navigate(href)
    setOpen(false)
  }

  function buildSearchValue(title: string, href: string) {
    return `${title} ${href} ${hrefSearchTokens(href)}`.toLowerCase()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-10 max-w-xl flex-1 justify-start gap-2 rounded-xl border-muted-foreground/25 bg-muted/25 px-3 text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground sm:max-w-md",
          dir === "rtl" ? "flex-row-reverse text-end" : "text-start",
        )}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4 shrink-0 opacity-70" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm">{nb("search")}</span>
        <kbd className="-me-px hidden shrink-0 items-center rounded-md bg-muted px-1.5 font-mono text-[0.6875rem] font-medium opacity-85 sm:flex">
          {shortcutDisplay}
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        dir={dir}
        title={nb("search_dialog_title")}
        description={nb("search_dialog_description")}
        showCloseButton
        className="top-[28%] w-full gap-0 overflow-hidden rounded-xl border p-0 sm:max-w-lg"
      >
        <div className="mx-px mt-px px-2 pb-3 pt-11">
          <Command
            className="text-start [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
            loop
            filter={(value, search, keywords) => {
              const q = search.trim().toLowerCase()
              if (!q) return 1
              const bundle = `${value} ${(keywords ?? []).join(" ")}`.toLowerCase()
              return bundle.includes(q) ? 1 : 0
            }}
          >
            <CommandInput placeholder={nb("search_placeholder")} />
            <CommandList className="no-scrollbar mt-1 max-h-80">
              <CommandEmpty>{nb("no_results")}</CommandEmpty>

              <CommandGroup heading={s("navigation")}>
                <CommandItem
                  keywords={[DASHBOARD_HOME_LINK.href, hrefSearchTokens("/")]}
                  value={buildSearchValue(s("home"), DASHBOARD_HOME_LINK.href)}
                  className="cursor-pointer gap-2"
                  onSelect={() => navigateTo(DASHBOARD_HOME_LINK.href)}
                >
                  <HomeIcon aria-hidden />
                  <span>{s("home")}</span>
                </CommandItem>
              </CommandGroup>

              {DASHBOARD_NAV_GROUPS.map((group) => (
                <CommandGroup key={group.id} heading={s(group.titleKey)}>
                  {group.links.map((link) => {
                    const LIcon = link.icon
                    const keywords = [
                      link.href,
                      hrefSearchTokens(link.href),
                      link.titleKey,
                    ]
                    return (
                      <CommandItem
                        key={link.href}
                        keywords={keywords}
                        value={buildSearchValue(s(link.titleKey), link.href)}
                        className="cursor-pointer gap-2"
                        onSelect={() => navigateTo(link.href)}
                      >
                        <LIcon aria-hidden />
                        <span>{s(link.titleKey)}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}

              <CommandGroup heading={s("settings")}>
                <CommandItem
                  keywords={[
                    DASHBOARD_SETTINGS_LINK.href,
                    hrefSearchTokens("/settings"),
                  ]}
                  value={buildSearchValue(
                    s("settings"),
                    DASHBOARD_SETTINGS_LINK.href,
                  )}
                  className="cursor-pointer gap-2"
                  onSelect={() => navigateTo(DASHBOARD_SETTINGS_LINK.href)}
                >
                  <SettingsIcon aria-hidden />
                  <span>{s("settings")}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </CommandDialog>
    </>
  )
}
