import { BulkDeleteConfirmationDialog } from "@/components/bulk-delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export type BlogsTableBulkDeleteProps = {
  selectedCount: number;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isPending: boolean;
};

export function BlogsTableBulkDelete({
  selectedCount,
  dialogOpen,
  onDialogOpenChange,
  onConfirm,
  isPending,
}: BlogsTableBulkDeleteProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });
  const { t: apiT } = useTranslation("translation", { keyPrefix: "blogs.api" });
  const confirmWord = t("table.bulk_delete_word");

  return (
    <>
      {selectedCount > 0 ? (
        <Button
          type="button"
          variant="destructive"
          size="lg"
          className="rounded-xl shrink-0"
          disabled={isPending}
          onClick={() => onDialogOpenChange(true)}
        >
          {t("table.bulk_delete_selected", { count: selectedCount })}
        </Button>
      ) : null}

      <BulkDeleteConfirmationDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        title={t("table.bulk_delete_title")}
        description={t("table.bulk_delete_description", { count: selectedCount })}
        confirmationPhrase={confirmWord}
        typePhraseLabel={t("table.bulk_delete_type_label", { word: confirmWord })}
        cancelLabel={apiT("cancel")}
        deleteLabel={apiT("delete")}
        isPending={isPending}
        onConfirm={onConfirm}
      />
    </>
  );
}
