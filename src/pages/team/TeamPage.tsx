import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserFormDialog } from "@/features/admin-users/components/admin-user-form-dialog";
import { TeamTable } from "@/features/admin-users/components/team-table";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "@/features/admin-users/services/admin-users-api";
import { ADMIN_USERS_QUERY_KEY } from "@/features/admin-users/query-keys";
import type { AdminUser, AdminUserFormValues } from "@/features/admin-users/types";
import { fetchRoles } from "@/features/roles/services/roles-api";
import { ROLES_QUERY_KEY } from "@/features/roles/query-keys";
import { Can } from "@/features/permissions/components/PermissionGate";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCog, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function TeamPage() {
  const { t } = useTranslation("translation", { keyPrefix: "team" });
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, page, search],
    queryFn: () => fetchAdminUsers(page, search),
  });

  const { data: rolesData } = useQuery({
    queryKey: [...ROLES_QUERY_KEY, "all"],
    queryFn: () => fetchRoles(1, ""),
  });

  const roleOptions =
    rolesData?.data?.roles.map((r) => ({
      id: r.id,
      name: r.name,
      display_name: r.display_name,
    })) ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload: { mode: "create" | "edit"; values: AdminUserFormValues }) =>
      payload.mode === "create"
        ? createAdminUser(payload.values)
        : updateAdminUser(editingUser!.id, payload.values),
    onSuccess: (res, vars) => {
      toast.success(
        resolveApiToastMessage(
          res,
          vars.mode === "create" ? t("toast_created") : t("toast_updated"),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      setDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => toast.error(t("toast_error")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("toast_deleted")));
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: () => toast.error(t("toast_error")),
  });

  const users = data?.data?.users ?? [];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCog className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <Can permission="admin-users.create">
          <Button
            size="lg"
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
            className="rounded-2xl"
          >
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

      <TeamTable
        users={users}
        isLoading={isLoading}
        onEdit={(user) => {
          setEditingUser(user);
          setDialogOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />

      <AdminUserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingUser ? "edit" : "create"}
        user={editingUser}
        roles={roleOptions}
        isSaving={saveMutation.isPending}
        onSubmit={(values) =>
          saveMutation.mutate({
            mode: editingUser ? "edit" : "create",
            values,
          })
        }
      />
    </div>
  );
}
