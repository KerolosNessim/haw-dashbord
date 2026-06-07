import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Can } from "@/features/permissions/components/PermissionGate";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import {
  createServiceAiContent,
  fetchServiceAiContent,
  updateServiceAiContent,
} from "@/features/service-ai-content/services/service-ai-content-api";
import type {
  ServiceAiContent,
  ServiceAiContentFormValues,
  ServiceAiContentItem,
} from "@/features/service-ai-content/types";
import { getHttpErrorMessage } from "@/lib/http-error-message";

const QUERY_KEY = ["service-ai-content"];

function emptyItem(): ServiceAiContentItem {
  return {
    video: "",
    subtitle: "",
    description: { ar: "", en: "" },
    sort_order: 0,
  };
}

function emptyForm(): ServiceAiContentFormValues {
  return {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    image_alt: { ar: "", en: "" },
    items: [],
    is_active: true,
  };
}

function contentToForm(content: ServiceAiContent): ServiceAiContentFormValues {
  return {
    title: { ...content.title },
    description: { ...content.description },
    meta_title: { ...content.meta_title },
    meta_description: { ...content.meta_description },
    image_alt: { ...content.image_alt },
    items: content.items.map((item) => ({ ...item, description: { ...item.description } })),
    is_active: content.is_active,
  };
}

function isOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type FormErrors = {
  title_ar?: string;
  itemUrl?: string;
};

export default function ServiceAiContentPage() {
  const { t } = useTranslation("translation", { keyPrefix: "service_ai_content" });
  const queryClient = useQueryClient();

  const contentQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchServiceAiContent,
  });

  const exists = Boolean(contentQuery.data?.id);

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      images,
    }: {
      values: ServiceAiContentFormValues;
      images: { ar: File | null; en: File | null };
    }) => {
      if (exists) return updateServiceAiContent(values, images);
      return createServiceAiContent(values, images);
    },
    onSuccess: () => {
      toast.success(t("toast_saved"));
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-20">
      <div className="flex flex-col gap-4 border-b pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
      </div>

      {contentQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ServiceAiContentForm
          key={contentQuery.data?.id ?? "new"}
          t={t}
          initial={contentQuery.data ?? undefined}
          isSaving={saveMutation.isPending}
          onSave={(values, images) => saveMutation.mutate({ values, images })}
        />
      )}
    </div>
  );
}

