import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSettingsApi, 
  getScriptsApi,
  updateScriptsApi,
  updateGeneralSettingsApi, 
  updateContactSettingsApi, 
  updateWorkingHoursApi,
  saveOfficeApi,
  deleteOfficeApi,
  saveSocialApi,
  deleteSocialApi,
  saveSeoApi,
  deleteSeoApi
} from "../services/settings";
import {
  fetchAiToolsBoxSettings,
  updateAiToolsBoxSettings,
  fetchToolsBoxServices,
} from "../services/ai-tools-box-api";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettingsApi,
  });
};

export const useScripts = () => {
  return useQuery({
    queryKey: ["settings-scripts"],
    queryFn: getScriptsApi,
  });
};

export const useUpdateScripts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScriptsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-scripts"] });
    },
  });
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGeneralSettingsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContactSettingsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useUpdateWorkingHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorkingHoursApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useSaveOffice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveOfficeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useDeleteOffice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOfficeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useSaveSocial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSocialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useDeleteSocial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSocialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useSaveSeo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSeoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useDeleteSeo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSeoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useAiToolsBox = () => {
  return useQuery({
    queryKey: ["settings", "ai-tools-box"],
    queryFn: fetchAiToolsBoxSettings,
  });
};

export const useUpdateAiToolsBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAiToolsBoxSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "ai-tools-box"] });
    },
  });
};

export const useToolsBoxServices = () => {
  return useQuery({
    queryKey: ["services", "admin-list", "tools-box"],
    queryFn: fetchToolsBoxServices,
  });
};
