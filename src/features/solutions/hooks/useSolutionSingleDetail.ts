import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import { fetchSolutionSingleById } from "@/features/solutions/services/solution-singles-api";
import { useQuery } from "@tanstack/react-query";

export function useSolutionSingleDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...SOLUTION_SINGLES_QUERY_KEY, "detail", id],
    queryFn: () => fetchSolutionSingleById(id as string),
    enabled: Boolean(id),
  });
}