function ServiceAiContentForm({
  t,
  initial,
  isSaving,
  onSave,
}: {
  t: (key: string) => string;
  initial?: ServiceAiContent;
  isSaving: boolean;
  onSave: (values: ServiceAiContentFormValues, images: { ar: File | null; en: File | null }) => void;
}) {
  const [form, setForm] = useState<ServiceAiContentFormValues>(() =>
    initial ? contentToForm(initial) : emptyForm(),
  );
  const [images, setImages] = useState<{ ar: File | null; en: File | null }>({ ar: null, en: null });
  const [preview, setPreview] = useState<{ ar: string | null; en: string | null }>({
    ar: initial?.image.ar ?? null,
    en: initial?.image.en ?? null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!initial) return;
    setForm(contentToForm(initial));
    setPreview({ ar: initial.image.ar, en: initial.image.en });
    setImages({ ar: null, en: null });
    setErrors({});
  }, [initial]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.title.ar.trim()) next.title_ar = t("validation.title_ar");
    if (form.items.some((item) => !isOptionalUrl(item.video) || !isOptionalUrl(item.subtitle))) {
      next.itemUrl = t("validation.url");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateItem = (index: number, patch: Partial<ServiceAiContentItem>) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const updateItemDescription = (index: number, locale: "ar" | "en", value: string) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) =>
        i === index ? { ...item, description: { ...item.description, [locale]: value } } : item,
      ),
    }));
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (!validate()) return;
        onSave(form, images);
      }}
    >
      <Tabs defaultValue="ar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ar">{t("tabs.ar")}</TabsTrigger>
          <TabsTrigger value="en">{t("tabs.en")}</TabsTrigger>
        </TabsList>

        <TabsContent value="ar" className="space-y-4 rounded-2xl border p-5">
          <Field>
            <FieldLabel>{t("fields.title")}</FieldLabel>
            <Input
              dir="rtl"
              value={form.title.ar}
              onChange={(e) => setForm((s) => ({ ...s, title: { ...s.title, ar: e.target.value } }))}
            />
            {errors.title_ar ? <p className="text-sm text-destructive">{errors.title_ar}</p> : null}
          </Field>
          <Field>
            <FieldLabel>{t("fields.description")}</FieldLabel>
            <div className="min-h-[160px] overflow-hidden rounded-xl border">
              <RichTextEditor
                dir="rtl"
                value={form.description.ar}
                onChange={(val) =>
                  setForm((s) => ({
                    ...s,
                    description: { ...s.description, ar: editorOnChangeToHtml(val) },
                  }))
                }
              />
            </div>
          </Field>
          <Field>
            <FieldLabel>{t("fields.meta_title")}</FieldLabel>
            <Input
              dir="rtl"
              value={form.meta_title.ar}
              onChange={(e) =>
                setForm((s) => ({ ...s, meta_title: { ...s.meta_title, ar: e.target.value } }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.meta_description")}</FieldLabel>
            <Input
              dir="rtl"
              value={form.meta_description.ar}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  meta_description: { ...s.meta_description, ar: e.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.image_alt")}</FieldLabel>
            <Input
              dir="rtl"
              value={form.image_alt.ar}
              onChange={(e) =>
                setForm((s) => ({ ...s, image_alt: { ...s.image_alt, ar: e.target.value } }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.image")}</FieldLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImages((s) => ({ ...s, ar: file }));
                setPreview((s) => ({ ...s, ar: file ? URL.createObjectURL(file) : s.ar }));
              }}
            />
            {preview.ar ? (
              <img src={preview.ar} alt="" className="mt-2 h-28 w-full rounded-md border object-cover" />
            ) : null}
          </Field>
        </TabsContent>

        <TabsContent value="en" className="space-y-4 rounded-2xl border p-5">
          <Field>
            <FieldLabel>{t("fields.title")}</FieldLabel>
            <Input
              value={form.title.en}
              onChange={(e) => setForm((s) => ({ ...s, title: { ...s.title, en: e.target.value } }))}
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.description")}</FieldLabel>
            <div className="min-h-[160px] overflow-hidden rounded-xl border">
              <RichTextEditor
                dir="ltr"
                value={form.description.en}
                onChange={(val) =>
                  setForm((s) => ({
                    ...s,
                    description: { ...s.description, en: editorOnChangeToHtml(val) },
                  }))
                }
              />
            </div>
          </Field>
          <Field>
            <FieldLabel>{t("fields.meta_title")}</FieldLabel>
            <Input
              value={form.meta_title.en}
              onChange={(e) =>
                setForm((s) => ({ ...s, meta_title: { ...s.meta_title, en: e.target.value } }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.meta_description")}</FieldLabel>
            <Input
              value={form.meta_description.en}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  meta_description: { ...s.meta_description, en: e.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.image_alt")}</FieldLabel>
            <Input
              value={form.image_alt.en}
              onChange={(e) =>
                setForm((s) => ({ ...s, image_alt: { ...s.image_alt, en: e.target.value } }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("fields.image")}</FieldLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImages((s) => ({ ...s, en: file }));
                setPreview((s) => ({ ...s, en: file ? URL.createObjectURL(file) : s.en }));
              }}
            />
            {preview.en ? (
              <img src={preview.en} alt="" className="mt-2 h-28 w-full rounded-md border object-cover" />
            ) : null}
          </Field>
        </TabsContent>
      </Tabs>

      <Field className="flex items-center justify-between rounded-xl border p-4">
        <FieldLabel>{t("fields.is_active")}</FieldLabel>
        <Switch
          checked={form.is_active}
          onCheckedChange={(value) => setForm((s) => ({ ...s, is_active: value }))}
        />
      </Field>

      <div className="space-y-4 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("items.title")}</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm((s) => ({ ...s, items: [...s.items, emptyItem()] }))}
          >
            <Plus className="me-2 h-4 w-4" />
            {t("items.add")}
          </Button>
        </div>
        {errors.itemUrl ? <p className="text-sm text-destructive">{errors.itemUrl}</p> : null}
        {!form.items.length ? (
          <p className="text-sm text-muted-foreground">{t("items.empty")}</p>
        ) : (
          form.items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border p-4">
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => {
                    setForm((s) => {
                      const next = [...s.items];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      return { ...s, items: next };
                    });
                  }}
                >
                  {t("items.move_up")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === form.items.length - 1}
                  onClick={() => {
                    setForm((s) => {
                      const next = [...s.items];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      return { ...s, items: next };
                    });
                  }}
                >
                  {t("items.move_down")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }))
                  }
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {t("items.delete")}
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t("items.fields.video")}</FieldLabel>
                  <Input
                    type="url"
                    placeholder="https://"
                    value={item.video}
                    onChange={(e) => updateItem(index, { video: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t("items.fields.subtitle")}</FieldLabel>
                  <Input
                    type="url"
                    placeholder="https://"
                    value={item.subtitle}
                    onChange={(e) => updateItem(index, { subtitle: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t("items.fields.description_ar")}</FieldLabel>
                  <Textarea
                    dir="rtl"
                    rows={3}
                    value={item.description.ar}
                    onChange={(e) => updateItemDescription(index, "ar", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t("items.fields.description_en")}</FieldLabel>
                  <Textarea
                    rows={3}
                    value={item.description.en}
                    onChange={(e) => updateItemDescription(index, "en", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Can anyOf={["services.create", "services.update"]}>
          <Button type="submit" size="lg" disabled={isSaving} className="h-12 gap-2 rounded-full px-12 font-bold">
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("save")}
          </Button>
        </Can>
      </div>
    </form>
  );
}
