import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, ImagePlus, X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveFullSection } from "@/features/services/services/section-api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const fullSectionSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
  image: z.any().refine(file => !!file, { message: "validation.required" }),
  items: z.array(z.object({
    title: localizedSchema,
    description: localizedSchema,
  })).optional(),
});

type FullSectionValues = z.infer<typeof fullSectionSchema>;

interface FullSectionProps {
  serviceId: number;
  initialData?: any;
}

export default function FullSection({ serviceId, initialData }: FullSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FullSectionValues>({
    resolver: zodResolver(fullSectionSchema),
    defaultValues: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: "", en: "" },
      image: initialData?.image || null,
      items: initialData?.items || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setValue("image", null, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FullSectionValues) => {
    setIsSubmitting(true);
    try {
      const res = await saveFullSection(serviceId, data);
      toast.success(res?.data?.message || "Section Saved!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving section");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 animate-in fade-in duration-500">
      <div className=" space-y-4-6">
        {/* Localization Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
           {/* Arabic Content */}
           <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
            <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
              {t("arabic")}
            </div>
            <Controller
              name="title.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.title")}</FieldLabel>
                  <Input {...field} dir="rtl" placeholder={t("placeholders.title")} className="h-12 rounded-xl bg-background border-border/50" />
                  <FieldError errors={[{ message: errors.title?.ar?.message ? t(errors.title.ar.message as any) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                    <Textarea {...field} dir="rtl" placeholder={t("placeholders.description")} />
                  <FieldError errors={[{ message: errors.description?.ar?.message ? t(errors.description.ar.message as any) : undefined }]} />
                </Field>
              )}
            />
          </div>

          {/* English Content */}
          <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
            <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
              {t("english")}
            </div>
            <Controller
              name="title.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.title")}</FieldLabel>
                  <Input {...field} dir="ltr" placeholder={t("placeholders.title")} className="h-12 rounded-xl bg-background border-border/50" />
                  <FieldError errors={[{ message: errors.title?.en?.message ? t(errors.title.en.message as any) : undefined }]} />
                </Field>
              )}
            />
            <Controller
              name="description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                    <Textarea {...field} dir="ltr" placeholder={t("placeholders.description")} />
                  <FieldError errors={[{ message: errors.description?.en?.message ? t(errors.description.en.message as any) : undefined }]} />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Right: Image Upload Area */}
        <div className="space-y-6">
          <FieldLabel className="text-sm font-bold flex items-center gap-2 px-2">
            <ImageIcon className="w-5 h-5 text-primary" /> {t("sections.fields.image")}
          </FieldLabel>
          <div 
            className={cn(
              "relative group overflow-hidden rounded-[40px] border-2 border-dashed transition-all h-full min-h-[400px]",
              imagePreview ? "border-primary/20 bg-background shadow-xl" : "border-border hover:border-primary/40 flex flex-col items-center justify-center bg-muted/10 cursor-pointer"
            )}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
             {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                  <Button type="button" size="icon" className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 shadow-xl transition-all" onClick={removeImage}>
                    <X className="w-6 h-6" />
                  </Button>
                  <Button type="button" variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-xl hover:scale-110 transition-all" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <ImagePlus className="w-6 h-6" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
                  <ImagePlus className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">{t("upload_image")}</p>
                  <p className="text-xs opacity-40 uppercase tracking-widest">{t("sections.fields.image_placeholder")}</p>
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>
          <FieldError errors={[{ message: errors.image?.message ? t(errors.image.message as any) : undefined }]} />
        </div>
      </div>

      {/* Additional Items Repeater */}
      <div className="pt-12 border-t space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> {t("sections.fields.items_list")}
          </h3>
          <Button type="button" variant="outline" size="sm" className="rounded-full h-10 gap-2 border-primary/20 hover:bg-primary/5 shadow-sm" onClick={() => append({ title: { ar: "", en: "" }, description: { ar: "", en: "" } })}>
            <Plus className="w-4 h-4" /> {t("sections.fields.add_item")}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {fields.map((field, index) => (
            <div key={field.id} className="relative group/item p-8 rounded-[32px] border bg-card/50 shadow-sm space-y-8 animate-in zoom-in-95 duration-500">
               <div className="flex justify-between items-center">
                <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Step #{index + 1}
                </div>
                <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg hover:scale-110 transition-all" onClick={() => remove(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Arabic Item */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{t("arabic")}</div>
                  <Controller
                    name={`items.${index}.title.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">{t("sections.fields.title")}</FieldLabel>
                        <Input {...field} dir="rtl" placeholder={t("placeholders.title")} className="h-11 rounded-xl bg-muted/5 border-border/40 font-bold" />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.description.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">{t("sections.fields.content")}</FieldLabel>
                        <Textarea {...field} dir="rtl" placeholder={t("placeholders.description")} className="rounded-xl bg-muted/5 border-border/40 min-h-[80px]" />
                      </Field>
                    )}
                  />
                </div>

                {/* English Item */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{t("english")}</div>
                  <Controller
                    name={`items.${index}.title.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">{t("sections.fields.title")}</FieldLabel>
                        <Input {...field} dir="ltr" placeholder={t("placeholders.title")} className="h-11 rounded-xl bg-muted/5 border-border/40 font-bold" />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.description.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs">{t("sections.fields.content")}</FieldLabel>
                        <Textarea {...field} dir="ltr" placeholder={t("placeholders.description")} className="rounded-xl bg-muted/5 border-border/40 min-h-[80px]" />
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="rounded-full h-14 px-12 font-bold text-lg gap-3 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {t("save_section")}
        </Button>
      </div>
    </form>
  );
}
