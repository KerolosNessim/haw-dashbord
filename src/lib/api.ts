import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import i18n from "@/i18n"
import { clearPersistedAuth } from "@/features/auth/utils/clear-client-session"
import { API_URL } from "@/config/api"

export const api = axios.create({
  baseURL: API_URL,
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
      const lang = i18n.language ?? i18n.resolvedLanguage ?? "en"
      config.headers["Accept-Language"] = lang.toLowerCase().startsWith("ar") ? "ar" : "en"
    }

    // Let the browser set multipart boundary (manual Content-Type breaks file uploads).
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"]
      delete config.headers["content-type"]
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
