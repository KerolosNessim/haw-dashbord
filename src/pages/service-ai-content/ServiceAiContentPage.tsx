import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Can } from "@/features/permissions/components/PermissionGate";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import {
  createServiceAiContent,
  fetchServiceAiContent,
  previewImageFromApiItem,
  updateServiceAiContent,
} from "@/features/service-ai-content/services/service-ai-content-api";
import type {
  ServiceAiContent,
  ServiceAiContentFormItem,
  ServiceAiContentFormValues,
} from "@/features/service-ai-content/types";
import { emptyBilingualSectionImage, type BilingualSectionImage } from "@/lib/bilingual-section-image";
import { getHttpErrorMessage } from "@/lib/http-error-message";

const QUERY_KEY = ["service-ai-content"];

function newClientId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function emptyItem(): ServiceAiContentFormItem {
  return {
    clientId: newClientId(),
    video: "",
    preview_image: emptyBilingualSectionImage(),
  };
}

function emptyForm(): ServiceAiContentFormValues {
  return {
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    items: [],
    is_active: true,
  };
}

function contentToForm(content: ServiceAiContent): ServiceAiContentFormValues {
  return {
    title: { ar: content.title?.ar ?? "", en: content.title?.en ?? "" },
    description: { ar: content.description?.ar ?? "", en: content.description?.en ?? "" },
    items: (content.items ?? []).map((item) => ({
      clientId: newClientId(),
      video: item.video ?? "",
      preview_image: previewImageFromApiItem(item),
    })),
    is_active: content.is_active ?? true,
  };
}

function htmlToPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type FormErrors = {
  title_ar?: string;
  itemVideo?: string;
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
    mutationFn: async (values: ServiceAiContentFormValues) => {
      if (exists) return updateServiceAiContent(values);
      return createServiceAiContent(values);
    },
    onSuccess: () => {
      toast.success(t("toast_saved"));
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => toast.error(getHttpErrorMessage(error, { default: t("toast_error") })),
  });

  if (contentQuery.isError) {
    return (
      <div className="mx-auto max-w-[1200px] py-16 text-center text-destructive">
        {t("load_error")}
      </div>
    );
  }

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
          onSave={(values) => saveMutation.mutate(values)}
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
  onSave: (values: ServiceAiContentFormValues) => void;
}) {
  const [form, setForm] = useState<ServiceAiContentFormValues>(() =>
    initial ? contentToForm(initial) : emptyForm(),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!htmlToPlainText(form.title.ar)) next.title_ar = t("validation.title_ar");
    if (form.items.some((item) => !item.video.trim())) {
      next.itemVideo = t("validation.video_required");
    } else if (form.items.some((item) => !isHttpUrl(item.video))) {
      next.itemUrl = t("validation.url");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateItem = (index: number, patch: Partial<ServiceAiContentFormItem>) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const updateItemPreview = (index: number, next: BilingualSectionImage) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) => {
        if (i !== index) return item;
        const clearPreview = { ar: item.clearPreview?.ar ?? false, en: item.clearPreview?.en ?? false };
        if (typeof item.preview_image.ar === "string" && item.preview_image.ar && !next.ar) {
          clearPreview.ar = true;
        }
        if (typeof item.preview_image.en === "string" && item.preview_image.en && !next.en) {
          clearPreview.en = true;
        }
        return { ...item, preview_image: next, clearPreview };
      }),
    }));
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (!validate()) return;
        onSave(form);
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
            <div className="min-h-[120px] overflow-hidden rounded-xl border">
              <RichTextEditor
                dir="rtl"
                value={form.title.ar}
                onChange={(val) =>
                  setForm((s) => ({
                    ...s,
                    title: { ...s.title, ar: editorOnChangeToHtml(val) },
                  }))
                }
              />
            </div>
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
        </TabsContent>

        <TabsContent value="en" className="space-y-4 rounded-2xl border p-5">
          <Field>
            <FieldLabel>{t("fields.title")}</FieldLabel>
            <div className="min-h-[120px] overflow-hidden rounded-xl border">
              <RichTextEditor
                dir="ltr"
                value={form.title.en}
                onChange={(val) =>
                  setForm((s) => ({
                    ...s,
                    title: { ...s.title, en: editorOnChangeToHtml(val) },
                  }))
                }
              />
            </div>
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
        {errors.itemVideo ? <p className="text-sm text-destructive">{errors.itemVideo}</p> : null}
        {errors.itemUrl ? <p className="text-sm text-destructive">{errors.itemUrl}</p> : null}
        {!form.items.length ? (
          <p className="text-sm text-muted-foreground">{t("items.empty")}</p>
        ) : (
          form.items.map((item, index) => (
            <div key={item.clientId} className="space-y-4 rounded-xl border p-4">
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
              <Field>
                <FieldLabel>{t("items.fields.video")}</FieldLabel>
                <Input
                  type="url"
                  dir="ltr"
                  placeholder="https://"
                  value={item.video}
                  onChange={(e) => updateItem(index, { video: e.target.value })}
                />
              </Field>
              <BilingualSectionImageUpload
                keyPrefix="service_ai_content"
                value={item.preview_image}
                onChange={(next) => updateItemPreview(index, next)}
                required={false}
              />
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
