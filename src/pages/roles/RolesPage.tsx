import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { RolesTable } from "@/features/roles/components/roles-table";
import {
  createRole,
  deleteRole,
  fetchPermissionsRegistry,
  fetchRoles,
  updateRole,
} from "@/features/roles/services/roles-api";
import {
  PERMISSIONS_REGISTRY_QUERY_KEY,
  ROLES_QUERY_KEY,
} from "@/features/roles/query-keys";
import type { Role, RoleFormValues } from "@/features/roles/types";
import { Can } from "@/features/permissions/components/PermissionGate";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function RolesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "roles" });
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [...ROLES_QUERY_KEY, page, search],
    queryFn: () => fetchRoles(page, search),
  });

  const { data: permData, isLoading: permsLoading } = useQuery({
    queryKey: PERMISSIONS_REGISTRY_QUERY_KEY,
    queryFn: fetchPermissionsRegistry,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { mode: "create" | "edit"; values: RoleFormValues }) =>
      payload.mode === "create"
        ? createRole(payload.values)
        : updateRole(editingRole!.id, payload.values),
    onSuccess: (res, vars) => {
      toast.success(
        resolveApiToastMessage(
          res,
          vars.mode === "create" ? t("toast_created") : t("toast_updated"),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      setDialogOpen(false);
      setEditingRole(null);
    },
    onError: () => toast.error(t("toast_error")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("toast_deleted")));
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
    onError: () => toast.error(t("toast_error")),
  });

  const roles = data?.data?.roles ?? [];
  const groups = permData?.data?.groups ?? [];

  const openCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <Can permission="roles.create">
          <Button size="lg" onClick={openCreate} className="rounded-2xl">
            <Plus className="me-2 h-5 w-5" />
            {t("add_button")}
          </Button>
        </Can>
      </div>

      <Input
        placeholder={t("search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <RolesTable
        roles={roles}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingRole ? "edit" : "create"}
        role={editingRole}
        permissionGroups={groups}
        isLoadingPermissions={permsLoading}
        isSaving={saveMutation.isPending}
        onSubmit={(values) =>
          saveMutation.mutate({
            mode: editingRole ? "edit" : "create",
            values,
          })
        }
      />
    </div>
  );
}
