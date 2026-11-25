# Ready Apologia: article voice and UI/UX playbook

The standard set by `/discover/hadith-reliability` (Oct 2026). Read this before writing or restyling any article, hub or reader-facing label. It covers **how we write** and **how we design**.

---

## 1. Who we write for

- **The reader:** someone from the other tradition (for example, a Muslim who was told hadith are unreliable and doesn't believe it) who clicks out of curiosity.
- **Assume** a first-time, only-time reader on a phone, often arriving cold from a shared link. Many leave after 1–3 pages.
- **The goal:** an **objective, critical invitation to look for themselves**, with the **strongest evidence first**. State facts. Never antagonize. Change a mind by showing the source, not by winning an argument.

## 2. Voice rules

1. **A researcher laying down facts.** Write as a researcher presenting evidence, not as a guide walking the reader through it. Headers are neutral questions or plain descriptions of what the source says. Hooks and takeaways are declarative statements of what the texts record. The quoted source carries the weight, never our adjective. (Owner, Oct 2026: no "Here you'll see…".)
2. **Attribute every judgment.** Write "al-Nawawī called it narrator error (wahm)", never "it is an error". Accurate translations of attributed verdicts are fine (Ibn Khirāsh: "a liar… who fabricates hadith").
3. **Banned in our own voice:** really, actually, yet, only, even, admit/admitted, blunder, errors (as our verdict), wrong, failed, edited out, blanked out, waived, survive, guessing, myth, exposed, debunk, supposedly, polemic, "leap of faith", and why-questions or either/or ultimatums in hooks. In titles, headings, labels and SEO also avoid: contradiction(s), conflicting, problematic, under scrutiny, absurd, self-serving, defects, conceded, misogyny.
4. **Be fair to the traditional view.** Name the classical reconciliation neutrally ("Commentators proposed rounding"), but **never let it have the last word**. End on the texts.
5. **Test the explanation; don't just place it beside the text.** This is the "Comparing with the primary text" block (owner's standard, Oct 2026). Write it in four short moves:
   1. **What the explanation needs:** name the premise the classical answer depends on. Example: "Al-Nawawī's reading needs a second abrogation, of the five, after the Prophet's last days."
   2. **Whether any text supports it:** say plainly whether a report, verse or early source states that premise, and whether the scholar cites one. Example: "No report says this, and al-Nawawī cites none; he offers it to reconcile ʿĀʾishah's words with the muṣḥaf." Only write this after a search of the primary sources; record the search in the fact-check.
   3. **Who the witness is:** give the narrator's or text's standing from the sources. Example: "The Prophet died in her house, on her day, with his head on her chest (Bukhārī 4449)."
   4. **The fork, then the text:** set out what follows from each option, plainly and without our adjectives. Example: "Either the verse was still recited when he died, as she says, and is not in today's muṣḥaf; or the person beside him at his death did not know a verse had been removed, and the same doubt reaches the many reports that rest on her." End on the quoted text.
   - A fork is allowed **here**, because it follows from the texts. It is still banned in hooks and titles.
   - Never call it "made up" or "invented". "Cites no report" and "offered to reconcile" say the same and can be checked.
6. **Keep quotes in context.** Keep the source's own qualifiers ("…though they do not intend to lie"). No interpolated brackets inside a quotation unless they literally gloss the Arabic.
7. **Invite verification.** Every claim links to its primary source (Sunnah.com, Shamela, IslamWeb; Qurʾān → our Tafsir al-Ṭabarī page).
8. **Texts, not persons.** Frame the case around the method and the text, not the man.
9. **Stand on common ground: the average Muslim.** The owner's standard, Nov 2026. Write every argument for a Muslim with no theology degree, reading it for the first time. Everything an argument stands on must be something that reader already knows and trusts, or something we establish in one line from a source they trust.
   - **Known; no introduction needed:** the Prophet, Khadījah, ʿĀʾishah, Abū Bakr, ʿUmar, ʿUthmān, ʿAlī, Fāṭimah, Gabriel, the Qurʾān, Ḥirāʾ, the Hijra, Badr, and Bukhārī and Muslim as the most authentic books after the Qurʾān.
   - **Companions most readers don't know** (Ibn Masʿūd, Ubayy ibn Kaʿb, Zayd ibn Thābit, Abū Mūsā, Saʿd ibn Muʿādh…): **establish why this person's word matters before using it**, with the Prophet's own words from Bukhārī/Muslim where they exist. Example: "The Prophet named four men to learn the Qurʾān from, and named Ibn Masʿūd first (Bukhārī 3808)." A reader who asks "why should I care what he thought?" must already have the answer.
   - **Scholars** (al-Nawawī, Ibn Kathīr, al-Ṭabarī, Ibn Ḥajar…): one clause on who they are, in terms the reader recognises (their best-known work, or their standing in Sunni scholarship).
   - **Technical terms** (naskh, muṣḥaf, qirāʾāt, isnād, mursal, ḥasan, tafsīr…): say it in plain English first, then the Arabic in brackets, once.
   - **Name the stake early.** Within its first two sentences, every item says why it bears on the page's question. Example: "If the teachers the Prophet chose disagreed about what belongs in the Qurʾān, the claim that it was kept letter for letter has to explain that."
   - **Lead with what the reader knows.** Prefer opening items and forks that rest on well-known figures (ʿĀʾishah, ʿUmar, ʿUthmān) and on Bukhārī/Muslim over lesser-known figures and later sources.
   - "Others disagreed with him" is not an escape when the point *is* the disagreement among people the Prophet himself vouched for. Say so explicitly.
