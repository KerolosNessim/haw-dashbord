import { useEffect, useState } from "react";
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
  parseServiceAiContentResponse,
  previewImageFromApiItem,
  updateServiceAiContent,
} from "@/features/service-ai-content/services/service-ai-content-api";
import { extractLaravelFieldErrors } from "@/features/service-ai-content/utils/form-errors";
import type {
  ServiceAiContent,
  ServiceAiContentFormItem,
  ServiceAiContentFormValues,
} from "@/features/service-ai-content/types";
import {
  emptyBilingualSectionImage,
  type BilingualSectionImage,
} from "@/lib/bilingual-section-image";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { hasRichTextContent } from "@/lib/zod-rich-text";

const QUERY_KEY = ["service-ai-content"];
const MAX_VIDEO_URL = 2048;

function newClientId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyItem(): ServiceAiContentFormItem {
  return {
    clientId: newClientId(),
    video: "",
    preview_image: emptyBilingualSectionImage(),
    clearPreview: { ar: false, en: false },
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
    title: { ...content.title },
    description: { ...content.description },
    is_active: content.is_active,
    items: content.items.map((item, index) => ({
      clientId: `server-${content.id}-${item.sort_order}-${index}`,
      video: item.video,
      preview_image: previewImageFromApiItem(item),
      clearPreview: { ar: false, en: false },
    })),
  };
}

function isValidVideoUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > MAX_VIDEO_URL) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type FormErrors = {
  title_ar?: string;
  title_en?: string;
  itemVideo?: string;
  server?: string;
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
    onSuccess: (res) => {
      toast.success(t("toast_saved"));
      const parsed = parseServiceAiContentResponse(res);
      if (parsed.id) {
        queryClient.setQueryData(QUERY_KEY, parsed);
      } else {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, { default: t("toast_error") }));
    },
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
      ) : contentQuery.isError ? (
        <p className="text-sm text-destructive">{t("load_error")}</p>
      ) : (
        <ServiceAiContentForm
          key={contentQuery.data?.id ?? "new"}
          t={t}
          isCreate={!exists}
          initial={contentQuery.data ?? undefined}
          isSaving={saveMutation.isPending}
          serverFieldErrors={saveMutation.isError ? extractLaravelFieldErrors(saveMutation.error) : {}}
          onSave={(values) => saveMutation.mutate(values)}
        />
      )}
    </div>
  );
}

function ServiceAiContentForm({
  t,
  isCreate,
  initial,
  isSaving,
  serverFieldErrors,
  onSave,
}: {
  t: (key: string) => string;
  isCreate: boolean;
  initial?: ServiceAiContent;
  isSaving: boolean;
  serverFieldErrors: Record<string, string>;
  onSave: (values: ServiceAiContentFormValues) => void;
}) {
  const [form, setForm] = useState<ServiceAiContentFormValues>(() =>
    initial ? contentToForm(initial) : emptyForm(),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  /** Sync from server only when persisted record changes — not on every query object reference. */
  const serverSyncKey = initial
    ? `${initial.id}:${initial.updated_at ?? ""}:${initial.items.length}`
    : null;

  useEffect(() => {
    if (serverSyncKey == null) return;
    setForm(contentToForm(initial!));
    setErrors({});
  }, [serverSyncKey]);

  useEffect(() => {
    if (!Object.keys(serverFieldErrors).length) return;
    setErrors((prev) => ({
      ...prev,
      title_ar: serverFieldErrors["title.ar"] ?? prev.title_ar,
      title_en: serverFieldErrors["title.en"] ?? prev.title_en,
      itemVideo:
        Object.entries(serverFieldErrors).find(([k]) => k.startsWith("items."))?.[1] ??
        prev.itemVideo,
      server: Object.values(serverFieldErrors).join(" · "),
    }));
  }, [serverFieldErrors]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (isCreate && !hasRichTextContent(form.title.ar)) next.title_ar = t("validation.title_ar");
    if (form.items.some((item) => !item.video.trim())) {
      next.itemVideo = t("validation.video_required");
    } else if (form.items.some((item) => !isValidVideoUrl(item.video))) {
      next.itemVideo = t("validation.url");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateItemVideo = (index: number, video: string) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) => (i === index ? { ...item, video } : item)),
    }));
  };

  const updateItemPreview = (index: number, preview_image: BilingualSectionImage) => {
    setForm((state) => ({
      ...state,
      items: state.items.map((item, i) => {
        if (i !== index) return item;
        const clearAr =
          preview_image.ar instanceof File
            ? false
            : preview_image.ar === null && typeof item.preview_image.ar === "string"
              ? true
              : (item.clearPreview?.ar ?? false);
        const clearEn =
          preview_image.en instanceof File
            ? false
            : preview_image.en === null && typeof item.preview_image.en === "string"
              ? true
              : (item.clearPreview?.en ?? false);
        return {
          ...item,
          preview_image,
          clearPreview: { ar: clearAr, en: clearEn },
        };
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
            {errors.title_en ? <p className="text-sm text-destructive">{errors.title_en}</p> : null}
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
        <h2 className="text-lg font-semibold">{t("items.title")}</h2>
        {errors.itemVideo ? <p className="text-sm text-destructive">{errors.itemVideo}</p> : null}
        {errors.server ? <p className="text-sm text-destructive">{errors.server}</p> : null}
        {!form.items.length ? (
          <p className="text-sm text-muted-foreground">{t("items.empty")}</p>
        ) : (
          <div className="space-y-4">
          {form.items.map((item, index) => (
            <ServiceAiContentItemCard
              key={item.clientId}
              t={t}
              index={index}
              item={item}
              total={form.items.length}
              onVideoChange={(video) => updateItemVideo(index, video)}
              onPreviewChange={(preview) => updateItemPreview(index, preview)}
              onMoveUp={() => {
                setForm((s) => {
                  const next = [...s.items];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  return { ...s, items: next };
                });
              }}
              onMoveDown={() => {
                setForm((s) => {
                  const next = [...s.items];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  return { ...s, items: next };
                });
              }}
              onDelete={() =>
                setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== index) }))
              }
            />
          ))}
          </div>
        )}

        <div className="flex justify-center border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm((s) => ({ ...s, items: [...s.items, emptyItem()] }))}
          >
            <Plus className="me-2 h-4 w-4" />
            {t("items.add")}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Can anyOf={["services.create", "services.update"]}>
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="h-12 gap-2 rounded-full px-12 font-bold"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("save")}
          </Button>
        </Can>
      </div>
    </form>
  );
}

function ServiceAiContentItemCard({
  t,
  index,
  item,
  total,
  onVideoChange,
  onPreviewChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  t: (key: string) => string;
  index: number;
  item: ServiceAiContentFormItem;
  total: number;
  onVideoChange: (video: string) => void;
  onPreviewChange: (preview: BilingualSectionImage) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={onMoveUp}>
          {t("items.move_up")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={index === total - 1}
          onClick={onMoveDown}
        >
          {t("items.move_down")}
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="me-2 h-4 w-4" />
          {t("items.delete")}
        </Button>
      </div>

      <Field>
        <FieldLabel>{t("items.fields.video")}</FieldLabel>
        <Input
          type="url"
          placeholder="https://youtube.com/..."
          value={item.video}
          maxLength={MAX_VIDEO_URL}
          onChange={(e) => onVideoChange(e.target.value)}
        />
      </Field>

      <BilingualSectionImageUpload
        value={item.preview_image}
        onChange={onPreviewChange}
        keyPrefix="service_ai_content"
        required={false}
        aspectClass="aspect-video min-h-[160px]"
      />
    </div>
  );
}
