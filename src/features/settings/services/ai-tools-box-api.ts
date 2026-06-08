import { api } from "@/lib/api";
import { assertApiEnvelopeSuccess, unwrapShowResource } from "@/lib/api-payload";
import { fetchRegularAdminServices } from "@/features/home-content/services/accreditation-services-api";
import type { Service } from "@/features/services/type";
import type {
  ApplicationSeoFormValues,
  ApplicationSeoLinkedService,
  ApplicationSeoSettings,
  LocaleString,
} from "../types";

const APPLICATION_SEO_PATH = "/v1/admin/settings/application-seo";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function pickLocalized(row: Record<string, unknown>, ...keys: string[]): LocaleString {
  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    if (typeof value === "string") return { ar: value, en: value };
    if (typeof value === "object" && !Array.isArray(value)) {
      const o = value as Record<string, unknown>;
      return { ar: str(o.ar), en: str(o.en) };
    }
  }
  return { ar: "", en: "" };
}

function pickLinkedServices(raw: unknown): ApplicationSeoLinkedService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = Number(row.id);
      if (!Number.isFinite(id) || id <= 0) return null;
      return {
        id,
        title: pickLocalized(row, "title"),
        slug: pickLocalized(row, "slug"),
        is_active:
          row.is_active === false || row.is_active === 0 || row.is_active === "0"
            ? false
            : row.is_active == null
              ? undefined
              : true,
      };
    })
    .filter((item): item is ApplicationSeoLinkedService => item != null);
}

function pickServiceIds(row: Record<string, unknown>): number[] {
  if (Array.isArray(row.service_ids)) {
    return row.service_ids.map((id) => Number(id)).filter((id) => id > 0);
  }
  return pickLinkedServices(row.services).map((s) => s.id);
}

export function defaultApplicationSeoSettings(): ApplicationSeoSettings {
  return {
    heading_ar: "أدخل معلوماتك أدناه للحصول على تدقيق SEO مجاني لموقعك.",
    heading_en: "Enter your information below to get a free SEO audit for your website.",
    website_placeholder_ar: "رابط موقعك",
    website_placeholder_en: "Your website link",
    email_placeholder_ar: "البريد الإلكتروني سيصلك عليه التقرير",
    email_placeholder_en: "The email address where you will receive the report",
    consent_text_ar:
      "أوافق على تقديم عنوان بريدي الإلكتروني واسمي ومعلومات الاتصال الإضافية من أجل تخزينها ومعالجتها لاحقًا.",
    consent_text_en:
      "I agree to provide my email address, name, and additional contact information for storage and processing later.",
    submit_button_text_ar: "التدقيق الآن",
    submit_button_text_en: "Audit Now",
    service_ids: [],
    services: [],
  };
}

/** @deprecated */
export const defaultAiToolsBoxSettings = defaultApplicationSeoSettings;

export function normalizeApplicationSeo(input: unknown): ApplicationSeoSettings {
  const defaults = defaultApplicationSeoSettings();
  const row = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const heading = pickLocalized(row, "heading", "description", "intro");
  const websitePlaceholder = pickLocalized(
    row,
    "website_placeholder",
    "challenge_label",
    "website",
  );
  const emailPlaceholder = pickLocalized(row, "email_placeholder", "email_label", "email");
  const consentText = pickLocalized(row, "consent_text", "consent_label", "consent");
  const submitButton = pickLocalized(
    row,
    "submit_button_text",
    "button_text",
    "cta_text",
  );

  const services = pickLinkedServices(row.services);

  return {
    heading_ar: str(row.heading_ar) || heading.ar || defaults.heading_ar,
    heading_en: str(row.heading_en) || heading.en || defaults.heading_en,
    website_placeholder_ar:
      str(row.website_placeholder_ar) || websitePlaceholder.ar || defaults.website_placeholder_ar,
    website_placeholder_en:
      str(row.website_placeholder_en) || websitePlaceholder.en || defaults.website_placeholder_en,
    email_placeholder_ar:
      str(row.email_placeholder_ar) || emailPlaceholder.ar || defaults.email_placeholder_ar,
    email_placeholder_en:
      str(row.email_placeholder_en) || emailPlaceholder.en || defaults.email_placeholder_en,
    consent_text_ar: str(row.consent_text_ar) || consentText.ar || defaults.consent_text_ar,
    consent_text_en: str(row.consent_text_en) || consentText.en || defaults.consent_text_en,
    submit_button_text_ar:
      str(row.submit_button_text_ar) || submitButton.ar || defaults.submit_button_text_ar,
    submit_button_text_en:
      str(row.submit_button_text_en) || submitButton.en || defaults.submit_button_text_en,
    service_ids: pickServiceIds(row),
    services,
  };
}

