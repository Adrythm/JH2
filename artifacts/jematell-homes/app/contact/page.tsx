import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import ContactInlineForm from "@/views/ContactInlineForm";
import { MapEmbed } from "@/components/MapEmbed";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Tell us about your vision and we'll be in touch to schedule a consultation. Call (602) 421-5576 or email info@jematellhomes.com.",
  canonical: "/contact",
});

export default function Contact() {
  return (
    <main className="page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        <picture>
          <source
            srcSet="/images/contact-hero-2000.webp 2000w, /images/contact-hero-1600.webp 1600w, /images/contact-hero-1280.webp 1280w, /images/contact-hero-768.webp 768w"
            sizes="100vw"
            type="image/webp"
          />
          <ResponsiveImage name="contact-hero" alt="" className="page-hero-bg" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={6176} height={4115} priority />
        </picture>
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <h1 className="page-hero-title hero-title">
            CREATE THE HOME OF YOUR DREAMS
          </h1>
        </div>
      </section>

      <section className="contact-intro">
        <div className="container contact-intro-split">
          <div className="contact-intro-text">
            <h2 className="contact-intro-heading">We're excited to hear about your ideas!</h2>
            <p className="contact-intro-body">
              To begin the process, please share some details about your project using the form to the right.
              From there we will contact you to arrange our introductory meeting and get things started.
            </p>
          </div>
          <div className="contact-intro-form" data-testid="contact-inline-form">
            <ContactInlineForm />
          </div>
        </div>
      </section>

      <section className="contact-location section-pad" style={{ background: "var(--color-cream)" }}>
        <div className="container">
          <div className="cl-outer">
            <div className="cl-photo">
              <picture>
                <source srcSet="/images/office-1280.webp 1280w, /images/office-960.webp 960w, /images/office-640.webp 640w" sizes="320px" type="image/webp" />
                <img src="/images/office.jpg" alt="Jematell Homes office lobby" loading="lazy" />
              </picture>
            </div>

            <div className="cl-card">
              <div className="cl-info">
                <div className="cl-row">
                  <MapPin size={18} />
                  <span>8350 E Raintree Dr Ste 210<br />Scottsdale, AZ 85260</span>
                </div>
                <div className="cl-row">
                  <Phone size={18} />
                  <a href="tel:6024215576">(602) 421-5576</a>
                </div>
                <div className="cl-row">
                  <Mail size={18} />
                  <a href="mailto:info@jematellhomes.com">info@jematellhomes.com</a>
                </div>
                <a
                  href="https://maps.app.goo.gl/pSjm2LpxCc5CcTVD8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cl-maps-link"
                  data-testid="contact-maps-link"
                >
                  View on Google Maps <ArrowRight size={14} />
                </a>
              </div>

              <div className="cl-map">
                <MapEmbed
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.4723783111376!2d-111.90154582430198!3d33.61899187332323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b77c4a350dd2b%3A0x36391f467ebe51cb!2sJematell%20Homes!5e0!3m2!1sen!2sus!4v1782847583042!5m2!1sen!2sus"
                  title="Jematell Homes location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
