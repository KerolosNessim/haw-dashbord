import { useMutation } from "@tanstack/react-query"
import { loginApi } from "../services/auth-api"
import type { LoginValues } from "../components/login-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/user-store";
import type { AxiosError } from "axios";
import type { LoginResponse } from "../types";
import { extractAuthToken } from "../utils/extract-auth-token";

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {mutate: loginMutation, isPending} = useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: (data) => {
      if (data?.data) {
        const token = extractAuthToken(data.data);
        if (!token) {
          toast.error(t("toasts.login_error"));
          return;
        }
        const { accessToken: _a, token: _t, ...user } = data.data;
        setAuth(user);
        localStorage.setItem("token", token);
      }
      toast.success(data?.message || t("toasts.login_success"));
      navigate("/");
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const raw = error?.response?.data?.message;
      const fromApi = typeof raw === "string" ? raw.trim() : "";
      toast.error(fromApi || t("toasts.login_error"));
    }
  })

  return {loginMutation, isPending}
}