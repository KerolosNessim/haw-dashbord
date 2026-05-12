import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardNavSearch } from "@/features/shared/components/dashboard-nav-search";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

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
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
