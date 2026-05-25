import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getMeApi } from "../services/auth-api";
import { useAuthStore } from "../store/user-store";
import { normalizeAuthUser } from "../utils/normalize-auth-user";

export const ADMIN_ME_QUERY_KEY = ["admin", "me"] as const;

function hasAuthToken(): boolean {
  return Boolean(localStorage.getItem("token")?.trim());
}

/**
 * Loads the current admin profile (roles + permissions) when a token exists.
 * Used by `DashboardLayout` before rendering protected content.
 */
export function useBootstrapAuth() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const tokenPresent = hasAuthToken();

  const meQuery = useQuery({
    queryKey: ADMIN_ME_QUERY_KEY,
    queryFn: getMeApi,
    enabled: tokenPresent,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data?.data) {
      const normalized = normalizeAuthUser(meQuery.data.data);
      if (normalized) setAuth(normalized);
    }
  }, [meQuery.data, setAuth]);

  /** Wait for the first `/me` response before rendering the dashboard shell. */
  const isBootstrapping = tokenPresent && !meQuery.isFetched;

  const isAuthenticated =
    tokenPresent &&
    Boolean(user ?? (meQuery.isSuccess ? meQuery.data?.data : null));

  return {
    tokenPresent,
    user,
    isBootstrapping,
    isAuthenticated,
    meError: meQuery.isError ? meQuery.error : null,
    refetchMe: meQuery.refetch,
  };
}
