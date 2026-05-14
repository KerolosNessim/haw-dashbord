import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/userService";

export const useUsers = (page: number = 1) => {
  return useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page),
  });
};
