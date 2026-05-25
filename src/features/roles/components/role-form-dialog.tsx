import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { PermissionMatrix } from "./permission-matrix";
import type { PermissionGroup, Role, RoleFormValues } from "../types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RoleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: Role | null;
  permissionGroups: PermissionGroup[];
  isLoadingPermissions?: boolean;
  isSaving?: boolean;
  onSubmit: (values: RoleFormValues) => void;
};

const emptyForm = (): RoleFormValues => ({
  name: "",
  display_name: "",
  description: "",
  permissions: [],
});

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  permissionGroups,
  isLoadingPermissions,
  isSaving,
  onSubmit,
}: RoleFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "roles" });
  const [form, setForm] = useState<RoleFormValues>(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && role) {
      setForm({
        name: role.name,
        display_name: role.display_name,
        description: role.description ?? "",
        permissions: [...role.permissions],
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>
              {mode === "create" ? t("create_title") : t("edit_title")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">{t("fields.slug")}</Label>
              <Input
                id="role-name"
                value={form.name}
                disabled={mode === "edit"}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="content-editor"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-display">{t("fields.display_name")}</Label>
              <Input
                id="role-display"
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-desc">{t("fields.description")}</Label>
              <Textarea
                id="role-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("fields.permissions")}</Label>
              {isLoadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Spinner className="size-6" />
                </div>
              ) : (
                <PermissionMatrix
                  groups={permissionGroups}
                  value={form.permissions}
                  onChange={(permissions) => setForm((f) => ({ ...f, permissions }))}
                  disabled={isSaving}
                />
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving || isLoadingPermissions}>
              {isSaving ? <Spinner className="size-4" /> : null}
              {mode === "create" ? t("create_submit") : t("save_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
