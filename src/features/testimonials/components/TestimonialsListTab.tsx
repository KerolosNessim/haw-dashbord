import {
  AlignLeft,
  Image as ImageIcon,
  Languages,
  Plus,
  Save,
  Star,
  Trash2,
  User,
  X,
  Loader2,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTestimonialsList } from "../hooks/useTestimonialsList";

interface TestimonialItem {
  id?: number;
  name_ar: string;
  name_en: string;
  job_ar: string;
  job_en: string;
  content_ar: string;
  content_en: string;
  rate: number;
  image: string | File | null;
}

type TestimonialsFormValues = {
  items: TestimonialItem[];
};

/**
 * TestimonialsListTab Component
 * 
 * Manages the list of individual customer testimonials with bulk editing.
 */
export default function TestimonialsListTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "testimonials.list",
  });

  const { getListQuery, updateList, isPending } = useTestimonialsList();
  const apiTestimonials = getListQuery.data?.data?.testimonials ?? [];
  console.log(apiTestimonials);
  

  const { control, handleSubmit } = useForm<TestimonialsFormValues>({
    values: {
      items: apiTestimonials.length > 0 
        ? apiTestimonials.map((item) => {
            const name = item.content?.name ?? item.name;
            const job = item.content?.job_title ?? item.job_title;
            const content = item.content?.content ?? item.description;
            
            return {
              id: item.id,
              name_ar: typeof name === 'object' ? name.ar : (name ?? ""),
              name_en: typeof name === 'object' ? name.en : (name ?? ""),
              job_ar: typeof job === 'object' ? job.ar : (job ?? ""),
              job_en: typeof job === 'object' ? job.en : (job ?? ""),
              content_ar: typeof content === 'object' ? content.ar : (content ?? ""),
              content_en: typeof content === 'object' ? content.en : (content ?? ""),
              rate: item.rate ?? 5,
              image: item.image,
            };
          })
        : [{
            name_ar: "",
            name_en: "",
            job_ar: "",
            job_en: "",
            content_ar: "",
            content_en: "",
            rate: 5,
            image: null
          }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data: TestimonialsFormValues) => {
    const formData = new FormData();
    
    data.items.forEach((item, index) => {
      // Send ID if it exists, otherwise send null as per request shape
      formData.append(`testimonials[${index}][id]`, item.id ? String(item.id) : "");
      
      formData.append(`testimonials[${index}][name][ar]`, item.name_ar);
      formData.append(`testimonials[${index}][name][en]`, item.name_en);
      formData.append(`testimonials[${index}][job_title][ar]`, item.job_ar);
      formData.append(`testimonials[${index}][job_title][en]`, item.job_en);
      formData.append(`testimonials[${index}][content][ar]`, item.content_ar);
      formData.append(`testimonials[${index}][content][en]`, item.content_en);
      formData.append(`testimonials[${index}][rate]`, String(item.rate));
      
      if (item.image instanceof File) {
        formData.append(`testimonials[${index}][image]`, item.image);
      }
    });

    updateList(formData);
  };

  if (getListQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => append({
            name_ar: "",
            name_en: "",
            job_ar: "",
            job_en: "",
            content_ar: "",
            content_en: "",
            rate: 5,
            image: null
          })}
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          {t("add_testimonial")}
        </Button>
      </div>

      {/* Testimonials List */}
      <div className="space-y-12">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group relative bg-muted/5 rounded-[40px] border border-border/60 p-8 md:p-10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
          >
            {/* Remove Button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
              className="absolute -top-4 -right-4 rounded-full w-12 h-12 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Image Upload Column */}
              <div className="lg:col-span-3">
                <Controller
                  name={`items.${index}.image`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="space-y-4">
                      <FieldLabel className="text-sm font-bold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        {t("image")}
                      </FieldLabel>
                      
                      <div 
                        className={cn(
                          "relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden bg-white flex flex-col items-center justify-center cursor-pointer group/img",
                          value ? "border-primary/20" : "border-border hover:border-primary/40"
                        )}
                        onClick={() => {
                          const input = document.getElementById(`file-input-${index}`);
                          input?.click();
                        }}
                      >
                        {value ? (
                          <>
                            <img 
                              src={typeof value === 'string' ? value : URL.createObjectURL(value as Blob)} 
                              className="w-full h-full object-cover" 
                              alt="Preview" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChange(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <Plus className="w-8 h-8 text-muted-foreground/40" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {t("upload_image")}
                            </p>
                          </div>
                        )}
                        <input
                          id={`file-input-${index}`}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange(file);
                          }}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Form Fields Column */}
              <div className="lg:col-span-9 space-y-8">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`items.${index}.name_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-start">
                          ({t("ar")}) {t("name")}
                          <User className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="rtl"
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.name_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {t("name")} ({t("en")})
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                </div>

                {/* Job Titles & Rate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Controller
                    name={`items.${index}.job_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-start">
                          ({t("ar")}) {t("job_title")}
                          <Languages className="w-4 h-4 text-primary/60" />
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="rtl"
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.job_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <Languages className="w-4 h-4 text-primary/60" />
                          {t("job_title")} ({t("en")})
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.rate`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {t("rate") ?? "Rate"} (1-5)
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={5}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                      </Field>
                    )}
                  />
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`items.${index}.content_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 justify-start">
                          ({t("ar")}) {t("content")}
                          <AlignLeft className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Textarea
                          {...field}
                          dir="rtl"
                          placeholder="..."
                          className="min-h-[100px] rounded-xl bg-white border-border/60 resize-none"
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.content_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-primary" />
                          {t("content")} ({t("en")})
                        </FieldLabel>
                        <Textarea
                          {...field}
                          placeholder="..."
                          className="min-h-[100px] rounded-xl bg-white border-border/60 resize-none"
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-10 border-t flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="rounded-2xl h-16 px-16 font-black text-xl gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
