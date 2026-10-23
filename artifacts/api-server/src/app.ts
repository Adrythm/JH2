import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import estimatePageRouter from "./routes/estimatePage";
import agentDiscoveryRouter from "./routes/agentDiscovery";
import mcpRouter from "./routes/mcp";
import { logger } from "./lib/logger";
import { staticSite, staticSiteAvailable, staticSiteInfo } from "./middlewares/staticSite";

const app: Express = express();

// Express advertises itself on every response, including all 1,011 static
// pages. It tells an attacker what to target and buys nothing.
app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Canonical host. www.jematellhomes.com and jematellhomes.com both answered 200
// with byte-identical responses (same ETag), so Google indexed the site twice.
// Measured in Search Console, Jul 27-Aug 9 2026: 249 of ~1,010 pages ranked
// under BOTH hostnames, 303 www URLs ranked in total, and the www share of
// impressions was still climbing (22.5% in Jul 13-26 -> 29.8% in Jul 27-Aug 9).
// On several pages the www copy outranked the apex by double digits, so this
// was not resolving on its own.
//
// rel=canonical was already correct on every page and did not fix it — it is a
// hint, not a directive — and Google removed the preferred-domain setting from
// Search Console in 2019. A 301 is the only mechanism that actually merges the
// two. Placed after pino so the redirects are visible in logs while Google
// reprocesses.
//
// Deliberately an exact-host allowlist rather than a generic "strip the www"
// rule: the *.replit.dev preview hostnames, localhost, and the autoscale health
// check must pass through untouched, and an over-broad rule is exactly how a
// redirect loop takes a site down.
//
// CANONICAL_HOST_REDIRECT=off disables it without a code change or redeploy —
// a safety valve, since this ships against a site that is under a month old.
const CANONICAL_HOST = process.env.CANONICAL_HOST ?? "jematellhomes.com";
const REDIRECT_HOSTS = new Set(
  (process.env.REDIRECT_HOSTS ?? "www.jematellhomes.com")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
);
const HOST_REDIRECT_ENABLED = process.env.CANONICAL_HOST_REDIRECT !== "off";

if (HOST_REDIRECT_ENABLED && REDIRECT_HOSTS.size > 0) {
  app.use((req, res, next) => {
    // Behind Google Frontend (Replit autoscale) the original hostname can
    // arrive on x-forwarded-host; fall back to Host. Take the first value if a
    // proxy chain appended more, and drop any :port suffix.
    const raw = (req.headers["x-forwarded-host"] ?? req.headers.host ?? "").toString();
    const host = raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
    if (!REDIRECT_HOSTS.has(host) || host === CANONICAL_HOST) return next();
    // originalUrl carries path AND query, so a shared estimate link survives:
    // www.../financing/estimate?cost=900000 -> .../financing/estimate?cost=900000
    // A trailing slash comes off in the same hop, so www.../casa-grande/ lands
    // in one redirect rather than two (the static handler would 301 it again).
    const q = req.originalUrl.indexOf("?");
    const path = q < 0 ? req.originalUrl : req.originalUrl.slice(0, q);
    const query = q < 0 ? "" : req.originalUrl.slice(q);
    const bare = path === "/" ? path : path.replace(/\/+$/, "") || "/";
    res.redirect(301, `https://${CANONICAL_HOST}${bare}${query}`);
  });
}
// CORS belongs to the JSON API and the agent-facing surfaces, which are meant
// to be callable cross-origin. It was mounted globally, so every static page
// also went out with `Access-Control-Allow-Origin: *` — meaningless for a
// document navigation, and it invites any origin to read the HTML via fetch.
const corsMiddleware = cors();
app.use("/api", corsMiddleware);
app.use("/mcp", corsMiddleware);
app.use("/openapi.json", corsMiddleware);
app.use("/.well-known", corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Agent-facing surfaces, mounted ahead of the static site so they win over a
// 404 from the export. All read-only:
//   /financing/estimate      server-rendered estimate for arbitrary parameters
//   /mcp                     Model Context Protocol server (streamable HTTP)
//   /.well-known/*, /openapi.json   discovery documents
app.use(estimatePageRouter);
app.use(mcpRouter);
app.use(agentDiscoveryRouter);

// NOTE: The public FAQ pages (/faq, /faq/:slug, /faq/topics/:slug) are now real
// React pages owned by the Jematell Homes web app (pre-rendered for SEO). This
// service keeps the database, the FAQ seed sync, and the /api/faqs JSON API. The
// FAQ renderers in lib/faq are retained because the build-time validator
// (faq:validate) reuses them to assert schema/H1 on every seed entry.

// Serve the Next static export (artifacts/jematell-homes/out) when it exists,
// so one process owns both /api and the site in production. Skipped when the
// site build is absent (e.g. API-only dev), where /api keeps working alone.
if (staticSiteAvailable()) {
  logger.info(`serving static site from ${staticSiteInfo()}`);
  app.use(staticSite);
} else {
  logger.info("static site build not found; serving /api only");
}

export default app;
