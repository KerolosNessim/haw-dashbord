import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Save, Image as ImageIcon, Search, Info, Settings2, FileText, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import RichTextEditor from "@/features/shared/components/editor";

const blogSchema = z.object({
  title: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().min(1, { message: "validation.required" }),
  }),
  subtitle: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().min(1, { message: "validation.required" }),
  }),
  content: z.object({
    ar: z.string().min(1, { message: "validation.required" }),
    en: z.string().min(1, { message: "validation.required" }),
  }),
  publisher_name: z.string().min(1, { message: "validation.required" }),
  tags: z.string().optional(),
  category_id: z.string().min(1, { message: "validation.required" }),
  image_alt: z.string().optional(),
  is_active: z.boolean().default(true),
  pub_status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  meta_title: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
  meta_description: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
  }),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function CreateBlogForm() {
  const { t } = useTranslation("translation", { keyPrefix: "blogs.form" });
  const { t: commonT } = useTranslation("translation");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: { ar: "", en: "" },
      subtitle: { ar: "", en: "" },
      content: { ar: "", en: "" },
      publisher_name: "",
      tags: "",
      category_id: "",
      image_alt: "",
      is_active: true,
      pub_status: "draft",
      meta_title: { ar: "", en: "" },
      meta_description: { ar: "", en: "" },
    },
  });

  const onSubmit = (data: BlogFormValues) => {
    console.log("Blog Data:", data);
  };
                  const [preview, setPreview] = useState<string | null>(null);

                  const handleFileChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                      // In a real app, you'd pass the file object to react-hook-form
                      // onChange(file);
                    }
                  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Basic Info Card */}
          <div className="p-8 rounded-[32px] border bg-white shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{t("basic_info")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Controller
                name="title.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("title_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                    <FieldError errors={[{ message: errors.title?.ar?.message ? commonT(errors.title.ar.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="title.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("title_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                    <FieldError errors={[{ message: errors.title?.en?.message ? commonT(errors.title.en.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="subtitle.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("subtitle_ar")}</FieldLabel>
                    <Input {...field} dir="rtl" className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                    <FieldError errors={[{ message: errors.subtitle?.ar?.message ? commonT(errors.subtitle.ar.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="subtitle.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("subtitle_en")}</FieldLabel>
                    <Input {...field} dir="ltr" className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                    <FieldError errors={[{ message: errors.subtitle?.en?.message ? commonT(errors.subtitle.en.message) : undefined }]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("category")}</FieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/10 border-border/40">
                        <SelectValue placeholder={commonT("services.form.country_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="1">{commonT("blogs.categories.accessories")}</SelectItem>
                        <SelectItem value="2">{commonT("blogs.categories.chilled")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[{ message: errors.category_id?.message ? commonT(errors.category_id.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="publisher_name"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("publisher")}</FieldLabel>
                    <Input {...field} className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                    <FieldError errors={[{ message: errors.publisher_name?.message ? commonT(errors.publisher_name.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("tags")}</FieldLabel>
                    <Input {...field} placeholder={t("tags_hint")} className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-white" />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Content Card */}
          <div className="p-8 rounded-[32px] border bg-white shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{t("content_label")}</h2>
            </div>

            <div className="space-y-12">
              <Controller
                name="content.ar"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2 mb-4">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       {t("content_ar")}
                    </FieldLabel>
                    <RichTextEditor
                      dir="rtl"
                      value={field.value}
                      placeholder={t("content_ar")}
                      onChange={(val: any) => field.onChange(val.html)}
                    />
                    <FieldError errors={[{ message: errors.content?.ar?.message ? commonT(errors.content.ar.message) : undefined }]} />
                  </Field>
                )}
              />
              <Controller
                name="content.en"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="flex items-center gap-2 mb-4">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       {t("content_en")}
                    </FieldLabel>
                    <RichTextEditor
                      dir="ltr"
                      value={field.value}
                      placeholder={t("content_en")}
                      onChange={(val: any) => field.onChange(val.html)}
                    />
                    <FieldError errors={[{ message: errors.content?.en?.message ? commonT(errors.content.en.message) : undefined }]} />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media & Status */}
        <div className="lg:col-span-4 space-y-8">
          {/* Status Card */}
          <div className="p-8 rounded-[32px] border bg-white shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{t("status_label")}</h2>
            </div>

            <div className="space-y-6">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/40">
                    <Label className="font-bold text-sm cursor-pointer" htmlFor="is_active">{t("is_active")}</Label>
                    <Switch dir="ltr" id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <Controller
                name="pub_status"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <Label className="font-bold text-sm">{t("pub_status")}</Label>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-2"
                    >
                      {["draft", "published", "scheduled"].map((status) => (
                        <div key={status} className="flex items-center space-x-2 space-x-reverse border p-3 rounded-xl hover:bg-muted/10 transition-colors">
                          <RadioGroupItem value={status} id={status} />
                          <Label htmlFor={status} className="flex-1 cursor-pointer font-medium ms-2">{commonT("blogs." + (status === "draft" ? "inactive_blogs" : "active_blogs"))}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Media Card */}
          <div className="p-8 rounded-[32px] border bg-white shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b pb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{t("media_label")}</h2>
            </div>

            <div className="space-y-6">
               <Controller
                name="image_alt"
                control={control}
                render={({ field: { onChange, value, ...field } }) => {


                  return (
                    <div className="space-y-6">
                      <div 
                        className="relative aspect-video rounded-[24px] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-primary/10 transition-all overflow-hidden"
                        onClick={() => document.getElementById('blog-image-input')?.click()}
                      >
                        {preview ? (
                          <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Button 
                                 type="button" 
                                 variant="destructive" 
                                 size="sm" 
                                 className="rounded-full px-4 h-9"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setPreview(null);
                                 }}
                               >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {commonT("services.delete_service")}
                               </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Plus className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-primary/60">{commonT("services.form.upload_image")}</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          id="blog-image-input" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>

                      <Field>
                        <FieldLabel>{t("image_alt")}</FieldLabel>
                        <Input 
                          {...field} 
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          className="h-11 rounded-xl bg-muted/10 border-border/40 focus:bg-white" 
                        />
                      </Field>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section: Full Width at the Bottom */}
      <div className="p-8 rounded-[32px] border bg-white shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b pb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">{t("seo_label")}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* AR SEO */}
          <div className="space-y-6 p-6 rounded-[24px] bg-muted/5 border border-dashed">
            <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest">
               <Globe className="w-4 h-4" /> {commonT("services.form.arabic")} SEO
            </div>
            <Controller
              name="meta_title.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_title_ar")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-12 rounded-2xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_ar")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[120px] rounded-[24px] bg-white border-border/40 resize-none" />
                </Field>
              )}
            />
          </div>

          {/* EN SEO */}
          <div className="space-y-6 p-6 rounded-[24px] bg-muted/5 border border-dashed">
            <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest">
               <Globe className="w-4 h-4" /> {commonT("services.form.english")} SEO
            </div>
            <Controller
              name="meta_title.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_title_en")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-2xl bg-white border-border/40" />
                </Field>
              )}
            />
            <Controller
              name="meta_description.en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("meta_description_en")}</FieldLabel>
                  <Textarea {...field} dir="ltr" className="min-h-[120px] rounded-[24px] bg-white border-border/40 resize-none" />
                </Field>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-16 h-14 text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save className="w-6 h-6 mr-3" />
          {t("save")}
        </Button>
      </div>
    </form>
  );
}

import { Plus } from "lucide-react";import { useState } from "react";

