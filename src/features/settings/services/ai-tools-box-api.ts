import { api } from "@/lib/api";
import { assertApiEnvelopeSuccess, unwrapShowResource } from "@/lib/api-payload";
import { fetchRegularAdminServices } from "@/features/home-content/services/accreditation-services-api";
import type { Service } from "@/features/services/type";
import type { AiToolsBoxSettings, AiToolsBoxFormValues, LocaleString } from "../types";

const TOOLS_BOX_PATH = "/v1/admin/services/tools-box";

export function defaultAiToolsBoxSettings(): AiToolsBoxSettings {
  return {
    description: {
      ar: "أدخل مجالك أدناه لتوليد قائمة مخصصة بأقوى أدوات الذكاء الاصطناعي لزيادة إنتاجيتك ومضاعفة أرباحك.",
      en: "Enter your field below to generate a customized list of the most powerful AI tools to boost productivity and multiply your profits.",
    },
    challenge_label: {
      ar: "ما هو التحدي الأكبر في عملك حالياً؟ (مثال: كتابة المحتوى، المبيعات، التصميم...)",
      en: "What is the biggest challenge in your work right now? (e.g. content writing, sales, design...)",
    },
    email_label: {
      ar: "البريد الإلكتروني الذي سيصلك دليل الأدوات المخصص عليه",
      en: "Email address where your personalized tools guide will be sent",
    },
    consent_label: {
      ar: "أوافق على استقبال تحديثات دورية بأحدث أدوات الذكاء الاصطناعي المكتشفة وحلول الأتمتة المبتكرة.",
      en: "I agree to receive periodic updates about the latest discovered AI tools and innovative automation solutions.",
    },
    button_text: {
      ar: "ادوات الذكاء الاصطناعي",
      en: "AI Tools",
    },
    service_ids: [],
    is_active: true,
  };
}

function pickLocalized(row: Record<string, unknown>, ...keys: string[]): LocaleString {
  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    if (typeof value === "string") return { ar: value, en: value };
    if (typeof value === "object" && !Array.isArray(value)) {
      const o = value as Record<string, unknown>;
      return {
        ar: typeof o.ar === "string" ? o.ar : "",
        en: typeof o.en === "string" ? o.en : "",
      };
    }
  }
  return { ar: "", en: "" };
}

function pickServiceIds(row: Record<string, unknown>): number[] {
  const raw = row.service_ids ?? row.service_ai_ids;
  if (Array.isArray(raw)) {
    return raw.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
  }
  if (Array.isArray(row.services)) {
    return row.services
      .map((item) => {
        if (!item || typeof item !== "object") return 0;
        return Number((item as Record<string, unknown>).id);
      })
      .filter((id) => id > 0);
  }
  return [];
}

export function normalizeAiToolsBox(input: unknown): AiToolsBoxSettings {
  const defaults = defaultAiToolsBoxSettings();
  const row = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const description = pickLocalized(row, "description", "intro", "heading");
  const challenge_label = pickLocalized(row, "challenge_label", "challenge_field", "field_1_label", "field_one_label");
  const email_label = pickLocalized(row, "email_label", "email_field", "field_2_label", "field_two_label");
  const consent_label = pickLocalized(row, "consent_label", "consent_text", "checkbox_label");
  const button_text = pickLocalized(row, "button_text", "cta_text", "action_button_text");

  return {
    description: {
      ar: description.ar || defaults.description.ar,
      en: description.en || defaults.description.en,
    },
    challenge_label: {
      ar: challenge_label.ar || defaults.challenge_label.ar,
      en: challenge_label.en || defaults.challenge_label.en,
    },
    email_label: {
      ar: email_label.ar || defaults.email_label.ar,
      en: email_label.en || defaults.email_label.en,
    },
    consent_label: {
      ar: consent_label.ar || defaults.consent_label.ar,
      en: consent_label.en || defaults.consent_label.en,
    },
    button_text: {
      ar: button_text.ar || defaults.button_text.ar,
      en: button_text.en || defaults.button_text.en,
    },
    service_ids: pickServiceIds(row),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
  };
}

export function aiToolsBoxToFormValues(data: AiToolsBoxSettings): AiToolsBoxFormValues {
  return {
    description_ar: data.description.ar,
    description_en: data.description.en,
    challenge_label_ar: data.challenge_label.ar,
    challenge_label_en: data.challenge_label.en,
    email_label_ar: data.email_label.ar,
    email_label_en: data.email_label.en,
    consent_label_ar: data.consent_label.ar,
    consent_label_en: data.consent_label.en,
    button_text_ar: data.button_text.ar,
    button_text_en: data.button_text.en,
    service_ids: data.service_ids,
    is_active: data.is_active,
  };
}

export function formValuesToAiToolsBoxPayload(values: AiToolsBoxFormValues) {
  return {
    description: { ar: values.description_ar.trim(), en: values.description_en.trim() },
    challenge_label: { ar: values.challenge_label_ar.trim(), en: values.challenge_label_en.trim() },
    email_label: { ar: values.email_label_ar.trim(), en: values.email_label_en.trim() },
    consent_label: { ar: values.consent_label_ar.trim(), en: values.consent_label_en.trim() },
    button_text: { ar: values.button_text_ar.trim(), en: values.button_text_en.trim() },
    service_ids: values.service_ids,
    is_active: values.is_active,
  };
}

export async function fetchAiToolsBoxSettings(): Promise<AiToolsBoxSettings> {
  const res = await api.get(TOOLS_BOX_PATH);
  assertApiEnvelopeSuccess(res.data);
  const root = res.data as { data?: unknown };
  if (root.data == null) return defaultAiToolsBoxSettings();
  try {
    const payload = unwrapShowResource(res.data);
    return normalizeAiToolsBox(payload);
  } catch {
    return normalizeAiToolsBox(root.data);
  }
}

export async function updateAiToolsBoxSettings(values: AiToolsBoxFormValues): Promise<unknown> {
  const res = await api.post(TOOLS_BOX_PATH, formValuesToAiToolsBoxPayload(values));
  return res.data;
}

export async function fetchToolsBoxServices(): Promise<Service[]> {
  return fetchRegularAdminServices();
}
