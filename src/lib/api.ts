import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import i18n from "@/i18n"
import { clearPersistedAuth } from "@/features/auth/utils/clear-client-session"

const baseUrl = import.meta.env.VITE_API_URL

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

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/login")) {
      clearPersistedAuth()
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)