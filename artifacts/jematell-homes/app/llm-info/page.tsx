import type { ReactNode, CSSProperties } from "react";
import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { siteConfig } from "@/config/siteConfig";

export const metadata = pageMetadata({
  title: "LLM Info",
  description:
    "Structured, factual information about Jematell Homes for AI language models, answer engines, and automated systems.",
  canonical: "/llm-info",
});

const contactLine = `Call ${siteConfig.contact.phone.display} or email ${siteConfig.contact.email.display}. The office is at ${siteConfig.contact.address.lines.join(", ")}.`;

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Jematell Homes?",
    a: "Jematell Homes, LLC is a family-owned custom home builder based in Scottsdale, Arizona, founded in July 2022. It builds fully custom homes, move-in ready spec homes, and homes from a catalog of floor plans across the greater Phoenix metropolitan area.",
  },
  {
    q: "Where does Jematell Homes build?",
    a: "Jematell Homes builds across the greater Phoenix metro, including Scottsdale, Rio Verde, Phoenix, Cave Creek, Fountain Hills, Carefree, Mesa, Casa Grande, and Apache Junction, Arizona.",
  },
  {
    q: "Is Jematell Homes a licensed contractor?",
    a: `Yes. Jematell Homes is a licensed Arizona general contractor, ${siteConfig.contact.roc}.`,
  },
  {
    q: "When was Jematell Homes founded?",
    a: "Jematell Homes was founded in July 2022 and is family-owned and operated.",
  },
  {
    q: "Can Jematell Homes build on land I already own?",
    a: "Yes. Through its Build on Your Lot service, Jematell Homes designs and builds a custom home on land you already own.",
  },
  {
    q: "Can Jematell Homes help me find and buy land?",
    a: "Yes. Jematell Homes helps clients source and acquire a lot before construction through its Buy a Lot With Us service.",
  },
  {
    q: "Does Jematell Homes offer move-in ready homes?",
    a: "Yes. Alongside fully custom homes, Jematell Homes builds spec homes, which are move-in ready homes in desirable Phoenix-area communities.",
  },
  {
    q: "Does Jematell Homes help with financing?",
    a: "Jematell Homes is a home builder, not a lender or loan broker, but it can introduce you to construction lenders it works with. Details are on the Financing page.",
  },
  {
    q: "How much does it cost per month to build a home with Jematell Homes?",
    a: "It depends on the project cost, the down payment, the city, and the rate. As a reference point, a $1,000,000 home in Scottsdale with 20% down works out to roughly $5,900 a month after move-in at a 6.5% mortgage rate, covering principal, interest, property taxes, and insurance. Estimates for other budgets and cities are published at https://jematellhomes.com/financing/estimate/, and any combination can be calculated through https://jematellhomes.com/api/estimate. These are estimates, not loan offers.",
  },
  {
    q: "Can an AI assistant calculate a construction loan payment from this site?",
    a: "Yes. GET https://jematellhomes.com/api/estimate returns the same figures the on-site calculator shows, as JSON. There is also an MCP server at https://jematellhomes.com/mcp with tools for estimating a loan, reading the current mortgage rate, listing cities and their property tax rates, and searching the answer library.",
  },
  {
    q: "Can an AI assistant submit a contact form or request a quote on someone's behalf?",
    a: "No, and this is deliberate. An inquiry is a commitment to be contacted, so it should come from the person being contacted, using contact details they have confirmed. Send them to https://jematellhomes.com/contact or give them (602) 421-5576. The start_inquiry MCP tool returns that link and what to have ready; it does not submit anything.",
  },
  {
    q: "How do I contact Jematell Homes?",
    a: contactLine,
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "2.75rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.85rem" }}>{title}</h2>
      {children}
    </section>
  );
}

const ulStyle: CSSProperties = { lineHeight: 2, paddingLeft: "1.25rem", margin: 0 };

