/** Maps dashboard path prefixes to permission resource keys. */
export const PATH_TO_RESOURCE: Record<string, string> = {
  "/": "dashboard",
  "/home-content": "home-content",
  "/why-choose-us": "why-choose-us",
  "/solutions": "solutions",
  "/solution-singles": "solutions",
  "/solution-categories": "solution-categories",
  "/help-you": "help-you",
  "/package-categories": "package-categories",
  "/packages": "packages",
  "/courses": "courses",
  "/categories": "courses",
  "/countries": "countries",
  "/services": "services",
  "/service-catalog": "service-catalog",
  "/services/pricing": "service-pricing",
  "/faq": "faq",
  "/blogs": "blogs",
  "/blog-categories": "blog-categories",
  "/testimonials": "testimonials",
  "/about": "about",
  "/privacy-policy": "legal",
  "/terms-of-use": "legal",
  "/refund-policy": "legal",
  "/contact-submissions": "contact-submissions",
  "/settings": "settings",
  "/backup-export": "backup-export",
  "/users": "site-users",
  "/service-bookings": "service-bookings",
  "/invoices": "invoices",
  "/team": "admin-users",
  "/roles": "roles",
};

export function resourceFromPathname(pathname: string): string | undefined {
  if (PATH_TO_RESOURCE[pathname]) return PATH_TO_RESOURCE[pathname];

  const match = Object.entries(PATH_TO_RESOURCE)
    .filter(([route]) => route !== "/" && pathname.startsWith(`${route}/`))
    .sort((a, b) => b[0].length - a[0].length);

  return match[0]?.[1];
}
