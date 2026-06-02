import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Author } from "../types";

type AuthorsTableProps = {
  authors: Author[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onEdit: (author: Author) => void;
  onDelete: (id: number) => void;
};

export default function AuthorsTable({
  authors,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: AuthorsTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "author.table" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const isAr = i18n.language.startsWith("ar");

  if (isLoading) return <p className="py-10 text-center text-sm text-muted-foreground">{t("loading")}</p>;
  if (!authors.length) return <p className="py-10 text-center text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("image")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("job_title")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-[120px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow key={author.id}>
                <TableCell>
                  {author.image ? (
                    <img
                      src={author.image}
                      alt={
                        (isAr
                          ? author.image_alt.ar || author.image_alt.en
                          : author.image_alt.en || author.image_alt.ar) || "author image"
                      }
                      className="h-10 w-10 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md border bg-muted/30" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {isAr ? author.name.ar || author.name.en : author.name.en || author.name.ar}
                </TableCell>
                <TableCell>
                  {isAr
                    ? author.job_title.ar || author.job_title.en
                    : author.job_title.en || author.job_title.ar}
                </TableCell>
                <TableCell>
                  <Badge variant={author.is_active ? "default" : "outline"}>
                    {author.is_active ? t("active") : t("inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Can permission="authors.update">
                      <Button type="button" size="icon" variant="ghost" onClick={() => onEdit(author)} aria-label={t("edit")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Can>
                    <Can permission="authors.delete">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(author.id)}
                        aria-label={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TypeToConfirmDeleteAlertDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_description")}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={t("delete_type_label")}
        inputPlaceholder={t("delete_placeholder")}
        cancelLabel={t("cancel")}
        deleteLabel={t("delete")}
        isPending={isDeleting ?? false}
        onConfirm={() => {
          if (deleteId != null) onDelete(deleteId);
        }}
      />
    </>
  );
}
