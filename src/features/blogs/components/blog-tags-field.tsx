import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BlogTagFormValue } from "@/features/blogs/types/blog-tag";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const EMPTY_TAG: BlogTagFormValue = { name: "", index: true, follow: true };

type BlogTagsFieldProps = {
  value: BlogTagFormValue[];
  onChange: (tags: BlogTagFormValue[]) => void;
};

export function BlogTagsField({ value, onChange }: BlogTagsFieldProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blogs.form" });
  const tags = value.length ? value : [EMPTY_TAG];

  const updateAt = (index: number, patch: Partial<BlogTagFormValue>) => {
    const next = tags.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeAt = (index: number) => {
    const next = tags.filter((_, i) => i !== index);
    onChange(next.length ? next : [EMPTY_TAG]);
  };

  const addRow = () => {
    onChange([...tags, { ...EMPTY_TAG }]);
  };

  return (
    <Field className="space-y-3">
      <div>
        <FieldLabel>{t("tags")}</FieldLabel>
        <p className="mt-1 text-[11px] text-muted-foreground">{t("tags_seo_hint")}</p>
      </div>

      <div className="space-y-3">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-border/50 bg-muted/10 p-4"
          >
            <div className="flex items-start gap-2">
              <Input
                value={tag.name}
                onChange={(e) => updateAt(index, { name: e.target.value })}
                placeholder={t("tags_name_placeholder")}
                className="h-11 flex-1 rounded-xl border-border/40 bg-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeAt(index)}
                aria-label={t("tags_remove")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2.5">
                <Label className="text-xs font-semibold">{t("tags_index")}</Label>
                <Switch
                  dir="ltr"
                  checked={tag.index}
                  onCheckedChange={(checked) => updateAt(index, { index: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2.5">
                <Label className="text-xs font-semibold">{t("tags_follow")}</Label>
                <Switch
                  dir="ltr"
                  checked={tag.follow}
                  onCheckedChange={(checked) => updateAt(index, { follow: checked })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={addRow}
      >
        <Plus className="me-2 h-4 w-4" />
        {t("tags_add")}
      </Button>
    </Field>
  );
}
