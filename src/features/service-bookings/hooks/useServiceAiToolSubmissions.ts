import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  deleteServiceAiToolSubmission,
  getServiceAiToolSubmissionById,
  getServiceAiToolSubmissions,
  type ServiceAiToolSubmissionsParams,
} from "../services/service-ai-tool-submissions-api";

export const useServiceAiToolSubmissions = (params: ServiceAiToolSubmissionsParams = {}) => {
  return useQuery({
    queryKey: ["service-ai-tool-submissions", params],
    queryFn: () => getServiceAiToolSubmissions(params),
  });
};

export const useServiceAiToolSubmission = (id: number | null, enabled: boolean) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["service-ai-tool-submissions", "detail", id],
    queryFn: async () => {
      const result = await getServiceAiToolSubmissionById(id!);
      void queryClient.invalidateQueries({ queryKey: ["service-ai-tool-submissions"] });
      return result.data;
    },
    enabled: enabled && id != null,
  });
};

export const useDeleteServiceAiToolSubmission = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "consultation.ai_tools" });

  return useMutation({
    mutationFn: deleteServiceAiToolSubmission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["service-ai-tool-submissions"] });
      toast.success(t("delete_success"));
    },
    onError: () => {
      toast.error(t("delete_error"));
    },
  });
};
