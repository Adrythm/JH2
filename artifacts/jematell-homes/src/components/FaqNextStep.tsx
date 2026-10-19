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

function pick(slug: string, categorySlug: string): Step | null {
  if (/(^|-)(adu|adus|casita|casitas|guest-house|guest-suite|jadu)(-|$)/.test(slug))
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
  return BY_CATEGORY[categorySlug] ?? null;
}

export function FaqNextStep({ slug, categorySlug }: { slug: string; categorySlug: string }) {
  const step = pick(slug, categorySlug);
  if (!step) return null;
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
