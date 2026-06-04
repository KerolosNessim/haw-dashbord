import { TypeToConfirmDeleteAlertDialog } from "@/components/type-to-confirm-delete-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Can } from "@/features/permissions/components/PermissionGate";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import {
  createJobOpening,
  deleteJobApplication,
  deleteJobOpening,
  deleteJobsSection,
  fetchJobApplicationById,
  fetchJobApplications,
  fetchJobOpenings,
  fetchJobsHeader,
  fetchJobsSections,
  saveJobsHeader,
  upsertJobsSection,
  updateJobOpening,
  updateJobsSection,
} from "@/features/jobs/services/jobs-api";
import type {
  JobApplication,
  JobOpening,
  JobOpeningFormValues,
  JobsHeader,
  JobsHeaderFormValues,
  JobsSection,
  JobsSectionFormItem,
  JobsSectionFormValues,
} from "@/features/jobs/types";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function emptyHeaderForm(): JobsHeaderFormValues {
  return {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    image_alt: { ar: "", en: "" },
    is_active: true,
  };
}

function emptySectionItem(): JobsSectionFormItem {
  return {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    image_alt: { ar: "", en: "" },
    image: { ar: null, en: null },
    currentImage: { ar: null, en: null },
  };
}

function emptySectionForm(): JobsSectionFormValues {
  return {
    section_type: "",
    name: { ar: "", en: "" },
    sort_order: 0,
    is_active: true,
    items: [emptySectionItem()],
  };
}

function emptyOpeningForm(): JobOpeningFormValues {
  return {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    job_type: { ar: "", en: "" },
    image_alt: { ar: "", en: "" },
    sort_order: 0,
    is_active: true,
  };
}

function sectionToForm(section: JobsSection): JobsSectionFormValues {
  return {
    section_type: section.section_type,
    name: { ...section.name },
    sort_order: section.sort_order,
    is_active: section.is_active,
    items: section.items.map((item) => ({
      id: item.id,
      title: { ...item.title },
      description: { ...item.description },
      image_alt: { ...item.image_alt },
      image: { ar: null, en: null },
      currentImage: { ...item.image },
      sort_order: item.sort_order,
    })),
  };
}

function openingToForm(opening: JobOpening): JobOpeningFormValues {
  return {
    title: { ...opening.title },
    description: { ...opening.description },
    job_type: { ...opening.job_type },
    image_alt: { ...opening.image_alt },
    sort_order: opening.sort_order,
    is_active: opening.is_active,
  };
}

function SectionValidationError({ message }: { message: string }) {
  return <p className="text-xs text-destructive">{message}</p>;
}

function htmlToPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function JobsPage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "jobs" });
  const isRtl = i18n.language.startsWith("ar");
  const queryClient = useQueryClient();
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [openingDialogOpen, setOpeningDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<JobsSection | null>(null);
  const [selectedOpening, setSelectedOpening] = useState<JobOpening | null>(null);
  const [sectionDeleteId, setSectionDeleteId] = useState<number | null>(null);
  const [openingDeleteId, setOpeningDeleteId] = useState<number | null>(null);
  const [applicationDeleteId, setApplicationDeleteId] = useState<number | null>(null);
  const [applicationPage, setApplicationPage] = useState(1);
  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationOpeningFilter, setApplicationOpeningFilter] = useState<string>("");
  const [applicationDetailsOpen, setApplicationDetailsOpen] = useState(false);
  const [applicationDetailsId, setApplicationDetailsId] = useState<number | null>(null);
  const [openingsSearch, setOpeningsSearch] = useState("");

  const headerQuery = useQuery({
    queryKey: ["jobs", "header"],
    queryFn: fetchJobsHeader,
  });
  const sectionsQuery = useQuery({
    queryKey: ["jobs", "sections"],
    queryFn: fetchJobsSections,
  });
  const openingsQuery = useQuery({
    queryKey: ["jobs", "openings"],
    queryFn: fetchJobOpenings,
  });
  const applicationsQuery = useQuery({
    queryKey: ["jobs", "applications", applicationPage, applicationSearch, applicationOpeningFilter],
    queryFn: () =>
      fetchJobApplications({
        page: applicationPage,
        perPage: 10,
        search: applicationSearch,
        jobOpeningId: applicationOpeningFilter ? Number(applicationOpeningFilter) : null,
      }),
    placeholderData: keepPreviousData,
  });
  const applicationDetailQuery = useQuery({
    queryKey: ["jobs", "applications", "detail", applicationDetailsId],
    queryFn: () => fetchJobApplicationById(applicationDetailsId!),
    enabled: applicationDetailsOpen && applicationDetailsId != null,
  });

  const saveHeaderMutation = useMutation({
    mutationFn: (payload: { values: JobsHeaderFormValues; images: { ar: File | null; en: File | null } }) =>
      saveJobsHeader(payload.values, payload.images),
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("header.toast_saved")));
      void queryClient.invalidateQueries({ queryKey: ["jobs", "header"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });
  const saveSectionMutation = useMutation({
    mutationFn: (payload: { id?: number; values: JobsSectionFormValues }) =>
      payload.id ? updateJobsSection(payload.id, payload.values) : upsertJobsSection(payload.values),
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("sections.toast_saved")));
      setSectionDialogOpen(false);
      setSelectedSection(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs", "sections"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });
  const deleteSectionMutation = useMutation({
    mutationFn: deleteJobsSection,
    onSuccess: () => {
      toast.success(t("sections.toast_deleted"));
      setSectionDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs", "sections"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });
  const saveOpeningMutation = useMutation({
    mutationFn: (payload: {
      id?: number;
      values: JobOpeningFormValues;
      images: { ar: File | null; en: File | null };
    }) =>
      payload.id
        ? updateJobOpening(payload.id, payload.values, payload.images)
        : createJobOpening(payload.values, payload.images),
    onSuccess: (res) => {
      toast.success(resolveApiToastMessage(res, t("openings.toast_saved")));
      setOpeningDialogOpen(false);
      setSelectedOpening(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs", "openings"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });
  const deleteOpeningMutation = useMutation({
    mutationFn: deleteJobOpening,
    onSuccess: () => {
      toast.success(t("openings.toast_deleted"));
      setOpeningDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs", "openings"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });
  const deleteApplicationMutation = useMutation({
    mutationFn: deleteJobApplication,
    onSuccess: () => {
      toast.success(t("applications.toast_deleted"));
      setApplicationDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });

  const openings = useMemo(() => openingsQuery.data ?? [], [openingsQuery.data]);
  const filteredOpenings = useMemo(() => {
    const q = openingsSearch.trim().toLowerCase();
    if (!q) return openings;
    return openings.filter((opening) =>
      [opening.title.ar, opening.title.en, opening.description.ar, opening.description.en, opening.job_type.ar, opening.job_type.en]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [openings, openingsSearch]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 py-6">
      <div className="border-b pb-6">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
          <BriefcaseBusiness className="h-7 w-7 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList>
          <TabsTrigger value="header">{t("tabs.header")}</TabsTrigger>
          <TabsTrigger value="sections">{t("tabs.sections")}</TabsTrigger>
          <TabsTrigger value="openings">{t("tabs.openings")}</TabsTrigger>
          <TabsTrigger value="applications">{t("tabs.applications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="header">
          <JobsHeaderTab
            t={t}
            initial={headerQuery.data}
            isLoading={headerQuery.isLoading}
            isSaving={saveHeaderMutation.isPending}
            onSave={(values, images) => saveHeaderMutation.mutate({ values, images })}
          />
        </TabsContent>

        <TabsContent value="sections">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Can permission="jobs-sections.create">
                <Button
                  onClick={() => {
                    setSelectedSection(null);
                    setSectionDialogOpen(true);
                  }}
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t("sections.add_button")}
                </Button>
              </Can>
            </div>
            <SectionsTable
              t={t}
              rows={sectionsQuery.data ?? []}
              isLoading={sectionsQuery.isLoading}
              onEdit={(section) => {
                setSelectedSection(section);
                setSectionDialogOpen(true);
              }}
              onDelete={setSectionDeleteId}
            />
          </div>
        </TabsContent>

        <TabsContent value="openings">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Input
                value={openingsSearch}
                onChange={(e) => setOpeningsSearch(e.target.value)}
                placeholder={t("openings.search_placeholder")}
                className="max-w-md"
              />
              <Can permission="jobs-openings.create">
                <Button
                  onClick={() => {
                    setSelectedOpening(null);
                    setOpeningDialogOpen(true);
                  }}
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t("openings.add_button")}
                </Button>
              </Can>
            </div>
            <OpeningsTable
              t={t}
              isRtl={isRtl}
              rows={filteredOpenings}
              isLoading={openingsQuery.isLoading}
              onEdit={(opening) => {
                setSelectedOpening(opening);
                setOpeningDialogOpen(true);
              }}
              onDelete={setOpeningDeleteId}
            />
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={applicationSearch}
                onChange={(e) => {
                  setApplicationSearch(e.target.value);
                  setApplicationPage(1);
                }}
                placeholder={t("applications.search_placeholder")}
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={applicationOpeningFilter}
                onChange={(e) => {
                  setApplicationOpeningFilter(e.target.value);
                  setApplicationPage(1);
                }}
              >
                <option value="">{t("applications.filter_all_openings")}</option>
                {openings.map((opening) => (
                  <option key={opening.id} value={String(opening.id)}>
                    {isRtl ? opening.title.ar || opening.title.en : opening.title.en || opening.title.ar}
                  </option>
                ))}
              </select>
            </div>

            <ApplicationsTable
              t={t}
              isRtl={isRtl}
              rows={applicationsQuery.data?.rows ?? []}
              isLoading={applicationsQuery.isLoading}
              onView={(id) => {
                setApplicationDetailsId(id);
                setApplicationDetailsOpen(true);
              }}
              onDelete={setApplicationDeleteId}
            />

            <LaravelResourcePagination
              meta={
                applicationsQuery.data?.meta ?? {
                  current_page: 1,
                  last_page: 1,
                  per_page: 10,
                  total: 0,
                  from: null,
                  to: null,
                  path: "/v1/admin/jobs/applications",
                }
              }
              onPageChange={setApplicationPage}
              isRtl={isRtl}
              disabled={applicationsQuery.isFetching}
              hideWhenSinglePage={false}
            />
          </div>
        </TabsContent>
      </Tabs>

      <SectionFormDialog
        t={t}
        open={sectionDialogOpen}
        initial={selectedSection ? sectionToForm(selectedSection) : undefined}
        isSaving={saveSectionMutation.isPending}
        onOpenChange={setSectionDialogOpen}
        onSubmit={(values) => saveSectionMutation.mutate({ id: selectedSection?.id, values })}
      />
      <OpeningFormDialog
        t={t}
        open={openingDialogOpen}
        initial={selectedOpening ? openingToForm(selectedOpening) : undefined}
        currentImage={selectedOpening?.image}
        isSaving={saveOpeningMutation.isPending}
        onOpenChange={setOpeningDialogOpen}
        onSubmit={(values, images) => saveOpeningMutation.mutate({ id: selectedOpening?.id, values, images })}
      />
      <ApplicationDetailsDialog
        t={t}
        open={applicationDetailsOpen}
        onOpenChange={setApplicationDetailsOpen}
        data={applicationDetailQuery.data ?? null}
        isLoading={applicationDetailQuery.isLoading}
      />

      <TypeToConfirmDeleteAlertDialog
        open={sectionDeleteId != null}
        onOpenChange={(open) => !open && setSectionDeleteId(null)}
        title={t("sections.delete_title")}
        description={t("sections.delete_description")}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={t("delete_type_label")}
        inputPlaceholder={t("delete_placeholder")}
        cancelLabel={t("cancel")}
        deleteLabel={t("delete")}
        isPending={deleteSectionMutation.isPending}
        onConfirm={() => {
          if (sectionDeleteId != null) deleteSectionMutation.mutate(sectionDeleteId);
        }}
      />
      <TypeToConfirmDeleteAlertDialog
        open={openingDeleteId != null}
        onOpenChange={(open) => !open && setOpeningDeleteId(null)}
        title={t("openings.delete_title")}
        description={t("openings.delete_description")}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={t("delete_type_label")}
        inputPlaceholder={t("delete_placeholder")}
        cancelLabel={t("cancel")}
        deleteLabel={t("delete")}
        isPending={deleteOpeningMutation.isPending}
        onConfirm={() => {
          if (openingDeleteId != null) deleteOpeningMutation.mutate(openingDeleteId);
        }}
      />
      <TypeToConfirmDeleteAlertDialog
        open={applicationDeleteId != null}
        onOpenChange={(open) => !open && setApplicationDeleteId(null)}
        title={t("applications.delete_title")}
        description={t("applications.delete_description")}
        validPhrases={["delete", "حذف"]}
        typePhraseLabel={t("delete_type_label")}
        inputPlaceholder={t("delete_placeholder")}
        cancelLabel={t("cancel")}
        deleteLabel={t("delete")}
        isPending={deleteApplicationMutation.isPending}
        onConfirm={() => {
          if (applicationDeleteId != null) deleteApplicationMutation.mutate(applicationDeleteId);
        }}
      />
    </div>
  );
}

function JobsHeaderTab({
  t,
  initial,
  isLoading,
  isSaving,
  onSave,
}: {
  t: (key: string, options?: Record<string, unknown>) => string;
  initial?: JobsHeader;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (values: JobsHeaderFormValues, images: { ar: File | null; en: File | null }) => void;
}) {
  const [form, setForm] = useState<JobsHeaderFormValues>(() => initial ? {
    title: {
      ar: htmlToPlainText(initial.title.ar),
      en: htmlToPlainText(initial.title.en),
    },
    description: { ...initial.description },
    meta_title: {
      ar: htmlToPlainText(initial.meta_title.ar),
      en: htmlToPlainText(initial.meta_title.en),
    },
    meta_description: {
      ar: htmlToPlainText(initial.meta_description.ar),
      en: htmlToPlainText(initial.meta_description.en),
    },
    image_alt: { ...initial.image_alt },
    is_active: initial.is_active,
  } : emptyHeaderForm());
  const [images, setImages] = useState<{ ar: File | null; en: File | null }>({ ar: null, en: null });
  const [preview, setPreview] = useState<{ ar: string | null; en: string | null }>({
    ar: initial?.image.ar ?? null,
    en: initial?.image.en ?? null,
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      title: {
        ar: htmlToPlainText(initial.title.ar),
        en: htmlToPlainText(initial.title.en),
      },
      description: { ...initial.description },
      meta_title: {
        ar: htmlToPlainText(initial.meta_title.ar),
        en: htmlToPlainText(initial.meta_title.en),
      },
      meta_description: {
        ar: htmlToPlainText(initial.meta_description.ar),
        en: htmlToPlainText(initial.meta_description.en),
      },
      image_alt: { ...initial.image_alt },
      is_active: initial.is_active,
    });
    setPreview({ ar: initial.image.ar, en: initial.image.en });
    setImages({ ar: null, en: null });
  }, [initial]);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;

  return (
    <form
      className="space-y-4 rounded-2xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, images);
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field>
          <FieldLabel>{t("header.fields.title_ar")}</FieldLabel>
          <div className="min-h-[140px] overflow-hidden rounded-xl border">
            <RichTextEditor
              dir="rtl"
              value={form.title.ar}
              onChange={(val) =>
                setForm((s) => ({ ...s, title: { ...s.title, ar: editorOnChangeToHtml(val) } }))
              }
            />
          </div>
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.title_en")}</FieldLabel>
          <div className="min-h-[140px] overflow-hidden rounded-xl border">
            <RichTextEditor
              dir="ltr"
              value={form.title.en}
              onChange={(val) =>
                setForm((s) => ({ ...s, title: { ...s.title, en: editorOnChangeToHtml(val) } }))
              }
            />
          </div>
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.description_ar")}</FieldLabel>
          <div className="min-h-[160px] overflow-hidden rounded-xl border">
            <RichTextEditor
              dir="rtl"
              value={form.description.ar}
              onChange={(val) =>
                setForm((s) => ({ ...s, description: { ...s.description, ar: editorOnChangeToHtml(val) } }))
              }
            />
          </div>
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.description_en")}</FieldLabel>
          <div className="min-h-[160px] overflow-hidden rounded-xl border">
            <RichTextEditor
              dir="ltr"
              value={form.description.en}
              onChange={(val) =>
                setForm((s) => ({ ...s, description: { ...s.description, en: editorOnChangeToHtml(val) } }))
              }
            />
          </div>
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.meta_title_ar")}</FieldLabel>
          <Input
            value={form.meta_title.ar}
            onChange={(e) => setForm((s) => ({ ...s, meta_title: { ...s.meta_title, ar: e.target.value } }))}
          />
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.meta_title_en")}</FieldLabel>
          <Input
            value={form.meta_title.en}
            onChange={(e) => setForm((s) => ({ ...s, meta_title: { ...s.meta_title, en: e.target.value } }))}
          />
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.meta_description_ar")}</FieldLabel>
          <Textarea
            value={form.meta_description.ar}
            dir="rtl"
            className="min-h-[100px] resize-none rounded-xl"
            onChange={(e) => setForm((s) => ({ ...s, meta_description: { ...s.meta_description, ar: e.target.value } }))}
          />
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.meta_description_en")}</FieldLabel>
          <Textarea
            value={form.meta_description.en}
            dir="ltr"
            className="min-h-[100px] resize-none rounded-xl"
            onChange={(e) => setForm((s) => ({ ...s, meta_description: { ...s.meta_description, en: e.target.value } }))}
          />
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.image_alt_ar")}</FieldLabel>
          <Input value={form.image_alt.ar} onChange={(e) => setForm((s) => ({ ...s, image_alt: { ...s.image_alt, ar: e.target.value } }))} />
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.image_alt_en")}</FieldLabel>
          <Input value={form.image_alt.en} onChange={(e) => setForm((s) => ({ ...s, image_alt: { ...s.image_alt, en: e.target.value } }))} />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field>
          <FieldLabel>{t("header.fields.image_ar")}</FieldLabel>
          <Input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setImages((s) => ({ ...s, ar: file }));
            setPreview((s) => ({ ...s, ar: file ? URL.createObjectURL(file) : s.ar }));
          }} />
          {preview.ar ? <img src={preview.ar} alt="" className="mt-2 h-28 w-full rounded-md border object-cover" /> : null}
        </Field>
        <Field>
          <FieldLabel>{t("header.fields.image_en")}</FieldLabel>
          <Input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setImages((s) => ({ ...s, en: file }));
            setPreview((s) => ({ ...s, en: file ? URL.createObjectURL(file) : s.en }));
          }} />
          {preview.en ? <img src={preview.en} alt="" className="mt-2 h-28 w-full rounded-md border object-cover" /> : null}
        </Field>
      </div>
      <Field className="flex items-center justify-between rounded-xl border p-3">
        <FieldLabel>{t("header.fields.is_active")}</FieldLabel>
        <Switch checked={form.is_active} onCheckedChange={(v) => setForm((s) => ({ ...s, is_active: v }))} />
      </Field>
      <Button type="submit" disabled={isSaving}>{t("save")}</Button>
    </form>
  );
}

function SectionsTable({
  t,
  rows,
  isLoading,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string;
  rows: JobsSection[];
  isLoading: boolean;
  onEdit: (row: JobsSection) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">{t("sections.empty")}</p>;
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("sections.table.type")}</TableHead>
            <TableHead>{t("sections.table.name")}</TableHead>
            <TableHead>{t("sections.table.items")}</TableHead>
            <TableHead>{t("sections.table.status")}</TableHead>
            <TableHead>{t("sections.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id || row.section_type}>
              <TableCell className="font-mono text-xs">{row.section_type}</TableCell>
              <TableCell>{row.name.ar || row.name.en}</TableCell>
              <TableCell>{row.items.length}</TableCell>
              <TableCell><Badge variant={row.is_active ? "default" : "outline"}>{row.is_active ? t("active") : t("inactive")}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Can permission="jobs-sections.update">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="h-4 w-4" /></Button>
                  </Can>
                  <Can permission="jobs-sections.delete">
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete(row.id)}><Trash2 className="h-4 w-4" /></Button>
                  </Can>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SectionFormDialog({
  t,
  open,
  initial,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  t: (key: string) => string;
  open: boolean;
  initial?: JobsSectionFormValues;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: JobsSectionFormValues) => void;
}) {
  const [form, setForm] = useState<JobsSectionFormValues>(initial ?? emptySectionForm());
  const [errors, setErrors] = useState<{ section_type?: string; name_ar?: string; itemTitleAr?: string }>({});

  useEffect(() => {
    if (!open) return;
    setForm(initial ?? emptySectionForm());
    setErrors({});
  }, [initial, open]);

  const validate = (): boolean => {
    const next: { section_type?: string; name_ar?: string; itemTitleAr?: string } = {};
    if (!/^[a-z0-9_-]+$/.test(form.section_type.trim())) next.section_type = t("sections.validation.section_type");
    if (!form.name.ar.trim()) next.name_ar = t("sections.validation.name_ar");
    if (form.items.some((item) => !item.title.ar.trim())) next.itemTitleAr = t("sections.validation.item_title_ar");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("sections.edit_title") : t("sections.create_title")}</DialogTitle>
          <DialogDescription>{t("sections.dialog_description")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate()) return;
            onSubmit(form);
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel>{t("sections.fields.section_type")}</FieldLabel>
              <Input value={form.section_type} onChange={(e) => setForm((s) => ({ ...s, section_type: e.target.value }))} />
              {errors.section_type ? <SectionValidationError message={errors.section_type} /> : null}
            </Field>
            <Field>
              <FieldLabel>{t("sections.fields.sort_order")}</FieldLabel>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value || 0) }))} />
            </Field>
            <Field>
              <FieldLabel>{t("sections.fields.name_ar")}</FieldLabel>
              <Input value={form.name.ar} onChange={(e) => setForm((s) => ({ ...s, name: { ...s.name, ar: e.target.value } }))} />
              {errors.name_ar ? <SectionValidationError message={errors.name_ar} /> : null}
            </Field>
            <Field>
              <FieldLabel>{t("sections.fields.name_en")}</FieldLabel>
              <Input value={form.name.en} onChange={(e) => setForm((s) => ({ ...s, name: { ...s.name, en: e.target.value } }))} />
            </Field>
          </div>

          <Field className="flex items-center justify-between rounded-xl border p-3">
            <FieldLabel>{t("sections.fields.is_active")}</FieldLabel>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm((s) => ({ ...s, is_active: v }))} />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{t("sections.items_title")}</h4>
              <Button type="button" variant="outline" onClick={() => setForm((s) => ({ ...s, items: [...s.items, emptySectionItem()] }))}>
                <Plus className="me-2 h-4 w-4" />
                {t("sections.add_item")}
              </Button>
            </div>
            {errors.itemTitleAr ? <SectionValidationError message={errors.itemTitleAr} /> : null}
            {form.items.map((item, index) => (
              <div key={index} className="space-y-3 rounded-xl border p-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => {
                    setForm((s) => {
                      const next = [...s.items];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      return { ...s, items: next };
                    });
                  }}>{t("sections.move_up")}</Button>
                  <Button type="button" size="sm" variant="outline" disabled={index === form.items.length - 1} onClick={() => {
                    setForm((s) => {
                      const next = [...s.items];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      return { ...s, items: next };
                    });
                  }}>{t("sections.move_down")}</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }))}>{t("delete")}</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field><FieldLabel>{t("sections.fields.item_title_ar")}</FieldLabel><Input value={item.title.ar} onChange={(e) => setForm((s) => ({ ...s, items: s.items.map((entry, i) => i === index ? { ...entry, title: { ...entry.title, ar: e.target.value } } : entry) }))} /></Field>
                  <Field><FieldLabel>{t("sections.fields.item_title_en")}</FieldLabel><Input value={item.title.en} onChange={(e) => setForm((s) => ({ ...s, items: s.items.map((entry, i) => i === index ? { ...entry, title: { ...entry.title, en: e.target.value } } : entry) }))} /></Field>
                  <Field>
                    <FieldLabel>{t("sections.fields.item_description_ar")}</FieldLabel>
                    <div className="min-h-[140px] overflow-hidden rounded-xl border">
                      <RichTextEditor
                        dir="rtl"
                        value={item.description.ar}
                        onChange={(val) =>
                          setForm((s) => ({
                            ...s,
                            items: s.items.map((entry, i) =>
                              i === index
                                ? { ...entry, description: { ...entry.description, ar: editorOnChangeToHtml(val) } }
                                : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>{t("sections.fields.item_description_en")}</FieldLabel>
                    <div className="min-h-[140px] overflow-hidden rounded-xl border">
                      <RichTextEditor
                        dir="ltr"
                        value={item.description.en}
                        onChange={(val) =>
                          setForm((s) => ({
                            ...s,
                            items: s.items.map((entry, i) =>
                              i === index
                                ? { ...entry, description: { ...entry.description, en: editorOnChangeToHtml(val) } }
                                : entry,
                            ),
                          }))
                        }
                      />
                    </div>
                  </Field>
                  <Field><FieldLabel>{t("sections.fields.item_image_ar")}</FieldLabel><Input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm((s) => ({ ...s, items: s.items.map((entry, i) => i === index ? { ...entry, image: { ...entry.image, ar: file } } : entry) }));
                  }} />{item.currentImage.ar ? <img src={item.currentImage.ar} alt="" className="mt-2 h-20 rounded border object-cover" /> : null}</Field>
                  <Field><FieldLabel>{t("sections.fields.item_image_en")}</FieldLabel><Input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm((s) => ({ ...s, items: s.items.map((entry, i) => i === index ? { ...entry, image: { ...entry.image, en: file } } : entry) }));
                  }} />{item.currentImage.en ? <img src={item.currentImage.en} alt="" className="mt-2 h-20 rounded border object-cover" /> : null}</Field>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit" disabled={isSaving}>{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OpeningsTable({
  t,
  isRtl,
  rows,
  isLoading,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string;
  isRtl: boolean;
  rows: JobOpening[];
  isLoading: boolean;
  onEdit: (row: JobOpening) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">{t("openings.empty")}</p>;
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("openings.table.image")}</TableHead>
            <TableHead>{t("openings.table.title")}</TableHead>
            <TableHead>{t("openings.table.job_type")}</TableHead>
            <TableHead>{t("openings.table.status")}</TableHead>
            <TableHead>{t("openings.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.image.ar || row.image.en ? <img src={row.image.ar || row.image.en || ""} alt="" className="h-10 w-10 rounded border object-cover" /> : <div className="h-10 w-10 rounded border bg-muted" />}</TableCell>
              <TableCell>{isRtl ? row.title.ar || row.title.en : row.title.en || row.title.ar}</TableCell>
              <TableCell>{isRtl ? row.job_type.ar || row.job_type.en : row.job_type.en || row.job_type.ar}</TableCell>
              <TableCell><Badge variant={row.is_active ? "default" : "outline"}>{row.is_active ? t("active") : t("inactive")}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Can permission="jobs-openings.update"><Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="h-4 w-4" /></Button></Can>
                  <Can permission="jobs-openings.delete"><Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete(row.id)}><Trash2 className="h-4 w-4" /></Button></Can>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function OpeningFormDialog({
  t,
  open,
  initial,
  currentImage,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  t: (key: string) => string;
  open: boolean;
  initial?: JobOpeningFormValues;
  currentImage?: { ar: string | null; en: string | null };
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: JobOpeningFormValues, images: { ar: File | null; en: File | null }) => void;
}) {
  const [form, setForm] = useState<JobOpeningFormValues>(initial ?? emptyOpeningForm());
  const [images, setImages] = useState<{ ar: File | null; en: File | null }>({ ar: null, en: null });
  const [preview, setPreview] = useState<{ ar: string | null; en: string | null }>({
    ar: currentImage?.ar ?? null,
    en: currentImage?.en ?? null,
  });

  useEffect(() => {
    if (!open) return;
    setForm(initial ?? emptyOpeningForm());
    setImages({ ar: null, en: null });
    setPreview({ ar: currentImage?.ar ?? null, en: currentImage?.en ?? null });
  }, [currentImage?.ar, currentImage?.en, initial, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("openings.edit_title") : t("openings.create_title")}</DialogTitle>
          <DialogDescription>{t("openings.dialog_description")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(form, images); }}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field><FieldLabel>{t("openings.fields.title_ar")}</FieldLabel><Input required value={form.title.ar} onChange={(e) => setForm((s) => ({ ...s, title: { ...s.title, ar: e.target.value } }))} /></Field>
            <Field><FieldLabel>{t("openings.fields.title_en")}</FieldLabel><Input value={form.title.en} onChange={(e) => setForm((s) => ({ ...s, title: { ...s.title, en: e.target.value } }))} /></Field>
            <Field>
              <FieldLabel>{t("openings.fields.description_ar")}</FieldLabel>
              <div className="min-h-[160px] overflow-hidden rounded-xl border">
                <RichTextEditor
                  dir="rtl"
                  value={form.description.ar}
                  onChange={(val) =>
                    setForm((s) => ({ ...s, description: { ...s.description, ar: editorOnChangeToHtml(val) } }))
                  }
                />
              </div>
            </Field>
            <Field>
              <FieldLabel>{t("openings.fields.description_en")}</FieldLabel>
              <div className="min-h-[160px] overflow-hidden rounded-xl border">
                <RichTextEditor
                  dir="ltr"
                  value={form.description.en}
                  onChange={(val) =>
                    setForm((s) => ({ ...s, description: { ...s.description, en: editorOnChangeToHtml(val) } }))
                  }
                />
              </div>
            </Field>
            <Field><FieldLabel>{t("openings.fields.job_type_ar")}</FieldLabel><Input value={form.job_type.ar} onChange={(e) => setForm((s) => ({ ...s, job_type: { ...s.job_type, ar: e.target.value } }))} /></Field>
            <Field><FieldLabel>{t("openings.fields.job_type_en")}</FieldLabel><Input value={form.job_type.en} onChange={(e) => setForm((s) => ({ ...s, job_type: { ...s.job_type, en: e.target.value } }))} /></Field>
            <Field><FieldLabel>{t("openings.fields.image_alt_ar")}</FieldLabel><Input value={form.image_alt.ar} onChange={(e) => setForm((s) => ({ ...s, image_alt: { ...s.image_alt, ar: e.target.value } }))} /></Field>
            <Field><FieldLabel>{t("openings.fields.image_alt_en")}</FieldLabel><Input value={form.image_alt.en} onChange={(e) => setForm((s) => ({ ...s, image_alt: { ...s.image_alt, en: e.target.value } }))} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field><FieldLabel>{t("openings.fields.image_ar")}</FieldLabel><Input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImages((s) => ({ ...s, ar: file }));
              setPreview((s) => ({ ...s, ar: file ? URL.createObjectURL(file) : s.ar }));
            }} />{preview.ar ? <img src={preview.ar} alt="" className="mt-2 h-20 rounded border object-cover" /> : null}</Field>
            <Field><FieldLabel>{t("openings.fields.image_en")}</FieldLabel><Input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImages((s) => ({ ...s, en: file }));
              setPreview((s) => ({ ...s, en: file ? URL.createObjectURL(file) : s.en }));
            }} />{preview.en ? <img src={preview.en} alt="" className="mt-2 h-20 rounded border object-cover" /> : null}</Field>
            <Field><FieldLabel>{t("openings.fields.sort_order")}</FieldLabel><Input type="number" value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value || 0) }))} /></Field>
            <Field className="flex items-center justify-between rounded-xl border p-3"><FieldLabel>{t("openings.fields.is_active")}</FieldLabel><Switch checked={form.is_active} onCheckedChange={(v) => setForm((s) => ({ ...s, is_active: v }))} /></Field>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button><Button type="submit" disabled={isSaving}>{t("save")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationsTable({
  t,
  isRtl,
  rows,
  isLoading,
  onView,
  onDelete,
}: {
  t: (key: string) => string;
  isRtl: boolean;
  rows: JobApplication[];
  isLoading: boolean;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">{t("applications.empty")}</p>;
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("applications.table.name")}</TableHead>
            <TableHead>{t("applications.table.email")}</TableHead>
            <TableHead>{t("applications.table.opening")}</TableHead>
            <TableHead>{t("applications.table.status")}</TableHead>
            <TableHead>{t("applications.table.date")}</TableHead>
            <TableHead>{t("applications.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.job_opening ? (isRtl ? row.job_opening.title.ar || row.job_opening.title.en : row.job_opening.title.en || row.job_opening.title.ar) : "-"}</TableCell>
              <TableCell><Badge variant="outline">{row.status || "-"}</Badge></TableCell>
              <TableCell>{row.created_at}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onView(row.id)}><Eye className="h-4 w-4" /></Button>
                  {row.cv_file_url ? <Button size="icon" variant="ghost" asChild><a href={row.cv_file_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a></Button> : null}
                  <Can permission="jobs-applications.delete"><Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete(row.id)}><Trash2 className="h-4 w-4" /></Button></Can>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ApplicationDetailsDialog({
  t,
  open,
  onOpenChange,
  data,
  isLoading,
}: {
  t: (key: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: JobApplication | null;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("applications.details_title")}</DialogTitle>
        </DialogHeader>
        {isLoading ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : data ? (
          <div className="space-y-2 text-sm">
            <p><strong>{t("applications.table.name")}:</strong> {data.name}</p>
            <p><strong>{t("applications.table.email")}:</strong> {data.email}</p>
            <p><strong>{t("applications.fields.age")}:</strong> {data.age ?? "-"}</p>
            <p><strong>{t("applications.table.status")}:</strong> {data.status || "-"}</p>
            <p><strong>{t("applications.table.date")}:</strong> {data.created_at}</p>
            {data.cv_file_url ? <p><a href={data.cv_file_url} target="_blank" rel="noreferrer" className="text-primary underline">{t("applications.download_cv")}</a></p> : null}
          </div>
        ) : <p className="text-sm text-muted-foreground">-</p>}
      </DialogContent>
    </Dialog>
  );
}
