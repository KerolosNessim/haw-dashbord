import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Eye, Mail, Search, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { ServiceAiToolSubmission } from "../types/service-ai-tool-submission";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import AiToolSubmissionDetailsDialog from "./ai-tool-submission-details-dialog";
import {
  useDeleteServiceAiToolSubmission,
  useServiceAiToolSubmissions,
} from "../hooks/useServiceAiToolSubmissions";
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

export default function AiToolSubmissionsTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "consultation.ai_tools" });
  const isRtl = i18n.language.startsWith("ar");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useServiceAiToolSubmissions({
    page,
    search: debouncedSearch || undefined,
  });
  const { mutate: deleteSubmission, isPending: isDeleting } = useDeleteServiceAiToolSubmission();

  const submissions = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const handleViewDetails = (submission: ServiceAiToolSubmission) => {
    setSelectedId(submission.id);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: number) => {
    setSubmissionToDelete(id);
  };

  const confirmDelete = () => {
    if (submissionToDelete) {
      deleteSubmission(submissionToDelete, {
        onSuccess: () => setSubmissionToDelete(null),
      });
    }
  };

  const paginationMeta = {
    ...meta,
    path: "",
    from: meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1,
    to: Math.min(meta.current_page * meta.per_page, meta.total),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
        <div className="border-b border-border/40 bg-muted/20 p-4 md:p-6">
          <div className="relative max-w-md">
            <Search
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isRtl ? "inset-e-3" : "inset-s-3"}`}
              aria-hidden
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search_placeholder")}
              className={`h-11 rounded-xl bg-white ${isRtl ? "pe-10" : "ps-10"}`}
              dir={isRtl ? "rtl" : "ltr"}
              type="search"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start py-5 px-6 font-bold text-foreground w-16">
                  {t("table.id")}
                </TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground min-w-[200px]">
                  {t("table.challenge")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.email")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.accepts_updates")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.status")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.date")}
                </TableHead>
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className="py-5 px-6">
                        <div className="h-8 w-full bg-muted/40 animate-pulse rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground font-medium text-lg"
                  >
                    {t("no_submissions")}
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="group border-border/40 transition-colors hover:bg-muted/5 cursor-pointer"
                    onClick={() => handleViewDetails(submission)}
                  >
                    <TableCell className="py-5 px-6 font-bold text-muted-foreground">
                      #{submission.id}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900 line-clamp-2 max-w-[280px]">
                          {submission.challenge || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        <span className="font-bold text-foreground" dir="ltr">
                          {submission.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold border-none ${
                          submission.accepts_updates
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {submission.accepts_updates ? t("accepts_yes") : t("accepts_no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold border-none ${
                          submission.status === "new"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {t(`status.${submission.status}`, { defaultValue: submission.status })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {submission.created_at}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(submission);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(submission.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && submissions.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-muted/5">
            <LaravelResourcePagination
              meta={paginationMeta}
              onPageChange={setPage}
              isRtl={isRtl}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        )}
      </div>

      <AiToolSubmissionDetailsDialog
        submissionId={selectedId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedId(null);
        }}
      />

      <AlertDialog
        open={submissionToDelete !== null}
        onOpenChange={(open) => !open && setSubmissionToDelete(null)}
      >
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">
              {t("delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground">
              {t("delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl px-6 font-bold">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-rose-200 transition-all"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
