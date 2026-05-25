import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { AdminRole } from "@/features/auth/types";
import type { AdminUser, AdminUserFormValues } from "../types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type AdminUserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  user?: AdminUser | null;
  roles: AdminRole[];
  isSaving?: boolean;
  onSubmit: (values: AdminUserFormValues) => void;
};

function emptyForm(): AdminUserFormValues {
  return {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_ids: [],
    is_active: true,
  };
}

export function AdminUserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  roles,
  isSaving,
  onSubmit,
}: AdminUserFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "team" });
  const [form, setForm] = useState<AdminUserFormValues>(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      setForm({
        name: user.name,
        email: user.email,
        role_ids: user.roles.map((r) => r.id),
        is_active: user.is_active,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, user]);

  const toggleRole = (roleId: number, checked: boolean) => {
    setForm((f) => {
      const ids = new Set(f.role_ids);
      if (checked) ids.add(roleId);
      else ids.delete(roleId);
      return { ...f, role_ids: [...ids] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (mode === "edit" && !payload.password?.trim()) {
      delete payload.password;
      delete payload.password_confirmation;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? t("create_title") : t("edit_title")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="au-name">{t("fields.name")}</Label>
              <Input
                id="au-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="au-email">{t("fields.email")}</Label>
              <Input
                id="au-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="au-pass">
                {mode === "create" ? t("fields.password") : t("fields.password_optional")}
              </Label>
              <PasswordInput
                id="au-pass"
                value={form.password ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={mode === "create"}
                minLength={mode === "create" ? 8 : undefined}
              />
            </div>
            {form.password ? (
              <div className="grid gap-2">
                <Label htmlFor="au-pass2">{t("fields.password_confirmation")}</Label>
                <PasswordInput
                  id="au-pass2"
                  value={form.password_confirmation ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      password_confirmation: e.target.value,
                    }))
                  }
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label>{t("fields.roles")}</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={form.role_ids.includes(role.id)}
                      onCheckedChange={(c) => toggleRole(role.id, c === true)}
                    />
                    {role.display_name}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, is_active: c === true }))
                }
              />
              {t("fields.is_active")}
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner className="size-4" /> : null}
              {mode === "create" ? t("create_submit") : t("save_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
