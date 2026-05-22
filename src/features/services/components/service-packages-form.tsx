import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Package, ListChecks, ImagePlus, X } from "lucide-react";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedDescriptionFields } from "@/features/shared/components/localized-description-fields";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

function editorNotEmpty(val: unknown): boolean {
  if (val == null || val === "") return false;
  if (typeof val === "string") {
    const text = val.replace(/<[^>]*>/g, "").trim();
    return text.length > 0;
  }
  if (typeof val === "object" && val !== null && "isEmpty" in val) {
    return !(val as { isEmpty?: boolean }).isEmpty;
  }
  return false;
}

const localizedEditorSchema = z.object({
  ar: z.any().refine(editorNotEmpty, { message: "validation.required" }),
  en: z.any().refine(editorNotEmpty, { message: "validation.required" }),
});

const packageItemSchema = z.object({
  title: localizedSchema,
  description: localizedEditorSchema,
  image: z.any().nullable().optional(),
  image_alt: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  price: z.coerce.number().min(0),
  currency: z.string().min(1),
  features: z.object({
    ar: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1),
  }),
});

const packagesSchema = z.object({
  title: localizedSchema,
  description: z
    .object({ ar: z.string().optional(), en: z.string().optional() })
    .optional(),
  items: z.array(packageItemSchema).min(1),
});

export type ServicePackagesValues = z.infer<typeof packagesSchema>;

export interface ServicePackagesFormHandle {
  validate: () => Promise<ServicePackagesValues | null>;
}

interface ServicePackagesFormProps {
  initialData?: Record<string, unknown>;
}

const ServicePackagesForm = forwardRef<
  ServicePackagesFormHandle,
  ServicePackagesFormProps
