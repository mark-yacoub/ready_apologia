# Ready Apologia: article voice and UI/UX playbook

The standard set by `/discover/hadith-reliability` (Oct 2026). Read this before writing or restyling any article, hub or reader-facing label. It covers **how we write** and **how we design**.

---

## 1. Who we write for

- **The reader:** someone from the other tradition (for example, a Muslim who was told hadith are unreliable and doesn't believe it) who clicks out of curiosity.
- **Assume** a first-time, only-time reader on a phone, often arriving cold from a shared link. Many leave after 1–3 pages.
- **The goal:** an **objective, critical invitation to look for themselves**, with the **strongest evidence first**. State facts. Never antagonize. Change a mind by showing the source, not by winning an argument.

## 2. Voice rules

1. **Ask, don't tell.** Headers are neutral questions or plain descriptions of what the source says. The quoted source carries the weight, never our adjective.
2. **Attribute every judgment.** Write "al-Nawawī called it narrator error (wahm)", never "it is an error". Accurate translations of attributed verdicts are fine (Ibn Khirāsh: "a liar… who fabricates hadith").
3. **Banned in our own voice:** really, actually, yet, only, even, admit/admitted, blunder, errors (as our verdict), wrong, failed, edited out, blanked out, waived, survive, guessing, myth, exposed, debunk, supposedly, polemic, "leap of faith", and why-questions or either/or ultimatums in hooks. In titles, headings, labels and SEO also avoid: contradiction(s), conflicting, problematic, under scrutiny, absurd, self-serving, defects, conceded, misogyny.
4. **Be fair to the traditional view.** Name the classical reconciliation neutrally ("Commentators proposed rounding"), but **never let it have the last word**. End on the texts.
5. **Keep quotes in context.** Keep the source's own qualifiers ("…though they do not intend to lie"). No interpolated brackets inside a quotation unless they literally gloss the Arabic.
6. **Invite verification.** Every claim links to its primary source (Sunnah.com, Shamela, IslamWeb; Qurʾān → our Tafsir al-Ṭabarī page).
7. **Texts, not persons.** Frame the case around the method and the text, not the man.

### Copy patterns
| Element | Pattern | Example |
|---|---|---|
| Title | What you're about to see: count + items + what they show | "3 Ṣaḥīḥ Reports Giving Different Ages for the Prophet at His Death" |
| Hook / subtitle | "Here you'll see …" plus orientation, ending on **one** good-faith question a traditional scholar could also ask | "Here you'll see both wordings side by side… Which wording came first?" |
| Takeaway | Plain, attributed statement, no "?", tension carried by facts | "Ṣaḥīḥ chains tie the Hour to a boy's lifetime; a variant reads 'your hour.'" |
| Section header | A question the reader would ask | "Does a Report Keep Its Wording From Book to Book?" |
| Topic labels | How a hadith index would title a chapter; honest, never a verdict | "Prophetic Medicine & Remedies", not "Medical Blunders" |
| Intro | Who regards the text how → what this page does → "read the full text and judge for yourself" | `/hadith` hub intro |
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
6. **Visual language:**
   - "Archive reading room": paper and ink; teal = verifiable; sand = original Arabic; slate = scholars' voice; no alarm red.
   - Scoped CSS (`.hrv`, `.hx`), no Tailwind.
   - AA contrast: informative text is never "faint grey" (use `#71717a` or darker).
   - Amiri for ʿ/ʾ marks inside Literata.
7. **Progressive disclosure:** the depth is there but collapsed; the first screen is the claim, the evidence and how to check it.
8. **Stateless:** no localStorage, read marks or session state on article pages.

## 6. Engineering guardrails (keep the quality from regressing)
- **Import:** a dataset contract is validated **at import** (`validate.js`): unique ids, contiguous ranks, `global_rank` = reading order, no duplicate cards, link targets `https://` or `/`, known showcase types. The importer prints the SHA-256.
- **Audit:** a static audit runs on the **built HTML** (`scripts/test_hadith_reliability.mjs`). It covers SEO, leaks, tone (body and headline gates), link policy, JSON-LD, structure, the catalog card, and an unsliced `build_config`.
- **Links:** one link policy (`linkAttrs`); internal hrefs are BASE-aware; shared routes live in `src/utils/routes.js`; nav tabs live in `src/components/navTabs.js`.
- **Labels:** reader-facing labels live in config and override dataset names. A missing label **fails the build**, and a unit test bans verdict words.
