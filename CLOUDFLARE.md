# Cloudflare Configuration

> **Architecture (since 2026-11-06):** `readyapologia.com` is an **R2 custom domain** on bucket `ready-apologia-web` (no Worker in the request path). Request flow: WAF custom rules → Redirect Rules (§6) → URL Rewrite rules → Cache Rule → R2.
> - URL Rewrite "R2: root to index.html": `(http.host eq "readyapologia.com" and http.request.uri.path eq "/")` → `/index.html`.
> - URL Rewrite "R2: clean URLs to index.html": `(http.host eq "readyapologia.com" and http.request.uri.path ne "/" and not http.request.uri.path contains ".")` → `concat(http.request.uri.path, "/index.html")`.
> - Cache Rule "R2: cache everything": `(http.host eq "readyapologia.com")`, Edge TTL overrides origin (4 h until the deploy's cache purge is confirmed, then 1 month), Browser TTL respects origin (HTML/sw.js are uploaded with `no-cache`). The deploy purges the whole zone cache after each sync.
> - `www` is a proxied CNAME to the apex; the "Redirect from WWW to root" redirect rule 301s it.
> - 404s show R2's default "Not Found" page (custom error pages need the Pro plan).
> - The old Worker `ready-apologia-router` (code in §1 history) is kept with no domains for rollback: remove the R2 custom domain, then re-add `readyapologia.com` (and `www`, after deleting its CNAME) as Worker custom domains.
> - Sections 1, 4 and 7 below describe the previous Worker setup and are kept for history.

This document outlines the custom Cloudflare configurations implemented for `readyapologia.com`. These rules were established to protect the site from excessive Cloudflare Worker invocations (hitting the 100,000 daily limit) caused by aggressive automated scrapers, unknown bots, and AI crawlers, while ensuring that real human users and verified crawler bots (like Googlebot) remain unaffected.

## 1. Routing & Triggers
* **Disabled `*.workers.dev` Route:** The default worker URL (`ready-apologia-router.marc-xznash.workers.dev`) has been disabled in the Worker's Trigger settings. All traffic must now route through the custom domain (`readyapologia.com`). This ensures that bots cannot bypass the Web Application Firewall (WAF) and Bot Fight Mode by hitting the worker directly.

## 2. Web Application Firewall (WAF) Custom Rules
* **Allow Social Media Crawlers (Priority 1 - Link Previews):** A custom WAF rule is set to `Skip` / `Allow` for verified social sharing crawlers so that WhatsApp, Facebook, iMessage, Twitter, Telegram, LinkedIn, Slack, and Discord can fetch Open Graph metadata and display rich preview cards (images, titles, descriptions).
  - Expression:
    ```text
    (http.user_agent contains "WhatsApp") or
    (http.user_agent contains "facebookexternalhit") or
    (http.user_agent contains "Twitterbot") or
    (http.user_agent contains "TelegramBot") or
    (http.user_agent contains "LinkedInBot") or
    (http.user_agent contains "Slackbot") or
    (http.user_agent contains "Discordbot") or
    (http.user_agent contains "Applebot")
    ```
  - Action: `Skip` (all remaining WAF rules, Rate Limiting, and Bot Management).

* **Block Aggressive AI Scrapers:** A custom WAF rule aggressively `Block`s or issues `Managed Challenge`s to commercial AI training and LLM scrapers to protect bandwidth, database assets, and Cloudflare Worker invocation limits.
  - Targeted Agents: `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `Bytespider`, `CCBot`, `PetalBot`, `Amazonbot`, `Diffbot`, `Cohere`, `PerplexityBot`.

* **Block Unknown OS & Empty User-Agents:** A custom WAF rule is set to `Managed Challenge` for requests where the `User Agent` is completely empty (`http.user_agent eq ""`). This targets cheap, automated scrapers and headless scripts that fail to provide identification and appear as "Unknown" Operating Systems in analytics.

* **Data Center / ASN Challenge:** A custom WAF rule is configured to issue a `Managed Challenge` to traffic originating from well-known Data Center Autonomous System Numbers (ASNs) such as AWS, DigitalOcean, Hetzner, etc. Real humans browse from consumer ISPs; targeting data center ASNs effectively catches sophisticated proxy scrapers without impacting genuine users.

* **Enforce Standard Browsers & Verified Bots:** A custom WAF rule is established to issue a `Managed Challenge` to requests where the User-Agent does not contain `"Mozilla"`, unless it is explicitly `Googlebot` or on the approved social media crawler allowlist. Legitimate human web traffic across mobile and desktop environments utilizes User-Agents rooted in `Mozilla/5.0`. This intercepts generic scripts, automated CLI tools (like curl or python-requests), and custom headless browsers.

## 3. Rate Limiting Rules
* **Human Rate Limiter:** A general rate-limiting WAF rule (`Human Rate Limit 200/10s`) is set to `Block` any client exceeding 200 requests within a 10-second window. This provides general abuse reduction while remaining generous enough to never disrupt legitimate human usage.

## 4. Edge Caching (Cache Rules)
* **Aggressive HTML Caching:** A Cache Rule is configured to force Edge Caching for all paths (`URI Path starts with /`). Because Cloudflare does not cache HTML documents natively by default (which triggers the worker on every page load), this rule ensures that once a page is generated and cached at the Cloudflare edge, subsequent requests for that page (by humans, social unfurlers, or crawlers) are served directly from the cache. Serving from the edge cache consumes **zero** Worker invocations and reduces bandwidth on the origin.

## 5. General Security Settings
* **Browser Integrity Check:** Cloudflare's native Browser Integrity Check is enabled (`Security > Settings`). This automatically evaluates incoming HTTP headers and drops requests lacking standard Web Browser syntaxes, providing a baseline shield against rudimentary scrapers and malicious proxy engines before they reach the routing layer.

## 6. SEO Redirect Rules (Rules → Redirect Rules → Single Redirects)
**Status: live since 2026-11-06** (after the pre-existing "Redirect from WWW to root" rule; all verified in a browser).
Redirect Rules run **before** the Worker, so they cost zero Worker invocations. All are `301`, "Preserve query string" on. Order matters (trailing slash first).

| # | Name | When incoming requests match (expression) | Dynamic target |
|---|------|-------------------------------------------|----------------|
| 1 | Strip trailing slash | `ends_with(http.request.uri.path, "/") and http.request.uri.path ne "/"` | `substring(http.request.uri.path, 0, -1)` |
| 2 | Legacy Bible verse URL → chapter anchor | `http.request.uri.path wildcard "/bible/*/*/*" and not http.request.uri.path wildcard "/bible/*/*/*/*"` | `wildcard_replace(http.request.uri.path, "/bible/*/*/*", "/bible/${1}/${2}#${3}")` |
| 3 | Legacy Quran ayah URL → surah anchor | `http.request.uri.path wildcard "/quran/*/*" and not http.request.uri.path wildcard "/quran/*/*/*" and not starts_with(http.request.uri.path, "/quran/codex/") and not starts_with(http.request.uri.path, "/quran/variant/")` | `wildcard_replace(http.request.uri.path, "/quran/*/*", "/quran/${1}#${2}")` |
| 4 | Legacy /topics → /evidence | `starts_with(http.request.uri.path, "/topics")` | `concat("/evidence", substring(http.request.uri.path, 7))` |

Why: the site is built with `trailingSlash: 'never'`, but the Worker also served `/path/`, so Google indexed both forms ("Alternate page with proper canonical", ~2.9K URLs). `/bible/<b>/<c>/<v>` and `/topics/*` pages were removed from the build (Jul 2026), and since Nov 2026 the deploy deletes stale HTML from R2 (`--delete` on the HTML sync pass); these rules keep old inbound links landing on the right page instead of a 404.

Verify after enabling: `curl -sI https://readyapologia.com/bible/jn/1/41` from a browser-like client → `301` to `/bible/jn/1#41`.

## 7. Worker Invocation Budget (important)
Audit 2026-11-06: the Worker is bound as a **Custom Domain** (readyapologia.com + www), so it runs before the cache on every request; no Cache Rules exist in the zone (section 4 is outdated), and the cache hit rate is ~0.1%. Worker usage was 14–20K requests/day (100K free limit). R2 bucket: ~6.5 GB, ~120K objects (free tier: 10 GB, 1M Class A, 10M Class B per month). Each deploy re-uploads every file (`aws s3 sync` compares mtimes, which are new on every CI build): ~207K Class A PUTs in the first 6 days of November.
Note: "Block All Bots Except Google" also blocks **Bingbot** and OAI-SearchBot; consider adding `and not cf.client.bot` (verified bots) to it.
A Worker bound to a route runs on **every** request to that route, *before* the cache. The "Aggressive HTML Caching" rule above only caches the Worker's own fetches from R2; it does **not** reduce Worker invocations. To stop crawlers from exhausting the 100K/day free limit without blocking them:
- **Option A (free):** serve the bucket through an **R2 custom domain** instead of the Worker, plus one Transform Rule (URL Rewrite) that maps `/path` → `/path/index.html` for paths without a `.`, and `/` → `/index.html`. Cached hits then cost nothing and there is no daily request cap. Trial it on a test subdomain first.
- **Option B ($5/month Workers Paid):** 10M requests/month included.
Once requests are not capped, relax the bot rules: let verified search bots and AI *search* fetchers (OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User) through, keep blocking AI *training* crawlers (GPTBot, ClaudeBot, CCBot, Bytespider, Amazonbot, meta-externalagent), and use Bing Webmaster Tools → Crawl Control to shift Bingbot to off-peak hours.

## 8. Config-as-Code Snapshot (`cloudflare/zone-config.json`)
`scripts/cloudflare/snapshot.mjs` exports the live zone entrypoint rulesets (`http_request_dynamic_redirect`, `http_request_transform`, `http_request_cache_settings`, `http_request_firewall_custom`, `http_ratelimit`, `http_response_headers_transform`), DNS records, and optional R2 custom domains into `cloudflare/zone-config.json` with volatile metadata (`id`, `version`, `last_updated`, etc.) stripped and keys sorted deterministically.

* **Required API Token Permissions:** `Zone Read` + `Zone WAF Read` + `Cache Rules Read` + `Transform Rules Read` + `Dynamic Redirect Read` + `DNS Read` (plus account R2 read if `CLOUDFLARE_ACCOUNT_ID` is passed).
* **Update committed snapshot:**
  ```bash
  CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... npm run cloudflare:snapshot
  ```
* **Check for drift against live config (exits 1 on mismatch):**
  ```bash
  CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... npm run cloudflare:snapshot -- --check
  ```

*Note for future modifications: If you deploy immediate layout/content changes, you may need to purge the Cloudflare cache for the changes to become visible to users immediately due to the aggressive caching rule.*
