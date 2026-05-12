import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogout } from '../hooks/useLogout';

export default function LogoutBtn() {
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" });
  const { logoutMutation, isPending } = useLogout();
  return (
    <Button
      variant="outline"
      className="h-[2.75rem] w-full rounded-[calc(0.8125rem)] border-sidebar-border/50 bg-linear-to-b from-white/68 via-sidebar-accent/[0.45] to-sidebar-accent/[0.32] font-semibold text-sidebar-foreground shadow-[0_12px_32px_-24px_rgb(28_52_38/72%),inset_0_1px_0_rgb(255_255_255/70%)] backdrop-blur-xl transition-[border-color,box-shadow,filter] duration-200 hover:border-sidebar-primary/42 hover:bg-linear-to-b hover:from-sidebar-accent/[0.88] hover:via-sidebar-accent/75 hover:to-sidebar-accent/62 hover:text-sidebar-accent-foreground hover:shadow-[0_16px_40px_-28px_rgb(77_52%_28%/45%)] dark:border-white/[0.1] dark:from-transparent dark:via-sidebar-accent/18 dark:to-sidebar-accent/[0.1] dark:hover:border-sidebar-primary/28 dark:hover:from-sidebar-accent/42 dark:[&_svg]:text-sidebar-primary [&_svg]:text-sidebar-primary/88 hover:[&_svg]:text-sidebar-primary"
      onClick={() => logoutMutation()}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <LogOut className="w-5 h-5" />
          <span>{s("logout")}</span>
        </>
      )}
    </Button>
  );
}