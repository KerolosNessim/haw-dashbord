import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import i18n from "@/i18n"
import { clearPersistedAuth } from "@/features/auth/utils/clear-client-session"
import { apiBaseUrl } from "@/lib/api-origin"

const baseUrl = apiBaseUrl()

function acceptLanguageFromDashboard(): "ar" | "en" {
  const lang = i18n.language ?? i18n.resolvedLanguage ?? "en"
  return lang.toLowerCase().startsWith("ar") ? "ar" : "en"
}

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Accept": "application/json",
  }
})
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token")

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.headers && !config.headers["Accept-Language"]) {
      config.headers["Accept-Language"] = acceptLanguageFromDashboard()
    }

    // Let the browser set multipart boundary (manual Content-Type breaks file uploads).
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"]
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ""

    if (status === 401 && !url.includes("/login")) {
      clearPersistedAuth()
      window.location.href = "/login"
      return Promise.reject(error)
    }

    // 403: stay logged in; callers show a permission message via getHttpErrorMessage
    return Promise.reject(error)
  }
)