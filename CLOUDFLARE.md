# Cloudflare Configuration

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

*Note for future modifications: If you deploy immediate layout/content changes, you may need to purge the Cloudflare cache for the changes to become visible to users immediately due to the aggressive caching rule.*
