import { api } from "@/lib/api";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import type { SolutionsResponse, LocaleString, SolutionsSectionSaveInput } from "../types";

function pickLocalized(input: unknown): LocaleString {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ar: "", en: "" };
  const row = input as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function normalizeSolutionsResponse(body: SolutionsResponse): SolutionsResponse {
  const row = body.data;
  if (!row) return body;
  const description = pickLocalized(row.description ?? row.subtitle);
  const subtitle = pickLocalized(row.subtitle ?? row.description);
  return {
    ...body,
    data: {
      ...row,
      title: pickLocalized(row.title),
      description,
      subtitle,
    },
  };
}

export function buildSolutionsSectionFormData(data: SolutionsSectionSaveInput): FormData {
  const formData = new FormData();
  formData.append("title[ar]", data.title_ar.trim());
  formData.append("title[en]", (data.title_en ?? "").trim());
  appendLocalizedDescriptionHtml(formData, "description", data.des_ar, data.des_en);
  return formData;
}

export const getSolutions = (): Promise<SolutionsResponse> => {
  return api
    .get<SolutionsResponse>("/v1/admin/solutions")
    .then((res) => normalizeSolutionsResponse(res.data))
    .catch((error) => {
      throw error;
    });
};

export const updateSolutions = (data: FormData): Promise<SolutionsResponse> => {
  return api
    .post<SolutionsResponse>("/v1/admin/solutions", data)
    .then((res) => normalizeSolutionsResponse(res.data))
    .catch((error) => {
      throw error;
    });
};
