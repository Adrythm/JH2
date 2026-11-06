/**
 * Deferred Google Tag Manager loader.
 *
 * GTM is the heaviest third-party script this site loads, and it would compete
 * for bandwidth with the hero image during initial load — LCP is the only
 * metric keeping mobile off 100, so putting gtm.js on the critical path costs
 * us the thing we care most about. Nothing here is deferred to game Lighthouse;
 * the point is that a tag manager has no business loading before the page the
 * visitor actually came for.
 *
 * Load happens on whichever comes first:
 *
 *   1. First real interaction — pointerdown / keydown / touchstart / scroll.
 *      This covers essentially every human: on mobile a single scroll counts.
 *
 *   2. Idle within 2 seconds for visits carrying an ad click id. A paid click
 *      needs the Google tag to run while `?gclid=` is still in the URL so it
 *      can write the `_gcl_aw` cookie. This site is a client-side-routed SPA,
 *      so once the visitor navigates the parameter is gone and the click can
 *      no longer be tied to a later conversion.
 *
 *   3. Every other visit: 4 seconds after the page's load event.
 *      Until 2026-11-06 organic and direct visits waited for interaction
 *      alone, so a visitor who landed from search, read the answer and left
 *      without scrolling or tapping was never counted in GA4. Search landings
 *      on the FAQ and reference pages are this site's main traffic, and the
 *      SEO work is judged on GA4 landing pages, so those visits must count.
 *      Four seconds after load is well past the hero image's paint, so LCP is
 *      untouched; it is the same "interaction or 4 seconds" pattern adrythm.com
 *      runs.
 *
 * Safe against ordering surprises: `dataLayer` is a plain array until gtm.js
 * arrives, so anything pushed beforehand queues and is replayed on load. A lead
 * event can never be dropped for firing "too early".
 */

const GTM_ID = "GTM-P4ZTW76";

/** Params that mean "an ad platform sent this visitor and expects attribution". */
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "msclkid", "fbclid"];

/**
 * GTM preview mode sets this. Without it in the eager set, the debugger cannot
 * connect until the tester happens to scroll or click, which presents as "the
 * tag is not firing at all" and sends people hunting for a bug that is not
 * there. Only ever present in a deliberate debug session, so real visitors are
 * unaffected.
 */
const DEBUG_PARAM = "gtm_debug";

/** Interaction is the primary signal; passive+once so it costs nothing to listen. */
const WAKE_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

/** How long a paid visit may go un-tagged before we load anyway. */
const CLICK_ID_IDLE_TIMEOUT_MS = 2000;

/** How long after the load event any other visit waits before we load anyway. */
const AFTER_LOAD_DELAY_MS = 4000;

interface GtmWindow extends Window {
  dataLayer?: unknown[];
}

let loaded = false;

function injectGtm(): void {
  if (loaded) return;
  loaded = true;

  const w = window as GtmWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  document.head.appendChild(script);
}

function needsEagerLoad(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has(DEBUG_PARAM) || CLICK_IDS.some((id) => params.has(id));
}

/**
 * Arm the loader. Idempotent and safe to call on every mount — once GTM is on
 * the page the listeners are gone and further calls are no-ops.
 */
export function loadGtmDeferred(): void {
  if (typeof window === "undefined" || loaded) return;

  let idleHandle: number | undefined;
  let timerHandle: ReturnType<typeof setTimeout> | undefined;
  let loadDelayHandle: ReturnType<typeof setTimeout> | undefined;

  const fire = (): void => {
    teardown();
    injectGtm();
  };

  function teardown(): void {
    for (const evt of WAKE_EVENTS) window.removeEventListener(evt, fire);
    const cancelIdle = (window as unknown as {
      cancelIdleCallback?: (h: number) => void;
    }).cancelIdleCallback;
    if (idleHandle !== undefined && cancelIdle) cancelIdle(idleHandle);
    if (timerHandle !== undefined) clearTimeout(timerHandle);
    if (loadDelayHandle !== undefined) clearTimeout(loadDelayHandle);
    window.removeEventListener("load", armAfterLoad);
  }

  function armAfterLoad(): void {
    loadDelayHandle = setTimeout(fire, AFTER_LOAD_DELAY_MS);
  }

  for (const evt of WAKE_EVENTS) {
    window.addEventListener(evt, fire, { once: true, passive: true });
  }

  // Paid visits and debug sessions get a short deadline; every other visit
  // loads 4 seconds after the page has loaded. See the header comment.
  if (!needsEagerLoad()) {
    if (document.readyState === "complete") armAfterLoad();
    else window.addEventListener("load", armAfterLoad, { once: true });
  } else {
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    if (ric) {
      idleHandle = ric(fire, { timeout: CLICK_ID_IDLE_TIMEOUT_MS });
    } else {
      // Safari has no requestIdleCallback; a plain timer is the fallback.
      timerHandle = setTimeout(fire, CLICK_ID_IDLE_TIMEOUT_MS);
    }
  }
}
