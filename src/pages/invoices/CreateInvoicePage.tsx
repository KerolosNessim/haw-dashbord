import InvoiceForm from "@/features/invoices/components/invoice-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function CreateInvoicePage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "invoices" });

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-20" dir={i18n.dir()}>
      <div className="flex flex-col gap-4 border-b pb-8">
        <Button variant="ghost" className="w-fit rounded-xl" asChild>
          <Link to="/invoices">
            <ArrowLeft className="me-2 h-4 w-4" />
            {t("back_to_list")}
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t("create_title")}</h1>
            <p className="text-muted-foreground">{t("create_description")}</p>
          </div>
        </div>
      </div>

      <InvoiceForm />
    </div>
  );
}
