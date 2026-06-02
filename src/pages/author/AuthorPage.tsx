import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { Can } from "@/features/permissions/components/PermissionGate";
import AuthorFormDialog from "@/features/authors/components/author-form-dialog";
import AuthorsTable from "@/features/authors/components/authors-table";
import {
  createAuthor,
  deleteAuthor,
  fetchAuthors,
  updateAuthor,
} from "@/features/authors/services/authors-api";
import type { Author, AuthorFormValues } from "@/features/authors/types";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UserRoundPen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function AuthorPage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "author" });
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["authors", search, page],
    queryFn: () => fetchAuthors({ search, page }),
  });
  const authors = data?.rows ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
    path: "/v1/admin/authors",
  };

  const saveMutation = useMutation({
    mutationFn: (payload: { mode: "create" | "edit"; values: AuthorFormValues; imageFile: File | null }) =>
      payload.mode === "create"
        ? createAuthor(payload.values, payload.imageFile)
        : updateAuthor(editingAuthor!.id, payload.values, payload.imageFile),
    onSuccess: (res, vars) => {
      toast.success(
        resolveApiToastMessage(
          res,
          vars.mode === "create" ? t("toast_created") : t("toast_updated"),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
      setDialogOpen(false);
      setEditingAuthor(null);
    },
    onError: () => toast.error(t("toast_error")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("toast_deleted")));
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: () => toast.error(t("toast_error")),
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 py-6">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <UserRoundPen className="h-7 w-7 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Can permission="authors.create">
          <Button
            className="rounded-xl"
            onClick={() => {
              setEditingAuthor(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="me-2 h-4 w-4" />
            {t("add_button")}
          </Button>
        </Can>
      </div>

      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder={t("search_placeholder")}
        className="max-w-md"
      />

      <AuthorsTable
        authors={authors}
        isLoading={isLoading}
        isDeleting={deleteMutation.isPending}
        onEdit={(author) => {
          setEditingAuthor(author);
          setDialogOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <LaravelResourcePagination
        meta={meta}
        onPageChange={setPage}
        disabled={isFetching}
        hideWhenSinglePage={false}
        isRtl={i18n.language.startsWith("ar")}
      />

      <AuthorFormDialog
        open={dialogOpen}
        mode={editingAuthor ? "edit" : "create"}
        author={editingAuthor}
        isSaving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(values, imageFile) =>
          saveMutation.mutate({
            mode: editingAuthor ? "edit" : "create",
            values,
            imageFile,
          })
        }
      />
    </div>
  );
}