/** @deprecated */
export const normalizeAiToolsBox = normalizeApplicationSeo;

export function applicationSeoToFormValues(data: ApplicationSeoSettings): ApplicationSeoFormValues {
  return {
    heading_ar: data.heading_ar,
    heading_en: data.heading_en,
    website_placeholder_ar: data.website_placeholder_ar,
    website_placeholder_en: data.website_placeholder_en,
    email_placeholder_ar: data.email_placeholder_ar,
    email_placeholder_en: data.email_placeholder_en,
    consent_text_ar: data.consent_text_ar,
    consent_text_en: data.consent_text_en,
    submit_button_text_ar: data.submit_button_text_ar,
    submit_button_text_en: data.submit_button_text_en,
    service_ids: data.service_ids,
    services: data.services,
  };
}

/** @deprecated */
export const aiToolsBoxToFormValues = applicationSeoToFormValues;

export function formValuesToApplicationSeoPayload(values: ApplicationSeoFormValues) {
  return {
    heading_ar: values.heading_ar.trim(),
    heading_en: values.heading_en.trim(),
    website_placeholder_ar: values.website_placeholder_ar.trim(),
    website_placeholder_en: values.website_placeholder_en.trim(),
    email_placeholder_ar: values.email_placeholder_ar.trim(),
    email_placeholder_en: values.email_placeholder_en.trim(),
    consent_text_ar: values.consent_text_ar.trim(),
    consent_text_en: values.consent_text_en.trim(),
    submit_button_text_ar: values.submit_button_text_ar.trim(),
    submit_button_text_en: values.submit_button_text_en.trim(),
    service_ids: values.service_ids,
  };
}

/** @deprecated */
export const formValuesToAiToolsBoxPayload = formValuesToApplicationSeoPayload;

export type ApplicationSeoResponse = {
  status: string;
  message: string;
  data: Record<string, unknown> | null;
};

function settingsFromResponse(body: unknown): ApplicationSeoSettings {
  const root = body as { data?: unknown };
  if (root.data == null) return defaultApplicationSeoSettings();
  try {
    return normalizeApplicationSeo(unwrapShowResource(body));
  } catch {
    return normalizeApplicationSeo(root.data);
  }
}

export async function fetchApplicationSeoSettings(): Promise<ApplicationSeoSettings> {
  const res = await api.get<ApplicationSeoResponse>(APPLICATION_SEO_PATH);
  assertApiEnvelopeSuccess(res.data);
  return settingsFromResponse(res.data);
}

/** @deprecated */
export const fetchAiToolsBoxSettings = fetchApplicationSeoSettings;

export async function updateApplicationSeoSettings(
  values: ApplicationSeoFormValues,
): Promise<ApplicationSeoResponse> {
  const res = await api.put<ApplicationSeoResponse>(
    APPLICATION_SEO_PATH,
    formValuesToApplicationSeoPayload(values),
  );
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

/** @deprecated */
export const updateAiToolsBoxSettings = updateApplicationSeoSettings;

export async function fetchToolsBoxServices(): Promise<Service[]> {
  return fetchRegularAdminServices();
}
