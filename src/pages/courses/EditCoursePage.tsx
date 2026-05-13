import CourseForm from "@/features/courses/components/course-form";
import CourseSectionsPanel from "@/features/courses/components/course-sections-panel";
import { useCourseDetail } from "@/features/courses/hooks/useCourseDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

function CourseEditSummary({
  detail,
  isRtl,
}: {
  detail: NonNullable<ReturnType<typeof useCourseDetail>["data"]>;
  isRtl: boolean;
}) {
  const title = isRtl
    ? detail.values.title.ar || detail.values.title.en
    : detail.values.title.en || detail.values.title.ar;
  const slug = isRtl
    ? detail.values.slug.ar || detail.values.slug.en
    : detail.values.slug.en || detail.values.slug.ar;

  return (
    <div className="flex flex-col gap-5 rounded-[32px] border bg-white p-6 shadow-sm md:flex-row md:items-center">
      {detail.coverUrl ? (
        <img
          src={detail.coverUrl}
          alt=""
          className="h-32 w-full rounded-2xl object-cover md:w-52"
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="truncate text-2xl font-black text-gray-900">{title || "—"}</h2>
          <span
            className={
              detail.values.is_active
                ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                : "rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
            }
          >
            {detail.values.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{slug || "—"}</p>
        {detail.values.description.en || detail.values.description.ar ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {isRtl
              ? detail.values.description.ar || detail.values.description.en
              : detail.values.description.en || detail.values.description.ar}
          </p>
        ) : null}
        {detail.values.price ? (
          <p className="text-lg font-bold text-primary">
            {detail.values.currency ? `${detail.values.currency} ` : ""}
            {detail.values.price}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("translation", { keyPrefix: "courses" });
  const isRtl = i18n.language.startsWith("ar");
  const { data: detail, isLoading, isError } = useCourseDetail(id);

  useEffect(() => {
    if (isLoading) return;
    console.log("[EditCoursePage] course detail data:", {
      courseId: id,
      detail,
      isError,
    });
  }, [detail, id, isError, isLoading]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/courses" className="w-fit">
        <Button
          variant="ghost"
          className="rounded-full pr-4 pl-2 font-bold text-muted-foreground hover:bg-primary/5 group"
        >
          {isRtl ? (
            <ChevronRight className="mr-1 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          ) : (
            <ChevronLeft className="ml-1 mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          )}
          {t("all_courses")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("edit_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("edit_description")}</p>
      </div>

      {isError && <p className="text-sm text-destructive">{t("load_one_error")}</p>}

      {detail ? <CourseEditSummary detail={detail} isRtl={isRtl} /> : null}

      <CourseForm
        mode="edit"
        courseId={id}
        initialValues={detail?.values ?? null}
        initialCoverUrl={detail?.coverUrl ?? null}
        isInitialLoading={isLoading}
      />

      <CourseSectionsPanel courseId={id} />
    </div>
  );
}
