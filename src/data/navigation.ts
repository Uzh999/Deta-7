export type NavigationItem = {
  /** Translation key under `nav.*` and identifier used by the footer filter. */
  key: string;
  /** In-page anchor target. */
  href: string;
};

export const navigationItems: readonly NavigationItem[] = [
  { key: "services", href: "#services" },
  { key: "before-after", href: "#before-after" },
  { key: "about", href: "#about" },
  { key: "pricing", href: "#pricing" },
  { key: "individualServices", href: "#individual-services" },
  { key: "reviews", href: "#reviews" },
  { key: "contact", href: "#contact" },
] as const;

/** Subset of `navigationItems` shown in the footer navigation column. */
export const footerNavigationKeys: readonly string[] = [
  "services",
  "before-after",
  "about",
  "pricing",
  "reviews",
  "contact",
] as const;
