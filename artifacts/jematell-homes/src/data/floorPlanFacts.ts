/**
 * The figures each floor plan page's own stat bar shows, for its FloorPlan
 * structured data (src/seo/jsonldBuilders.ts floorPlanJsonLd). Keep these equal
 * to the page: a figure the page states two ways is left out (null) until the
 * page says one thing. 3610's stat bar says 3 bathrooms while its description
 * and drawing say 3.5, so its bathrooms are left out.
 *
 * Bathrooms as the stat bar counts them: 2.5 is two full and one half bath.
 */
export interface FloorPlanFacts {
  /** The address segment, /floor-plans/<planId>. */
  planId: string;
  /** The plan's name as its breadcrumb gives it. */
  name: string;
  sqft: number;
  bedrooms: number;
  fullBathrooms: number | null;
  halfBathrooms: number | null;
  /** The floor plan drawing. */
  layoutImage: string;
  /** The rendering the page uses as its share image. */
  image: string;
}

export const FLOOR_PLAN_FACTS: Record<string, FloorPlanFacts> = {
  "1604": { planId: "1604", name: "1604 Floor Plan", sqft: 1604, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, layoutImage: "/images/plans/1604-1.png", image: "/images/plans/1604-rendering.png" },
  "1644": { planId: "1644", name: "1644 Floor Plan", sqft: 1644, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, layoutImage: "/images/plans/1644-1.png", image: "/images/plans/1644-rendering.png" },
  "1849": { planId: "1849", name: "1849 Floor Plan", sqft: 1849, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, layoutImage: "/images/plans/1849-1.png", image: "/images/1849-rendering-v2.png" },
  "2045": { planId: "2045", name: "2045 Floor Plan", sqft: 2045, bedrooms: 2, fullBathrooms: 2, halfBathrooms: 1, layoutImage: "/images/plans/2045-1.png", image: "/images/plans/2045-rendering.png" },
  "2086": { planId: "2086", name: "2086 Floor Plan", sqft: 2086, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, layoutImage: "/images/plans/2086-1.png", image: "/images/plans/2086-rendering.png" },
  "2194": { planId: "2194", name: "2194 Floor Plan", sqft: 2194, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 0, layoutImage: "/images/plans/2194-1.png", image: "/images/plans/2194-rendering.png" },
  "2616": { planId: "2616", name: "2616 Floor Plan", sqft: 2616, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 1, layoutImage: "/images/plans/2616-1.png", image: "/images/plans/2616-rendering.png" },
  "2867": { planId: "2867", name: "2867 Floor Plan", sqft: 2867, bedrooms: 3, fullBathrooms: 2, halfBathrooms: 1, layoutImage: "/images/plans/2867-1.png", image: "/images/plans/2867-rendering.png" },
  "2997": { planId: "2997", name: "2997 Floor Plan", sqft: 2997, bedrooms: 5, fullBathrooms: 3, halfBathrooms: 1, layoutImage: "/images/plans/2997-1.png", image: "/images/plans/2997-rendering.png" },
  "3094": { planId: "3094", name: "3094 Floor Plan", sqft: 3094, bedrooms: 3, fullBathrooms: 3, halfBathrooms: 0, layoutImage: "/images/plans/3094-1.png", image: "/images/plans/3094-rendering.png" },
  "3102": { planId: "3102", name: "3132 Floor Plan", sqft: 3132, bedrooms: 4, fullBathrooms: 3, halfBathrooms: 1, layoutImage: "/images/plans/3102-floor-plan-updated.png", image: "/images/plans/3102-rendering.png" },
  "3610": { planId: "3610", name: "3610 Floor Plan", sqft: 3610, bedrooms: 4, fullBathrooms: null, halfBathrooms: null, layoutImage: "/images/plans/3610-1.png", image: "/images/plans/3610-rendering.png" },
  "3771": { planId: "3771", name: "3771 Floor Plan", sqft: 3771, bedrooms: 3, fullBathrooms: 4, halfBathrooms: 1, layoutImage: "/images/plans/3771-1.png", image: "/images/plans/3771-rendering.png" },
  "3970": { planId: "3970", name: "3970 Floor Plan", sqft: 3970, bedrooms: 4, fullBathrooms: 4, halfBathrooms: 1, layoutImage: "/images/plans/3970-1.png", image: "/images/plans/3970-rendering.png" },
  "4103": { planId: "4103", name: "4103 Floor Plan", sqft: 4103, bedrooms: 3, fullBathrooms: 4, halfBathrooms: 1, layoutImage: "/images/plans/4103-1.png", image: "/images/plans/4103-rendering.png" },
};
