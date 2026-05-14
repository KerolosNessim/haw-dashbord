import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { DashboardNavSearch } from "@/features/shared/components/dashboard-nav-search";
import { Loader2, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { i18n } = useTranslation();
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" });

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };
  const { logoutMutation, isPending } = useLogout();
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4">
      <SidebarTrigger />
      <DashboardNavSearch />
      <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          type="button"
          onClick={toggleLanguage}
        >
          {i18n.language.startsWith("ar") ? "EN" : "AR"}
        </Button>
        <Button
          variant="destructive"
          type="button"
          onClick={() => logoutMutation()}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>

              <LogOut className="w-5 h-5" />
              <span className="hidden md:block">{s("logout")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
