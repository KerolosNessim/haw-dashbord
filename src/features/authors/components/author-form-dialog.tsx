import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { slugifyForLocale } from "@/lib/slugify";
import { Link, Loader2, Lock, Search, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Author, AuthorFormValues } from "../types";

type AuthorFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  author?: Author | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AuthorFormValues, imageFile: File | null) => void;
};

function emptyForm(): AuthorFormValues {
  return {
    name: { ar: "", en: "" },
    job_title: { ar: "", en: "" },
    bio: { ar: "", en: "" },
    image_alt: { ar: "", en: "" },
    slug: { ar: "", en: "" },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    is_active: true,
  };
}

export default function AuthorFormDialog({
  open,
  mode,
  author,
  isSaving,
  onOpenChange,
  onSubmit,
}: AuthorFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "author" });
  const [form, setForm] = useState<AuthorFormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [slugLinked, setSlugLinked] = useState<{ ar: boolean; en: boolean }>({
    ar: true,
    en: true,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && author) {
      setForm({
        name: { ...author.name },
        job_title: { ...author.job_title },
        bio: { ...author.bio },
        image_alt: { ...author.image_alt },
        slug: { ...author.slug },
        meta_title: { ...author.meta_title },
        meta_description: { ...author.meta_description },
        is_active: author.is_active,
      });
      setPreview(author.image);
      setImageFile(null);
      setSlugLinked({ ar: false, en: false });
      return;
    }
    setForm(emptyForm());
    setPreview(null);
    setImageFile(null);
    setSlugLinked({ ar: true, en: true });
  }, [open, mode, author]);

  useEffect(() => {
    if (!slugLinked.ar) return;
    setForm((f) => ({ ...f, slug: { ...f.slug, ar: slugifyForLocale("ar", f.name.ar) } }));
  }, [form.name.ar, slugLinked.ar]);

  useEffect(() => {
    if (!slugLinked.en) return;
    setForm((f) => ({ ...f, slug: { ...f.slug, en: slugifyForLocale("en", f.name.en) } }));
  }, [form.name.en, slugLinked.en]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, imageFile);
  };

  const setLocalized = <K extends keyof AuthorFormValues>(
    key: K,
    locale: "ar" | "en",
    value: string,
  ) =>
    setForm((f) => ({
      ...f,
      [key]: { ...(f[key] as { ar: string; en: string }), [locale]: value },
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-7xl no-scrollbar">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? t("create_title") : t("edit_title")}</DialogTitle>
            <DialogDescription>{t("dialog_description")}</DialogDescription>
          </DialogHeader>

          {/* ── Basic Info ──────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("sections.basic")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.name_ar")}</FieldLabel>
                <Input required dir="rtl" value={form.name.ar}
                  onChange={(e) => setLocalized("name", "ar", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.name_en")}</FieldLabel>
                <Input required dir="ltr" value={form.name.en}
                  onChange={(e) => setLocalized("name", "en", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.job_title_ar")}</FieldLabel>
                <Input required dir="rtl" value={form.job_title.ar}
                  onChange={(e) => setLocalized("job_title", "ar", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.job_title_en")}</FieldLabel>
                <Input required dir="ltr" value={form.job_title.en}
                  onChange={(e) => setLocalized("job_title", "en", e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.bio_ar")}</FieldLabel>
                <div className="min-h-[180px] overflow-hidden rounded-xl border">
                  <RichTextEditor dir="rtl" value={form.bio.ar}
                    onChange={(val) => setLocalized("bio", "ar", editorOnChangeToHtml(val))} />
                </div>
              </Field>
              <Field>
                <FieldLabel>{t("fields.bio_en")}</FieldLabel>
                <div className="min-h-[180px] overflow-hidden rounded-xl border">
                  <RichTextEditor dir="ltr" value={form.bio.en}
                    onChange={(val) => setLocalized("bio", "en", editorOnChangeToHtml(val))} />
                </div>
              </Field>
            </div>
          </section>

          {/* ── Image ──────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t("sections.image")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.image")}</FieldLabel>
                <Input type="file" accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    setPreview(file ? URL.createObjectURL(file) : (author?.image ?? null));
                  }} />
              </Field>
              <Field className="flex flex-row items-center justify-between rounded-xl border p-3">
                <FieldLabel>{t("fields.is_active")}</FieldLabel>
                <Switch checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              </Field>
            </div>

            {preview ? (
              <div className="overflow-hidden rounded-xl border bg-muted/20 p-2">
                <img src={preview} alt="" className="h-40 w-full rounded-lg object-contain" />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.image_alt_ar")}</FieldLabel>
                <Input dir="rtl" value={form.image_alt.ar}
                  placeholder={t("placeholders.image_alt")}
                  onChange={(e) => setLocalized("image_alt", "ar", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.image_alt_en")}</FieldLabel>
                <Input dir="ltr" value={form.image_alt.en}
                  placeholder={t("placeholders.image_alt")}
                  onChange={(e) => setLocalized("image_alt", "en", e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Slug ──────────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-dashed bg-muted/5 p-5">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("sections.slug")}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.slug_ar")}</FieldLabel>
                <button
                  type="button"
                  className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => setSlugLinked((s) => ({ ...s, ar: !s.ar }))}
                >
                  {slugLinked.ar ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {slugLinked.ar ? "linked" : "manual"}
                </button>
                <Input
                  dir="ltr"
                  value={form.slug.ar}
                  readOnly={slugLinked.ar}
                  placeholder={t("placeholders.slug")}
                  className={slugLinked.ar ? "bg-muted/20" : ""}
                  onChange={(e) => setLocalized("slug", "ar", slugifyForLocale("ar", e.target.value))}
                />
              </Field>
              <Field>
                <FieldLabel>{t("fields.slug_en")}</FieldLabel>
                <button
                  type="button"
                  className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => setSlugLinked((s) => ({ ...s, en: !s.en }))}
                >
                  {slugLinked.en ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {slugLinked.en ? "linked" : "manual"}
                </button>
                <Input
                  dir="ltr"
                  value={form.slug.en}
                  readOnly={slugLinked.en}
                  placeholder={t("placeholders.slug")}
                  className={slugLinked.en ? "bg-muted/20" : ""}
                  onChange={(e) => setLocalized("slug", "en", slugifyForLocale("en", e.target.value))}
                />
              </Field>
            </div>
          </section>

          {/* ── SEO ──────────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-dashed bg-muted/5 p-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("sections.seo")}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.meta_title_ar")}</FieldLabel>
                <Input dir="rtl" value={form.meta_title.ar}
                  placeholder={t("placeholders.meta_title")}
                  onChange={(e) => setLocalized("meta_title", "ar", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.meta_title_en")}</FieldLabel>
                <Input dir="ltr" value={form.meta_title.en}
                  placeholder={t("placeholders.meta_title")}
                  onChange={(e) => setLocalized("meta_title", "en", e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("fields.meta_description_ar")}</FieldLabel>
                <Textarea dir="rtl" value={form.meta_description.ar}
                  placeholder={t("placeholders.meta_description")}
                  className="min-h-[80px] resize-none rounded-xl"
                  onChange={(e) => setLocalized("meta_description", "ar", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>{t("fields.meta_description_en")}</FieldLabel>
                <Textarea dir="ltr" value={form.meta_description.en}
                  placeholder={t("placeholders.meta_description")}
                  className="min-h-[80px] resize-none rounded-xl"
                  onChange={(e) => setLocalized("meta_description", "en", e.target.value)} />
              </Field>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? t("create_submit") : t("save_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
