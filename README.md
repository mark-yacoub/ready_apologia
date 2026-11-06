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
*   `scripts/agent_worktree.sh`: `new|list|rm <task-name>` — one isolated git worktree + `agent/<task-name>` branch per agent task (node_modules hard-linked, `.env` copied), so parallel agents never share a working tree.
*   `scripts/test_history_api.mjs` (`npm run test:history`): Fails if client code calls `history.pushState`/`replaceState` or assigns `location.hash` outside `src/utils/url_history.js` (Astro ClientRouter ignores Back/Forward to null-state entries).
*   `src/db.js`: Database helper utilizing built-in Node 22 `node:sqlite`.
*   `src/data/scripture/`: Imported NASB (NT) and LXX (OT) scripture JSON files.
*   `public/images/manuscripts/`: Local mock folder containing a few sample manuscript scans for development.
*   `src/pages/`: Page templates for Bible reader, Quran reader, Quran verse evidence drawers, Companion Codices, and Discover articles (`divinity-timeline.astro`, `extrabiblical-evidence-for-jesus.astro`, `islamic-dilemma.astro`, `origins-of-revelation.astro`, `quran-preservation.astro`, `trustworthiness-of-the-bible.astro`, `from-mecca-to-medina.astro`, `hadith-reliability/` (hub, `[case].astro`, `at-a-glance.astro`), `convenient-revelations/` (hub + `[part].astro`), `muhammad-and-slavery/` (hub + `prophets-practice`, `quranic-witness`, `counter-apologetics`)).
*   `src/components/`: Interactive React elements and Astro components (e.g. Quran special pages, headers, evidence tabs, `RouteAnalytics.astro` for declarative DOM routing, `GoogleAnalytics.astro` for GA4 tracking, `MicrosoftClarity.astro` for Clarity heatmaps/recordings, `discover/trustworthiness/` for Stage 1-4 UI components, `discover/hadith-reliability/` for the Hadith Reliability article: case-page building blocks + 8 showcase archetypes, `discover/quran-preservation/` for the Qurʾān preservation item layout, and `discover/islamic-dilemma/` for the Islamic Dilemma page, which reuses them; `discover/convenient-revelations/` for the 12-occasions-of-revelation article: inline item blocks reusing those showcases; `discover/origins-of-revelation/` for the Origins of Revelation article: static section bar, glance rows, section head, confrontation/witness showcases, quotation cards, classical pair, sources, stateless `client.js`; `discover/mecca-to-medina/` for From Mecca to Medina: `Item`, `Evidence`, `Showcase`, `Table`, `Sources` Astro components + a stateless `client.js`; `discover/muhammad-slavery/` for the Muhammad and slavery pages: item components (hadith account, Qurʾān passage, answer), sticky bar with "On this page" index, tiny stateless `client.js`).
*   `src/utils/`: Helper utilities for loading scripture, topics, non-Uthmanic Quran data, Hadith Reliability renderer/loader/SEO/schema (`hadithReliability/`), Islamic Dilemma config/copy/overrides/model (`islamicDilemma/`), the occasions-of-revelation config/model/schema (`convenientRevelations/`), Origins of Revelation config/copy contract/references/markdown/data lock/quote fixes/view model/tone (`originsOfRevelation/`; `corepack yarn test:orv` runs its unit tests + audit), From Mecca to Medina copy config / view model / schema / tone gate (`meccaToMedina/`), Muhammad and slavery view model + override layer (`muhammadSlavery/`: copy/*.json (single source of reader copy, schema in validate.js), config, ids, refs, quote fixes, extra texts, generated arabic.js, model split into sources/quoting/items/hub with build-failing checks, text, tone, schema, tests), global CDN configuration (`cdn_config.js`), client-side GA4 and Clarity event tracking (`analytics.js`), Discover URL `#hash` section navigation (`section_navigator.js`), and apologetic evidence (debunking miracles, contradictions, scientific errors).

*   `src/data/quran/debunking/`: Dataset for debunked Quranic scientific miracles.
*   `scripts/import_hadith_reliability.js`: Syncs the Hadith Reliability dataset (`hadith_reliability_overview.json` + optional `verification_report.json`) into `src/data/discover/islam/scripture/hadith_reliability/` — the only sanctioned way to refresh it. Validates the dataset contract (`src/utils/hadithReliability/validate.js`) before copying and prints the SHA-256.
*   `scripts/test_islamic_dilemma.mjs`: Static audit of the built `/discover/islamic-dilemma` page (run after `astro build`; `--allow-sliced` for local partial builds, `--pending-catalog` while the catalog card text is pending): SEO, leaks, link policy and tafsir-page existence, tone, JSON-LD, structure (sections, `#stage-N` aliases, passage counts, islands), stateless client. Copy for that page lives in `src/utils/islamicDilemma/content.js` / `overrides.js`; unit tests: `node --test src/utils/islamicDilemma/*.test.mjs`.
*   `scripts/test_mecca_to_medina.mjs` (`npm run audit:mecca-to-medina`, which first runs `node --test src/utils/meccaToMedina/model.test.mjs`): Static audit of the built From Mecca to Medina page (run after `astro build`; `--allow-sliced` for local partial builds): SEO, leaks of markdown/dataset keys, tone, link policy, internal links and tafsīr routes, legacy anchors, "Check the sources" ↔ page links, heading outline and accessible names, JSON-LD (no FAQPage while `EMIT_FAQ` is false), no React islands, stateless client, Discover catalog card, unsliced build config.
*   `scripts/gen_mecca_to_medina_data_proposals.mjs` (`npm run proposals:mecca-to-medina`): Data proposals for From Mecca to Medina generated from `src/utils/meccaToMedina/config.js` (byte-identical to the overrides; `--out FILE`, `--check FILE`).
*   `scripts/test_hadith_reliability.mjs`: Static audit of the built Hadith Reliability pages (run after `astro build`; `--allow-sliced` for local partial builds): SEO, zero markdown/data leaks, tone, link policy and verification verdicts, internal links, JSON-LD, stateless client, Discover catalog card, unsliced build config.
*   `scripts/test_convenient_revelations.mjs` (`npm run audit:convenient-revelations`): Static audit of the built "12 Occasions of Revelation" pages (`/discover/convenient-revelations`; run after `astro build`; `--allow-sliced` for local partial builds, `--require-catalog` to fail while the Discover catalog card still carries the old name/cover image; unit tests: `npm run test:convenient-revelations`): SEO, item skeleton, 48 legacy anchors, every source card and verify chip, Arabic counts, dataset-prose leaks, tone, link policy, JSON-LD, stateless client.
*   `scripts/test_origins_of_revelation.mjs`: Static audit of the built `/discover/origins-of-revelation` page (run after `astro build`; `--allow-sliced` for local partial builds, `--pending-catalog` while the catalog proposal is open): SEO/meta, leaks, link policy (incl. dist existence, tafsir pages, `rv` not `rev`), tone (incl. the old verdict words), banned colours, JSON-LD, structure (one H1, glance rows = item sections, old-id aliases, zero islands), stateless client, catalog card, unsliced build config.
*   `scripts/origins_of_revelation_data.mjs`: `--lock` regenerates the data lock (`dataLock.js`; run after re-reading the copy for changed data positions); `--import-fixes <quote_fixes.json>` regenerates `src/utils/originsOfRevelation/quoteFixes.js` (verified render-time quote fixes; stale fixes fail); `--proposals <file.md>` writes the data proposals (quote fixes + catalog card, byte-identical with SHA-256) for the data owner.
*   `scripts/test_muhammad_slavery.mjs`: Static audit of the 4 built Muhammad and slavery pages (meta, leaks, links incl. tafsir/hadith route existence and cross-page anchors, legacy anchors, tone as a deny-list of verbatim containers, JSON-LD without FAQPage, structure, unchanged analytics params, stateless client, catalog card, unsliced build config; `--allow-sliced` for local builds, `--allow-pending-data` while the catalog card proposal is pending).
*   `scripts/verify_muhammad_slavery_quotes.mjs`: Network check of every hadith source the Muhammad and slavery pages can quote (`model.hadithSources`: English word-for-word, Arabic without tashkīl) against the fawazahmed0 mirror of Sunnah.com (must report 0 mismatches before shipping; `--cache <dir>` to reuse downloads).
*   `scripts/muhammad_slavery/`: `gen_arabic.mjs` (writes `src/utils/muhammadSlavery/arabic.js` from the mirror for the model's key quotes) and `lib.mjs` (shared model/mirror loading for the scripts).
*   `scripts/import_quran_sources.js` (`npm run import:quran-sources`): Imports the v3 Primary Sources of the Quran dataset (100 adversarially vetted items across 70 distinct motifs with unclamped quotes and verbatim `<mark>` highlights, validated against `src/utils/quranSources/contract.js`; exits 1 and writes nothing on error) into `src/data/quran/sources/` (per-surah drawer data + `index.json`) and `public/data/quran-sources/<category>/<tradition>/<page>.json` (side-by-side reference cards ordered strongest-first with classical explanation vs. primary text preemption). Prints the dataset SHA-256.
*   `scripts/import_hadith.js` (`npm run import:hadith`): Imports the Sahih Hadith dataset + full Bukhari/Muslim texts (annotated hadiths, parallels and every cited reference) into `src/data/hadith/`. Data problems are reported by the build as one `[hadithLoader]` summary.
*   `src/components/hadith/` (feed, card, narration, outline sheet, permalink, translation audit), `src/utils/hadith*.js`, `src/styles/hadith.css`: Sahih Hadith Explorer UI, loader, config (incl. verified Sunnah.com numbering overrides) and scoped styles.
*   `docs/distribution_strategy.md`: [Multi-Channel Marketing, Outreach & Distribution Strategy](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/distribution_strategy.md) actionable master plan and checklists.
*   `docs/creator_contacts.md`: [Creator Contacts & Outreach Directory](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/creator_contacts.md) for top apologists indexed in Ready Apologia.
*   `docs/creator_top_verses.md`: [Personalized Creator Top Bible Verses & Outreach Playbook](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/creator_top_verses.md) with shareable WOW links per creator.
*   `docs/notebooklm.md`: [Notebook LM Video Generation & Discover PDF Export Guide](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/notebooklm.md) covering data standards, PDF structure, and export automation.
*   `docs/pillar2_seo_implementation.md`: [Technical SEO Master Plan & Implementation Code](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/pillar2_seo_implementation.md) for sitemaps, FAQ JSON-LD schema, Open Graph, and robots.txt.
*   `scripts/generate_discover_pdfs.py`: Script to generate high-density, self-contained PDF exports of all Discover articles into `~/Downloads/discover/`.
*   `promo_cards/`: Self-contained directory containing `generate_cards.mjs`, `qrcode.min.js`, `README.md`, printable 8-up double-sided vector PDF, and high-resolution PNG sheet previews.

## 🗺️ Route Map
| Route | Description |
| :--- | :--- |
| `/bible/gospels/videos` | Overview video feed of apologetics shorts across all four Gospels |
| `/evidence/[evidence_id]` | Christian Apologetics Evidence Explorer (`divinity_of_christ`, `divinity_of_the_holy_spirit`, `trinity`, `prophecies`, and `nt_authors` 27-book patristic authorship explorer with `#Book_Name` hash deep links) |
| `/quran` | Evidence & Filters Home (Qiraat & Competing Codices access) |
| `/quran/[surah]` | Quran reader with Uthmanic Arabic and English translation |
| `/quran/[surah]/[ayah]/[tab]` | Quran verse evidence drawer (Debunking Miracles, Scientific Errors, Contradictions, Footnotes, Commentaries, Videos, Primary Sources, Manuscripts) |
| `/evidence/quran_sources` | Primary Sources of the Quran: pre-AD 630 parallels browsed by tradition (lazy-loaded pages) |
| `/quran/variant/[slug]` | Dynamic page showing all verses affected by a specific Qiraat effect or category |
| `/quran/codex/[companion]` | Deep-dive into a companion's non-Uthmanic codex (e.g., Ubayy, Ibn Masud) |
| `/quran/0` | Lost Verses hub rendering the 8 ranked missing and omitted Quranic passages with unabridged Hadiths and Sunnah.com verification links |
| `/hadith` | Sahih Hadiths hub: intro, 7 categories, translation-audit entry |
| `/hadith/[cat]` | Category overview: subcategory pills + top 3 narrations per subcategory |
| `/hadith/[cat]/[sub]` | Ranked feed of narrations (supports `#bukhari-5134` / `#muslim-1422a` deep links) |
| `/hadith/bukhari/[num]`, `/hadith/muslim/[num]` | Single-hadith permalink (Sunnah.com numbering) with full text, analysis, Muslim response |
| `/hadith/translation-audit` | Softened / omitted / euphemized English renderings (supports `#softened`, `#omission`, `#euphemistic`, or a hadith slug) |
| `/discover` | Discover hub with deep dives on Christian theology and Islamic scripture |
| `/discover/hadith-reliability` | How Reliable Are the Hadith? Hub: 6 reader-question sections, 25 cases ordered strongest-first, browse by kind of evidence |
| `/discover/hadith-reliability/[case]` | One case (25 short SEO slugs, e.g. `hour-before-boy-grows-old`): showcase, evidence with Sunnah.com verify chips, classical response, sources, prev/next, same-section and other-section navigation |
| `/discover/hadith-reliability/at-a-glance` | All cases at a glance |
| `/discover/convenient-revelations` | 12 occasions of revelation: hub (Start here, 4 chapters × 3 items, source counts) |
| `/discover/convenient-revelations/[part]` | One chapter (`sexual-privileges`, `evading-accountability`, `spoils-and-etiquette`, `wealth-and-power`) with 3 inline items: showcase, classical explanation, comparison with the texts, full sources with Arabic and verify chips (old `#anchors` still land) |
| `/discover/islamic-dilemma` | What the Qurʾān says about the Gospel Christians held, beside Gospel copies older than Islam: one page, 6 sections (`#quran`, `#gospel-copies`, `#on-jesus`, `#text-history`, `#answers`, `#sources`); old `#stage-1..7` links still land on their sections |
| `/discover/quran-preservation` | How was the Qurʾān preserved? One page: Start here + 5 reader-question sections, 18 anchored items (`#<item-id>`; old `#stage-N` links still land), each with a showcase, Sunnah.com verify chips and the classical explanation |
| `/discover/origins-of-revelation` | 5 accounts of how revelation came (Ḥirāʾ, what the Companions saw, siḥr, Qurʾān 22:52, after Ḥirāʾ) beside the Bible, plus the New Testament's test of a spirit; old `#initial-encounter`-style links land via alias anchors |
| `/discover/from-mecca-to-medina` | From Mecca to Medina: one static page of 15 anchored items (Start here + 4 reader-question sections), each verse labelled Meccan/Medinan, every text quoted and linked; per-item `#id` sharing; old section hashes (`#four-stages-of-warfare`, …) still land |
| `/discover/muhammad-and-slavery` | Muhammad and slavery hub: Start here (Qurʾān 4:24), browse by source, 5 reader-question sections reaching every item |
| `/discover/muhammad-and-slavery/prophets-practice` | 34 hadith accounts from Bukhārī and Muslim in 7 sections (`#<id>` items; legacy `#cat-1…7`) |
| `/discover/muhammad-and-slavery/quranic-witness` | 16 Qurʾān passages with repo-verbatim Ibn Kathīr / al-Ṭabarī excerpts (`#verse-4-24` …) |
| `/discover/muhammad-and-slavery/counter-apologetics` | 9 common answers set beside the texts (`#<id>`, aliases `#faq-1…9`) |
| `/discover/divinity-timeline` | Archaeological Evidence of the Divine Christ timeline (supports `#event-id` URL hash sharing) |
| `/discover/extrabiblical-evidence-for-jesus` | Extrabiblical & Historical Evidence for Jesus catalog (supports `#evidence-id` URL hash sharing) |
| `/discover/trustworthiness-of-the-bible` | The Trustworthiness of the Bible 4-stage evidentiary repository |

