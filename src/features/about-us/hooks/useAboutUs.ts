import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as aboutUsService from "../services/about-us";
import type { AxiosError } from "axios";

export const useAboutUs = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getAboutUsQuery = useQuery({
    queryKey: ["about-us"],
    queryFn: async () => {
      try {
        const data = await aboutUsService.getAboutUs();
        console.log("getAboutUs raw response:", data);
        return data;
      } catch (error) {
        console.error("getAboutUs error:", error);
        throw error;
      }
    },
  });

  const generalMutation = useMutation({
    mutationFn: aboutUsService.updateAboutUs,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_update_failed"));
    },
  });

  const introMutation = useMutation({
    mutationFn: aboutUsService.updateIntroSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_intro_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_intro_update_failed"));
    },
  });

  const visionMutation = useMutation({
    mutationFn: aboutUsService.updateVisionSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_vision_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_vision_update_failed"));
    },
  });

  const whyUsMutation = useMutation({
    mutationFn: aboutUsService.updateWhyUsSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_why_us_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error);
      toast.error(error?.response?.data?.message || t("toasts.about_why_us_update_failed"));
    },
  });

  const contactMutation = useMutation({
    mutationFn: aboutUsService.updateContactSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_contact_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_contact_update_failed"));
    },
  });

  const whoWeAreMutation = useMutation({
    mutationFn: aboutUsService.upsertWhoWeAreSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_who_we_are_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_who_we_are_update_failed"));
    },
  });

  const deleteWhoWeAreMutation = useMutation({
    mutationFn: aboutUsService.deleteWhoWeAreSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || t("toasts.about_who_we_are_deleted"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.about_who_we_are_delete_failed"));
    },
  });

  return {
    getAboutUsQuery,
    updateAboutUs: generalMutation.mutate,
    isUpdating: generalMutation.isPending,
    updateIntroSection: introMutation.mutate,
    isUpdatingIntroSection: introMutation.isPending,
    updateVisionSection: visionMutation.mutate,
    isUpdatingVisionSection: visionMutation.isPending,
    updateWhyUsSection: whyUsMutation.mutate,
    isUpdatingWhyUsSection: whyUsMutation.isPending,
    updateContactSection: contactMutation.mutate,
    isUpdatingContactSection: contactMutation.isPending,
    upsertWhoWeAreSection: whoWeAreMutation.mutate,
    isUpsertingWhoWeAreSection: whoWeAreMutation.isPending,
    deleteWhoWeAreSection: deleteWhoWeAreMutation.mutate,
    isDeletingWhoWeAreSection: deleteWhoWeAreMutation.isPending,
  };
};