10. **No editorial housekeeping or translation-provenance tags in articles.** Never scatter inline disclaimers about AI-assisted or machine-generated translations, "the translation this site uses", "Highlighting ours", "emphasis added", or UI meta-notes explaining how site links/commentaries open ("Opens Sunnah.com", "Opens Tafsir al-Ṭabarī on this site"). Commentary translation provenance lives once beneath each commentary in `TafseerViewer.jsx` (a single standard bibliographic citation for a printed edition where needed is fine; repeating per-card translation tags across articles is not).

### Copy patterns
| Element | Pattern | Example |
|---|---|---|
| Title | What you're about to see: count + items + what they show | "3 Ṣaḥīḥ Reports Giving Different Ages for the Prophet at His Death" |
| Hook / subtitle | **Researcher's voice: lay down the facts.** One or two declarative sentences saying what the texts record, attributed. No guiding phrases ("Here you'll see", "Let's look", "You may wonder"). Optionally end on **one** good-faith question a traditional scholar could also ask. | "Muslim 1452a records ʿĀʾishah saying a verse of five sucklings was still recited as Qurʾān when the Prophet died. Today's muṣḥaf has no such verse." |
| Takeaway | Plain, attributed statement, no "?", tension carried by facts | "Ṣaḥīḥ chains tie the Hour to a boy's lifetime; a variant reads 'your hour.'" |
| Section header | A question the reader would ask | "Does a Report Keep Its Wording From Book to Book?" |
| Topic labels | How a hadith index would title a chapter; honest, never a verdict | "Prophetic Medicine & Remedies", not "Medical Blunders" |
| Intro | **State the claim, then the tension, plainly.** At most 3 short sentences: (1) what Muslims hold, with its proof-text; (2) that their own most-trusted sources record texts that do not fit that claim; (3) what is on the page, with "judge for yourself" optional. Straight to the point, not harsh: the reader must know within one sentence what the page argues and why it matters. No source inventories, no coyness. | "Muslims hold that the Qurʾān has been preserved letter for letter since it was revealed (15:9). Bukhārī and Muslim, the collections they trust most after the Qurʾān, record Companions describing verses that are not in today's muṣḥaf and readings that differ from it. These are those texts, each linked to its source." |
| Cross-pointer | A quiet aside raising a factual question, not a claim | "A separate question is how faithfully these reports were passed down… How reliable are the hadith? →" |

## 3. Ordering: strongest first
"Strongest" means **hardest to dismiss**. Test each item against the reader's ready answers:
- **R1** minor slip, core intact
- **R2** the scholars already filtered it
- **R3** multiple events
- **R4** rounding
- **R5** Shia / Orientalist / Qurʾānist talking point
- **R6** the 99% rejection proves rigour
- **R7** that prophecy was fulfilled

Criteria, in order:
1. Escape-hatch resistance
2. Both books in the opening slots
3. Core, not periphery
4. Loyalty lever (protecting the Qurʾān or the Prophet *requires* doubting the report)
5. Method-level, not one bad report
6. Source purity (no Western or Shia source carries the core claim)
7. Verifiable in about 60 seconds

**Sequencing rule:** material readers are taught as *proof of rigour* (Muslim's Introduction, Bukhārī's 600k) comes only **after** concrete failures. Accessibility is a pass/fail gate, not a weight. Put concrete evidence before dense methodology.

## 4. Process that produced the quality
- **Adversarial debate:** a strategist and a challenger on a different model debate the order and copy until both sign off. The challenger role-plays the sceptical reader *and* a well-read defender.
- **Data agent agreement:** the data agent must agree, backing any disagreement with real data (hadith numbers, quotes). Both sides hold byte-identical data (confirm the SHA-256).
- **Blind title test:** read the title alone and predict the page; counts must match the showcase.
- **Rendered-page read:** an adversarial reader reads the *built* pages. JSON-field checks miss what readers see.
- **Never regex a tone pass.** Rewrite sentences with an agent and the tone guide; deleting words produced "repnort", duplicate cards and broken links.

---

## 5. UI/UX principles
1. **CUJ first.** Define the reader, the landing scenario (cold, shared link, one visit) and what they must understand in 10 seconds. Design every page to stand alone.
2. **Mobile first.** Screenshot every change at **360, 412 and 1280 px** (`scratch/shot.sh`). Touch targets are at least 44px, with no horizontal scroll that hides choices (e.g. the religion tabs split 60/40 so Islamics is never missed).
3. **Information architecture:** hub (short intro → Start here → browse-by-kind chips → reader-question sections) → **at a glance** (every item as a compact card) → **item pages**.
4. **A showcase per kind of evidence**, showing the point in 10 seconds:
   - number fan (differing numbers)
   - versions tabs (wordings)
   - redline (changed or removed words highlighted)
   - timeline
   - bars (counts)
   - chain anatomy (isnād with the unproven link)
   - witnesses (scholar verdict cards)
   - confrontation (principle beside text)
