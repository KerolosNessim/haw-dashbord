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
import type { Role } from "../types";

type RolesTableProps = {
  roles: Role[];
  isLoading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
};

export function RolesTable({
  roles,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}: RolesTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "roles.table" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">{t("loading")}</p>
    );
  }

  if (roles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">{t("empty")}</p>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("display_name")}</TableHead>
              <TableHead>{t("permissions_count")}</TableHead>
              <TableHead>{t("users_count")}</TableHead>
              <TableHead className="w-[120px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-mono text-sm">{role.name}</TableCell>
                <TableCell className="font-medium">{role.display_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{role.permissions.length}</Badge>
                </TableCell>
                <TableCell>{role.users_count ?? 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Can permission="roles.update">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(role)}
                        aria-label={t("edit")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="roles.delete">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(role.id)}
                        aria-label={t("delete")}
                      >
                        <Trash2 className="size-4" />
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
