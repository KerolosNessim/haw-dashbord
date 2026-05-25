import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useDeleteCourse } from "@/features/courses/hooks/useDeleteCourse";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Link } from "react-router-dom";

export default function CoursesTable() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "courses" });
  const { t: tApi } = useTranslation("translation", { keyPrefix: "courses.api" });
  const { t: tbl } = useTranslation("translation", { keyPrefix: "courses.table" });
  const { data: rows = [], isLoading, isError, error } = useCourses();
  const { deleteMutation, isPending: isDeleting } = useDeleteCourse();
  const isAr = i18n.language.startsWith("ar");

  const titleLabel = (ar: string, en: string) => (isAr ? ar || en : en || ar);

  return (
    <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white shadow-sm">
      {isError && (
        <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error)?.message || t("load_error")}
        </p>
      )}
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 ps-8 font-bold">{tbl("title")}</TableHead>
            <TableHead className="font-bold">{tbl("slug")}</TableHead>
            <TableHead className="font-bold">{tbl("price")}</TableHead>
            <TableHead className="w-[180px] py-6 pe-8 font-bold">{tbl("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                {[...Array(4)].map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            rows.map((row) => (
              <TableRow key={row.id} className="border-border/40">
                <TableCell className="py-6 ps-8 font-bold text-gray-900">
                  {titleLabel(row.titleAr, row.titleEn)}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {row.slug ? (
                    <Badge variant="outline" className="font-mono">
                      {row.slug}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.priceLabel}</TableCell>
                <TableCell className="py-6 pe-8">
                  <div className="flex items-center justify-start gap-2">
                    <Can permission="courses.update">
                      <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <Link to={`/courses/edit/${row.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </Can>
                    <Can permission="courses.delete">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-rose-600 hover:bg-rose-50"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{tApi("delete_confirm_title")}</AlertDialogTitle>
                          <AlertDialogDescription>{tApi("delete_confirm")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">{tApi("cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => void deleteMutation(row.id)}
                          >
                            {tApi("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-16 text-start text-muted-foreground">
                {tbl("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
