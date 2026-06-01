import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getWhyUs, updateWhyUs } from "../services/why-us";
import type { WhyUsGalleryMedia } from "../types";
import {
  extractWhyUsSectionData,
  mergeWhyUsGalleryPreserved,
  patchWhyUsCacheImages,
  pickWhyUsGalleryFromApi,
} from "../lib/gallery-from-api";
import type { AxiosError } from "axios";

export type UpdateWhyUsContext = {
  gallerySnapshot?: WhyUsGalleryMedia[];
};

function mergeGalleryForCache(
  cached: unknown,
  response: unknown,
  snapshot?: WhyUsGalleryMedia[],
): WhyUsGalleryMedia[] {
  const prev = pickWhyUsGalleryFromApi(extractWhyUsSectionData(cached));
  const fromResponse = pickWhyUsGalleryFromApi(extractWhyUsSectionData(response));
  const fromSnapshot = snapshot ?? [];
  return mergeWhyUsGalleryPreserved(
    mergeWhyUsGalleryPreserved(prev, fromResponse),
    fromSnapshot,
  );
}

export const useWhyUs = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getWhyUsQuery = useQuery({
    queryKey: ["why-us"],
    queryFn: getWhyUs,
  });

  const { mutate: updateWhyUsMutation, isPending } = useMutation({
    mutationFn: updateWhyUs,
    onSuccess: async (res, _variables, context) => {
      const ctx = context as UpdateWhyUsContext | undefined;
      const cached = queryClient.getQueryData(["why-us"]);
      const images = mergeGalleryForCache(cached, res, ctx?.gallerySnapshot);

      if (images.length > 0) {
        queryClient.setQueryData(["why-us"], (old) => patchWhyUsCacheImages(old, images));
      }

      await queryClient.invalidateQueries({ queryKey: ["why-us"] });

      const afterRefetch = queryClient.getQueryData(["why-us"]);
      const refetchedImages = pickWhyUsGalleryFromApi(extractWhyUsSectionData(afterRefetch));
      const preserved = mergeWhyUsGalleryPreserved(images, refetchedImages);

      if (preserved.length > 0) {
        queryClient.setQueryData(["why-us"], (old) => patchWhyUsCacheImages(old, preserved));
      }

      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getWhyUsQuery,
    updateWhyUs: updateWhyUsMutation,
    isPending,
  };
};
