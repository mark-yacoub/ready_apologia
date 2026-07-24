# Cloudflare Configuration

This document outlines the custom Cloudflare configurations implemented for `readyapologia.com`. These rules were established to protect the site from excessive Cloudflare Worker invocations (hitting the 100,000 daily limit) caused by aggressive automated scrapers, unknown bots, and AI crawlers, while ensuring that real human users and verified crawler bots (like Googlebot) remain unaffected.

## 1. Routing & Triggers
* **Disabled `*.workers.dev` Route:** The default worker URL (`ready-apologia-router.marc-xznash.workers.dev`) has been disabled in the Worker's Trigger settings. All traffic must now route through the custom domain (`readyapologia.com`). This ensures that bots cannot bypass the Web Application Firewall (WAF) and Bot Fight Mode by hitting the worker directly.

## 2. Web Application Firewall (WAF) Custom Rules
* **Block All Bots Except Google:** A custom WAF rule unconditionally `Block`s any request where the User-Agent contains `bot`, `crawl`, `spider`, `Applebot`, `GPTBot`, or `ClaudeBot`, *unless* it explicitly contains `Googlebot`. This rule aggressively terminates third-party verified bots (like AppleBot, which generated ~24k requests) and unrecognized scrapers directly at the edge before they can invoke the Worker, thereby preserving daily limits while maintaining Google Search SEO indexing.
* **Block Unknown OS:** A custom WAF rule is set to `Managed Challenge` for requests where the `User Agent` is completely empty (`http.user_agent eq ""`). This targets cheap, automated scrapers and headless scripts that fail to provide identification and appear as "Unknown" Operating Systems in the analytics, stopping them before they trigger a worker invocation.
* **Data Center / ASN Challenge:** A custom WAF rule is configured to issue a `Managed Challenge` to traffic originating from well-known Data Center Autonomous System Numbers (ASNs) such as AWS, DigitalOcean, Hetzner, etc. Real humans browse from consumer ISPs; targeting data center ASNs effectively catches sophisticated proxy scrapers without impacting genuine users.

* **Enforce Standard Browsers:** A custom WAF rule is established to issue a `Managed Challenge` to any request where the User-Agent does not contain `"Mozilla"` AND is not `"Googlebot"`. Legitimate human web traffic across all mobile and desktop environments typically utilizes User-Agents rooted in `Mozilla/5.0`. This aggressively intercepts generic scripts, automated CLI tools (like curl or python-requests), and custom headless browsers that omit standard headers.

## 3. Rate Limiting Rules
* **Human Rate Limiter:** A general rate-limiting WAF rule (`Human Rate Limit 200/10s`) is set to `Block` any client exceeding 200 requests within a 10-second window. This provides general abuse reduction while remaining generous enough to never disrupt legitimate human usage. *(Note: AI bots are not explicitly rate-limited due to Free tier restrictions on user-agent matching, but their impact on Worker limits is mitigated entirely by the aggressive Edge Caching rule below).*

## 4. Edge Caching (Cache Rules)
* **Aggressive HTML Caching:** A Cache Rule is configured to force Edge Caching for all paths (`URI Path starts with /`). Because Cloudflare does not cache HTML documents natively by default (which triggers the worker on every page load), this rule ensures that once a page is generated and cached at the Cloudflare edge, subsequent requests for that page (by humans, AI, or other bots) are served directly from the cache. Serving from the edge cache consumes **zero** Worker invocations.

## 5. General Security Settings
* **Browser Integrity Check:** Cloudflare's native Browser Integrity Check is enabled (`Security > Settings`). This automatically evaluates incoming HTTP headers and drops requests lacking standard Web Browser syntaxes, providing a baseline shield against rudimentary scrapers and malicious proxy engines before they reach the routing layer.

*Note for future modifications: If you deploy immediate layout/content changes, you may need to purge the Cloudflare cache for the changes to become visible to users immediately due to the aggressive caching rule.*
