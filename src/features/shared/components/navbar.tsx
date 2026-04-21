import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang)
  }
  return (
    <div className="p-4 flex items-center border-b h-14">
      <SidebarTrigger />
      {/* avatar and localiztion */}
      <div className='flex items-center gap-2 ms-auto'>

        <Button variant="outline" size="icon" className='rounded-full' onClick={toggleLanguage}>
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