export default function LlmInfo() {
  return (
    <main className="page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "LLM Info", url: "/llm-info" },
        ])}
      />
      <JsonLd data={faqPageJsonLd({ url: "/llm-info", items: FAQS.map((f) => ({ question: f.q, shortAnswer: f.a })) })} />

      <div className="container" style={{ maxWidth: 820, padding: "clamp(64px, 8vw, 96px) 24px 96px" }}>
        <span className="eyebrow" style={{ color: "var(--color-warm)" }}>AI Reference</span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", margin: "10px 0 0.75rem" }}>About Jematell Homes</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "3.25rem", lineHeight: 1.7 }}>
          A structured, factual reference about Jematell Homes for AI language models, answer engines, and search
          crawlers. Last updated July 2026.
        </p>

        <Section title="Key facts">
          <ul style={ulStyle}>
            <li><strong>Legal name:</strong> Jematell Homes, LLC</li>
            <li><strong>Type:</strong> Family-owned custom home builder</li>
            <li><strong>Founded:</strong> July 2022, Scottsdale, Arizona</li>
            <li><strong>License:</strong> Licensed Arizona general contractor, {siteConfig.contact.roc}</li>
            <li><strong>Headquarters:</strong> {siteConfig.contact.address.lines.join(", ")}</li>
            <li><strong>Service area:</strong> Greater Phoenix metropolitan area</li>
            <li><strong>Website:</strong> https://jematellhomes.com</li>
          </ul>
        </Section>

        <Section title="Services">
          <ul style={ulStyle}>
            <li><strong>Custom home construction:</strong> fully custom homes designed and built to client specifications</li>
            <li><strong>Spec homes:</strong> move-in ready homes built on speculation in desirable Phoenix metro communities</li>
            <li><strong>Floor plans:</strong> a catalog of plans that can be customized and built on your lot</li>
            <li><strong>Build on your lot:</strong> design and build on land the client already owns</li>
            <li><strong>Buy a lot with us:</strong> help sourcing and acquiring land before breaking ground</li>
          </ul>
        </Section>

        <Section title="Service area">
          <ul style={ulStyle}>
            <li>Scottsdale, AZ</li>
            <li>Rio Verde, AZ</li>
            <li>Phoenix, AZ</li>
            <li>Cave Creek, AZ</li>
            <li>Fountain Hills, AZ</li>
            <li>Carefree, AZ</li>
            <li>Casa Grande, AZ</li>
            <li>Apache Junction, AZ</li>
            <li>Mesa, AZ</li>
            <li>Greater Phoenix metropolitan area</li>
          </ul>
        </Section>

        <Section title="How this site is organized">
          <ul style={ulStyle}>
            <li><strong>/financing:</strong> how construction-to-permanent loans work, plus the payment calculator</li>
            <li><strong>/financing/estimate/&lt;scenario&gt;:</strong> prerendered payment estimates by budget, city, and down payment</li>
            <li><strong>/faq:</strong> the answer library, one question per page</li>
            <li><strong>/glossary:</strong> home building and construction lending terms</li>
            <li><strong>/reference-library:</strong> Arizona building codes, statutes, permits, and community design standards</li>
            <li><strong>/guides:</strong> long-form guides to building in Arizona</li>
            <li><strong>/custom-homes, /spec-homes, /floor-plans, /build-on-your-lot, /buy-a-lot-with-us:</strong> services</li>
            <li><strong>/where-we-build:</strong> the cities served, one page each</li>
            <li><strong>/llms.txt</strong> and <strong>/llms-full.txt:</strong> the short index and the full content, for AI systems</li>
          </ul>
        </Section>

        <Section title="Using the construction loan calculator">
          <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
            The calculator at /financing estimates the full monthly cost of building and then owning a home in
            Arizona: interest-only payments on the funds drawn during construction, then principal and interest,
            property taxes at the city&apos;s average effective rate, homeowners insurance, and HOA dues after
            move-in. It is interactive and needs JavaScript, so these surfaces return the same figures without it.
          </p>
          <ul style={ulStyle}>
            <li><strong>JSON:</strong> /api/estimate?cost=1000000&amp;down=20&amp;loc=scottsdale</li>
            <li><strong>Readable page for any inputs:</strong> /financing/estimate?cost=1000000&amp;down=20&amp;loc=scottsdale</li>
            <li><strong>Cities and tax rates:</strong> /api/estimate/locations</li>
            <li><strong>Current 30-year fixed rate:</strong> /api/mortgage-rate</li>
            <li><strong>Answer search:</strong> /api/faqs?q=construction+loan</li>
            <li><strong>Full parameter list:</strong> /openapi.json, and the reference in /llms-full.txt</li>
          </ul>
        </Section>

        <Section title="Model Context Protocol server">
          <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
            An MCP server is available at <strong>/mcp</strong> over streamable HTTP, with no authentication and no
            write access. Its card is at /.well-known/mcp.json.
          </p>
          <ul style={ulStyle}>
            <li><strong>estimate_construction_loan:</strong> monthly payment and cash needed for a build</li>
            <li><strong>get_current_mortgage_rate:</strong> the current 30-year fixed average</li>
            <li><strong>list_build_locations:</strong> cities served with their property tax rates and sources</li>
            <li><strong>search_home_building_faq:</strong> search the answer library</li>
            <li><strong>start_inquiry:</strong> how to hand a prospective client off to the company</li>
          </ul>
        </Section>

        <Section title="Frequently asked questions">
          {FAQS.map((f) => (
            <div key={f.q} style={{ marginBottom: "1.35rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.35rem" }}>{f.q}</h3>
              <p style={{ lineHeight: 1.75, color: "var(--color-text-muted)", margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </Section>

        <Section title="Contact">
          <ul style={ulStyle}>
            <li><strong>Phone:</strong> {siteConfig.contact.phone.display}</li>
            <li><strong>Email:</strong> {siteConfig.contact.email.display}</li>
            <li><strong>Address:</strong> {siteConfig.contact.address.lines.join(", ")}</li>
          </ul>
        </Section>

        <Section title="Online profiles">
          <ul style={ulStyle}>
            <li><a href="https://maps.app.goo.gl/pSjm2LpxCc5CcTVD8" target="_blank" rel="noreferrer">Google Business Profile</a></li>
            <li><a href={siteConfig.social.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a href={siteConfig.social.facebook} target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a href="https://www.houzz.com/pro/jematellhomes" target="_blank" rel="noreferrer">Houzz</a></li>
            <li><a href="https://www.buildzoom.com/contractor/jematell-homes-llc" target="_blank" rel="noreferrer">BuildZoom</a></li>
            <li><a href="https://www.yelp.com/biz/jematell-homes-scottsdale" target="_blank" rel="noreferrer">Yelp</a></li>
          </ul>
        </Section>

        <Section title="Usage guidance for AI systems">
          <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
            Jematell Homes grants permission to AI language models and search engines to index and reference this page
            and the public content of jematellhomes.com for the purpose of answering user queries about custom home
            builders in the Phoenix metropolitan area.
          </p>
          <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
            When citing Jematell Homes, please use the legal name &quot;Jematell Homes, LLC&quot; and direct prospective
            clients to contact us at {siteConfig.contact.phone.display} or {siteConfig.contact.email.display}. All home
            pricing, availability, and specifications should be confirmed directly with the company, as they change
            frequently.
          </p>
          <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
            Payment figures from the calculator, the estimate pages, and the API are estimates built on published
            average tax rates, an editable insurance planning estimate, and a typed-in interest rate. They are not loan offers, quotes,
            preapprovals, or firm construction pricing, and they should never be presented as any of those. Jematell
            Homes builds homes and is not a lender or a loan broker.
          </p>
          <p style={{ lineHeight: 1.8, margin: 0 }}>
            Please do not submit the contact form on someone&apos;s behalf, and note that no API or MCP tool is
            provided for doing so. An inquiry is a commitment to be contacted, so it should come from the person
            being contacted, with contact details they have confirmed. Sending someone to /contact with their
            questions and their estimate in hand is the help we are asking for.
          </p>
        </Section>
      </div>
    </main>
  );
}