>(function ServicePackagesForm({ initialData }, ref) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const {
    control,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServicePackagesValues>({
    resolver: zodResolver(packagesSchema),
    values: {
      title: (initialData?.title as ServicePackagesValues["title"]) || {
        ar: "",
        en: "",
      },
      description: (initialData?.description as ServicePackagesValues["description"]) || {
        ar: "",
        en: "",
      },
      items: (initialData?.items as ServicePackagesValues["items"]) || [
        {
          title: { ar: "", en: "" },
          description: { ar: null, en: null },
          image: null,
          image_alt: { ar: "", en: "" },
          price: 0,
          currency: "OMR",
          features: { ar: [""], en: [""] },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const valid = await trigger();
      if (!valid) return null;
      const values = getValues();
      return {
        ...values,
        items: values.items.map((item) => ({
          ...item,
          description: {
            ar: editorOnChangeToHtml(item.description?.ar),
            en: editorOnChangeToHtml(item.description?.en),
          },
        })),
      };
    },
  }));

  const translateError = (message?: string) =>
    message?.includes("validation.") ? t(message) : message;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-[24px] border border-dashed bg-muted/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary/60">
            {t("arabic")} — {t("sections.fields.title")}
          </div>
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <Input {...field} dir="rtl" className="h-12 rounded-xl bg-background" />
                <FieldError
                  errors={[
                    { message: translateError(errors.title?.ar?.message) },
                  ]}
                />
              </Field>
            )}
          />
        </div>
        <div className="space-y-6 rounded-[24px] border border-dashed bg-muted/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary/60">
            {t("english")} — {t("sections.fields.title")}
          </div>
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <Input {...field} dir="ltr" className="h-12 rounded-xl bg-background" />
                <FieldError
                  errors={[
                    { message: translateError(errors.title?.en?.message) },
                  ]}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <LocalizedDescriptionFields
        control={control}
        nameAr="description.ar"
        nameEn="description.en"
        labelAr={`${t("packages_description")} (AR)`}
        labelEn={`${t("packages_description")} (EN)`}
        minHeightClass="min-h-[160px]"
      />

      <div className="space-y-6">
        <h3 className="flex items-center gap-2 px-2 text-xl font-bold">
          <Package className="h-5 w-5 text-primary" />
          {t("sections.types.packages")}
        </h3>

        <div className="space-y-8">
          {fields.map((field, index) => (
            <PackageItem
              key={field.id}
              index={index}
              control={control}
              setValue={setValue}
              watch={watch}
              onRemove={() => remove(index)}
              showRemove={fields.length > 1}
              itemErrors={errors.items?.[index]}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-16 w-full rounded-[24px] border-2 border-dashed hover:bg-primary/5"
            onClick={() =>
              append({
                title: { ar: "", en: "" },
                description: { ar: null, en: null },
                image: null,
                image_alt: { ar: "", en: "" },
                price: 0,
                currency: "OMR",
                features: { ar: [""], en: [""] },
              })
            }
          >
            <Plus className="mr-2 h-5 w-5" />
            {t("sections.fields.add_item")}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ServicePackagesForm;

function PackageItem({
  index,
  control,
  setValue,
  watch,
  onRemove,
  showRemove,
  itemErrors,
}: {
  index: number;
  control: ReturnType<typeof useForm<ServicePackagesValues>>["control"];
  setValue: ReturnType<typeof useForm<ServicePackagesValues>>["setValue"];
  watch: ReturnType<typeof useForm<ServicePackagesValues>>["watch"];
  onRemove: () => void;
  showRemove: boolean;
  itemErrors?: {
    title?: { ar?: { message?: string }; en?: { message?: string } };
    description?: { ar?: { message?: string }; en?: { message?: string } };
  };
}) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const translateError = (message?: string) =>
    message?.includes("validation.") ? t(message) : message;

  const imageValue = watch(`items.${index}.image`);
  const [preview, setPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageValue instanceof File) return;
    setPreview(typeof imageValue === "string" && imageValue ? imageValue : null);
  }, [imageValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue(`items.${index}.image`, file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setValue(`items.${index}.image`, null);
    setPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const { fields: arFeatures, append: appendAr, remove: removeAr } = useFieldArray({
    control,
    name: `items.${index}.features.ar`,
  });

  const { fields: enFeatures, append: enAppend, remove: enRemove } = useFieldArray({
    control,
    name: `items.${index}.features.en`,
  });

  return (
    <div className="relative space-y-8 rounded-[32px] border bg-card/50 p-8">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
          {t("package_number", { n: index + 1 })}
        </span>
        {showRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Controller
            name={`items.${index}.title.ar`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-[10px] uppercase opacity-40">
                  {t("arabic")} — {t("sections.fields.title")}
                </FieldLabel>
                <Input {...field} dir="rtl" className="h-11 rounded-xl bg-muted/5" />
                <FieldError
                  errors={[
                    {
                      message: translateError(itemErrors?.title?.ar?.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name={`items.${index}.description.ar`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-[10px] uppercase opacity-40">
                  {t("arabic")} — {t("sections.fields.description")}
                </FieldLabel>
                <div className="min-h-[160px] rounded-xl border overflow-hidden">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      if (field.value !== html) field.onChange(html || null);
                    }}
                    dir="rtl"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: translateError(itemErrors?.description?.ar?.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name={`items.${index}.price`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("price")}</FieldLabel>
                  <Input {...field} type="number" className="h-11 rounded-xl bg-muted/5" />
                </Field>
              )}
            />
            <Controller
              name={`items.${index}.currency`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("currency")}</FieldLabel>
                  <Input {...field} className="h-11 rounded-xl bg-muted/5" />
                </Field>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Controller
            name={`items.${index}.title.en`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-[10px] uppercase opacity-40">
                  {t("english")} — {t("sections.fields.title")}
                </FieldLabel>
                <Input {...field} dir="ltr" className="h-11 rounded-xl bg-muted/5" />
                <FieldError
                  errors={[
                    {
                      message: translateError(itemErrors?.title?.en?.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name={`items.${index}.description.en`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-[10px] uppercase opacity-40">
                  {t("english")} — {t("sections.fields.description")}
                </FieldLabel>
                <div className="min-h-[160px] rounded-xl border overflow-hidden">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => {
                      const html = editorOnChangeToHtml(val);
                      if (field.value !== html) field.onChange(html || null);
                    }}
                    dir="ltr"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: translateError(itemErrors?.description?.en?.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="space-y-6 border-t pt-6">
        <p className="text-sm font-bold opacity-60">{t("package_image")}</p>
        <div
          className={cn(
            "relative mx-auto flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all",
            preview
              ? "border-primary/20"
              : "border-border hover:border-primary/40",
          )}
          onClick={() => !preview && imageInputRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all hover:opacity-100">
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-red-500 text-white shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6">
              <ImagePlus className="h-8 w-8 opacity-20" />
              <p className="text-[10px] font-bold opacity-30">{t("upload_cover")}</p>
            </div>
          )}
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name={`items.${index}.image_alt.ar`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("image_alt_ar")}</FieldLabel>
                <Input
                  {...field}
                  dir="rtl"
                  className="h-11 rounded-xl bg-muted/5"
                  placeholder={t("placeholders.image_alt")}
                />
              </Field>
            )}
          />
          <Controller
            name={`items.${index}.image_alt.en`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("image_alt_en")}</FieldLabel>
                <Input
                  {...field}
                  dir="ltr"
                  className="h-11 rounded-xl bg-muted/5"
                  placeholder={t("placeholders.image_alt")}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center gap-2 text-sm font-bold opacity-60">
          <ListChecks className="h-4 w-4" />
          {t("sections.fields.features")}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <FeatureList
            locale="ar"
            fields={arFeatures}
            control={control}
            index={index}
            localeKey="ar"
            onAppend={() => appendAr("")}
            onRemove={removeAr}
            addLabel={t("add_feature")}
          />
          <FeatureList
            locale="en"
            fields={enFeatures}
            control={control}
            index={index}
            localeKey="en"
            onAppend={() => enAppend("")}
            onRemove={enRemove}
            addLabel={t("add_feature")}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureList({
  locale,
  fields,
  control,
  index,
  localeKey,
  onAppend,
  onRemove,
  addLabel,
}: {
  locale: "ar" | "en";
  fields: { id: string }[];
  control: ReturnType<typeof useForm<ServicePackagesValues>>["control"];
  index: number;
  localeKey: "ar" | "en";
  onAppend: () => void;
  onRemove: (i: number) => void;
  addLabel: string;
}) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase opacity-40">
        {locale === "ar" ? t("arabic") : t("english")}
      </p>
      {fields.map((f, fi) => (
        <div key={f.id} className="flex gap-2">
          <Controller
            name={`items.${index}.features.${localeKey}.${fi}`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="h-9 rounded-lg bg-muted/5 text-xs"
                placeholder={t("feature_placeholder")}
              />
            )}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => onRemove(fi)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-full border border-dashed text-[10px]"
        onClick={onAppend}
      >
        <Plus className="mr-1 h-3 w-3" />
        {addLabel}
      </Button>
    </div>
  );
}
