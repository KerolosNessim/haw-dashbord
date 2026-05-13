import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { logoutApi } from "../services/auth-api";
import { useAuthStore } from "../store/user-store";
import { clearPersistedAuth } from "../utils/clear-client-session";
import type { LoginResponse } from "../types";

export const useLogout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  /** Sync in-memory user, drop token + persisted zustand, clear cached API data. */
  const endSessionLocally = () => {
    logout();
    clearPersistedAuth();
    void queryClient.clear();
  };

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: (data) => {
      endSessionLocally();
      toast.success(data?.message || t("toasts.logout_success"));
      navigate("/login", { replace: true });
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const raw = error?.response?.data?.message;
      const fromApi = typeof raw === "string" ? raw.trim() : "";
      endSessionLocally();
      toast.error(fromApi || t("toasts.logout_error"));
      navigate("/login", { replace: true });
    },
  });

  return { logoutMutation, isPending };
};
