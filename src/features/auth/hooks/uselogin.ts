import { useMutation } from "@tanstack/react-query"
import { loginApi } from "../services/auth-api"
import type { LoginValues } from "../components/login-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/user-store";
import type { AxiosError } from "axios";
import type { LoginResponse } from "../types";

export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {mutate: loginMutation, isPending} = useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: (data) => {
      if (data?.data) {
        const { accessToken, ...user } = data.data;
        setAuth(user);
        localStorage.setItem("token", accessToken);
      }
      toast.success(data?.message || "Login successful!");
      navigate("/");
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const message = error?.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
    }
  })

  return {loginMutation, isPending}
}