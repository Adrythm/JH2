"use client";
import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ResponsiveImage } from "./components/ResponsiveImage";
import { img } from "./lib/paths";
import Link from "next/link";
import { useContactForm } from "./contact-form";
import { EASE_OUT_EXPO } from "./motion";

// FeaturedProjects lives in its own module (it is also rendered by ContentPage
// on /custom-homes, which must not pull the rest of the home sections into its
// route JS). Re-exported here so the home page import path is unchanged.
export { FeaturedProjects } from "./components/FeaturedProjects";

export { HomepageFloorPlans } from "./components/HomepageFloorPlans";

// --- Data ---
const REVIEWS = [
  {
    headline: "“They are highly committed to delivering a quality product…",
    body: "We did a custom home build with Jematell Homes and are very glad we did! Joe worked with us through the entire process to make sure we got the exact home we wanted. Him, Tyler and their team did an incredible job building our first home, gave honest recommendations, and were very transparent”",
    author: "Travis & Sarah W.",
  },
  {
    headline: "“We couldn’t be happier with our Jematell Home!",
    body: "We couldn’t be happier with our Jematell Home!! It has a spacious floor plan, beautiful finishes, and a large lot!! Working with the Jematell Homes team made the home-buying process easy. If you’re thinking about buying a house give them a call.”",
    author: "Joe & Cassandra M.",
  },
  {
    headline: "“You can tell Jematell Homes takes pride in their work and doesn’t cut corners…”",
    body: "We bought a completed home from Jematell Homes, and we are very happy with our decision. Every finish felt thoughtfully selected, and the layout was both functional and beautiful. Even though it was a spec home, it felt anything but standard.”",
    author: "Ashton S.",
  },
];

// --- Sections ---

export function Hero() {
  const { open: openContactForm } = useContactForm();
  return (
    <section className="hero">
      <div className="hero-bg">
        <ResponsiveImage
          name="hero"
          alt="Aerial view of Jematell Home"
          widths={[768, 1280, 1920, 2500]}
          // The 200vw portrait bump stays for tablets: a landscape frame still
          // has to over-fetch to cover a tall viewport, and dropping it would
          // under-resolve iPad portrait. Phones no longer need it — they get a
          // real portrait crop below.
          sizes="(orientation: portrait) 200vw, 100vw"
          portraitWidths={[640, 768, 828, 1080, 1296]}
          width={2500}
          height={1406}
          priority
        />
      </div>
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div className="hero-copy">
          <h1 className="heading-xl hero-title">
            <span>Let's Make Your</span>
            <span>Dream a Reality</span>
          </h1>
          <button type="button" className="btn btn-outline-light hero-cta" data-testid="hero-cta" onClick={openContactForm}>
            Start Your Build
          </button>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="about section-pad" id="about">
      <div className="container">
        <div className="about-grid" style={{ display: 'block' }}>
          <m.div
            className="about-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          >
            <span className="eyebrow" style={{ fontSize: '15px' }}>Get to know us</span>
            <h2 className="heading-lg" style={{ fontSize: '55px', marginBottom: '32px', textTransform: 'uppercase' }}>A family-owned builder for Arizona</h2>
            <p>
              As a family-owned Arizona home builder, we take pride in creating well-built homes that feel thoughtful, comfortable, and made to last.
            </p>
            <p>
              From the first conversation to the final walk-through, we focus on honest communication, quality craftsmanship, and the details that make a house feel like home. Whether you’re looking for a <Link href="/custom-homes">custom home</Link>, a home <Link href="/build-on-your-lot">built on the lot you already own</Link>, a <Link href="/casitas-and-guest-houses">casita or guest house</Link>, a home with an <Link href="/rv-garages">RV garage</Link>, or a move-in-ready <Link href="/spec-homes">spec home</Link>, we’re here to help bring your vision to life.
            </p>
            <p>
              Welcome to Jematell Homes, where we turn your dream home into a reality.
            </p>
          </m.div>
        </div>
      </div>
    </section>
  );
}


