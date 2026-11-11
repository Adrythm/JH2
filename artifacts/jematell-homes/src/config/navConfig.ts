/**
 * navConfig.ts — the config-driven nav model. One structure drives three
 * surfaces: the desktop dropdowns, the mobile accordion drawer, and the footer
 * sitemap. Adapted from the site-architecture-kit (Next.js) to React Router:
 * the active-state helpers below take a plain pathname string from
 * `useLocation()`.
 */

import { locations, locationHref } from "./siteConfig";

export interface SubNavItem {
  id: string;
  label: string;
  href: string;
  /**
   * Render as a full-page `<a>` (hard navigation) instead of a client-side
   * `<Link>`. Used for routes the React app does not own yet (currently /faq,
   * served by the api-server until the FAQ pages move into the web app).
   */
  hardNav?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  /** Optional. When omitted, the item is a dropdown trigger with no own page. */
  href?: string;
  children?: SubNavItem[];
}

export const navItems: NavItem[] = [
  { id: "custom-homes", label: "Custom Homes", href: "/custom-homes" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "floor-plans", label: "Floor Plans", href: "/floor-plans" },
  {
    id: "where-we-build",
    label: "Where We Build",
    href: "/where-we-build",
    children: [
      { id: "build-on-your-lot", label: "Build on Your Lot", href: "/build-on-your-lot" },
      ...locations.map((l) => ({
        id: l.slug,
        label: l.name,
        href: locationHref(l.slug),
      })),
      { id: "buy-a-lot-with-us", label: "Buy a Lot With Us", href: "/buy-a-lot-with-us" },
    ],
  },
  { id: "financing", label: "Financing", href: "/financing" },
  { id: "about", label: "About", href: "/about" },
  {
    id: "resources",
    label: "Resources",
    href: "/resources",
    children: [
      { id: "faq", label: "FAQ", href: "/faq" },
      { id: "blog", label: "Blog", href: "/blog" },
      { id: "guides", label: "Guides", href: "/guides" },
      { id: "glossary", label: "Glossary", href: "/glossary" },
      { id: "reference-library", label: "Reference Library", href: "/reference-library" },
    ],
  },
];

/**
 * Is `href` the active route for `pathname`? Exact match for "/", prefix match
 * for everything else so /custom-homes keeps "Homes" active, etc.
 */
export function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** True when the current path belongs to the section represented by `item`. */
export function isSectionActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.href && isNavActive(pathname, item.href)) return true;
  return !!item.children?.some((c) => isNavActive(pathname, c.href));
}

/** The top-level item whose section the current path belongs to, if any. */
export function activeSection(
  pathname: string | null,
  items: NavItem[] = navItems,
): NavItem | undefined {
  if (!pathname) return undefined;
  return items.find((item) => isSectionActive(pathname, item));
}
