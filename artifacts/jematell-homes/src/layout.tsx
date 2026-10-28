"use client";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { MessageSquare, MessageCircle, Phone, Mail, Instagram, Facebook, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContactForm } from "./contact-form";
import { siteConfig, services, locations, locationHref } from "./config/siteConfig";
import { navItems, isNavActive, isSectionActive, type SubNavItem } from "./config/navConfig";
import { img } from "./lib/paths";

/** Renders a sub-nav child as a client Link, or a hard <a> for routes the app
 * does not own yet (e.g. /faq). Shared by desktop dropdowns and mobile sub-nav. */
function SubNavLink({
  item,
  pathname,
  testIdPrefix,
  onNavigate,
}: {
  item: SubNavItem;
  pathname: string | null;
  testIdPrefix: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  const className = active ? "is-active" : undefined;
  const testId = `${testIdPrefix}-${item.id}`;
  if (item.hardNav) {
    return (
      <a href={item.href} role="menuitem" className={className} data-testid={testId} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      role="menuitem"
      // Dropdown children are in the DOM before the menu opens, so without
      // this they prefetch on load too — for menus the reader never opens.
      prefetch={false}
      className={className}
      data-testid={testId}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

interface NavDropdownProps {
  label: string;
  testId: string;
  to?: string;
  active?: boolean;
  children: ReactNode;
}

function NavDropdown({ label, testId, to, active, children }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass = `nav-trigger${active ? " is-active" : ""}`;
  const chevron = <ChevronDown className="nav-chevron" size={14} aria-hidden="true" />;

  const trigger = to ? (
    <Link
      href={to}
      // Same reason as the top-level nav links: intent, not sight. Opening the
      // dropdown already runs on mouseenter/focus, which is exactly when Next
      // prefetches this href anyway.
      prefetch={false}
      className={triggerClass}
      data-testid={testId}
      aria-haspopup="true"
      aria-expanded={open}
      onClick={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      onFocus={() => setOpen(true)}
    >
      {label}
      {chevron}
    </Link>
  ) : (
    <button
      type="button"
      className={triggerClass}
      data-testid={testId}
      aria-haspopup="true"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onMouseEnter={() => setOpen(true)}
      onFocus={() => setOpen(true)}
    >
      {label}
      {chevron}
    </button>
  );

  return (
    <div
      className={`nav-dropdown ${open ? "is-open" : ""}`}
      ref={wrapRef}
      onMouseLeave={() => setOpen(false)}
    >
      {trigger}
      <div className="dropdown-panel" role="menu" onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>
  );
}

// Routes whose top hero is light/cream — header must always render in solid/light style
// so the dark nav text stays readable. Everything else has a dark image hero.
function isLightHeroPath(pathname: string | null): boolean {
  if (!pathname) return false;
  // Normalize trailing slash so /blog/ matches /blog
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (p === "/blog") return true;
  // /blog/:slug and /gallery/:slug have dark image heroes — keep transparent
  return false;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const { open: openContactForm } = useContactForm();
  const forceSolid = isLightHeroPath(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset scroll-state when route changes so a long blog post doesn't leave the
  // header stuck in the wrong mode after navigating to the cream-bg blog index.
  useEffect(() => {
    setScrolled(window.scrollY > 50);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const close = () => setMobileMenuOpen(false);

  return (
    <>
      <header className={`site-header ${scrolled || forceSolid ? "scrolled" : ""}`}>
      <div className="container header-inner">
        <div className="header-left">
        <Link href="/" className="brand-logo" aria-label={siteConfig.brand.name} data-testid="nav-logo">
          <img src={img("logo.png")} alt={siteConfig.brand.name} width={1331} height={472} />
        </Link>

        <nav className="main-nav" aria-label="Primary">
          {navItems.map((item) =>
            item.children ? (
              <NavDropdown
                key={item.id}
                label={item.label}
                testId={`nav-${item.id}`}
                to={item.href}
                active={isSectionActive(pathname, item)}
              >
                {item.children.map((child) => (
                  <SubNavLink key={child.id} item={child} pathname={pathname} testIdPrefix="nav" />
                ))}
              </NavDropdown>
            ) : (
              <Link
                key={item.id}
                href={item.href!}
                // Prefetch on intent, not on sight. The header sits in the
                // viewport from the first paint, so the default viewport
                // prefetch fired for every top-level route while the page was
                // still loading: a production trace showed ~28 RSC payload
                // fetches AND — because a `priority` hero calls react-dom
                // preload() — the about, gallery and financing hero images
                // pulled in at HIGH priority (147KB) at ~700ms, competing for
                // bandwidth with this page's own LCP image.
                // prefetch={false} only turns off the VIEWPORT trigger; Next
                // still prefetches on hover/focus, so a real navigation is
                // just as fast, in every browser.
                prefetch={false}
                className={isNavActive(pathname, item.href!) ? "is-active" : undefined}
                data-testid={`nav-${item.id}`}
                aria-current={isNavActive(pathname, item.href!) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        </div>

        <div className="header-actions">
          <button type="button" className="btn btn-primary" data-testid="header-cta" onClick={openContactForm}>
            {siteConfig.cta.label}
          </button>
        </div>

        <a
          href={siteConfig.contact.phone.href}
          className="mobile-call-btn"
          aria-label={`Call ${siteConfig.contact.phone.display}`}
          data-testid="mobile-call"
        >
          <Phone size={19} strokeWidth={1.5} aria-hidden="true" />
        </a>

        <button
          className={`mobile-menu-btn${mobileMenuOpen ? " is-open" : ""}`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      </header>

      <div
        id="mobile-nav-panel"
        className={`mobile-nav ${mobileMenuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
      >
        <nav aria-label="Mobile">
          {navItems.map((item) =>
            item.children ? (
              <div className="mobile-nav-group" key={item.id}>
                <button
                  type="button"
                  className="mobile-nav-accordion"
                  aria-expanded={expanded === item.id}
                  data-testid={`mobile-nav-${item.id}`}
                  onClick={() => setExpanded((e) => (e === item.id ? null : item.id))}
                >
                  {item.label}
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
                {expanded === item.id && (
                  <div className="mobile-nav-sub">
                    {item.children.map((child) => (
                      <SubNavLink
                        key={child.id}
                        item={child}
                        pathname={pathname}
                        testIdPrefix="mobile-nav"
                        onNavigate={close}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href!}
                onClick={close}
                className={isNavActive(pathname, item.href!) ? "is-active" : undefined}
                data-testid={`mobile-nav-${item.id}`}
              >
                {item.label}
              </Link>
            ),
          )}
          <button
            type="button"
            onClick={() => { close(); openContactForm(); }}
            className="btn btn-primary"
            data-testid="mobile-nav-cta"
            style={{ marginTop: 16, alignSelf: 'flex-start' }}
          >
            {siteConfig.cta.label}
          </button>
          <div className="mobile-nav-contact">
            <a href={siteConfig.contact.phone.href} data-testid="mobile-nav-phone"><Phone size={16} /> {siteConfig.contact.phone.display}</a>
            <a href={siteConfig.contact.email.href} data-testid="mobile-nav-email"><Mail size={16} /> {siteConfig.contact.email.display}</a>
          </div>
        </nav>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={img("logo.png")} alt={siteConfig.brand.name} style={{ filter: "none" }} width={1331} height={472} />
            <p>{siteConfig.blurb}</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/contact">Contact</Link>
            <Link href="/spec-homes">Spec Homes</Link>
            <Link href="/build-on-your-lot">Build on Your Lot</Link>
            <Link href="/casitas-and-guest-houses">Casitas and Guest Houses</Link>
            <Link href="/rv-garages">RV Garages</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/glossary">Glossary</Link>
            <Link href="/reference-library">Reference Library</Link>
            <Link href="/warranty">Warranty</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/llm-info">LLM Info</Link>
            <Link href="/for-agents">For Agents</Link>
          </nav>
        </div>

        <div className="footer-social footer-social-centered">
          <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
            <Instagram size={20} />
          </a>
          <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer">
            <Facebook size={20} />
          </a>
          <a href="https://maps.app.goo.gl/pSjm2LpxCc5CcTVD8" aria-label="Google" target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          </a>
          <a href="https://www.yelp.com/biz/jematell-homes-scottsdale?utm_campaign=www_business_share_popup&utm_medium=copy_link&utm_source=(direct)" aria-label="Yelp" target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m7.6885 15.1415-3.6715.8483c-.3769.0871-.755.183-1.1452.155-.2611-.0188-.5122-.0414-.7606-.213a1.179 1.179 0 0 1-.331-.3594c-.3486-.5519-.3656-1.3661-.3697-2.0004a6.2874 6.2874 0 0 1 .3314-2.0642 1.857 1.857 0 0 1 .1073-.2474 2.3426 2.3426 0 0 1 .1255-.2165 2.4572 2.4572 0 0 1 .1563-.1975 1.1736 1.1736 0 0 1 .399-.2831 1.082 1.082 0 0 1 .4592-.0837c.2355.0016.5139.052.91.1734.0555.0191.1237.0382.1856.0572.3277.1013.7048.2404 1.1499.3987.6863.2404 1.3663.487 2.0463.7397l1.2117.4423c.2217.0807.4363.18.6412.297.174.0984.3273.2298.4512.387a1.217 1.217 0 0 1 .192.4309 1.2205 1.2205 0 0 1-.872 1.4522c-.0468.0151-.0852.0239-.1085.0293l-1.105.2553-.0031-.001zM18.8208 7.565a1.8506 1.8506 0 0 0-.2042-.1754 2.4082 2.4082 0 0 0-.2077-.1394 2.3607 2.3607 0 0 0-.2269-.109 1.1705 1.1705 0 0 0-.482-.0796 1.0862 1.0862 0 0 0-.4498.1263c-.2107.1048-.4388.2732-.742.5551-.042.0417-.0947.0886-.142.133-.2502.2351-.5286.5252-.8599.863a114.6363 114.6363 0 0 0-1.5166 1.5629l-.8962.9293a4.1897 4.1897 0 0 0-.4466.5483 1.541 1.541 0 0 0-.2364.5459 1.2199 1.2199 0 0 0 .0107.4518l.0046.02a1.218 1.218 0 0 0 1.4184.923 1.162 1.162 0 0 0 .1105-.0213l4.7781-1.104c.3766-.087.7587-.1667 1.097-.3631.2269-.1316.4428-.262.5909-.5252a1.1793 1.1793 0 0 0 .1405-.4683c.0733-.6512-.2668-1.3908-.5403-1.963a6.2792 6.2792 0 0 0-1.2001-1.7103zM8.9703.0754a8.6724 8.6724 0 0 0-.83.1564c-.2754.066-.548.1383-.8146.2236-.868.2844-2.0884.8063-2.295 1.8065-.1165.5655.1595 1.1439.3737 1.66.2595.6254.614 1.1889.9373 1.7777.8543 1.5545 1.7245 3.0993 2.5922 4.6457.259.4617.5416 1.0464 1.043 1.2856a1.058 1.058 0 0 0 .1013.0383c.2248.0851.4699.1016.7041.0471a4.3015 4.3015 0 0 0 .0418-.0097 1.2136 1.2136 0 0 0 .5658-.3397 1.1033 1.1033 0 0 0 .079-.0822c.3463-.435.3454-1.0833.3764-1.6134.1042-1.771.2139-3.5423.3009-5.3142.0332-.6712.1055-1.3333.0655-2.0096-.0328-.5579-.0368-1.1984-.3891-1.6563-.6218-.8073-1.9476-.741-2.8523-.6158zm2.084 15.9505a1.1053 1.1053 0 0 0-1.2306-.4145 1.1398 1.1398 0 0 0-.1526.0633 1.4806 1.4806 0 0 0-.2171.1354c-.1992.1475-.3668.3392-.5196.5315-.0386.049-.074.1143-.12.1562l-.7686 1.0573a113.9168 113.9168 0 0 0-1.2913 1.789c-.278.3895-.5184.7184-.7083 1.0094-.036.0547-.0734.116-.1075.1647-.2277.3522-.3566.6092-.4228.8381a1.0945 1.0945 0 0 0-.046.4721c.0211.1655.0768.3246.1635.467.046.0715.0957.1406.1487.207a2.334 2.334 0 0 0 .1754.1825 1.843 1.843 0 0 0 .2108.1732c.5304.369 1.1112.6342 1.722.8391a6.0958 6.0958 0 0 0 1.5716.3004c.091.0046.1821.0025.2728-.006a2.3878 2.3878 0 0 0 .2506-.0351 2.3862 2.3862 0 0 0 .2447-.071 1.1927 1.1927 0 0 0 .4175-.2658c.1127-.113.1994-.249.2541-.3989.0889-.2214.1473-.5026.1857-.92.0034-.0593.0118-.1305.0177-.1958.0304-.3463.0443-.7531.0666-1.2315.0375-.7357.067-1.4681.0903-2.2026 0 0 .0495-1.3053.0494-1.306.0113-.3008.002-.6342-.0814-.9336a1.396 1.396 0 0 0-.1756-.4054zm8.6754 2.0439c-.1605-.176-.3878-.3514-.7462-.5682-.0518-.0288-.1124-.0674-.1684-.1009-.2985-.1795-.658-.3684-1.078-.5965a120.7615 120.7615 0 0 0-1.9427-1.042l-1.1515-.6107c-.0597-.0175-.1203-.0607-.1766-.0878-.2212-.1058-.4558-.2045-.6992-.2498a1.4915 1.4915 0 0 0-.2545-.0265 1.1527 1.1527 0 0 0-.1648.01 1.1077 1.1077 0 0 0-.9227.9133 1.4186 1.4186 0 0 0 .0159.439c.0563.3065.1932.6096.3346.875l.615 1.1526c.3422.65.6884 1.2963 1.0435 1.9406.229.4202.4196.7799.5982 1.078.0338.056.0721.1163.1011.1682.2173.3584.392.584.569.7458.1146.1107.252.195.4026.247.1583.0525.326.071.4919.0546a2.368 2.368 0 0 0 .251-.0435c.0817-.022.1622-.048.241-.0784a1.863 1.863 0 0 0 .2475-.1143 6.1018 6.1018 0 0 0 1.2818-.9597c.4596-.4522.8659-.9454 1.182-1.51.044-.08.0819-.163.1138-.2483a2.49 2.49 0 0 0 .0773-.2411c.0186-.083.033-.1669.0429-.2513a1.188 1.188 0 0 0-.0565-.491 1.0933 1.0933 0 0 0-.248-.4041z"/>
            </svg>
          </a>
          <a href="https://www.houzz.com/pro/jematellhomes" aria-label="Houzz" target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M1.27 0V24H9.32V16.44H14.68V24H22.73V10.37L6.61 5.75V0H1.27Z"/>
            </svg>
          </a>
          <a href="https://www.buildzoom.com/contractor/jematell-homes-llc" aria-label="BuildZoom" target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="2 2 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5.5-5.5 5.5H8v5h3v-3h2v3h3v-5h1.5L12 7.5z"/>
            </svg>
          </a>
        </div>

      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>&copy; {new Date().getFullYear()} {siteConfig.brand.name}. All rights reserved.</span>
          <span className="footer-bottom-contact">
            <a href={siteConfig.contact.email.href}>{siteConfig.contact.email.display}</a>
            <span className="footer-bottom-sep" aria-hidden="true">·</span>
            <a href={siteConfig.contact.phone.href}>{siteConfig.contact.phone.display}</a>
            <span className="footer-bottom-sep" aria-hidden="true">·</span>
            <span>{siteConfig.contact.address.lines[0]}, {siteConfig.contact.address.lines[1]}</span>
            <span className="footer-bottom-sep" aria-hidden="true">·</span>
            <span>{siteConfig.contact.hours}</span>
            <span className="footer-bottom-sep" aria-hidden="true">·</span>
            <span>{siteConfig.contact.roc}</span>
          </span>
        </div>

      </div>
    </footer>
  );
}

export function ContactWidget() {
  const { open: openContactForm } = useContactForm();
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  // On the homepage, the widget stays hidden while the hero is in view and
  // fades in once the visitor scrolls past it. On every other route it is
  // visible from the start.
  useEffect(() => {
    if (!isHomepage) {
      setPastHero(false);
      return;
    }
    const hero = document.querySelector(".hero");
    if (!hero) {
      setPastHero(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHomepage]);

  const hidden = isHomepage && !pastHero;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    firstItemRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleMessage = () => {
    setIsOpen(false);
    openContactForm();
  };

  return (
    <div
      className={`contact-widget${isOpen ? " is-open" : ""}${hidden ? " is-hidden" : ""}`}
      ref={rootRef}
      aria-hidden={hidden}
    >
      <button
        ref={triggerRef}
        className="contact-widget-btn"
        onClick={() => setIsOpen((v) => !v)}
        data-testid="contact-widget"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="contact-widget-panel"
        aria-label={`Contact ${siteConfig.brand.name}`}
        tabIndex={hidden ? -1 : 0}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
      <div
        id="contact-widget-panel"
        className="contact-widget-panel"
        aria-label="Contact options"
      >
        <h3>How can we help?</h3>
        <a
          ref={firstItemRef}
          href={siteConfig.contact.phone.href}
          data-testid="contact-widget-call"
          tabIndex={isOpen ? 0 : -1}
        >
          <Phone size={18} />
          Call us
        </a>
        <a
          href={siteConfig.contact.sms.href}
          data-testid="contact-widget-text"
          tabIndex={isOpen ? 0 : -1}
        >
          <MessageCircle size={18} />
          Text us
        </a>
        <button
          type="button"
          className="contact-widget-msg"
          onClick={handleMessage}
          data-testid="contact-widget-message"
          tabIndex={isOpen ? 0 : -1}
        >
          <MessageSquare size={18} />
          Send us a message
        </button>
      </div>
    </div>
  );
}
