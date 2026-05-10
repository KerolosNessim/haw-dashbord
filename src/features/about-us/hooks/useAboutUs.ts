import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as aboutUsService from "../services/about-us";
import type { AxiosError } from "axios";

export const useAboutUs = () => {
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
      toast.success(res.message || "About Us updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update About Us");
    },
  });

  const introMutation = useMutation({
    mutationFn: aboutUsService.updateIntroSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || "About Us Intro section updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update About Us Intro section");
    },
  });

  const visionMutation = useMutation({
    mutationFn: aboutUsService.updateVisionSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || "About Us Vision section updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update About Us Vision section");
    },
  });

  const whyUsMutation = useMutation({
    mutationFn: aboutUsService.updateWhyUsSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || "About Us Why Us section updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update About Us Why Us section");
    },
  });

  const contactMutation = useMutation({
    mutationFn: aboutUsService.updateContactSection,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["about-us"] });
      toast.success(res.message || "About Us Contact section updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update About Us Contact section");
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
  };
};
