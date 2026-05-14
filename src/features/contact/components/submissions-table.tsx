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
import { Eye, Mail, Phone, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContactSubmission } from "../types/index";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { useState } from "react";
import SubmissionDetailsDialog from "./submission-details-dialog";

interface SubmissionsTableProps {
  submissions: ContactSubmission[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function SubmissionsTable({
  submissions,
  meta,
  isLoading,
  onPageChange,
}: SubmissionsTableProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "contact" });
  const isRtl = i18n.language.startsWith("ar");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  const paginationMeta = {
    ...meta,
    path: "",
    from: (meta.current_page - 1) * meta.per_page + 1,
    to: Math.min(meta.current_page * meta.per_page, meta.total),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={isRtl ? "rtl" : "ltr"}>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start py-5 px-6 font-bold text-foreground">
                  {t("table.name")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.email")}
                </TableHead>
                <TableHead className="text-start font-bold text-foreground">
                  {t("table.phone")}
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} className="py-4 px-6">
                        <div className="h-6 w-full bg-muted/40 animate-pulse rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
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
                    <TableCell className="py-5 px-6 font-bold text-gray-900">
                      {submission.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 opacity-50" />
                        {submission.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground" dir="ltr">
                      <div className="flex items-center gap-2 justify-start">
                        <Phone className="w-3.5 h-3.5 opacity-50" />
                        {submission.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold border-none ${
                          submission.status === "new"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {t(`status.${submission.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {submission.created_at}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(submission);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
              onPageChange={onPageChange}
              isRtl={isRtl}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        )}
      </div>

      <SubmissionDetailsDialog
        submission={selectedSubmission}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
