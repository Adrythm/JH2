import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { contentPageMeta } from "@/lib/contentPageMeta";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { SITE_URL } from "@/seo/siteMeta";
import { AboutCta } from "@/components/AboutCta";
import { ContactCta } from "@/components/ContactCta";

export const metadata = pageMetadata(contentPageMeta({ pageKey: "aboutus" }));

const ABOUT_PATH = "/about";
const ABOUT_URL = SITE_URL + ABOUT_PATH;

// Leadership team. No portrait photos exist yet, so each card uses an initials
// monogram; swap in <img> cards when headshots are provided.
const TEAM: { name: string; monogram: string; role: string; bio: string; jsonId?: string }[] = [
  {
    name: "Joseph Telles",
    monogram: "JT",
    role: "President, Founder",
    bio: "Joseph founded Jematell Homes with over a decade of experience building homes across Arizona. His hands-on approach and eye for quality guide every project the company takes on.",
    jsonId: SITE_URL + "/#founder",
  },
  {
    name: "Tyler Johnson",
    monogram: "TJ",
    role: "Vice President | Real Estate & Client Relations",
    bio: "Tyler brings a background in finance as a financial analyst and holds an active Arizona real estate license, helping clients move through budgets, financing, and land with clarity and confidence.",
  },
  {
    name: "Dave Telles",
    monogram: "DT",
    role: "Co-Founder",
    bio: "Dave contributes more than 40 years of experience in land development and bridge building. His deep knowledge of sitework and infrastructure keeps every build on solid ground.",
  },
];

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SectionHead({ eyebrow, title, centered }: { eyebrow: string; title: string; centered?: boolean }) {
  return (
    <div className={`page-section-head${centered ? " centered" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="heading-lg about-h2">{title}</h2>
    </div>
  );
}

function aboutJsonLd(): object[] {
  const org = { "@id": SITE_URL + "/#organization" };
  const aboutPage = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": ABOUT_URL + "#webpage",
    url: ABOUT_URL,
    name: "About Jematell Homes",
    description:
      "Jematell Homes is a family-owned custom home builder in Scottsdale, Arizona, led by Joseph Telles, Tyler Johnson, and Dave Telles, serving the greater Phoenix metro.",
    about: org,
    isPartOf: { "@id": SITE_URL + "/#website" },
    primaryImageOfPage: SITE_URL + "/images/about-hero.jpg",
  };
  const people = TEAM.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    ...(t.jsonId ? { "@id": t.jsonId } : {}),
    name: t.name,
    jobTitle: t.role,
    description: t.bio,
    worksFor: org,
  }));
  return [
    aboutPage,
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "About", url: ABOUT_PATH },
    ]),
    ...people,
  ];
}

export default function About() {
  return (
    <>
      <JsonLd data={aboutJsonLd()} />
      <main className="page" data-testid="page-aboutus">
        {/* Hero — kept as-is */}
        <section className="page-hero page-hero--no-zoom" data-testid="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
          <ResponsiveImage name="about-hero" alt="" className="page-hero-bg" widths={[768, 1280]} sizes="100vw" width={1448} height={1086} priority />
          <div
            className="page-hero-overlay"
            style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" }}
          />
          <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
            <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>About Us</h1>
          </div>
        </section>

        {/* Mission */}
        <section className="section-pad">
          <div className="container">
            <div className="about-split">
              <div className="about-copy">
                <span className="eyebrow">Our Mission</span>
                <h2 className="heading-lg about-h2">Building homes that reflect the way you live</h2>
                <p className="about-lead">
                  Jematell Homes is a family-owned custom home builder based in Scottsdale, Arizona, serving communities across the greater Phoenix metro.
                </p>
                <p>
                  Our mission is to bring your vision to life by constructing homes that blend innovative design,
                  functionality, and comfort. We understand that your home is a reflection of your lifestyle, and we
                  strive to create spaces that perfectly suit your needs while maintaining the highest standards of
                  construction.
                </p>
              </div>
              <figure className="about-figure">
                <ResponsiveImage
                  name="custom-home"
                  alt="Custom kitchen by Jematell Homes with deep green cabinetry, a natural stone waterfall island, and vaulted ceilings"
                  widths={[768, 1280, 1600, 2000]}
                  sizes="(max-width: 820px) 100vw, (max-width: 1400px) 45vw, 640px"
                  width={2000}
                  height={1334}
                />
              </figure>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="section-pad alt-bg">
          <div className="container">
            <SectionHead eyebrow="Our Approach" title="A collaborative process, from concept to keys" centered />
            <p className="about-centered-lead">
              We believe that building a home is a collaborative process, and we work closely with our clients to ensure
              every detail is carefully planned and executed. From the initial concept to the final finishing touches,
              we involve you at every step, valuing your input and ideas. Our team of skilled architects, designers, and
              craftsmen combines their expertise with your vision to create a truly personalized home that exceeds your
              expectations.
            </p>
            <div className="about-values">
              <div className="about-value">
                <h3>Collaborative design</h3>
                <p>We involve you from the first concept to the final finishing touches, so every decision reflects your vision.</p>
              </div>
              <div className="about-value">
                <h3>Skilled craftsmanship</h3>
                <p>Our architects, designers, and craftsmen bring their combined expertise to every build, holding to the highest standards.</p>
              </div>
              <div className="about-value">
                <h3>Personalized to you</h3>
                <p>Every home is tailored to your preferences and the way your family lives, so the result is unmistakably yours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Satisfaction */}
        <section className="section-pad">
          <div className="container">
            <div className="about-narrow">
              <SectionHead eyebrow="Customer Satisfaction" title="Your trust, earned at every milestone" centered />
              <p className="about-centered-lead">
                We value the trust and confidence you place in us, and we are dedicated to your complete satisfaction. We
                believe in open and transparent communication, providing regular updates throughout construction and
                addressing any concerns promptly. Our goal is not only to meet but to exceed your expectations, ensuring
                a positive and stress-free experience from start to finish.
              </p>
              <ul className="about-assurance">
                <li><Check /> Open, transparent communication at every stage</li>
                <li><Check /> Regular updates through each phase of construction</li>
                <li><Check /> A positive, stress-free experience from start to finish</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Story + Team */}
        <section className="section-pad alt-bg">
          <div className="container">
            <div className="about-split reverse">
              <figure className="about-figure">
                <ResponsiveImage
                  name="office"
                  alt="The Jematell Homes office reception in Scottsdale, Arizona, with the company logo on the wall and a natural stone reception desk"
                  widths={[640, 768, 1280, 1920]}
                  sizes="(max-width: 820px) 100vw, (max-width: 1400px) 45vw, 640px"
                  width={1920}
                  height={2560}
                />
              </figure>
              <div className="about-copy">
                <span className="eyebrow">Our Story</span>
                <h2 className="heading-lg about-h2">A family built on<br /> decades of experience</h2>
                <p className="about-lead">
                  Founded in 2022, Jematell Homes brings together a team whose experience spans home building, finance,
                  and land development.
                </p>
                <p>
                  What unites us is a shared belief that a custom home should be built with the same care we would put
                  into our own. From our office in Scottsdale, we guide every client through a process that is personal,
                  transparent, and genuinely enjoyable.
                </p>
              </div>
            </div>

            <div className="about-team-grid">
              {TEAM.map((t) => (
                <article className="about-team-card" key={t.name}>
                  <div className="about-monogram" aria-hidden="true">{t.monogram}</div>
                  <h3>{t.name}</h3>
                  <p className="about-team-role">{t.role}</p>
                  <p>{t.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Experience the Difference — closing */}
        <section className="section-pad">
          <div className="container">
            <div className="about-narrow about-closing">
              <SectionHead eyebrow="Experience the Difference" title="Experience building a home with Jematell" centered />
              <p className="about-centered-lead">
                Choosing Jematell Homes means choosing a home builder that is dedicated to creating exceptional homes
                tailored to your unique preferences. We are passionate about what we do, and our commitment to quality,
                integrity, and client satisfaction sets us apart.
              </p>
              <p className="about-centered-lead">
                Contact us today to discuss your home building needs and let us guide you on the journey to creating the
                home you have always dreamed of.
              </p>
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <ContactCta className="btn btn-primary" testid="about-contact-cta">Contact Us</ContactCta>
              </div>
            </div>
          </div>
        </section>

        {/* Kept: Let's Build Your Dream Home CTA */}
        <AboutCta />
      </main>
    </>
  );
}
