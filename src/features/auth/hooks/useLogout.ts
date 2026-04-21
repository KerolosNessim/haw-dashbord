import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutApi } from "../services/auth-api";
import { useAuthStore } from "../store/user-store";
import type { LoginResponse } from "../types";

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const {mutate: logoutMutation, isPending} = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: (data) => {
        logout();
        localStorage.removeItem("token");
      toast.success(data?.message || "Logout successful!");
      navigate("/login");
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const message = error?.response?.data?.message || "Logout failed! Please try again.";
      toast.error(message);
    }
  })

  return {logoutMutation, isPending}
}