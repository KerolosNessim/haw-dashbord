import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  deleteApplicationSeoSubmission,
  getApplicationSeoSubmissions,
} from "../services/application-seo-submissions-api";

export const useApplicationSeoSubmissions = (page: number = 1) => {
  return useQuery({
    queryKey: ["application-seo-submissions", page],
    queryFn: () => getApplicationSeoSubmissions(page),
  });
};

export const useDeleteApplicationSeoSubmission = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "consultation.seo" });

  return useMutation({
    mutationFn: deleteApplicationSeoSubmission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["application-seo-submissions"] });
      toast.success(t("delete_success"));
    },
    onError: () => {
      toast.error(t("delete_error"));
    },
  });
};
