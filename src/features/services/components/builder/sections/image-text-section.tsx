import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { saveImageTextSection } from "@/features/services/services/section-api";
import RichTextEditor from "@/features/shared/components/editor";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().min(1, { message: "validation.required" }),
});

const localizedEditorSchema = z.object({
  ar: z.any().refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z.any().refine((val) => val && !val.isEmpty, { message: "validation.required" }),
});

const imageTextSchema = z.object({
  title: localizedSchema,
  description: localizedEditorSchema,
  image: z.any().refine(file => !!file, { message: "validation.required" }),
});

type ImageTextValues = z.infer<typeof imageTextSchema>;

interface ImageTextSectionProps {
  serviceId: number;
  index: number;
  initialData?: any;
}

export default function ImageTextSection({ serviceId, initialData }: ImageTextSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ImageTextValues>({
    resolver: zodResolver(imageTextSchema),
    defaultValues: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: null, en: null },
      image: initialData?.image || null,
    },
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

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ImageTextValues) => {
    setIsSubmitting(true);
    try {
      const finalData = {
        ...data,
        description: {
          ar: data.description.ar?.html || "",
          en: data.description.en?.html || "",
        }
      };
      
      const res = await saveImageTextSection(serviceId, finalData);
      console.log(res);
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
                <div className="min-h-[200px]">
                  <RichTextEditor 
                    value={field.value} 
                    onChange={field.onChange} 
                    dir="rtl" 
                    placeholder={t("placeholders.description")}
                  />
                </div>
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
                <div className="min-h-[200px]">
                  <RichTextEditor 
                    value={field.value} 
                    onChange={field.onChange} 
                    dir="ltr" 
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError errors={[{ message: errors.description?.en?.message ? t(errors.description.en.message as any) : undefined }]} />
              </Field>
            )}
          />
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="space-y-4 mx-auto w-full">
        <FieldLabel className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" /> {t("sections.fields.image")}
        </FieldLabel>
        <div 
          className={cn(
            "relative group overflow-hidden rounded-[32px] border-2 border-dashed transition-all",
            imagePreview ? "border-primary/20 aspect-video shadow-lg" : "border-border hover:border-primary/40 min-h-[300px] flex flex-col items-center justify-center bg-muted/10 cursor-pointer"
          )}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                <Button type="button" size="icon" className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 transition-colors shadow-xl" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                  <X className="w-6 h-6" />
                </Button>
                <Button type="button" variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-xl" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <ImagePlus className="w-6 h-6" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary animate-bounce-slow">
                <ImagePlus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">{t("upload_image")}</p>
                <p className="text-xs opacity-40 uppercase tracking-tighter">Recommended size: 1200x800px</p>
              </div>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        <FieldError errors={[{ message: errors.image?.message ? t(errors.image.message as any) : undefined }]} />
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
