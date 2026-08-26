# 🎬 Notebook LM Video Generation & Discover PDF Export Guide

This document outlines the architecture, data standards, and automated pipeline for converting **Ready Apologia Discover Articles** into self-contained, high-density PDF knowledge bases optimized for ingestion into **Notebook LM** to produce deep-dive video scripts, podcasts, and study guides.

---

## 🎯 Purpose & Notebook LM Requirements

When feeding documents into Notebook LM for video or podcast generation, the AI requires a **self-contained, logically structured, and evidentiary-complete** document. It cannot browse live external databases or follow hyperlinks; all necessary primary evidence, context, and counter-arguments must be explicitly present in the source text.

### Key Requirements for Every Exported Article:
1. **Executive Summary & Thesis:** A clear statement of the topic, historical context, and deductive syllogism/logical dilemma.
2. **Sequential / Thematic Flow:** Structured progression (Chronological timeline, Multi-stage evidentiary pillars, or Case studies).
3. **Unabridged Primary Sources:**
   - Exact scholarly references (e.g., `Sahih al-Bukhari 5038`, `Codex Sinaiticus [א, 01]`, `Tacitus Annals 15.44`).
   - Original language text where applicable (Arabic, Greek, Latin, Hebrew).
   - Complete English translations.
   - Provenance, date range, narrator chain (*Isnad*), or manuscript discovery location.
4. **Classical Exegesis & Commentary:** Classical Islamic Tafsir (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Razi), Ante-Nicene Church Fathers, and Roman/Jewish historians.
5. **Apologetics & Refutation Matrices:** The Claim $\rightarrow$ Orthodox Primary Sources $\rightarrow$ Standard Apologetic Defense $\rightarrow$ Devastating Counter-Analysis.
6. **Master Summary Tables:** Structured comparison grids, manuscript timelines, and variant taxonomies.
7. **Dedicated Video Blueprint:** 5–7 sequential talking points specifically formatted for video pacing (Hook, Context, Core Evidence, Rebuttals, Verdict).

---

## 🚀 Generation Pipeline & CLI Commands

### Output Directory
All generated PDFs are automatically saved to:
`~/Downloads/discover/` (`/usr/local/google/home/markyacoub/Downloads/discover/`)

### Running the Generator
To generate all 8 Discover article PDFs simultaneously:
```bash
python3 scripts/generate_discover_pdfs.py
```

### PDF Rendering Engine
The generator uses **Headless Google Chrome** (`--headless=new --disable-gpu --no-sandbox --print-to-pdf`) to render semantic, beautifully formatted HTML documents directly into high-resolution, vector-crisp PDFs with zero external Python PDF dependencies.

---

## 📚 Currently Supported Discover Articles

