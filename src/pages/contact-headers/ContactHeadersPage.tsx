import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ContactHeaderFormDialog from "@/features/contact-headers/components/contact-header-form-dialog";
import ContactHeadersTable from "@/features/contact-headers/components/contact-headers-table";
import { useDeleteContactHeader } from "@/features/contact-headers/hooks/useDeleteContactHeader";
import type { ContactHeader } from "@/features/contact-headers/types";
import HomeContentCountrySelector from "@/features/home-content/components/HomeContentCountrySelector";
import { HomeContentCountryProvider } from "@/features/home-content/context/home-content-country-context";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Layout, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function ContactHeadersPageContent() {
  const { t } = useTranslation("translation", { keyPrefix: "contact_headers" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ContactHeader | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { mutate: deleteHeader, isPending: isDeleting } = useDeleteContactHeader();

  const openCreate = () => {
    setEditing(null);
    setMode("create");
    setDialogOpen(true);
  };

  const openEdit = (row: ContactHeader) => {
    setEditing(row);
    setMode("edit");
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId == null) return;
    deleteHeader(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-gray-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Layout className="h-7 w-7" />
            </span>
            {t("title")}
          </h1>
          <p className="ms-0 max-w-2xl text-lg font-medium text-muted-foreground md:ms-[60px]">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <HomeContentCountrySelector />
          {/* <Can resource="contact-headers" action="create">
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/20"
              onClick={openCreate}
            >
              <Plus className="me-2 h-5 w-5" />
              {t("add_button")}
            </Button>
          </Can> */}
        </div>
      </div>

      <ContactHeadersTable
        onEdit={openEdit}
        onDelete={setDeleteId}
        isDeleting={isDeleting}
      />

      <ContactHeaderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={mode}
        initial={editing}
      />

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">{t("delete_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground">
              {t("delete_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl px-6 font-bold">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-rose-600 px-6 font-bold text-white hover:bg-rose-700"
            >
              {t("delete_confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ContactHeadersPage() {
  return (
    <HomeContentCountryProvider>
      <ContactHeadersPageContent />
    </HomeContentCountryProvider>
  );
}
