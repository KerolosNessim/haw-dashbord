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
import type { AdminUser } from "../types";

type TeamTableProps = {
  users: AdminUser[];
  isLoading?: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
};

export function TeamTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}: TeamTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "team.table" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">{t("loading")}</p>
    );
  }

  if (users.length === 0) {
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
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("roles")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-[120px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.is_super_admin ? (
                      <Badge>{t("super_admin")}</Badge>
                    ) : (
                      user.roles.map((r) => (
                        <Badge key={r.id} variant="secondary">
                          {r.display_name}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "outline"}>
                    {user.is_active ? t("active") : t("inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Can permission="admin-users.update">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(user)}
                        disabled={user.is_super_admin}
                        aria-label={t("edit")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="admin-users.delete">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(user.id)}
                        disabled={user.is_super_admin}
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
