import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  buildInterestSeries,
  estimate,
  TAX_AS_OF,
  INSURANCE_AS_OF,
  INSURANCE_PER_YEAR_PER_100K,
  NEW_BUILD_TAX_NOTE,
} from "@workspace/construction-loan";
import { PaymentDonut, PaymentTimeline } from "@/components/PaymentCharts";
import { breakdownParts } from "@/components/paymentChartParts";
import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { DetailDisclaimer } from "@/components/DetailParts";
import { locations } from "@/config/siteConfig";
import { pages } from "@/data/pages";
import { ContactCta } from "@/components/ContactCta";
import { WhyBuild } from "@/components/WhyBuild";
import { CTA } from "@/cta";
import {
  SCENARIO_BUILD_MONTHS,
  SCENARIO_CONSTRUCTION_RATE_PCT,
  SCENARIO_DOWN_PCTS,
  SCENARIO_LOCATIONS,
  SCENARIO_MORTGAGE_RATE_PCT,
  SCENARIO_PRICES,
  SCENARIO_TERM_YEARS,
  estimateScenarios,
  getEstimateScenario,
  isIndexedScenario,
  scenarioSlug,
  scenarioTitle,
  type EstimateScenario,
} from "@/data/estimateScenarios";

/**
 * /financing/estimate/<scenario> — a prerendered construction-loan estimate.
 *
 * Every figure on the page is computed at build time from
 * @workspace/construction-loan, the same module behind the interactive
 * calculator and the /api/estimate endpoint, so the three can never disagree.
 * Rates are the fixed assumptions stated on the page; the calculator uses the
 * live 30-year fixed rate, which is why each page links to it.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return estimateScenarios.map((s) => ({ slug: s.slug }));
}

const money = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function computeFor(s: EstimateScenario) {
  return estimate({
    totalProjectCost: s.price.value,
    landOwned: false,
    landValue: 0,
    buildCost: 0,
    downPct: s.downPct,
    buildRatePct: SCENARIO_CONSTRUCTION_RATE_PCT,
    permRatePct: SCENARIO_MORTGAGE_RATE_PCT,
    termYears: SCENARIO_TERM_YEARS,
    buildMonths: SCENARIO_BUILD_MONTHS,
    locationSlug: s.location.slug,
    hoaMonthly: 0,
  });
}

function calculatorHref(s: EstimateScenario): string {
  const p = new URLSearchParams({
    cost: String(s.price.value),
    down: String(s.downPct),
    br: String(SCENARIO_CONSTRUCTION_RATE_PCT),
    term: String(SCENARIO_TERM_YEARS),
    months: String(SCENARIO_BUILD_MONTHS),
    loc: s.location.slug,
  });
  return `/financing?${p.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getEstimateScenario(slug);
  if (!s) return {};
  const est = computeFor(s);
  const meta = pageMetadata({
    title: scenarioTitle(s),
    description:
      `A ${s.price.label} custom home in ${s.location.name}, Arizona with ${s.downPct}% down works out to about ` +
      `${money(est.allInMonthly)} a month after move-in, including principal and interest, property taxes, and insurance. ` +
      `Estimate only, not a loan offer.`,
    canonical: `/financing/estimate/${s.slug}`,
  });
  // Only one down payment per budget and city is indexed; the rest stay for
  // readers and pass their links on (see isIndexedScenario).
  return isIndexedScenario(s) ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function EstimateScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getEstimateScenario(slug);
  if (!s) notFound();

  const est = computeFor(s);
  const title = scenarioTitle(s);
  const url = `/financing/estimate/${s.slug}`;

  const paymentAnswer =
    `About ${money(est.allInMonthly)} a month after move-in: ${money(est.permMonthly)} in principal and interest on a ` +
    `${money(est.loan)} loan at ${SCENARIO_MORTGAGE_RATE_PCT}% over ${SCENARIO_TERM_YEARS} years, ` +
    `${money(est.monthlyTax)} in property taxes at ${s.location.name}'s ${s.location.effectiveRatePct}% average effective rate, ` +
    `and ${money(est.monthlyInsurance)} in homeowners insurance. HOA dues, if the community has them, are on top of that.`;

  const cashAnswer =
    `About ${money(est.cashToPlanFor)}: a ${money(est.cashDown)} down payment at ${s.downPct}%, plus roughly ` +
    `${money(est.totalBuildInterest)} in interest paid across a ${SCENARIO_BUILD_MONTHS}-month build. Closing costs are separate. ` +
    `During construction you pay interest only on the money drawn so far, so the payments start small and grow with each draw, ` +
    `reaching about ${money(est.finalMonthInterest)} in the final month before the loan converts.`;

  const faqs = [
    { question: `What is the monthly payment on a ${s.price.label} home in ${s.location.name}, AZ with ${s.downPct}% down?`, shortAnswer: paymentAnswer },
    { question: `How much cash do you need to build a ${s.price.label} home in ${s.location.name}?`, shortAnswer: cashAnswer },
  ];

  const rows: Array<[string, string]> = [
    ["Total project value", s.price.exact],
    ["Down payment", `${money(est.cashDown)} (${s.downPct}%)`],
    ["Construction-to-permanent loan", money(est.loan)],
    ["Interest during the build", `${money(est.totalBuildInterest)} total over ${SCENARIO_BUILD_MONTHS} months`],
    ["Cash to plan for", money(est.cashToPlanFor)],
    ["Principal and interest", `${money(est.permMonthly)}/mo`],
    ["Property taxes", `${money(est.monthlyTax)}/mo (${money(est.taxYearly)}/yr)`],
    ["Homeowners insurance", `${money(est.monthlyInsurance)}/mo (${money(est.insuranceYearly)}/yr)`],
    ["All-in monthly after move-in", `${money(est.allInMonthly)}/mo`],
  ];

  /**
   * A related scenario, carrying the figure it resolves to. Showing the monthly
   * payment on the card is the point: a reader comparing budgets or cities gets
   * the answer without a round trip, and every one of those numbers is real
   * prerendered text rather than something only the calculator can produce.
   */
  const related = (o: EstimateScenario | undefined, label: string) => {
    if (!o) return null;
    return { slug: o.slug, label, monthly: money(computeFor(o).allInMonthly) };
  };
  const byBudget = SCENARIO_PRICES.filter((p) => p.slug !== s.price.slug)
    .map((p) => related(getEstimateScenario(scenarioSlug(p, s.location, s.downPct)), `${p.label} home`))
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const byCity = SCENARIO_LOCATIONS.filter((l) => l.slug !== s.location.slug)
    .map((l) => related(getEstimateScenario(scenarioSlug(s.price, l, s.downPct)), l.name))
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const byDown = SCENARIO_DOWN_PCTS.filter((d) => d !== s.downPct)
    .map((d) => related(getEstimateScenario(scenarioSlug(s.price, s.location, d)), `${d}% down`))
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const financingQuestions = [
    { to: "/faq/construction-to-permanent-loan-arizona", label: "What is a construction-to-permanent loan in Arizona?" },
    { to: "/faq/construction-loan-requirements-arizona", label: "What are construction loan requirements in Arizona?" },
    { to: "/faq/do-i-pay-interest-during-the-construction-phase-of-a-loan-in-arizona", label: "Do I pay interest during the construction phase?" },
    { to: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-arizona", label: "How much does it cost to build a custom home in Arizona?" },
    { to: "/faq/what-is-a-builder-allowance-and-what-happens-if-you-go-over", label: "What is a builder allowance and what if you go over it?" },
    { to: "/faq/cost-plus-vs-fixed-price-home-contract", label: "Cost-plus or fixed-price contract: which is better?" },
  ];

  /**
   * The "where we build" page for this scenario's city, when there is one. Every
   * city in the tax table has one today, but the card is guarded so adding a tax
   * location without a matching page degrades to no section rather than a dead
   * link.
   */
  const cityLocation = locations.find((l) => l.slug === s.location.slug);
  const cityPage = pages[s.location.slug];
  const cityCard =
    cityLocation && cityPage
      ? {
          href: `/where-we-build/${cityLocation.slug}`,
          name: cityLocation.name,
          tagline: cityLocation.tagline,
          image: cityPage.ogImage,
          description: cityPage.description,
        }
      : null;

  const termsToKnow = [
    { to: "/glossary/draw-schedule", label: "Draw Schedule" },
    { to: "/glossary/as-completed-appraisal", label: "As-Completed Appraisal" },
    { to: "/glossary/interest-reserve", label: "Interest Reserve" },
    { to: "/glossary/allowance", label: "Allowance" },
    { to: "/glossary/builders-risk-insurance", label: "Builders Risk Insurance" },
  ];

  return (
    <main className="page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Financing", url: "/financing" },
          { name: title, url },
        ])}
      />
      <JsonLd data={faqPageJsonLd({ url, items: faqs })} />

      {/*
        The page opens on the same dark surface the calculator band uses on
        /financing: same palette, same charts, so a scenario page reads as the
        same tool rather than a stripped-down copy of it. Running it from the
        very top also gives the site header a dark backdrop to sit on before the
        reader scrolls, which a light hero does not. Both charts render
        server-side with their final geometry; the sweep-in is CSS only.
      */}
      <section className="est-band">
        <div className="container est-band-inner">
          <div className="dt-back-row est-back-row">
            <Link href="/financing#calculator" className="dt-back dt-back--top est-back" data-testid="estimate-back">
              <ArrowLeft size={14} aria-hidden="true" />
              Construction loan calculator
            </Link>
          </div>

          <p className="eyebrow est-eyebrow est-eyebrow--header">Construction loan estimate</p>

          <div className="est-hero-grid">
            <div className="est-hero-copy">
              <h1 className="est-h1">{title}</h1>
              <p className="est-lead">
                Building a {s.price.exact} custom home in {s.location.name}, Arizona with {s.downPct}% down means a{" "}
                {money(est.loan)} construction-to-permanent loan, and about {money(est.cashToPlanFor)} in cash between
                the down payment and the interest paid while the house is being built.
              </p>
              <div className="est-hero-cta">
                <ContactCta className="est-cta est-cta--primary" testid="estimate-hero-cta">
                  Start Your Build
                </ContactCta>
              </div>
            </div>

            <div className="est-hero-chart">
              <div className="est-stat est-stat--lead">
                <span className="est-stat-k">All-in monthly after move-in</span>
                <span className="est-stat-v">{money(est.allInMonthly)}</span>
                <span className="est-stat-sub">
                  {money(est.permMonthly)} principal and interest, {money(est.monthlyTax)} taxes,{" "}
                  {money(est.monthlyInsurance)} insurance
                </span>
              </div>
              <PaymentDonut
                parts={breakdownParts({
                  principalAndInterest: est.permMonthly,
                  propertyTax: est.monthlyTax,
                  insurance: est.monthlyInsurance,
                  hoa: est.hoaMonthly,
                })}
                total={est.allInMonthly}
              />
            </div>
          </div>

          <div className="est-stats">
            <div className="est-stat">
              <span className="est-stat-k">Loan amount</span>
              <span className="est-stat-v">{money(est.loan)}</span>
              <span className="est-stat-sub">After a {money(est.cashDown)} down payment</span>
            </div>
            <div className="est-stat">
              <span className="est-stat-k">Cash to plan for</span>
              <span className="est-stat-v">{money(est.cashToPlanFor)}</span>
              <span className="est-stat-sub">Down payment plus construction-period interest</span>
            </div>
            <div className="est-stat">
              <span className="est-stat-k">Interest during the build</span>
              <span className="est-stat-v">{money(est.totalBuildInterest)}</span>
              <span className="est-stat-sub">
                Payments start small and grow with each draw, reaching about {money(est.finalMonthInterest)}/mo in the
                final month
              </span>
            </div>
          </div>

        </div>
      </section>

      <section className="dt-section est-page est-body">
        <div className="container est-container">
          <table className="est-table">
            <caption>Full breakdown at {SCENARIO_MORTGAGE_RATE_PCT}% on a {SCENARIO_TERM_YEARS}-year mortgage</caption>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="est-h2">What you pay while the house is being built</h2>
          <p>
            With a construction-to-permanent loan you apply once and close once. During the build the lender
            releases money to the builder in stages called draws, each tied to completed work, and you pay
            interest only on what has been drawn so far. On a {money(est.loan)} loan at{" "}
            {SCENARIO_CONSTRUCTION_RATE_PCT}% over {SCENARIO_BUILD_MONTHS} months that comes to about{" "}
            {money(est.totalBuildInterest)} in total, starting near {money(est.finalMonthInterest / SCENARIO_BUILD_MONTHS)} in
            the first month and reaching about {money(est.finalMonthInterest)} in the last. Some lenders bill
            those payments monthly; others set up an interest reserve so nothing comes out of pocket until the
            loan converts. When the home is finished the loan becomes a standard mortgage, usually without a
            second closing.
          </p>

          {/*
            The timeline sits here rather than up in the band because this is
            the paragraph it illustrates, and a dark chart card mid-page breaks
            up what would otherwise be a long run of prose.
          */}
          <div className="est-timeline-card">
            <PaymentTimeline
              series={buildInterestSeries(est.loan, SCENARIO_CONSTRUCTION_RATE_PCT, SCENARIO_BUILD_MONTHS)}
              allInMonthly={est.allInMonthly}
              months={SCENARIO_BUILD_MONTHS}
              finalMonthInterest={est.finalMonthInterest}
              idPrefix={`tl-${s.slug}`}
            />
          </div>

          <h2 className="est-h2">Where these numbers come from</h2>
          <p>
            Property taxes use {s.location.name}&apos;s average effective residential rate of{" "}
            {s.location.effectiveRatePct}% ({s.location.county} County), verified {TAX_AS_OF} (
            <a href={s.location.sourceUrl} rel="nofollow noreferrer" target="_blank">
              source
            </a>
            ). Insurance uses a planning estimate of about {money(INSURANCE_PER_YEAR_PER_100K)} per year per
            $100,000 of home value as of {INSURANCE_AS_OF}. The mortgage rate here is a fixed {SCENARIO_MORTGAGE_RATE_PCT}% assumption and the
            construction rate is {SCENARIO_CONSTRUCTION_RATE_PCT}%; both are editable in the calculator, which
            also loads the current 30-year fixed average. HOA dues are not included because they vary by
            community.
          </p>
          <p className="est-note">{NEW_BUILD_TAX_NOTE}</p>

          <h2 className="est-h2">Common questions</h2>
          {faqs.map((f) => (
            <div key={f.question} className="est-faq">
              <h3 className="est-faq-q">{f.question}</h3>
              <p className="est-faq-a">{f.shortAnswer}</p>
            </div>
          ))}

          <div className="est-cta-row">
            <ContactCta className="est-cta est-cta--primary" testid="estimate-lead-cta">
              Get a real quote
            </ContactCta>
            <Link className="est-cta" href={`${calculatorHref(s)}#calculator`}>
              Adjust this estimate
            </Link>
            <Link className="est-cta" href="/contact">
              Contact us
            </Link>
          </div>

          <p className="est-note">
            Estimates only, not a loan offer, quote, or preapproval. Jematell Homes is a home builder, not a
            lender or loan broker. Figures assume draws spread evenly across the build and exclude closing
            costs. Your lender&apos;s terms, your parcel&apos;s tax bill, and your insurance quote will differ.
          </p>

          <DetailDisclaimer />
        </div>
      </section>

      {/*
        These pages double as landing pages, so the transparency block that
        carries the homepage's core pitch runs here too, directly after the
        numbers and before the exploration modules. Kept in sync with the
        api-server's static copy of this section (see estimatePage.ts), which
        serves the same block on shared-link estimates.
      */}
      <WhyBuild />

      {/*
        The old single "Keep exploring" block put four link lists in two masonry
        columns, which read as one cramped wall. These are three separate
        modules with room to breathe, and each estimate card carries the figure
        it resolves to so comparing budgets, cities, or down payments does not
        require opening anything.
      */}
      {cityCard ? (
        <section className="dt-section est-city-section" data-testid="estimate-city">
          <div className="container est-wide">
            <Link className="est-city-card" href={cityCard.href}>
              <span className="est-city-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cityCard.image}
                  alt={`Custom homes built by Jematell Homes in ${cityCard.name}, Arizona`}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="est-city-body">
                <span className="est-city-eyebrow">Building in {cityCard.name}</span>
                <span className="est-city-title">{cityCard.tagline}</span>
                <span className="est-city-text">{cityCard.description}</span>
                <span className="est-city-link">
                  See what we build in {cityCard.name}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="dt-section est-explore" data-testid="estimate-related">
        <div className="container est-wide">
          <h2 className="est-h2 est-explore-h2">Compare other estimates</h2>

          {/*
            Three lists side by side rather than a card grid: with 4, 8, and 2
            items the cards left orphan gaps, and a row list compares better
            anyway because the monthly figures line up in a column.
          */}
          <div className="est-compare-cols">
            {[
              { label: `Other budgets in ${s.location.name}`, items: byBudget },
              { label: `A ${s.price.label} home in other cities`, items: byCity },
              { label: "Other down payments", items: byDown },
            ].map((group) => (
              <div key={group.label} className="est-compare-col">
                <h3 className="est-related-label">{group.label}</h3>
                <ul className="est-compare-list">
                  {group.items.map((o) => (
                    <li key={o.slug}>
                      <Link className="est-compare-row" href={`/financing/estimate/${o.slug}`}>
                        <span className="est-compare-label">{o.label}</span>
                        <span className="est-compare-value">{o.monthly}/mo</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dt-section est-explore est-explore--alt">
        <div className="container est-wide">
          <h2 className="est-h2 est-explore-h2">Financing questions</h2>
          <ul className="est-q-grid">
            {financingQuestions.map((q) => (
              <li key={q.to}>
                <Link className="est-q-card" href={q.to}>
                  <span>{q.label}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="est-h2 est-explore-h2 est-terms-h2">Terms to know</h2>
          <ul className="est-terms">
            {termsToKnow.map((t) => (
              <li key={t.to}>
                <Link className="est-term-chip" href={t.to}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTA />
    </main>
  );
}
