import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogout } from '../hooks/useLogout';

export default function LogoutBtn() {
  const { t: s } = useTranslation("translation", { keyPrefix: "sidebar" });
  const { logoutMutation, isPending } = useLogout();
  return (
    <Button variant='destructive' className='w-full' onClick={() => logoutMutation()} disabled={isPending}>
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