import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import { fetchSolutionSingles } from "@/features/solutions/services/solution-singles-api";
import { useQuery } from "@tanstack/react-query";

export function useSolutionSinglesList() {
  return useQuery({
    queryKey: SOLUTION_SINGLES_QUERY_KEY,
    queryFn: fetchSolutionSingles,
  });
}
