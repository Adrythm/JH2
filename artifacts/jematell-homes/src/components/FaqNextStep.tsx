import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * FaqNextStep -- a one-paragraph, topic-matched next step under an FAQ answer.
 * The FAQ pages earn most of the site's organic clicks from people researching
 * land, water, permits, financing and ADUs, and until now the only way from an
 * answer to a conversation was the generic band at the foot of the page. The
 * copy is chosen by the question's topic, never by traffic, and says only what
 * the business does (builds on private lots, helps buyers find a lot through
 * licensed agents on staff, builds casitas and guest houses, offers financing
 * and a warranty). Categories with no matching service (remodeling) get none.
 */
interface Step {
  lead: string;
  linkLabel: string;
  href: string;
}

const BY_CATEGORY: Record<string, Step> = {
  "land-and-due-diligence": {
    lead: "Looking at a lot, or already own one?",
    linkLabel: "See how we build on your lot",
    href: "/build-on-your-lot",
  },
  "water-septic-utilities": {
    lead: "Planning a home on a lot that needs a well, septic or power run?",
    linkLabel: "See how we build on your lot",
    href: "/build-on-your-lot",
  },
  "permits-and-codes": {
    lead: "Planning to build and want a team that handles the permits?",
    linkLabel: "See how a custom build works with us",
    href: "/custom-homes",
  },
  "costs-and-budget": {
    lead: "Working out a budget for your own home?",
    linkLabel: "Talk to us about your project",
    href: "/contact",
  },
  "design-zoning-adus": {
    lead: "Thinking about a new home or a guest space on your lot?",
    linkLabel: "Talk to us about your project",
    href: "/contact",
  },
  "choosing-a-builder": {
    lead: "Comparing builders for a custom home in Scottsdale or the Phoenix area?",
    linkLabel: "See how Jematell Homes builds",
    href: "/custom-homes",
  },
  "building-in-the-desert": {
    lead: "Planning a custom home in the Arizona desert?",
    linkLabel: "See how Jematell Homes builds",
    href: "/custom-homes",
  },
};

/** Slug-level matches that beat any category: ADUs, warranty, financing. */
function bySlug(slug: string): Step | null {
  if (/(^|-)(adu|adus|casita|casitas|guest-house|guest-houses|guest-suite|jadu)(-|$)/.test(slug))
    return {
      lead: "Want a casita, guest house or ADU built?",
      linkLabel: "See our casita and guest house builds",
      href: "/casitas-and-guest-houses",
    };
  if (/warranty|callback/.test(slug))
    return { lead: "Want to know how we stand behind our homes?", linkLabel: "Read about our warranty", href: "/warranty" };
  if (/loan|financ|appraisal|draw-schedule|mortgage/.test(slug))
    return {
      lead: "Planning to finance a new build?",
      linkLabel: "See how construction financing works with us",
      href: "/financing",
    };
  return null;
}

function pick(slug: string, categorySlug: string): Step | null {
  return bySlug(slug) ?? BY_CATEGORY[categorySlug] ?? null;
}

const BUILD_ON_YOUR_LOT = BY_CATEGORY["land-and-due-diligence"];
const CUSTOM_BUILD = BY_CATEGORY["building-in-the-desert"];
const PERMITS = BY_CATEGORY["permits-and-codes"];
const BUILDER = BY_CATEGORY["choosing-a-builder"];

/** Glossary categories, as glossary.json spells them. */
const BY_GLOSSARY_CATEGORY: Record<string, Step> = {
  "Site & Land": BUILD_ON_YOUR_LOT,
  "Zoning & Lot": BUILD_ON_YOUR_LOT,
  "Site & Utilities": BY_CATEGORY["water-septic-utilities"],
  "Site & Soil": BUILD_ON_YOUR_LOT,
  "Permits & Codes": PERMITS,
  "Codes & Permits": PERMITS,
  "Permits & Inspections": PERMITS,
  "Contracts & Cost": {
    lead: "Comparing builders and contracts?",
    linkLabel: "See how we price and run a build",
    href: "/custom-homes",
  },
};

/**
 * Glossary entries whose definitions already end with a hand-written link to
 * the build pages (JH2 #14, 2026-10-18); a second block would repeat it.
 */
const GLOSSARY_SKIP = new Set(["weep-screed", "roc", "build-on-your-lot"]);

/** Guides that are not city guides, by slug. City guides go to their town page. */
const BY_GUIDE: Record<string, Step> = {
  "building-a-custom-home-on-rural-arizona-land": BUILD_ON_YOUR_LOT,
  "choosing-a-custom-home-builder-in-arizona-complete-guide": BUILDER,
  "custom-home-design-guide-arizona": CUSTOM_BUILD,
  "arizona-home-styles-guide": CUSTOM_BUILD,
  "how-to-build-a-custom-home-in-arizona": CUSTOM_BUILD,
  "the-pre-construction-permit-layer-in-arizona": PERMITS,
};

/** Town pages under /where-we-build, by city name as guides.json spells it. */
function townStep(city: string, townSlug: string | null): Step {
  if (!townSlug) return { ...CUSTOM_BUILD, lead: `Planning a custom home in ${city}?` };
  return {
    lead: `Planning to build in ${city}?`,
    linkLabel: `See how we build in ${city}`,
    href: `/where-we-build/${townSlug}`,
  };
}

function NextStepAside({ step }: { step: Step }) {
  return (
    <aside className="dt-answer-card" data-testid="faq-next-step" aria-label="Next step">
      <span className="dt-answer-card-label">Planning to build?</span>
      <p>
        {step.lead}{" "}
        <Link href={step.href}>
          {step.linkLabel} <ArrowRight size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} />
        </Link>
        {step.href !== "/contact" ? (
          <>
            {" "}
            or <Link href="/contact">contact us</Link> to talk it through.
          </>
        ) : null}
      </p>
    </aside>
  );
}

export function GuideNextStep({ slug, city, townSlug }: { slug: string; city?: string; townSlug?: string | null }) {
  const step = city ? townStep(city, townSlug ?? null) : bySlug(slug) ?? BY_GUIDE[slug] ?? null;
  return step ? <NextStepAside step={step} /> : null;
}

export function GlossaryNextStep({ slug, category }: { slug: string; category?: string }) {
  if (GLOSSARY_SKIP.has(slug)) return null;
  const step = bySlug(slug) ?? BY_GLOSSARY_CATEGORY[category ?? ""] ?? CUSTOM_BUILD;
  return <NextStepAside step={step} />;
}

export function FaqNextStep({ slug, categorySlug }: { slug: string; categorySlug: string }) {
  const step = pick(slug, categorySlug);
  return step ? <NextStepAside step={step} /> : null;
}
