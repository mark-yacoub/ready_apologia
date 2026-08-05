# Ready Apologia

Ready Apologia is a mobile-first, high-speed "field manual" web application designed for Christian evangelists. It allows users to quickly find scriptural proofs, answers to objections, manuscript evidence, and theological explanations while actively engaging in the field.

---

## 🚀 Getting Started

### 1. Installation
All package commands use **Yarn v1** (via Node Corepack) to prevent permission errors on restricted workstations.

```bash
corepack yarn install
```

### 2. Initialize the Database
To set up the local SQLite database with sample apologetics data for testing, run:

```bash
node --experimental-sqlite scripts/init_db.js
```
This generates a `data.db` file in the root directory.

---

## 🖥️ Running the App

### Option A: Development Mode (Recommended for Editing)
Starts the Astro development server with Hot Module Replacement (live editing).

```bash
corepack yarn dev
```
*   **URL:** `http://localhost:4321`
*   *Troubleshooting:* If port `4321` is blocked on your workstation, you can force a different port: `corepack yarn dev --port 8081`. If accessing via SSH tunnel, bind to all interfaces using `corepack yarn dev --host`.

### Option B: Production Static Build
Compiles the React components and queries the local SQLite database at build time, baking everything into 100% static HTML/JSON files in the `dist/` directory.

```bash
corepack yarn build
```

### Option C: Zero-Dependency Static Preview (Workstation Safe)
Serves the production-compiled `dist/` folder locally using a lightweight script that uses **only Node.js core modules** (`http` and `fs`). This requires zero external packages to run.

```bash
corepack yarn serve
# Or run directly with Node:
node scripts/serve.js
```
*   **URL:** `http://localhost:8080`
*   *Troubleshooting:* Override the default port using `PORT=9090 node scripts/serve.js`.

---

## 🛑 Stopping the App (Killing the Process)

### 1. If running in your active terminal
Simply press **`Ctrl + C`** in the terminal window where the server is running.

### 2. If running in the background (or port is stuck)
If the app was started in the background or the port is stuck, you can find and terminate the process manually.

#### Find the Process ID (PID) using the Port:
Run this to see what is running on the Astro port (`4321`) or the static server port (`8080`):
```bash
lsof -i :4321
# or
lsof -i :8080
```

This will output something like:
```
COMMAND    PID       USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    426093 markyacoub   19u  IPv4 658128      0t0  TCP *:4321 (LISTEN)
```

#### Kill the Process:
Take the **PID** (e.g., `426093` from the example above) and run:
```bash
kill -9 <PID>
# Example: kill -9 426093
```

#### Quick "Kill All" Shortcut:
To terminate any running Astro development servers instantly:
```bash
pkill -f astro
```

---

## 📂 Repository Map
*   `.gitignore`: Standard Git exclusion rules for node dependencies and build outputs.
*   `.github/workflows/deploy.yml`: Automated CI/CD deployment workflow to sync static builds directly to Cloudflare R2 object storage.
*   `data.db`: SQLite database containing apologetics and manuscript metadata.
*   `docs/db_schema.sql`: SQL schema definitions for the SQLite database.
*   `scripts/import_scripture.js`: Script to import NASB (NT) and LXX (OT) JSON scriptures into the repository.
*   `scripts/copy_sample_images.js`: Script to recursively search and copy sample manuscript images from the big data collection.
*   `scripts/find_creator_top_verse.js`: Script to find the #1 ranked Bible verse per apologist creator based on the UI multi-step sorting algorithm.
*   `scripts/serve.js`: Zero-dependency HTTP server.
*   `src/db.js`: Database helper utilizing built-in Node 22 `node:sqlite`.
*   `src/data/scripture/`: Imported NASB (NT) and LXX (OT) scripture JSON files.
*   `public/images/manuscripts/`: Local mock folder containing a few sample manuscript scans for development.
*   `src/pages/`: Page templates for Bible reader, Quran reader, Quran verse evidence drawers, Companion Codices, and Discover articles (`divinity-timeline.astro`, `extrabiblical-evidence-for-jesus.astro`, `islamic-dilemma.astro`, `quran-preservation.astro`, `trustworthiness-of-the-bible.astro`).
*   `src/components/`: Interactive React elements and Astro components (e.g. Quran special pages, headers, evidence tabs, `RouteAnalytics.astro` for declarative DOM routing, `GoogleAnalytics.astro` for GA4 tracking, and `discover/trustworthiness/` for Stage 1-4 UI components).
*   `src/utils/`: Helper utilities for loading scripture, topics, non-Uthmanic Quran data, global CDN configuration (`cdn_config.js`), client-side GA4 event tracking (`analytics.js`), Discover URL `#hash` section navigation (`section_navigator.js`), and apologetic evidence (debunking miracles, contradictions, scientific errors).

*   `src/data/quran/debunking/`: Dataset for debunked Quranic scientific miracles.
*   `docs/distribution_strategy.md`: [Multi-Channel Marketing, Outreach & Distribution Strategy](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/distribution_strategy.md) actionable master plan and checklists.
*   `docs/creator_contacts.md`: [Creator Contacts & Outreach Directory](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/creator_contacts.md) for top apologists indexed in Ready Apologia.
*   `docs/creator_top_verses.md`: [Personalized Creator Top Bible Verses & Outreach Playbook](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/creator_top_verses.md) with shareable WOW links per creator.
*   `docs/pillar2_seo_implementation.md`: [Technical SEO Master Plan & Implementation Code](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/pillar2_seo_implementation.md) for sitemaps, FAQ JSON-LD schema, Open Graph, and robots.txt.

## 🗺️ Route Map
| Route | Description |
| :--- | :--- |
| `/quran` | Evidence & Filters Home (Qiraat & Competing Codices access) |
| `/quran/[surah]` | Quran reader with Uthmanic Arabic and English translation |
| `/quran/[surah]/[ayah]/[tab]` | Quran verse evidence drawer (Debunking Miracles, Scientific Errors, Contradictions, Footnotes, Commentaries, Manuscripts) |
| `/quran/variant/[slug]` | Dynamic page showing all verses affected by a specific Qiraat effect or category |
| `/quran/codex/[companion]` | Deep-dive into a companion's non-Uthmanic codex (e.g., Ubayy, Ibn Masud) |
| `/quran/0` | Special route rendering verses historically reported but lost/abrogated |
| `/discover` | Discover hub with deep dives on Christian theology and Islamic scripture |
| `/discover/islamic-dilemma` | The Islamic Dilemma interactive deep-dive page (supports `#stage-X` URL hash sharing) |
| `/discover/quran-preservation` | The Myth of Quranic Preservation deep-dive page (supports `#stage-X` URL hash sharing) |
| `/discover/divinity-timeline` | Archaeological Evidence of the Divine Christ timeline (supports `#event-id` URL hash sharing) |
| `/discover/extrabiblical-evidence-for-jesus` | Extrabiblical & Historical Evidence for Jesus catalog (supports `#evidence-id` URL hash sharing) |