| # | Slug / PDF Name | Subject & Category | Core Dataset | Key Artifacts / Evidences |
|---|---|---|---|---|
| 1 | `divinity-timeline.pdf` | **Archaeological Evidence of the Divine Christ**<br>*(Christianity · History)* | `src/data/divinityTimeline.json` | 42 Ante-Nicene archaeological inscriptions, Megiddo Mosaic, Nomina Sacra papyri, house churches, hostile pagan letters. |
| 2 | `quran-preservation.pdf` | **The Myth of the Preservation of the Quran**<br>*(Islamics · Scripture)* | `src/data/discover/islam/scripture/quran_preservation.json` | 8-stage historical progression: Forgetfulness, Yamama crisis, Uthman's burning, lost Stoning/Suckling verses, Sana'a Palimpsest, 7 Ahruf vs Qira'at. |
| 3 | `islamic-dilemma.pdf` | **The Islamic Dilemma: Why the Quran Self-Destructs on the Bible**<br>*(Islamics · Scripture)* | `src/data/discover/islam/scripture/islamic_dilemma.md` | Core logical trilemma, Surahs 5:47 / 10:94 / 5:68, Codex Sinaiticus & Vaticanus synchronicity, Classical Tafsir consensus, 4 objections refuted. |
| 4 | `extrabiblical-evidence-for-jesus.pdf` | **Extrabiblical & Historical Evidence for Jesus**<br>*(Christianity · History)* | `src/data/extrabiblical-evidence-for-jesus.json` | 62 Ante-Nicene non-Christian sources: Tacitus, Josephus, Pliny, Talmud, Nazareth Inscription, Caiaphas ossuary, Pilate stone. |
| 5 | `trustworthiness-of-the-bible.pdf` | **The Trustworthiness of the Bible: From Manuscripts to History**<br>*(Christianity · Scripture)* | `src/data/trustworthiness-of-the-bible.json` | 92 evidences across 4 stages: Classical manuscript histograms vs NT, cornerstone codices, Onomastics, undesigned coincidences, 36,000+ Patristic citations. |
| 6 | `convenient-revelations.pdf` | **Convenient Revelations: Self-Serving Medinan Revelations**<br>*(Islamics · The Prophet)* | `src/data/convenient-revelations.json` | 12 case studies: Aisha's observation (Bukhari 4788), 4-wife exemption, Zaynab bint Jahsh, Maria the Copt oath, Dinner etiquette (33:53), Umar Hijab, 4-witness rule. |
| 7 | `muhammad-and-slavery.pdf` | **Muhammad & Slavery in Canonical Islamic Texts**<br>*(Islamics · The Prophet)* | `src/data/discover/islam/prophet/slavery.json` | 228 Hadiths from Sahihayn across 7 categories (trading slaves, concubines, *'Azl*, overriding manumission), 16 Quranic verses with Tafsir Ibn Kathir & Tabari, 9 FAQs. |
| 8 | `origins-of-revelation.pdf` | **Assessing the Origins of Islamic Revelation**<br>*(Islamics · Scripture)* | `src/data/discover/islam/scripture/demonic_revelation.json` | 5 comparative stages: Physical choking in Hira, suicidal despair, mediumistic bodily symptoms, black magic (Sihr), Satanic Verses incident vs Biblical accounts. |

---

## 🛠️ How to Add a New Article to the Pipeline

When creating a new Discover article in the future, follow this standard pattern to integrate it into `scripts/generate_discover_pdfs.py`:

### 1. Structure the Data Source
Store your article data in `src/data/` or `src/data/discover/` as either a structured JSON file or an enriched Markdown file. Ensure fields include:
- `title`, `subtitle`, `category`, `description`
- Primary source citations, original language quotes, and English translations
- Structured stages, themes, or case studies
- Apologetic claims and counter-refutations

### 2. Add the Generator Function in `scripts/generate_discover_pdfs.py`
```python
def build_new_article():
    with open(REPO_ROOT / 'src/data/discover/path_to_data.json') as f:
        data = json.load(f)
        
    body = []
    
    # 1. Executive Summary & Thesis
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> ...</p>
    </div>
    """)
    
    # 2. Table of Contents
    body.append("""
    <div class="toc-box">
      <h3>Document Structure</h3>
      <ul class="toc-list">
        <li>...</li>
      </ul>
    </div>
    """)
    
    # 3. Evidentiary Body (Evidence cards, quotes, comparison grids, tables)
    # Loop through items and append semantic HTML components...
    
    # 4. Video Generation Blueprint
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> ...</li>
        <li><strong>Core Argument 1:</strong> ...</li>
        <li><strong>Conclusion / Verdict:</strong> ...</li>
      </ol>
    </div>
    """)
    
    # Wrap in standard HTML template
    html_content = wrap_html_document(
        title="Article Title",
        subtitle="Comprehensive Subtitle",
        category="Christianity · Topic" if is_christian else "Islamics · Topic",
        is_islamic=True_or_False,
        content_body="\n".join(body)
    )
    
    # Render PDF via Chrome
    html_file = HTML_TMP_DIR / "new-article-slug.html"
    pdf_file = DOWNLOADS_DIR / "new-article-slug.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)
```

### 3. Register in `main()`
Add the new function call to `main()` in `scripts/generate_discover_pdfs.py`:
```python
def main():
    ...
    build_new_article()
    ...
```

---

## 🎨 Semantic CSS Components Available for PDF Layouts

The generator provides built-in semantic styling designed for high-contrast print layouts:

| CSS Class | Visual Appearance | Intended Usage |
|---|---|---|
| `.executive-summary` | Light blue background with blue left accent border | Top-level thesis, historical premise, syllogism |
| `.toc-box` | Light slate pill container with bullet list | Navigation and structural breakdown |
| `.evidence-card.highlight` | Bordered white card with theme-colored left border (`#974543` or `#059669`) | Individual artifact, manuscript, or hadith record |
| `.quote-box` | Warm serif quote box (`Literata` / `Georgia`) | Scripture, patristics, or ancient inscriptions |
| `.quote-box.islamic` | Light emerald serif quote box with green border | Hadith or Quranic translations |
| `.quote-box.biblical` | Light blue serif quote box with blue border | Old & New Testament biblical verses |
| `.comparison-grid` | 2-column side-by-side grid (`.comparison-col.islam` & `.comparison-col.christian`) | Comparative religion side-by-side analysis |
| `.case-study` | Bordered multi-section card with claim, sources, defense, and counter | Case studies & moral/historical critiques |
| `.faq-box` | Card with `.faq-q`, `.faq-claim` (red), and `.faq-refutation` (green) | Counter-apologetic FAQs |
| `.video-outline-box` | Purple accent container with numbered talking points | Pacing guide and video outline for Notebook LM |