export function ServicesSplit() {
  return (
    <section className="services-split" id="services">
      {/* .service-pane-inner exists so the desktop expand can counter-scale the
          pane's transform:scaleX (keeping content undistorted) — see index.css. */}
      <div className="service-pane" data-testid="card-custom">
        <div className="service-pane-inner">
          <ResponsiveImage
            name="custom-home"
            className="service-bg"
            alt="Custom home kitchen with green cabinetry and marble island"
            widths={[768, 1280, 1600, 2000, 2500]}
            sizes="(min-width: 900px) 50vw, 100vw"
            width={2500}
            height={1667}
          />
          <div className="service-overlay" />
          <div className="service-content">
            <span className="eyebrow" style={{ color: '#fff' }}>Portfolio</span>
            <h3 style={{ whiteSpace: 'nowrap' }}>Build a Custom Home</h3>
            <p>
              Is a custom home what you’re envisioning? Explore our portfolio of past projects, learn more about our process, and discover how we bring your unique vision to life in the desert.
            </p>
            <Link href="/custom-homes" className="btn btn-outline-light">Explore Custom</Link>
          </div>
        </div>
      </div>
      <div className="service-pane" data-testid="card-spec">
        <div className="service-pane-inner">
          <ResponsiveImage
            name="spec-home"
            className="service-bg"
            alt="Twilight House spec home front exterior"
            widths={[768, 1280, 1600, 2000, 2500]}
            sizes="(min-width: 900px) 50vw, 100vw"
            width={2500}
            height={1667}
          />
          <div className="service-overlay" />
          <div className="service-content">
            <span className="eyebrow" style={{ color: '#fff' }}>Available</span>
            <h3 style={{ whiteSpace: 'nowrap' }}>Buy One of Our Homes</h3>
            <p>
              Explore stunning Arizona properties and find a home that perfectly suits your unique preferences and lifestyle. Move-in ready luxury, crafted with our signature attention to detail.
            </p>
            <Link href="/spec-homes" className="btn btn-outline-light">View Spec Homes</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const steps = [
    { num: "01", title: "Consultation", desc: "We start by getting to know your vision, budget, goals, and the land you\u2019ll be building on." },
    { num: "02", title: "Design", desc: "Together, we shape the architecture, layout, finishes, and interior selections that bring your home to life." },
    { num: "03", title: "Build", desc: "Our team manages the construction process with care, communication, and attention to quality. You\u2019ll know what\u2019s happening throughout the build, from foundation to finishing touches. Weekly updates." },
    { num: "04", title: "Completion", desc: "Once the home is complete, we walk through every detail with you to make sure it feels right. Then comes the best part: handing over the keys to your finished Jematell home.", featured: true },
  ];

  return (
    <section className="process section-pad">
      <div className="container">
        <span className="eyebrow" style={{ fontSize: '15px' }}>Our Process</span>
        <h2 className="heading-lg" style={{ fontSize: '55px', textTransform: 'uppercase' }}>How we build your dream home</h2>
        <div className="process-grid">
          {steps.map((step, i) => (
            <m.div
              key={i}
              className={`process-card process-card--${step.num}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: Math.min(i, 5) * 0.06, duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              {step.featured && (
                <ResponsiveImage
                  name="completion-reveal"
                  className="process-bg"
                  alt="Finished primary bathroom in a completed Jematell home"
                  widths={[768, 1280, 1600]}
                  sizes="(min-width: 900px) 33vw, 100vw"
                  width={1600}
                  height={1066}
                />
              )}
              <div className="process-num">{step.num}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * The carousel only advances while it is actually on screen and the tab is
   * in the foreground.
   *
   * It used to run unconditionally from mount. This section sits ~10,000px
   * down the home page, so on any measurement run (and for every visitor who
   * never scrolls this far) the timer fired into nothing: each tick
   * re-rendered the review, then transitioned the pager pills' `width` for
   * 300ms. `width` is a layout property, so those were full layout passes
   * every frame, forever, for a section nobody was looking at.
   *
   * Gating on visibility is invisible to a reader who scrolls here — the
   * rotation still starts and runs exactly as before — and it also means they
   * now arrive at review 1 instead of wherever the timer had wandered to.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer === null) {
        timer = setInterval(() => {
          setCurrent((prev) => (prev + 1) % REVIEWS.length);
        }, 6000);
      }
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    let onScreen = false;
    const sync = () => (onScreen && document.visibilityState === "visible" ? start() : stop());

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, []);

  return (
    <section className="reviews section-pad" id="reviews" ref={sectionRef}>
      <div className="container">
        <div className="reviews-container">
          <div className="reviews-left">
            <span className="eyebrow" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              Reviews
              <span style={{ color: 'var(--color-accent)', fontSize: '14px', letterSpacing: '2px' }}>
                ★★★★★
              </span>
            </span>
            <h2 className="heading-lg" style={{ fontSize: '55px', textTransform: 'uppercase' }}>What our homeowners say</h2>
            <div style={{ display: 'flex', marginTop: '32px' }}>
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  data-testid={`review-pager-${i}`}
                  className="review-pager"
                  style={{
                    // 24px minimum touch target (WCAG 2.5.8); the visible pill
                    // lives on the inner span so the dot looks exactly the same.
                    width: i === current ? '32px' : '24px',
                    height: '24px',
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={i === current}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      width: i === current ? '32px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: i === current ? 'var(--color-accent)' : 'var(--color-border)',
                      // Named properties, not `all`: identical motion, but the
                      // browser no longer has to watch every animatable
                      // property on this element for a change.
                      transition: 'width 0.3s ease, background-color 0.3s ease'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="reviews-right">
            <div className="review-content" data-testid={`review-${current}`}>
              <AnimatePresence mode="wait">
                <m.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                >
                  <p className="review-body">{REVIEWS[current].headline}</p>
                  <p style={{ marginBottom: '24px', color: 'var(--color-text-muted)' }}>{REVIEWS[current].body}</p>
                  <div className="review-author">- {REVIEWS[current].author}</div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
