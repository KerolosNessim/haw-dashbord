import { useQuery } from "@tanstack/react-query";
import { getContactSubmissions } from "../services/contactService";

export const useContactSubmissions = (page: number = 1) => {
  return useQuery({
    queryKey: ["contact-submissions", page],
    queryFn: () => getContactSubmissions(page),
  });
};
