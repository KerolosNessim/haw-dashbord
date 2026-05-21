import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Package, ListChecks } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const packageItemSchema = z.object({
  title: localizedSchema,
  description: z.object({ ar: z.string().optional(), en: z.string().optional() }).optional(),
  price: z.coerce.number().min(0),
  currency: z.string().min(1),
  features: z.object({
    ar: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1),
  }),
});

const packagesSchema = z.object({
  title: localizedSchema,
  description: z.object({ ar: z.string().optional(), en: z.string().optional() }).optional(),
  items: z.array(packageItemSchema).min(1),
});

type PackagesValues = z.infer<typeof packagesSchema>;

interface PackagesSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  initialData?: any;
}

export default function PackagesSection({
  initialData,
  embedded,
  onDataChange,
}: PackagesSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const { control, watch, getValues, formState: { errors } } = useForm<PackagesValues>({
    resolver: zodResolver(packagesSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      items: initialData?.items || [{ 
        title: { ar: "", en: "" }, 
        price: 0, 
        currency: "OMR", 
        features: { ar: [""], en: [""] } 
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Title */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("arabic")} - {t("sections.fields.title")}
          </div>
          <Controller
            name="title.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <Input {...field} dir="rtl" placeholder="عنوان السيكشن" className="h-12 rounded-xl bg-background" />
                <FieldError errors={[{ message: errors.title?.ar?.message }]} />
              </Field>
            )}
          />
        </div>
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("english")} - {t("sections.fields.title")}
          </div>
          <Controller
            name="title.en"
            control={control}
            render={({ field }) => (
              <Field>
                <Input {...field} dir="ltr" placeholder="Section Title" className="h-12 rounded-xl bg-background" />
                <FieldError errors={[{ message: errors.title?.en?.message }]} />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Controller
          name="description.ar"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>packages_description (AR)</FieldLabel>
              <Textarea {...field} dir="rtl" className="min-h-[80px] rounded-xl" />
            </Field>
          )}
        />
        <Controller
          name="description.en"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>packages_description (EN)</FieldLabel>
              <Textarea {...field} dir="ltr" className="min-h-[80px] rounded-xl" />
            </Field>
          )}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          <Package className="w-5 h-5 text-primary" /> {t("sections.types.packages")}
        </h3>
        
        <div className="space-y-8">
          {fields.map((field, index) => (
            <PackageItem 
              key={field.id} 
              index={index} 
              control={control} 
              onRemove={() => remove(index)} 
              showRemove={fields.length > 1}
              errors={errors.items?.[index]}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-[24px] border-dashed h-16 border-2 hover:bg-primary/5 transition-all"
            onClick={() => append({ 
              title: { ar: "", en: "" }, 
              price: 0, 
              currency: "OMR", 
              features: { ar: [""], en: [""] } 
            })}
          >
            <Plus className="w-5 h-5 mr-2" /> {t("sections.fields.add_item")}
          </Button>
        </div>
      </div>

    </div>
  );
}

function PackageItem({ index, control, onRemove, showRemove, errors }: any) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  
  const { fields: arFeatures, append: appendAr, remove: removeAr } = useFieldArray({
    control,
    name: `items.${index}.features.ar`,
  });

  const { fields: enFeatures, append: enAppend, remove: enRemove } = useFieldArray({
    control,
    name: `items.${index}.features.en`,
  });

  return (
    <div className="p-8 rounded-[32px] border bg-card/50 space-y-8 relative group">
      <div className="flex justify-between items-center">
        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Package #{index + 1}
        </span>
        {showRemove && (
          <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Basic Info */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <Controller
              name={`items.${index}.title.ar`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("arabic")} - {t("sections.fields.title")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-11 rounded-xl bg-muted/5" />
                </Field>
              )}
            />
            <Controller
              name={`items.${index}.title.en`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("english")} - {t("sections.fields.title")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-11 rounded-xl bg-muted/5" />
                </Field>
              )}
            />
          </div>

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

        {/* Features Repeater */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold opacity-60">
            <ListChecks className="w-4 h-4" /> {t("sections.fields.features")}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Arabic Features */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase opacity-40 font-bold">{t("arabic")}</p>
              {arFeatures.map((f, fi) => (
                <div key={f.id} className="flex gap-2">
                  <Controller
                    name={`items.${index}.features.ar.${fi}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} dir="rtl" className="h-9 rounded-lg bg-muted/5 text-xs" placeholder="ميزة..." />
                    )}
                  />
                  {arFeatures.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeAr(fi)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="text-[10px] h-8 w-full border-dashed border" onClick={() => appendAr("")}>
                <Plus className="w-3 h-3 mr-1" /> إضافة ميزة
              </Button>
            </div>

            {/* English Features */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase opacity-40 font-bold">{t("english")}</p>
              {enFeatures.map((f, fi) => (
                <div key={f.id} className="flex gap-2">
                  <Controller
                    name={`items.${index}.features.en.${fi}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} dir="ltr" className="h-9 rounded-lg bg-muted/5 text-xs" placeholder="Feature..." />
                    )}
                  />
                  {enFeatures.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => enRemove(fi)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="text-[10px] h-8 w-full border-dashed border" onClick={() => enAppend("")}>
                <Plus className="w-3 h-3 mr-1" /> Add Feature
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
