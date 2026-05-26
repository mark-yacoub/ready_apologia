# ADR 0001: Framework and Offline Strategy for Ready Apologia

## Status
Accepted

## Context & Requirements
**Ready Apologia** is a mobile-first "field manual" web application designed for Christian evangelists. It allows them to quickly find scriptural proofs, answers to objections, manuscript evidence, and theological explanations while actively engaging with people "on the spot".

### Key Constraints
1.  **Mobile-First & High Speed:** Must load instantly in the field, where cellular reception (3G/4G) may be weak or unreliable.
2.  **Offline Capability (Critical):** The app must work reliably in basements, rural areas, or planes where internet access is completely unavailable.
3.  **Predefined Data:** The core content (Bible ESV, Quran, database of cross-references, commentaries, topics, and manuscript links) is static and only updated occasionally (e.g., monthly for typos).
4.  **Workstation Restrictions:** The development environment is a restricted local workstation with limitations on installing heavy native binaries or compilers.

---

## Decision
We will use **Astro** as the core meta-framework, utilizing **React** for interactive client-side components (islands), compiling to a **Progressive Web App (PWA)** using a Service Worker for offline caching.

The entire Bible, Quran, topics, and articles will be pre-rendered into static HTML and compressed JSON files during the build process using a local SQLite database file (`data.db`) populated from a `.sql` dump.

---

## Rationale

### 1. Extreme Performance (Zero-JS by Default)
Astro's **Islands Architecture** is uniquely suited for a content-heavy app like this.
*   Bible and Quran chapters are 95% static text. Astro renders them as pure HTML, shipping **0 KB of JavaScript** to the browser for these views.
*   React is *only* loaded for specific interactive elements (e.g., the search bar, favorites toggles, or the verse detail popover) using Astro's `client:load` directive.
*   This ensures the page loads instantly on old mobile devices and weak networks, whereas **Next.js** would force the phone to download a massive React framework shell before rendering text.

### 2. 100% Offline Capability (PWA Caching)
Because the data is static and pre-rendered, the entire app consists of static HTML and tiny JSON files.
*   We will implement a Service Worker that pre-caches all pages and resources.
*   When the evangelist is in the field, the browser serves the app directly from local storage. It works completely offline, including the search and verse details.
*   A 10MB SQL database, when compiled into optimized static HTML and compressed JSON, is extremely small and easily cached on a phone.

### 3. Restricted Workstation Resilience
Next.js relies on **SWC** (a compiler written in Rust) which requires downloading complex native pre-built binaries. In restricted corporate environments, this frequently fails.
*   Astro uses **Vite** and **esbuild**, which successfully installed and built on our restricted workstation in under 3 seconds.
*   Furthermore, we leverage **Node 22's built-in experimental SQLite module (`node:sqlite`)**. This allows us to query the SQL file directly in Node during the build with **zero external npm dependencies** and no native C++ compilation issues (avoiding `better-sqlite3` or `sqlite3` npm packages).

---

## Alternatives Considered & Rejected

### Alternative A: Next.js (Static Export)
*   *Why Rejected:* Next.js is a "full-page React" framework. Even when exported statically, it hydrates the entire page, sending large JS bundles to the browser. This causes slower load times on mobile and high CPU usage. Additionally, the SWC native compiler presents a high risk of failing on restricted corporate workstations.

### Alternative B: Client-Side SQLite (Wasm) in React
*   *Why Rejected:* This would require the user's browser to download the entire 10MB database file on their first visit before they can read a single verse. This is a terrible user experience on mobile data.

### Alternative C: Serverless API Backend
*   *Why Rejected:* Every verse click or search would require a network request to a serverless function. This completely fails the requirement to work offline or in areas with poor reception.

---

## Migration & Evolution Path

If the project needs to evolve in the future, Astro provides clean migration paths:

1.  **If we need dynamic, real-time user writes (e.g., shared community comments):**
    *   We can switch Astro from `output: 'static'` to `output: 'hybrid'`.
    *   This allows us to keep the Bible text and articles 100% static, but use serverless functions (SSR) or connect a client-side React component directly to a database like **Supabase (PostgreSQL)** for the dynamic writing features.
2.  **If we migrate to a fully dynamic backend:**
    *   Our React components (`Search.jsx`, `ThemeToggle.jsx`) are standard React. They can be copied directly into a Next.js project or a React Native mobile app in the future without rewriting the UI logic.
