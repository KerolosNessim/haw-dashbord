export type ServiceResourceScope = "services" | "service_ais";

function scopeFromPathname(pathname?: string): ServiceResourceScope {
  if (pathname?.startsWith("/ai-services")) return "service_ais";
  return "services";
}

export function getServiceResourceScope(): ServiceResourceScope {
  if (typeof window !== "undefined") return scopeFromPathname(window.location.pathname);
  return "services";
}

export function getAdminServicesBasePath(scope: ServiceResourceScope = getServiceResourceScope()): string {
  return `/v1/admin/${scope}`;
}

export function getServicesUiBasePath(scope: ServiceResourceScope = getServiceResourceScope()): string {
  return scope === "service_ais" ? "/ai-services" : "/services";
}

export function getServiceQueryNamespace(scope: ServiceResourceScope = getServiceResourceScope()): string {
  return scope;
}
