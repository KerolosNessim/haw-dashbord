/**
 * Canonical permission names used by the Howeyah dashboard.
 * Backend (Laravel + Spatie) should seed these exact strings and expose them
 * via GET /api/v1/admin/permissions grouped as documented below.
 */

export type PermissionAction = "view" | "create" | "update" | "delete";

export type PermissionResourceDef = {
  /** Spatie permission prefix, e.g. `service-catalog` */
  resource: string;
  actions: readonly PermissionAction[];
  /** i18n key under roles.permission_resources (underscore form) */
  labelKey: string;
  /** Registry group key returned by GET /v1/admin/permissions */
  group: string;
};

export const p = (resource: string, action: PermissionAction) =>
  `${resource}.${action}` as const;

/**
 * Route → permission required to open the page (view/create shortcuts).
 * Edit routes use `{resource}.update` via route-permission.ts + PATH_TO_RESOURCE.
 */
export const PERMISSION_BY_ROUTE: Record<string, string> = {
  "/": p("dashboard", "view"),
  "/home-content": p("home-content", "view"),
  "/why-choose-us": p("why-choose-us", "view"),
  "/solutions": p("solutions", "view"),
  "/solution-singles": p("solutions", "view"),
  "/solution-categories": p("solution-categories", "view"),
  "/help-you": p("help-you", "view"),
  "/package-categories": p("package-categories", "view"),
  "/packages": p("packages", "view"),
  "/courses": p("courses", "view"),
  "/categories": p("courses", "view"),
  "/countries": p("countries", "view"),
  "/services": p("services", "view"),
  "/service-catalog": p("service-catalog", "view"),
  "/service-catalog/create": p("service-catalog", "create"),
  "/services/pricing": p("service-pricing", "view"),
  "/faq": p("faq", "view"),
  "/blogs": p("blogs", "view"),
  "/blog-categories": p("blog-categories", "view"),
  "/testimonials": p("testimonials", "view"),
  "/about": p("about", "view"),
  "/privacy-policy": p("legal", "view"),
  "/terms-of-use": p("legal", "view"),
  "/refund-policy": p("legal", "view"),
  "/contact-submissions": p("contact-submissions", "view"),
  "/settings": p("settings", "view"),
  "/backup-export": p("backup-export", "view"),
  "/users": p("site-users", "view"),
  "/service-bookings": p("service-bookings", "view"),
  "/invoices": p("invoices", "view"),
  "/invoices/create": p("invoices", "create"),
  "/team": p("admin-users", "view"),
  "/roles": p("roles", "view"),
};

/**
 * Resources the dashboard expects in the permissions registry.
 * New backend resources must match these keys exactly.
 */
export const DASHBOARD_PERMISSION_RESOURCES: readonly PermissionResourceDef[] = [
  { resource: "dashboard", actions: ["view"], labelKey: "dashboard", group: "dashboard" },
  { resource: "home-content", actions: ["view", "update"], labelKey: "home_content", group: "content" },
  { resource: "why-choose-us", actions: ["view", "update"], labelKey: "why_choose_us", group: "content" },
  { resource: "solutions", actions: ["view", "create", "update", "delete"], labelKey: "solutions", group: "content" },
  { resource: "solution-categories", actions: ["view", "create", "update", "delete"], labelKey: "solution_categories", group: "content" },
  { resource: "help-you", actions: ["view", "update"], labelKey: "help_you", group: "content" },
  { resource: "package-categories", actions: ["view", "create", "update", "delete"], labelKey: "package_categories", group: "catalog" },
  { resource: "packages", actions: ["view", "create", "update", "delete"], labelKey: "packages", group: "catalog" },
  { resource: "courses", actions: ["view", "create", "update", "delete"], labelKey: "courses", group: "catalog" },
  { resource: "countries", actions: ["view", "create", "update", "delete"], labelKey: "countries", group: "catalog" },
  { resource: "services", actions: ["view", "create", "update", "delete"], labelKey: "services", group: "catalog" },
  { resource: "service-catalog", actions: ["view", "create", "update", "delete"], labelKey: "service_catalog", group: "catalog" },
  { resource: "service-pricing", actions: ["view", "update"], labelKey: "service_pricing", group: "catalog" },
  { resource: "invoices", actions: ["view", "create", "delete"], labelKey: "invoices", group: "catalog" },
  { resource: "faq", actions: ["view", "create", "update", "delete"], labelKey: "faq", group: "content" },
  { resource: "blogs", actions: ["view", "create", "update", "delete"], labelKey: "blogs", group: "content" },
  { resource: "blog-categories", actions: ["view", "create", "update", "delete"], labelKey: "blog_categories", group: "content" },
  { resource: "testimonials", actions: ["view", "update"], labelKey: "testimonials", group: "content" },
  { resource: "about", actions: ["view", "update"], labelKey: "about", group: "content" },
  { resource: "legal", actions: ["view", "update"], labelKey: "legal", group: "content" },
  { resource: "contact-submissions", actions: ["view", "delete"], labelKey: "contact_submissions", group: "crm" },
  { resource: "site-users", actions: ["view"], labelKey: "site_users", group: "crm" },
  { resource: "service-bookings", actions: ["view"], labelKey: "service_bookings", group: "crm" },
  { resource: "settings", actions: ["view", "update"], labelKey: "settings", group: "system" },
  { resource: "backup-export", actions: ["view", "create"], labelKey: "backup_export", group: "system" },
  { resource: "admin-users", actions: ["view", "create", "update", "delete"], labelKey: "admin_users", group: "access_control" },
  { resource: "roles", actions: ["view", "create", "update", "delete"], labelKey: "roles", group: "access_control" },
] as const;

/** Flat list of every permission string the dashboard may check. */
export function allDashboardPermissionNames(): string[] {
  return DASHBOARD_PERMISSION_RESOURCES.flatMap(({ resource, actions }) =>
    actions.map((action) => p(resource, action)),
  );
}
