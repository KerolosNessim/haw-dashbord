import type { LoginResponse } from "@/features/auth/types";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import { basicFormApi } from "../services/basic-form";

export const useBasicForm = () => {


  const {mutateAsync: basicFormMutation, isPending} = useMutation({
    mutationFn: (values: BasicInfoValues) => basicFormApi(values),
    onSuccess: (data) => {
      toast.success(data?.message || "Created successfully!");
      return data;
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const message = error?.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(message);
    }
  })

  return {basicFormMutation, isPending}
}