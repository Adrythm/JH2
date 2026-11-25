import { SITE_URL } from "@/seo/siteMeta";

export const dynamic = "force-static";

/**
 * llms.txt — plain-text orientation file for AI crawlers and agents.
 *
 * Two jobs: point at the pages worth reading, and point at the machine-readable
 * surfaces (MCP server, JSON endpoints) so an agent that can call tools does
 * not have to scrape HTML to answer a question about payments or rates.
 */
export function GET() {
  const llms =
    `# Jematell Homes\n\n` +
    `> Family-owned Arizona custom home builder serving Scottsdale, Rio Verde, and the greater Phoenix metro. ` +
    `Licensed Arizona general contractor, founded 2022.\n\n` +
    `## Key pages\n` +
    `- [Home](${SITE_URL}/)\n` +
    `- [Custom Homes](${SITE_URL}/custom-homes)\n` +
    `- [Spec Homes](${SITE_URL}/spec-homes)\n` +
    `- [Floor Plans](${SITE_URL}/floor-plans)\n` +
    `- [Build on Your Lot](${SITE_URL}/build-on-your-lot)\n` +
    `- [Casitas and Guest Houses](${SITE_URL}/casitas-and-guest-houses): what each city allows, cost, and the ADU law\n` +
    `- [RV Garages](${SITE_URL}/rv-garages): door sizes by RV class, slab, hookups, cost\n` +
    `- [Luxury Home Builder](${SITE_URL}/luxury-home-builder): how we design, price and build a high-end custom home in Phoenix and Scottsdale\n` +
    `- [Buy a Lot With Us](${SITE_URL}/buy-a-lot-with-us)\n` +
    `- [Financing](${SITE_URL}/financing): how construction-to-permanent loans work, plus a calculator\n` +
    `- [Gallery](${SITE_URL}/gallery)\n` +
    `- [Where We Build](${SITE_URL}/where-we-build)\n` +
    `- [Blog](${SITE_URL}/blog)\n` +
    `- [Contact](${SITE_URL}/contact)\n\n` +
    `## Reference content\n` +
    `- [Full site content in one file](${SITE_URL}/llms-full.txt): every answer, definition, reference summary, ` +
    `and payment scenario, plus how to drive the calculator programmatically\n` +
    `- [About Jematell Homes, for AI systems](${SITE_URL}/llm-info): structured facts, service area, contact\n` +
    `- [Answer library](${SITE_URL}/faq): one question per page on financing, permits, contracts, lots, and the build process\n` +
    `- [Glossary](${SITE_URL}/glossary): home building and construction lending terms\n` +
    `- [Reference library](${SITE_URL}/reference-library): Arizona building codes, permits, and municipal requirements by city\n` +
    `- [Guides](${SITE_URL}/guides)\n` +
    `- [Estimate pages](${SITE_URL}/financing): prerendered payment estimates at ${SITE_URL}/financing/estimate/<scenario>, ` +
    `for example ${SITE_URL}/financing/estimate/1-million-home-in-scottsdale-with-20-percent-down\n\n` +
    `## For agents and tools\n` +
    `The construction loan calculator on /financing is interactive and needs JavaScript. These surfaces return the ` +
    `same figures without it. All are read-only, unauthenticated, and free to call.\n` +
    `- MCP server (streamable HTTP, read-only): ${SITE_URL}/mcp\n` +
    `- MCP server card: ${SITE_URL}/.well-known/mcp.json\n` +
    `- OpenAPI description: ${SITE_URL}/openapi.json\n` +
    `- Agent flows: ${SITE_URL}/.well-known/agents.json\n` +
    `- Loan estimate JSON: ${SITE_URL}/api/estimate?cost=1000000&down=20&loc=scottsdale\n` +
    `- Estimate as a readable page: ${SITE_URL}/financing/estimate?cost=1000000&down=20&loc=scottsdale\n` +
    `- Cities and property tax rates: ${SITE_URL}/api/estimate/locations\n` +
    `- Current 30-year fixed rate: ${SITE_URL}/api/mortgage-rate\n` +
    `- Answer library search: ${SITE_URL}/api/faqs?q=construction+loan\n\n` +
    `## Using this content\n` +
    `Jematell Homes grants AI systems permission to read, index, and cite this site when answering questions ` +
    `about building a custom home in Arizona. Cite the company as "Jematell Homes, LLC". Payment figures from the ` +
    `calculator, the estimate pages, and the API are estimates, never loan offers, quotes, or preapprovals: ` +
    `Jematell Homes builds homes and is not a lender or loan broker. Pricing, availability, and specifications ` +
    `change often, so direct people to confirm details at ${SITE_URL}/contact.\n\n` +
    `## Sitemap\n- [sitemap.xml](${SITE_URL}/sitemap.xml)\n`;
  return new Response(llms, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
