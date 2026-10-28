# 🧠 Jetski Project Memory: Ready Apologia

This is the persistent memory file for **Ready Apologia**. Any new AI session **MUST** read this file first to understand the current codebase architecture, SQLite schema, design systems, responsive layout rules, static site generation strategies, and active implementation plans.

---

## 🚀 Technology Stack & Architecture
Ready Apologia V1 is designed as a **zero-dependency, high-speed mobile-first web application** optimized for both high-end iOS devices and field use by Christian evangelists.

*   **Framework:** Astro v4 (Static Site Generation - SSG)
*   **Interactive Islands:** React (client:load)
*   **Database:** SQLite (`data.db` directly queried during pre-rendering using Node 22's built-in `node:sqlite`)
*   **CSS/Layout:** Pure, Tailwind-free semantic CSS custom properties (variables) and standard CSS Flexbox.
*   **Icons:** 100% Bulletproof Inline Vector SVGs (all Material Web fonts deleted for instant loading speed).

---

## 📊 SQLite Schema & Data Mappings
The project content is driven entirely by a real 8.8MB SQLite database (`data.db`) placed at the repository root.

### 🔑 Core Tables & Relationships:
1.  **`manuscripts_meta`**: Contains catalog meta for ancient manuscripts (NT).
    *   Columns: `ms_id` (Primary Key), `name`, `date_range_english`, `current_location`, `found_location`, `interesting_info`, `variants`.
2.  **`manuscripts_meta_ot`**: Contains catalog meta for Old Testament manuscripts.
    *   Columns: `ms_id`, `name`, `language`, `v11n_type`, `text_type_alignment`, `earliest_date`, etc.
    *   *UI Rule:* Display ONLY `language` (`ms.language`) in the specs drawer. Ignore scholarly columns like `text_type_alignment`, `djd_volume`, and `biblical_content`. Hide `v11n_type` from the UI.
3.  **`manuscript_per_verse`**: Maps NT verses to specific manuscript image scans.
    *   Columns: `verse_id` (`jn_1_1`), `ms_id`, `image_name`.
4.  **`manuscript_per_verse_ot`**: Maps OT verses to image scans with versification tags.
    *   Columns: `verse_id` (`jl_2_28` or `jl_3_1`), `ms_id`, `image_name`, `v11n_type` (`'LXX'` vs `'MT'`).
5.  **`contradictions`**: Alleged Bible contradictions and their exegesis.
    *   Columns: `contradiction_id`, `verse1` (`jn_1_1`), `verse2` (`lk_2_4`), `title`, `answer`, `src`.
6.  **`apologetics`**: Detailed theological defenses.
    *   Columns: `apologetics_id`, `verse` (`jn_1_1`), `title`, `answer`, `src`.

### 🌐 Cloudflare CDN Routing Rule:
*   Derive testament (`isNT`) strictly from the static book catalog (`src/data/books_meta.json`). Never deduce testament from the presence of language or ID prefixes.
*   Network image requests route dynamically to `images/` for NT books (`isNT ? 'images' : 'ot_images'`) and `ot_images/` for OT books.

### ⏳ Historical Date Formatting Rule:
*   Ancient manuscript dates must be cleanly formatted using `formatDate`: negative integers represent Before Christ (`[number] BC`, e.g., `-150` -> `150 BC`), positive integers represent Anno Domini (`AD [number]`). Never output `~-150 AD`.

### 📖 Verse ID Convention:
Verse IDs in the database are formatted as: `[book_id]_[chapter]_[verse]` (all lowercase).
*   *Examples:* `jn_1_1` (John 1:1), `gn_1_26` (Genesis 1:26), `heb_9_12` (Hebrews 9:12).
*   **LXX vs MT Versification Resolution**: All web reader routes (`/bible/[book]/[chapter]/[verse]`) are strictly anchored to Greek Septuagint (`LXX`) numbering. For Old Testament books, database query gates must resolve Masoretic Text (`MT`) numbering equivalents via `mapLxxToMt` / `mapMtToLxx` (`src/utils/scripture_mapper.js`) combining matching rows:
    `WHERE (verse_id = :lxxId AND v11n_type = 'LXX') OR (verse_id = :mtId AND v11n_type = 'MT')`.

---

## 🎨 Design System & Responsive CSS variables

### Mobile Bounding Phone Simulator (Default):
*   On mobile screens (`< 768px`), the app container is bounded to exactly `width: 100%; max-width: 412px` and locked to `height: 100dvh; overflow: hidden;`.
*   Only `<main class="main-content">` scrolls. **This guarantees the Bottom Navigation tab bar remains permanently visible and sticky at the bottom of the device screen at all times.**

### Responsive Desktop Auto-Docking (`>= 768px`):
*   On tablets/desktops, `.app-container` expands to a **sleek, centered Apple-style card (`max-width: 1100px; height: 92vh; border-radius: 20px; flex-direction: row;`)**.
*   The Left Navigator (`ScriptureNav.jsx`) is **permanently docked as a sidebar** on the left side of the screen.
*   The burger menu button and the Bottom Navigation bar are **automatically hidden** on desktop viewports.

### CSS Color Tokens (Zinc/Slate Apple Theme):
```css
:root {
  --color-primary: #09090b; /* Zinc 950 */
  --color-secondary: #974543; /* Terracotta Red */
  --color-background: #f4f4f5; /* Zinc 100 */
  --color-surface: #ffffff;
  --color-on-surface: #09090b;
  --color-on-surface-variant: #71717a; /* Zinc 500 */
  --color-outline-variant: #e4e4e7; /* Zinc 200 */
  --color-surface-container-low: #f4f4f5;
  --color-surface-container-lowest: #ffffff;
  
  --font-display: 'Literata', Georgia, serif;
  --font-body: 'Public Sans', -apple-system, sans-serif;
}
```

---

## 📲 Mobile App Launching
1.  **Immersive launching (`public/manifest.json`):**
    Configured with `"display": "standalone"`. When added to the home screen on iOS/Android, it launches in fullscreen native mode with no browser URL bar. Shield logo (`/assets/logo.png`) is the app icon.

---

## 📂 Codebase Map
*   `.gitignore`: Standard Git exclusion rules for `node_modules/`, `dist/`, and `.astro/`.
*   `.github/workflows/deploy.yml`: Automated CI/CD deployment workflow to sync static builds directly to Cloudflare R2 object storage.
*   `CHATBOT_IDEAS.md`: Architectural options, zero-hallucination guardrails, orthodoxy rules, and caching strategy for the chatbot feature.
*   `data.db`: The SQLite database queried during pre-rendering.
*   `docs/db_schema.sql`: SQL schema definitions for database queries.
*   `docs/distribution_strategy.md`: Multi-Channel Marketing, Outreach & Distribution Strategy with actionable checklists.
*   `docs/creator_contacts.md`: Verified Creator Contacts & Outreach Directory for top apologists indexed in Ready Apologia.
*   `docs/creator_top_verses.md`: Personalized Creator Top Bible Verses & Outreach Playbook with shareable WOW links per creator.
*   `docs/notebooklm.md`: Architecture guide, data standards, and CLI workflow for exporting Discover deep-dive articles into self-contained PDFs for Notebook LM video generation.
*   `docs/pillar2_seo_implementation.md`: Technical SEO Master Plan & Implementation Code for sitemaps, FAQ JSON-LD schema, Open Graph, and robots.txt.
*   `scripts/generate_discover_pdfs.py`: Automated exporter compiling all Discover deep dives into self-contained, high-density PDFs in `~/Downloads/discover/`.
*   `promo_cards/`: Self-contained directory containing `generate_cards.mjs`, `qrcode.min.js`, `README.md`, printable 8-up double-sided vector PDF, and high-resolution PNG sheet previews.
*   `scripts/import_scripture.js`: Script to sync NASB (NT) and LXX (OT) JSON scripture databases.
*   `scripts/copy_sample_images.js`: Script to recursively copy sample manuscript images from data collection.
*   `scripts/find_creator_top_verse.js`: Script to find the #1 ranked Bible verse per apologist creator based on the UI multi-step sorting algorithm.
*   `scripts/serve.js`: Zero-dependency static server running on `http://localhost:8080` for testing.
*   `src/db.js`: Database query helper utilizing `node:sqlite`.
*   `src/data/scripture/`: Contains the imported scripture files (NASB NT & LXX2012 OT) in structured JSON format.
*   `public/images/manuscripts/`: Local mock folder containing a few sample manuscript scans for development.
*   `src/layouts/Layout.astro`: The main responsive layout shell in light-only mode.
*   `src/pages/index.astro`: Homepage handling auto-redirects to John 1.
*   `src/pages/bible/[book]/[chapter].astro`: Compact scripture chapter reader with inline-end badges.
*   `src/pages/bible/[book]/[chapter]/[verse].astro`: 100% SEO-indexable static verse detail page.
*   `src/pages/bible/gospels/videos.astro`: Overview page showing apologetics videos across all four Gospels.
*   `src/pages/quran/index.astro`: Quran home page with filters and evidence cards.
*   `src/pages/quran/[surah].astro`: Surah reader page showing Arabic and English translation.
*   `src/pages/quran/[surah]/[ayah]/[tab].astro`: Quran verse evidence drawer (Debunking Miracles, Scientific Errors, Contradictions, Footnotes, Commentaries, Manuscripts).
*   `src/pages/quran/variant/[slug].astro`: Dynamic page listing all verses matching a specific Qiraat effect or category.
*   `src/pages/quran/0.astro`: Lost Verses page entry point.
*   `src/pages/quran/-1.astro`: Abrogated Verses page entry point.
*   `src/pages/quran/codex/[companion].astro`: Companion Codex page showing comparisons, virtues, and lost verses.
*   `src/pages/discover/`: Discover deep-dive articles (`divinity-timeline.astro`, `extrabiblical-evidence-for-jesus.astro`, `islamic-dilemma.astro`, `origins-of-revelation.astro`, `quran-preservation.astro`, `trustworthiness-of-the-bible.astro`, `statistics.astro`, `from-mecca-to-medina.astro`, `muhammad-and-slavery/`, `hadith-reliability/`) configured with URL `#hash` linking and initial mount hash auto-scrolling so specific chapters, stages, or evidence sections can be shared.
*   **Article voice & UI/UX standard**: `docs/article_and_ux_playbook.md`. Read it before writing or restyling any article, hub, label or SEO copy (objective invitational voice, strongest-first ordering, adversarial review, mobile-first showcase-driven design, guardrails).
*   **How Reliable Are the Hadith? (`/discover/hadith-reliability`, under `Islamics` → `Scripture`)** — rebuilt from scratch (Oct 2026) around one CUJ: a Muslim who has been told hadith are unreliable, doesn't believe it, and checks for himself once, on a phone. Non-polemic, every claim one tap from its source. **Stateless by design** (no localStorage, no read state): every case page must stand alone as a landing page.
    *   Routes: hub `/discover/hadith-reliability` (short intro → Start here → "all at a glance" link → browse-by-kind chips → 6 reader-question sections, ordered strongest-first per FINAL_ORDER v3.2); `/discover/hadith-reliability/at-a-glance` (all cases as compact showcase cards; file name must equal `SEO_GLANCE.slug`); `/discover/hadith-reliability/[case]` × 25 (sticky case bar → header with cold-landing context line → **Showcase** → "About this question" (PAA phrasing) → evidence cards with Arabic + verify chips → comparison tables → classical scholars' explanation vs. "comparing with the primary text" → deep dive / original Arabic (collapsed) → sources grouped by repository → further reading (reference vs. perspective) → prev/next case pager → "More in question N" (sibling cases, current marked) → "Explore other questions"). Tone: every reader-facing string is an objective, critical invitation to look, never polemic. Attribute every judgment to a named scholar, avoid gotcha words (really/actually/yet/only/admit/errors/why…), hooks end on one good-faith question, takeaways are plain attributed statements. No React islands, no JSON endpoints; one ~1.5 KB stateless `client.js` (copy link, chips filter, version tabs).
    *   Data: `scripts/import_hadith_reliability.js` is the ONLY way to refresh `src/data/discover/islam/scripture/hadith_reliability/` (copies `hadith_reliability_overview.json` and, when present, `verification_report.json` from the data-collection repo; prints schema version + field coverage). The data-collection agent is the single writer of the source dataset; the UI never edits it.
    *   **Dataset contract** (`src/utils/hadithReliability/validate.js`, tests in `validate.test.mjs`): enforced by the importer BEFORE copying (exit 1, nothing imported) and again by the loader at build time. Errors: required fields/arrays, unique ids, contiguous section/case `rank`, `global_rank` = reading order, no duplicate evidence cards, every markdown link target `https://` or `/`, known showcase types. Warnings (human check): a title's leading count vs. showcase item count (titles may count pairs/groups). The importer prints the SHA-256 to confirm against the data agent.
    *   `src/utils/hadithReliability/`: `render.js` (small Markdown renderer for exactly the dataset's subset; bracket-safe links; code spans → `.hrv-ar-inline` / `.hrv-chain` (isnād) / `.hrv-math`; ʿ/ʾ → `.hrv-tlm` (not `.hrv-tl`, which is the timeline list); **link policy**: quran.com → internal `/quran/S/A/tafsir/tabari`, everything else external in a new tab; links graded `broken` in the verification report render as plain text; `mismatch` verdicts fail `scripts/test_hadith_reliability.mjs` until the data agent fixes the sentence), `loader.js` (memoised view model: reading order, badges, sources dedup, where-next selection, showcase resolution; ranking/rubric fields never leave it; one `[hadithReliability]` build warning summary), `config.js` (UI copy, archetype fallbacks, angle labels, fallbacks for dataset fields), `seo.js` (titles/slugs/descriptions for all pages from the adversarially-reviewed SEO spec; **slugs are public URLs — never change without a redirect**), `schema.js` (Article with `citation` + Wikidata `about`, BreadcrumbList, ItemList; deliberately no FAQPage/ClaimReview).
    *   Showcase archetypes (`src/components/discover/hadith-reliability/showcase/`): `number_fan`, `versions`, `redline`, `timeline`, `bars`, `chain`, `witnesses`, `confrontation` (+ `facts` fallback when a case has no dataset `showcase`). Each has a `compact` variant used on the glance page and the hub's Start-here card. Showcase facts come from the dataset (`subpoints[].showcase`, `takeaway`).
    *   `src/styles/hadith-reliability.css`: scoped `.hrv` design system ("archive reading room": paper/ink, teal = verifiable, sand = original Arabic, slate = scholars' voice, no red). Element defaults use `:where()` (zero specificity) so component classes win; headings are hardened against the unscoped `h3`–`h6` rules in `markdown-exegesis.css`.
    *   `scripts/test_hadith_reliability.mjs`: static audit of the built pages (SEO titles/descriptions, zero markdown/data leaks, link policy incl. verification verdicts and Ṭabarī route existence, internal links, JSON-LD shape, stateless client). Run after `astro build`.
        *   Named check groups (`meta`, `leaks`, `links`, `tone`, `jsonld`, `structure`, plus `catalog`, `stateless`, `build-config`). Local builds with a sliced `build_config.js` must pass `--allow-sliced`; without it the audit fails until `BUILD_BOOKS`/`BUILD_SURAHS` are `null`. Link policy lives in one place: `render.js` `linkAttrs`/`linkFor().attrs` (templates spread `{...x.attrs}`); further reading = academic hosts (`REFERENCE_HOSTS`) after the sources, everything else collapsed at the page bottom as "What others are saying" with `nofollow`. All internal hrefs include `BASE` (`config.js`). The default scripture page for the Scripture tab and `/` lives in `src/utils/routes.js`.
*   `src/pages/discover/from-mecca-to-medina.astro`: Comprehensive deep-dive article examining the sociopolitical transition from Mecca to Medina, the four stages of Jihad, the deterioration of relations with Jewish tribes, Christological polemics, and the classical science of Naskh (abrogation).
*   `src/components/discover/mecca-to-medina/`: Interactive mobile-first components for From Mecca to Medina (`MeccaToMedinaNav.jsx`, `AbstractSection.jsx`, `SociopoliticalBackdropSection.jsx`, `WarfareStagesTimeline.jsx`, `JewishRelationsSection.jsx`, `ChristologicalShiftSection.jsx`, `DoctrineOfNaskhSection.jsx`, `ComparativeSynthesisSection.jsx`, `InterpretiveFrameworksSection.jsx`, `ConclusionSection.jsx`, `MeccaToMedinaArticle.jsx`, `CollapsibleHadithBox.jsx`, `meccaMedinaUtils.jsx`).
*   `src/data/discover/islam/scripture/from_mecca_to_medina.json`: Sourced dataset containing structured metadata, classical commentary consensus (Al-Tabari, Ibn Kathir), and canonical Hadith citations.
*   `src/pages/discover/muhammad-and-slavery/`: 3-part Portal Hub and dedicated sub-pages (`index.astro`, `prophets-practice.astro`, `quranic-witness.astro`, `counter-apologetics.astro`) examining canonical Islamic texts on slavery.
*   `src/components/discover/slavery/`: Interactive visual components for Muhammad & Slavery (`HadithPillarView.jsx`, `QuranPillarView.jsx`, `FaqPillarView.jsx`, `PillarFooterNav.astro`).
*   `src/data/discover/islam/prophet/slavery.json`: Sourced dataset containing 228 verified hadiths from the Sahihayn, 17 Quranic passages with Tafsir Ibn Kathir & Al-Tabari, and 9 counter-apologetic FAQs.
*   `src/pages/discover/statistics.astro`: Data-driven Scripture Statistics & Leaderboards page providing rankings across Bible and Quran datasets (Top Videos, Defenses, Patristics, Contradictions, Manuscripts, Classical Tafsir by Tabari and Ibn Kathir, Christian Footnotes, Critical Deficiency Labels, and Manuscript Alterations).
*   `src/utils/statisticsLoader.js`: Build-time statistics loader utility querying SQLite and scripture/commentary JSON datasets to compute verified leaderboards and deep links.
*   `src/components/discover/demonic-revelation/`: Interactive comparative components for Assessing the Origins of Islamic Revelation (`DemonicRevelationNav.jsx`, `ComparativeStageCard.jsx`).
*   `src/data/discover/islam/scripture/demonic_revelation.json`: Sourced data containing canonical Islamic testimony, biblical parallels/expectations, and reflections for the Origins of Revelation deep dive.
*   `src/components/discover/trustworthiness/`: Interactive visual components for The Trustworthiness of the Bible (`Stage1TextualTransmission.jsx`, `Stage2ArchaeologyHistory.jsx`, `Stage3EyewitnessCredibility.jsx`, `Stage4CanonVerdict.jsx`).
*   `src/components/islamicdilemma/`: Interactive visual components for the Islamic Dilemma (`DilemmaNav`, `DilemmaDecisionCard`, `AffirmationTable`, `ManuscriptTimeline`, `LogicalTrapDiagram`, `ObjectionsSection`, `PrimaryReferenceTable`).
*   `src/data/discover/islam/scripture/islamic_dilemma.md`: Read-only markdown source of truth for the Islamic Dilemma topic.
*   `src/components/VerseTabs.jsx`: Client-side React switcher for Bible verse detail tabs.
*   `src/components/QuranVerseTabs.jsx`: Client-side React switcher for Quran verse evidence tabs (defaulting to Debunking Miracles).
*   `src/components/BottomNav.jsx`: Immersive mobile segmented bottom navigation tabs.
*   `src/components/ScriptureNav.jsx`: Collapsible Left Navigator featuring responsive desktop vertical app sections.
*   `src/components/OnboardingModal.jsx`: Centered card overlay providing an initial onboarding tip.
*   `src/components/GoogleAnalytics.astro`: Astro `<head>` component injecting GA4 tracking scripts and global SPA/route delegation.
*   `src/components/MicrosoftClarity.astro`: Astro `<head>` component injecting Microsoft Clarity behavioral analytics, session recording, heatmap tracking, and SPA route synchronization.
*   `src/components/common/RouteAnalytics.astro`: L6 declarative GA4 route analytics component emitting `#route-analytics-payload` DOM metadata for SPA transitions.
*   `src/components/QuranSpecial.astro`: Component rendering Lost or Abrogated verses list.
*   `src/components/QuranPageHeader.astro`: Header component for Quran pages with Surah selection dropdown.
*   `src/utils/analytics.js`: L6 client-side Google Analytics 4 utility handling SPA transitions, tab views, and global event delegation.
*   `src/utils/cdn_config.js`: Global CDN image base URL configuration (`R2_BASE_URL`).
*   `src/components/quran/LostVersesHub.jsx`: Interactive mobile-first React component for the Lost Verses hub (`/quran/0`) featuring objective category tabs, language switchers, modern vs companion recitation comparison boxes, unabridged Hadith citations, key missing phrase highlights, and direct Sunnah.com verification links.
*   `src/utils/lostVersesLoader.js`: Dedicated loader and data normalization pipeline for Lost and Omitted Quranic verses, containing full unabridged Arabic/English Hadiths, ranked evidentiary hierarchy, categorized claims, and SQLite apologetics video links.
*   `src/utils/nonUthmanicLoader.js`: Loader for non-Uthmanic data (companions, variants, virtues).
*   `src/utils/quran_debunking_loader.js`: Loader utility for Quranic scientific miracles debunking data.
*   `src/utils/section_navigator.js`: L6 centralized URL `#hash` navigation and section scroll-spy observer utility for Discover articles.
*   `src/data/quran/debunking/`: Contains the scientific miracles debunked JSON dataset.
*   **Sahih Hadith Explorer (`/hadith`)**:
    *   `scripts/import_hadith.js` (`npm run import:hadith`): The ONLY sanctioned way to refresh `src/data/hadith/` (copies `master_hadith_dataset.json` from the data-collection repo and extracts `sahih_fulltext.json` for annotated hadiths + parallels + every reference cited in notes, defenses or translation-issue explanations, inline or bare, via the shared `extractHadithRefs`). Never hand-edit `src/data/hadith/`.
    *   `src/utils/hadith_config.js`: Category/subcategory display labels (neutral topic names for a curious Muslim reader; `label` overrides the dataset name; an unmapped or unlabelled dataset name fails the build; `src/utils/hadith_config.test.mjs` guards labels, slugs and SEO against verdict words), slugs + short labels (keyed by exact dataset names), reserved slugs, UI labels, translation-issue copy, hub intro (objective; with a quiet pointer to /discover/hadith-reliability), SEO templates, sidebar entries (`getHadithNavSections`), and `SUNNAH_NUMBER_OVERRIDES` (verified fixes where the corpus `arabicnumber` is wrong or has no Sunnah.com page, e.g. `muslim:3499` → `154b`; every Muslim reference was swept against Sunnah.com — add an entry only after checking the page's title, chain and English).
    *   `src/utils/hadithLoader.js`: Build-time memoised view model built from small pure builders sharing one context (categories → subcategories → ranked card items, Tier 4 split out; per-hadith records; translation-audit lists; lazy JSON payloads + Arabic packs). Data problems (unanchored excerpts/redlines/terms, refs without full text, dangling or unlisted ids, duplicate Sunnah numbers, merged combined entries) are reported once per build as a single `[hadithLoader]` warning summary — check it after every import.
        *   **Combined entries**: Sunnah.com sometimes files one narration under several numbers ("Bukhari 299, 300, 301"); the corpus then has identical copies. `groupCombinedEntries` keeps the lowest number (the entry's own Sunnah.com URL — later numbers 404) and `buildAllAnnotations` moves annotations from the copies onto it (identical ones merge; `ctx.annIdMap` lets hierarchy ids follow). A copy keeps its own number in prose but links to the kept page. One hadith = one card per feed and one page.
        *   **Authored prose** (notes, defenses, translation-issue explanations) goes through `prepareProse` before markdown: editorial `[brackets]` are parked as placeholders (the shared parser's lazy link regex would otherwise link from `[Wait]` to the next `](url)`); hadith refs → internal links; Abu Dawud/Tirmidhi/Nasa'i/Ibn Majah refs → Sunnah.com links; backtick code spans → Arabic `<span class="hx-ar-inline" lang="ar" dir="rtl">` or transliteration `<em>`; stray backticks (Muhsin Khan's ASCII ʿayn) → `ʿ`. `renderMarkdown` then wraps `ʾ`/`ʿ` in `.hx-tl` (Literata gives them a half-em advance; the Arabic stack draws them tight). Rendered fields are `noteHtml`, `defenseHtml` and `issue.explanationHtml` (shown in `.hx-note`, `.hx-prose` or `.hx-lex-prose`, whose CSS neutralises the global markdown styles). `renderPlainText` is the same pipeline without markup — use it for meta descriptions, JSON-LD and Outline headlines so raw keys like `bukhari:3868` never leak. Narration text from the corpus is left verbatim.
    *   `src/utils/hadithText.js`: Isomorphic helpers — Sunnah.com numbering (`toSunnahNumber`: Muslim `1422.01` → `1422a`), slugs (`muslim-1422a`), Arabic-normalised excerpt anchoring (`findRange`), fringes, redline segments (`buildSegments`), omission detection (`isOmittedRendering`), reference regexes (`extractHadithRefs`, `OTHER_COLLECTION_REF`), and prose tokens (`CODE_SPAN` — word-edge anchored so an ASCII ʿayn never pairs with another backtick — and `ARABIC_SCRIPT`).
    *   `src/components/hadith/`: `HadithFeed.jsx` (feed/overview island, language toggle, Arabic packs, deep-link flash, scroll-spy), `HadithCard.jsx` (torn-page card, lazy full text, redline, defense/parallels panels), `HadithNarration.jsx` (`FullNarration`, `ParallelPanel`), `OutlineSheet.jsx` (modal Outline: focus trap, Escape, focus restore), `HadithParts.jsx` (icons, `MarkedText`, `LexicalCard`, `LoadError`, toast), `HadithPermalink.jsx`, `TranslationAuditBrowser.jsx` (one type's entries + link tabs), `TranslationAuditPage.astro` (shared per-type audit page), `HadithSectionHeader.astro`, `HadithPermalinkPage.astro`, `hadithClient.js` (memoised `fetchJsonOnce`, `useLazyJson` with retry, language preference, share, in-page navigation).
        *   **Card conventions** (user-chosen, keep them): reading order is source → hadith excerpt (serif, primary) → note (quieter sans explanation) → translation badge. The source row is the reference with the full book title wrapping beneath it, plus an icon-only 44px Sunnah.com link. "Read full hadith" is the ONLY way to see more: it shows when there are blurred fringes or the excerpt is clamped (long excerpts fade out instead of a "Show more"), and is hidden when the excerpt already is the whole narration. The redline always shows both wordings (no "show as published" toggle, no translator line, no full-literal drawer). Share copies the hadith's permalink, not the feed anchor.
        *   **Translation audit entries** (`TranslationAuditBrowser.jsx`, rows from `buildTranslationAudit`): each entry is self-contained, in the card frame: source (ref + book + Sunnah icon) → headline (the note's first sentence, or a word-boundary cut if it is very long) → the published sentence with the redline in place (`getRedlineContext` windows long excerpts around the change) → labelled Arabic → "Why the wording matters" (collapsed explanation) → topic link + "Read full hadith". Rows in each tab are sorted by tier, then score.
    *   `src/styles/hadith.css`: Scoped `.hx` design system (does not leak into the rest of the app). Contrast rule: informative text uses `--hx-muted` or darker; `--hx-faint` is for separators/icons only.
        *   It carries its own `box-sizing: border-box` reset for `.hx` and the portaled `.hx-sheet` (the app has no global one), and hardens `.hx-eyebrow` against the unscoped `h3`–`h6` rules in `markdown-exegesis.css`.
        *   **Sticky geometry**: `--hx-sticky-inset` (the `.main-content` top padding), `--hx-head-h` (header height: back row + pill rail + border; a smaller value via `.hx:has(.hx-sticky-pad)` on pages without pills) and `--hx-scroll-offset` drive the sticky header, the "Read full hadith" bar (`top: var(--hx-head-h)`) and every `scroll-margin-top`. If the header's parts change size, update these variables.
    *   Hadith pages pass `showOnboarding={false}` to `Layout.astro` (the site onboarding banner is hidden there).
    *   **Prefetch rule**: links into feed/category pages (header back link, pills, overview section links, cards, crumbs) use `data-astro-prefetch="hover"` — feed pages are 40–100 KB gzip, and the site-wide `viewport` default would download several per page view.
    *   Routes: `/hadith`, `/hadith/[cat]`, `/hadith/[cat]/[sub]#<slug>`, `/hadith/{bukhari,muslim}/[num]`, `/hadith/translation-audit/{softened,omitted,euphemism}` — one crawlable page per type with its own title/H1/canonical, built from `TRANSLATION_ISSUE_TYPES[*].slug` via `getTranslationAuditPath`. There is NO `/hadith/translation-audit` index page and no `#type` hashes; the hub's audit chips link straight to each type (`#<slug>` still scrolls to an entry), static JSON `/hadith/data/<slug>.json` and `/hadith/data/arabic/<cat>--<sub>.json`.
    *   **Rule**: All user-visible hadith numbering uses Sunnah.com canonical references; navigation surfaces show names only (no ranks/scores/tiers).

---

## 🚀 Commands & Workflows
Always use Yarn v1 via Corepack on this repository:
*   **Install dependencies:** `corepack yarn install`
*   **Run Dev Server:** `corepack yarn dev`
*   **Build Production Static Files:** `corepack yarn build`
*   **Run Zero-Dependency Static Preview:** `node scripts/serve.js`

### ⚠️ Terminal Sandbox & Node Execution Quirks:
1.  **Mandatory SQLite Experimental Flag**: When running `node` or `astro build` directly with Node v22, `NODE_OPTIONS='--experimental-sqlite'` is strictly required.
2.  **Missing Sandbox `$PATH` Binaries**: In non-interactive terminal subprocesses (`run_command`), standard `node` / `yarn` binaries are missing from `$PATH`. To execute builds autonomously, use the embedded stable Node binary located in VS Code Server:
    `NODE_OPTIONS='--experimental-sqlite' ~/.vscode-server/cli/servers/*/server/node ./node_modules/astro/astro.js build`
3.  **Fast Iteration Builds (`src/utils/build_config.js`)**: To avoid 8-minute compilation times across 77k pages during UI dev cycles, restrict `BUILD_BOOKS` in `build_config.js` to a representative slice (`gn`, `ps`, `is`, `jl`, `dt`, `jn`, `rom`) and optionally `BUILD_SURAHS` (e.g. `new Set(['1'])`). Set both to `null` before final release. (Astro v6: the CLI entry is `./node_modules/astro/bin/astro.mjs`.)

---

## 🎯 Active Plan: Milestone 3 (Verse Evidence Drawer)
This is the immediate next task to execute. Do **NOT** change any files until this plan is aligned with the user.

📁 **[verse_evidence_drawer_plan.md](file:///usr/local/google/home/markyacoub/.gemini/jetski/brain/f5928a4f-2b93-4b4a-a659-4ffd6bcc905c/verse_evidence_drawer_plan.md)**

### Objective:
Overhaul `[verse].astro` and `VerseTabs.jsx` to replace all Tailwind utility classes and Material Font symbols with **custom CSS layout grids** and **inline vector SVGs**, matching the light-only Apple theme.

### Action Steps:
1.  **Modify `src/components/VerseTabs.jsx`:**
    *   Change active tab colors to Terracotta (`#974543`).
    *   Remove dark mode variable mappings.
    *   Format headers as highly elegant segmented pill controls.
2.  **Modify `src/pages/bible/[book]/[chapter]/[verse].astro`:**
    *   Replace back button with standard Apple header `← [Book] [Chapter]`.
    *   Quote box styled with Literata italics and soft Zinc borders.
    *   **Manuscripts:** Replace symbols with a vector **Scroll SVG**, and metadata grids styled using standard CSS grids (Date, Current Location, Found Location).
    *   **Contradictions:** Replace symbols with a vector **Scales SVG**, and format contrasting links as rounded red badges `Chapter X:Y →`.
    *   **Apologetics:** Replace symbols with a vector **Shield-Check SVG**, and format theological exegesis in tight, justified serif paragraphs.

---

## 🧠 Instructions for Future AI Sessions
1.  **Strictly Avoid Tailwind CSS:** Always write custom CSS selectors and variables inside `<style>` tags for local styling. Tailwind is not configured globally and utility classes will fail/collapse.
2.  **Static Pre-rendering Enforcement:** Never write features requiring a live server API. Everything must be statically pre-rendered during Astro compile.
3.  **Mandatory UI Self-Audit (Quality Assurance):** Anytime you build, edit, or polish a user interface (UI), you **MUST** run the local static server, take a screenshot using the headless browser CLI (`gbrowser`), and inspect the generated PNG yourself using the `view_file` tool **before** declaring the task complete. Critically evaluate the layout for text overflows, alignments, spacing, double-logo bugs, and color contrast. Compare it against reference designs to ensure it is an outstanding, premium-quality UI.
4.  **Continuous Documentation Sync (README & JETSKI.md):** Anytime you add, remove, or modify files, components, routes, static assets, helper scripts, or command workflows, you **MUST** immediately update both `README.md` and `JETSKI.md` to keep the Repository Map, setup guides, and CLI commands perfectly synchronized with the actual codebase state. Never leave documentation stale.
5.  **Mandatory SEO Strategy Check:** If creating any new tab, new evidence topic, or ingesting any new data that generates a new unique page pattern, you **MUST** explicitly prompt the user for the SEO title, description, keywords, and FAQ schema data for that page. No webpage component should be shipped without a precise SEO structure designed by the user.

## Code modification rules
- **NEVER MODIFY DATA FILES DIRECTLY**: Do not touch anything in the `src/data/` folder. These files are overwritten by an automated data collection engine. If you need to restructure them for UI components, you must do the processing dynamically midway (e.g. in the Astro component's frontmatter javascript mapping step), treating the data files strictly as read-only.

