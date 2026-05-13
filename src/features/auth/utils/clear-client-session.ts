/** Zustand persist key — must match `persist({ name })` in `user-store.ts`. */
export const AUTH_STORAGE_KEY = "auth-storage";

/**
 * Removes API token and persisted auth state. Use on forced sign-out (e.g. 401) when the
 * app is about to reload, so `AuthLayout` does not treat a stale `user` as logged in.
 */
export function clearPersistedAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