5. **Item page skeleton:**
   - sticky bar (back · prev / position / next · at a glance · copy link)
   - cold-landing context line
   - showcase
   - "About this question"
   - evidence cards (Arabic + translation + verify chips)
   - comparison tables (stacked cards on mobile)
   - classical explanation vs. comparison with the text
   - collapsed deep dive / original Arabic
   - sources grouped by repository
   - academic references
   - pager
   - same-section list
   - other sections
   - "What others are saying" (collapsed, at the very bottom, `nofollow`)
6. **Visual language ("Archive Reading Room"):**
   - Warm archival paper (`--ra-paper: #fbf9f5`), elevated white sheets (`--ra-surface: #ffffff`), deep warm ink (`--ra-ink: #1b1917`), and calm hairline borders (`--ra-line: #e8e2d9`).
   - **Option B section theming** via `src/utils/sectionTheme.js` (applied on `Layout.astro` root as `.sec-christian`, `.sec-islamic`, or `.sec-neutral`):
     - **Christianity (`.sec-christian`):** oxblood `--ra-christian: #7a3530` (bg `#f6eeec`, rule `#dfc5c2`).
     - **Islam (`.sec-islamic`):** deep manuscript cypress `--ra-islamic: #33593a` (bg `#edf3ee`, rule `#c2d6c6`).
     - **Verifiable links & check chips (both sections):** `--ra-verify: #0e5e6f` (bg `#e8f2f3`, rule `#bdd8dc`), never clashing with section accents.
     - **Original Arabic / textual highlight:** warm sand (`--ra-sand: #f6efe3`, `--ra-sand-rule: #b8893a`, `--ra-mark: #f3dfae`). No alarm red, no saturated Tailwind/iOS neons.
   - **Shared primitives & scoped CSS:** `src/styles/ui.css` (`:where()`-scoped) + feature-scoped CSS (`.hrv`, `.hx`, `.ra-home`, etc.), no Tailwind.
   - **3-font stack:** `Literata` (display/scripture serif), `Public Sans` (UI sans), `Amiri` (Arabic + ʿ/ʾ marks inside Literata). No `Cinzel`, `Newsreader`, `Playfair Display`, or `Inter`.
   - **AA contrast:** informative text is never "faint grey" (use `--ra-ink-3: #6b6560` or darker; `>= 4.5:1` on paper/white).
   - **Guardrail:** `npm run audit:palette` (`scripts/test_palette.mjs`) fails on forbidden Tailwind/iOS neon hexes, decorative emojis in UI chrome, retired fonts, or missing `--ra-*` tokens.
7. **Progressive disclosure:** the depth is there but collapsed; the first screen is the claim, the evidence and how to check it.
8. **Personal state is allowed:** pages may keep the reader's own preferences and progress in `localStorage` (e.g. audio position and playback speed). No tracking identifiers, and nothing that changes what a cold reader sees on first visit. (Owner, Nov 2026: the earlier "no localStorage" rule is lifted.)
9. **No explanatory text about the app.** No visible lines that describe the app or the page (counts, "N verses with manuscripts…", "what you'll find here") between a header and its content. Scripture and evidence speak for themselves; SEO copy lives in `<title>` and the meta description only. (Owner, Nov 2026.)

## 6. Engineering guardrails (keep the quality from regressing)
- **Import:** a dataset contract is validated **at import** (`validate.js`): unique ids, contiguous ranks, `global_rank` = reading order, no duplicate cards, link targets `https://` or `/`, known showcase types. The importer prints the SHA-256.
- **Voice & meta-tag gate:** `src/utils/discover/playbookTone.js` (+ `playbookTone.test.mjs`) centralizes Playbook §2.3 (`PLAYBOOK_BODY`, `PLAYBOOK_HEADLINE`) and §2.10 (`PLAYBOOK_META`) banned patterns across all Discover `tone.js` gates, `scripts/test_hadith_reliability.mjs`, and `scripts/test_seo_titles.mjs`.
- **Audit:** a static audit runs on the **built HTML** (`scripts/test_hadith_reliability.mjs` and per-article `scripts/test_*.mjs` audits). It covers SEO, leaks, tone (body, headline, and meta-tag gates), link policy, JSON-LD, structure, the catalog card, and an unsliced `build_config`.
- **Links:** one link policy (`linkAttrs`); internal hrefs are BASE-aware; shared routes live in `src/utils/routes.js`; nav tabs live in `src/components/navTabs.js`.
- **Palette & chrome gate:** `scripts/test_palette.mjs` (`npm run audit:palette`) enforces the Archive Reading Room palette, 3-font stack, canonical `--ra-*` tokens, and SVG-only global chrome.
- **Labels:** reader-facing labels live in config and override dataset names. A missing label **fails the build**, and a unit test bans verdict words.
