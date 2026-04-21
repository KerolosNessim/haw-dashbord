import { useEffect } from "react";
import { DirectionProvider } from "@/components/ui/direction";
import { useTranslation } from "react-i18next";
import App from "./App";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Root() {
  const { i18n } = useTranslation();
  const dir = i18n.dir();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [dir, i18n.language]);

  return (
    <QueryProvider>
      <DirectionProvider
        direction={dir as "ltr" | "rtl"}
        dir={dir as "ltr" | "rtl"}
      >
        <App />
        <Toaster position="top-center" richColors />
      </DirectionProvider>
    </QueryProvider>
  );
}
