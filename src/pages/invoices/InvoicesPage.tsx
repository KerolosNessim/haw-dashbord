import InvoicesTable from "@/features/invoices/components/invoices-table";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/permissions/components/PermissionGate";
import { useResourcePermissions } from "@/features/permissions/hooks/useResourcePermissions";
import { FileText, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function InvoicesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "invoices" });
  const navigate = useNavigate();
  const invoicePerms = useResourcePermissions("invoices");

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("title")}</h1>
            <p className="text-lg font-medium text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <Can permission="invoices.create">
          <Button
            size="lg"
            onClick={() => navigate("/invoices/create")}
            className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20"
          >
            <Plus className="me-2 h-6 w-6" />
            {t("add_button")}
          </Button>
        </Can>
      </div>

      {invoicePerms.view ? <InvoicesTable /> : null}
    </div>
  );
}
