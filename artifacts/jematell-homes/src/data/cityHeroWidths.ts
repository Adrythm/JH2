/* Widths of the generated rungs for each town hero photo
 * (public/images/city-hero-<slug>-<w>.{avif,webp}). Read by the town pages'
 * hero (ContentPage) and the /where-we-build CityNavigator cards. */
export const cityHeroWidths: Record<string, number[]> = {
  "scottsdale":      [768, 1280, 1500],
  "rio-verde":       [768, 1280, 1500],
  "phoenix":         [768, 1280, 1920, 2500],
  "cave-creek":      [768, 1280, 1500],
  "fountain-hills":  [768, 1280, 1920, 2500],
  "carefree":        [768, 1280, 1500],
  "casa-grande":     [768, 1280, 1920, 2500],
  "apache-junction": [768, 1280, 1500],
  "surprise":        [768, 1280, 1920, 2500],
};
