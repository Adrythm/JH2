import { pageMetadata } from "@/seo/metadata";
import { absoluteUrl } from "@/seo/siteMeta";
import { Hero, About, ServicesSplit, Process, Reviews, FeaturedProjects, HomepageFloorPlans } from "@/sections";
import { WhyBuild } from "@/components/WhyBuild";
import { CTA } from "@/cta";

export const metadata = pageMetadata({
  title: "Custom Home Builder in Scottsdale & Phoenix, AZ",
  description:
    "Family-owned custom home builder in Scottsdale, AZ. We build on your lot across Rio Verde, Cave Creek and the Phoenix metro, with upfront pricing and weekly updates.",
  canonical: "/",
});

export default function Home() {
  // The hero's preload is emitted by ResponsiveImage (priority) so the hint
  // always matches the rendered <picture> — a manual webp preload here would
  // double-download now that the picture serves AVIF first.
  return (
    <main>
      {/* Root canonical/og:url carry the trailing slash to stay byte-identical
          with the old build and sitemap.xml. Next's metadata resolver strips it
          under trailingSlash:false, so pageMetadata omits both for "/" and the
          tags are rendered here instead (React hoists them into <head>). */}
      <link rel="canonical" href={absoluteUrl("/")} />
      <meta property="og:url" content={absoluteUrl("/")} />
      <Hero />
      <About />
      <ServicesSplit />
      <Process />
      {/* Transparency pillars. Sits after the process so the pricing and
          schedule commitments read as a continuation of how we work, before
          the proof sections below. */}
      <WhyBuild />
      <FeaturedProjects />
      <Reviews />
      <HomepageFloorPlans />
      <CTA />
    </main>
  );
}
