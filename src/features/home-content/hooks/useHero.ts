import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getHeroContent, updateHeroContent } from "../services/hero"
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const useHero = () => {
  const queryClient = useQueryClient();

  const getHero = useQuery({
    queryKey: ["hero"],
    queryFn: getHeroContent,
  })

  const {mutate:updateHero,isPending} = useMutation({
    mutationFn: updateHeroContent,
    onSuccess: (res) => {
      toast.success(res?.message || "Hero updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hero"] });
    },
    onError: (error:AxiosError<{message:string}>) => {
      toast.error(error?.response?.data?.message || "Failed to update hero");
    },
  })
  return {
    getHero,
    updateHero,
    isPending
  }
} 