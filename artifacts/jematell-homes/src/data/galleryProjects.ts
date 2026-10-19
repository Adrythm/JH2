export interface GalleryProject {
  slug: string;
  title: string;
  meta: string;
  thumb?: string;
  buildType?: string;
  location?: string;
  completed?: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  { slug: "skinner-custom",      title: "Skinner Custom",      meta: "Surprise, AZ · Custom Home",  thumb: "/images/gallery/crist/kitchen-hero.png", buildType: "Custom", location: "Surprise", completed: "2026" },
  { slug: "modern-farmhouse",    title: "Modern Farmhouse",    meta: "Rio Verde · Custom Home",      buildType: "Custom", location: "Rio Verde", completed: "2024" },
  { slug: "rio-verde-farmhouse", title: "Rio Verde Farmhouse", meta: "Rio Verde · Custom Home",      buildType: "Custom", location: "Rio Verde", completed: "2026" },
  { slug: "cave-creek",          title: "Cave Creek Spec",     meta: "Cave Creek · Spec Home",       buildType: "Spec",   location: "Cave Creek", completed: "2026" },
  { slug: "rio-verde-rv",        title: "Rio Verde RV",        meta: "Rio Verde, AZ",                buildType: "Custom", location: "Rio Verde", completed: "2023" },
  { slug: "twilight-house",      title: "Twilight House",      meta: "Rio Verde · Custom Home",      buildType: "Custom", location: "Rio Verde", completed: "2025" },
  { slug: "desert-retreat",      title: "Desert Retreat",      meta: "Rio Verde · Custom Home",      buildType: "Custom", location: "Rio Verde", completed: "2024" },
  { slug: "mccartney-spec-1849", title: "McCartney Spec 1849", meta: "Casa Grande · Spec Home",       buildType: "Spec", location: "Casa Grande", completed: "2026" },
  { slug: "mccartney-spec-1644", title: "McCartney Spec 1644", meta: "Casa Grande · Spec Home",       buildType: "Spec", location: "Casa Grande", completed: "2026" },
  { slug: "az-city-custom",      title: "AZ City Custom",      meta: "Arizona City · Custom Home",   buildType: "Custom", location: "Arizona City", completed: "2025" },
  { slug: "cozy-comfort",        title: "Cozy Comfort",        meta: "Rio Verde · Custom Home",      buildType: "Custom", location: "Rio Verde", completed: "2024" },
];

export const GALLERY_BY_SLUG = Object.fromEntries(GALLERY_PROJECTS.map((p) => [p.slug, p]));
