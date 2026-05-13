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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourseSections } from "@/features/courses/hooks/useCourseSections";
import { useMutateCourseSection } from "@/features/courses/hooks/useMutateCourseSection";
import type { CourseSectionRow, CourseSectionFormValues } from "@/features/courses/types";
import { Languages, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function emptySectionForm(sortOrder: number): CourseSectionFormValues {
  return {
    title: { ar: "", en: "" },
    video_url: "",
    duration: "",
    is_free: false,
    sort_order: sortOrder,
  };
}

function rowToForm(row: CourseSectionRow): CourseSectionFormValues {
  return {
    title: { ar: row.titleAr, en: row.titleEn },
    video_url: row.video_url,
    duration: row.duration,
    is_free: row.is_free,
    sort_order: row.sort_order,
  };
}

export default function CourseSectionsPanel({ courseId }: { courseId: string | undefined }) {
  const { t } = useTranslation("translation", { keyPrefix: "courses.sections" });
  const { t: tApi } = useTranslation("translation", { keyPrefix: "courses.sections_api" });
  const { data: rows = [], isLoading } = useCourseSections(courseId);
  const { createSection, updateSection, removeSection, isPending } = useMutateCourseSection(courseId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSectionRow | null>(null);
  const [form, setForm] = useState<CourseSectionFormValues>(emptySectionForm(1));

  const openCreate = () => {
    const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 1;
    setEditing(null);
    setForm(emptySectionForm(nextOrder));
    setDialogOpen(true);
  };

  const openEdit = (row: CourseSectionRow) => {
    console.log("[CourseSectionsPanel] edit section row:", {
      courseId,
      row,
      formValues: rowToForm(row),
    });
    setEditing(row);
    setForm(rowToForm(row));
    setDialogOpen(true);
  };

  const submitSection = async () => {
    if (!courseId) return;
    if (editing) {
      await updateSection({ sectionId: editing.id, values: form });
    } else {
      await createSection(form);
    }
    setDialogOpen(false);
  };

  if (!courseId) return null;

  return (
    <>
    <div className="space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button type="button" className="rounded-2xl font-bold" onClick={openCreate}>
          <Plus className="mr-2 h-5 w-5" />
          {t("add_section")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <Table>
            <TableHeader>
            <TableRow>
              <TableHead className="ps-4">{t("title_en")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("video_url")}</TableHead>
              <TableHead>{t("duration")}</TableHead>
              <TableHead>{t("sort_order")}</TableHead>
              <TableHead>{t("free_preview")}</TableHead>
              <TableHead className="w-[120px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-start text-muted-foreground">
                  …
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-start text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="ps-4 font-medium">{row.titleEn || row.titleAr}</TableCell>
                  <TableCell className="hidden max-w-[200px] truncate font-mono text-xs md:table-cell">
                    {row.video_url || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.duration.trim() ? row.duration : "—"}</TableCell>
                  <TableCell>{row.sort_order}</TableCell>
                  <TableCell>{row.is_free ? t("yes") : t("no")}</TableCell>
                  <TableCell>
                    <div className="flex justify-start gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="rounded-lg text-rose-600 hover:bg-rose-50"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("delete_confirm")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">{tApi("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              className="rounded-xl"
                              onClick={() => void removeSection(row.id)}
                            >
                              {tApi("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? t("edit_section") : t("add_section")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 text-primary">
              <Languages className="h-4 w-4" />
              <span className="text-sm font-semibold">{t("titles")}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("title_ar")}</FieldLabel>
                <Input
                  dir="rtl"
                  className="rounded-xl"
                  value={form.title.ar}
                  onChange={(e) => setForm((f) => ({ ...f, title: { ...f.title, ar: e.target.value } }))}
                />
              </Field>
              <Field>
                <FieldLabel>{t("title_en")}</FieldLabel>
                <Input
                  dir="ltr"
                  className="rounded-xl"
                  value={form.title.en}
                  onChange={(e) => setForm((f) => ({ ...f, title: { ...f.title, en: e.target.value } }))}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>{t("video_url")}</FieldLabel>
              <Input
                dir="ltr"
                className="rounded-xl font-mono text-sm"
                value={form.video_url}
                onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                placeholder="https://"
              />
            </Field>

            <Field>
              <FieldLabel>{t("duration")}</FieldLabel>
              <Input
                dir="ltr"
                className="rounded-xl"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder={t("duration_placeholder")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("sort_order")}</FieldLabel>
                <Input
                  type="number"
                  className="rounded-xl"
                  value={Number.isFinite(form.sort_order) ? String(form.sort_order) : "0"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number.parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </Field>
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={form.is_free}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_free: Boolean(v) }))}
                  />
                  {t("free_preview")}
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-xl">
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="rounded-xl font-bold"
                disabled={isPending || !form.title.ar.trim() || !form.title.en.trim()}
                onClick={() => void submitSection()}
              >
                {editing ? t("save") : t("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
