#!/usr/bin/env python3
"""
Generate comprehensive, self-contained PDFs for all 8 Discover articles
for ingestion into Notebook LM for video generation.
Saves all PDFs to ~/Downloads/discover.
"""

import os
import sys
import json
import re
import html
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOWNLOADS_DIR = Path.home() / "Downloads" / "discover"
HTML_TMP_DIR = Path("/tmp/ready_apologia_discover_html")

DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
HTML_TMP_DIR.mkdir(parents=True, exist_ok=True)

def clean_text(text):
    if text is None:
        return ""
    return html.escape(str(text))

def format_inline_md(text):
    if not text:
        return ""
    text = html.escape(str(text))
    # Bold: **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic: *text* or _text_
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<em>\1</em>', text)
    text = re.sub(r'(?<!_)_(?!_)(.+?)(?<!_)_(?!_)', r'<em>\1</em>', text)
    # Links: [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<span class="source-link">\1 [<em>\2</em>]</span>', text)
    return text

def md_to_html_blocks(text):
    if not text:
        return ""
    paragraphs = text.strip().split('\n\n')
    out = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith('#### '):
            out.append(f'<h5>{format_inline_md(p[5:])}</h5>')
        elif p.startswith('### '):
            out.append(f'<h4>{format_inline_md(p[4:])}</h4>')
        elif p.startswith('## '):
            out.append(f'<h3>{format_inline_md(p[3:])}</h3>')
        elif p.startswith('# '):
            out.append(f'<h2>{format_inline_md(p[2:])}</h2>')
        elif p.startswith('> '):
            quote_content = '\n'.join(line[2:] if line.startswith('> ') else line for line in p.split('\n'))
            out.append(f'<div class="quote-box">{format_inline_md(quote_content)}</div>')
        elif p.startswith('- ') or p.startswith('* '):
            items = p.split('\n')
            li_html = ''.join(f'<li>{format_inline_md(item.lstrip("-* ").strip())}</li>' for item in items if item.strip())
            out.append(f'<ul>{li_html}</ul>')
        else:
            out.append(f'<p>{format_inline_md(p.replace(chr(10), "<br/>"))}</p>')
    return '\n'.join(out)

BASE_CSS = """
@page {
  size: letter;
  margin: 16mm 14mm 16mm 14mm;
  @bottom-right {
    content: "Page " counter(page);
    font-size: 8pt;
    color: #64748b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @bottom-left {
    content: "Ready Apologia • Discover Deep-Dive Knowledge Base";
    font-size: 8pt;
    color: #64748b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #0f172a;
  background: #ffffff;
  line-height: 1.5;
  font-size: 9.5pt;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5 {
  color: #0f172a;
  page-break-after: avoid;
  font-weight: 700;
}

h1 {
  font-size: 19pt;
  line-height: 1.2;
  margin-top: 0;
  margin-bottom: 4px;
}

h2 {
  font-size: 13.5pt;
  border-bottom: 1.5px solid #cbd5e1;
  padding-bottom: 4px;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #0f172a;
}

h3 {
  font-size: 11.5pt;
  margin-top: 14px;
  margin-bottom: 6px;
  color: #1e293b;
}

h4 {
  font-size: 10pt;
  margin-top: 10px;
  margin-bottom: 4px;
  color: #334155;
}

h5 {
  font-size: 9.5pt;
  margin-top: 8px;
  margin-bottom: 2px;
  color: #475569;
}

p {
  margin-top: 0;
  margin-bottom: 8px;
}

.doc-header {
  border-bottom: 2px solid #974543;
  padding-bottom: 10px;
  margin-bottom: 16px;
}

.doc-header.islam-theme {
  border-bottom-color: #059669;
}

.doc-category {
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #974543;
  margin-bottom: 4px;
}

.islam-theme .doc-category {
  color: #059669;
}

.doc-subtitle {
  font-size: 11pt;
  color: #475569;
  margin-top: 2px;
  margin-bottom: 8px;
  font-weight: 500;
}

.doc-meta-bar {
  display: flex;
  gap: 16px;
  font-size: 8pt;
  color: #64748b;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e2e8f0;
}

.executive-summary {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
  page-break-inside: avoid;
}

.executive-summary h3 {
  margin-top: 0;
  font-size: 11pt;
  color: #1e3a8a;
}

.toc-box {
  background: #f1f5f9;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 18px;
  font-size: 8.5pt;
  page-break-inside: avoid;
}

.toc-box h3 {
  margin-top: 0;
  margin-bottom: 6px;
  font-size: 10pt;
}

.toc-list {
  margin: 0;
  padding-left: 18px;
}

.toc-list li {
  margin-bottom: 3px;
}

.evidence-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: #ffffff;
  page-break-inside: avoid;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.evidence-card.highlight {
  border-left: 4px solid #974543;
  background: #fafbfc;
}

.islam-theme .evidence-card.highlight {
  border-left: 4px solid #059669;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 4px;
}

.card-title {
  font-weight: 700;
  font-size: 10.5pt;
  color: #0f172a;
}

.card-badges {
  display: flex;
  gap: 6px;
  font-size: 7.5pt;
}

.badge {
  background: #e2e8f0;
  color: #334155;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.date {
  background: #fef3c7;
  color: #92400e;
}

.badge.category {
  background: #dbeafe;
  color: #1e40af;
}

.badge.type {
  background: #f1f5f9;
  color: #475569;
}

.quote-box {
  background: #faf8f5;
  border-left: 3px solid #974543;
  padding: 8px 12px;
  margin: 6px 0;
  font-family: "Literata", Georgia, serif;
  font-size: 9pt;
  color: #27272a;
  page-break-inside: avoid;
}

.quote-box.islamic {
  background: #f0fdf4;
  border-left-color: #059669;
}

.quote-box.biblical {
  background: #eff6ff;
  border-left-color: #2563eb;
}

.quote-original {
  font-size: 8.5pt;
  color: #52525b;
  margin-bottom: 4px;
}

.quote-translation {
  font-style: italic;
}

.quote-citation {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 8pt;
  font-weight: 700;
  color: #71717a;
  margin-top: 4px;
  text-align: right;
  font-style: normal;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 8px 0;
  page-break-inside: avoid;
}

.comparison-col {
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  padding: 8px 10px;
}

.comparison-col.islam {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.comparison-col.christian {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.comparison-header {
  font-weight: 700;
  font-size: 8.5pt;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comparison-col.islam .comparison-header { color: #059669; }
.comparison-col.christian .comparison-header { color: #2563eb; }

table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 8pt;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid #cbd5e1;
  padding: 5px 7px;
  text-align: left;
  vertical-align: top;
}

th {
  background: #f1f5f9;
  font-weight: 700;
  color: #1e293b;
}

tr:nth-child(even) td {
  background: #f8fafc;
}

.case-study {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 14px;
  background: #ffffff;
  page-break-inside: avoid;
}

.case-study-title {
  font-size: 11pt;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
}

.case-section {
  margin-bottom: 8px;
}

.case-section-title {
  font-size: 8.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 3px;
}

.case-section.claim .case-section-title { color: #475569; }
.case-section.sources .case-section-title { color: #059669; }
.case-section.defense .case-section-title { color: #d97706; }
.case-section.counter .case-section-title { color: #dc2626; }

.case-box {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 9pt;
}

.case-box.claim { background: #f8fafc; border-left: 3px solid #64748b; }
.case-box.defense { background: #fffbeb; border-left: 3px solid #f59e0b; }
.case-box.counter { background: #fef2f2; border-left: 3px solid #ef4444; }

.faq-box {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
  page-break-inside: avoid;
}

.faq-q {
  font-weight: 700;
  color: #0f172a;
  font-size: 10pt;
  margin-bottom: 6px;
}

.faq-claim {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 8.5pt;
}

.faq-claim strong {
  color: #991b1b;
}

.faq-refutation {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
  padding: 8px 10px;
  font-size: 8.5pt;
}

.faq-refutation strong {
  color: #065f46;
}

.video-outline-box {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-left: 4px solid #9333ea;
  border-radius: 6px;
  padding: 10px 14px;
  margin-top: 18px;
  page-break-inside: avoid;
}

.video-outline-box h3 {
  margin-top: 0;
  color: #6b21a8;
  font-size: 11pt;
}

.takeaways-list {
  padding-left: 18px;
  margin: 0;
  font-size: 9pt;
}

.takeaways-list li {
  margin-bottom: 5px;
}

.source-link {
  color: #2563eb;
  font-family: monospace;
  font-size: 8pt;
}
"""

def wrap_html_document(title, subtitle, category, is_islamic, content_body):
    theme_class = "islam-theme" if is_islamic else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{clean_text(title)}</title>
  <style>
    {BASE_CSS}
  </style>
</head>
<body class="{theme_class}">
  <div class="doc-header {theme_class}">
    <div class="doc-category">{clean_text(category)}</div>
    <h1>{clean_text(title)}</h1>
    <div class="doc-subtitle">{clean_text(subtitle)}</div>
    <div class="doc-meta-bar">
      <span><strong>Source:</strong> Ready Apologia Evidentiary Engine</span>
      <span><strong>Format:</strong> Notebook LM Self-Contained Knowledge Base</span>
      <span><strong>Target:</strong> Video Scripting, AI Podcast & Deep-Dive Generation</span>
    </div>
  </div>
  {content_body}
</body>
</html>"""

def convert_html_to_pdf(html_path, pdf_path):
    cmd = [
        "/usr/bin/google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={pdf_path}",
        str(html_path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error converting {html_path.name}: {res.stderr}")
        return False
    size_kb = pdf_path.stat().st_size / 1024
    print(f"  [OK] Generated {pdf_path.name} ({size_kb:.1f} KB)")
    return True


# ==============================================================================
# 1. DIVINITY TIMELINE
# ==============================================================================
def build_divinity_timeline():
    with open(REPO_ROOT / 'src/data/divinityTimeline.json') as f:
        data = json.load(f)
    
    sorted_items = sorted(data, key=lambda x: x.get('date_int', 9999))
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> A common historical myth—popularized by modern revisionists and popular fiction—asserts that Jesus of Nazareth was viewed merely as a mortal prophet by early Christians, and that His divine status was invented centuries later by Emperor Constantine at the Council of Nicaea (AD 325). This claim is completely contradicted by archaeological, papyrological, epigraphical, and patristic records.</p>
      <p><strong>Evidentiary Proof:</strong> From the 1st through early 4th century, Christians across the Greco-Roman world worshipped Jesus Christ as God (<em>Theos</em> / <em>Kyrios</em>). This catalog presents <strong>42 hard archaeological and documentary artifacts</strong>—including early Christian house churches, sacred mosaics, biblical papyri utilizing divine contractions (<em>Nomina Sacra</em>), early liturgical hymns, and hostile Roman and pagan testimonies—irrefutably demonstrating an unbroken, pre-Nicene belief in Christ's divinity.</p>
    </div>
    """)
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure</h3>
      <ul class="toc-list">
        <li><strong>Part 1:</strong> Methodological Overview & The Pre-Nicene Consensus</li>
        <li><strong>Part 2:</strong> Chronological Evidence Catalog (42 Archaeological & Documentary Artifacts)</li>
        <li><strong>Part 3:</strong> Categorical Analysis & Thematic Synthesis</li>
        <li><strong>Part 4:</strong> Video Script Blueprint & Discussion Guide for Notebook LM</li>
      </ul>
    </div>
    """)
    
    body.append("<h2>Part 1: Methodological Overview & Pre-Nicene Evidence</h2>")
    body.append("""
    <p>The evidence is grouped across six rigorous historical domains:</p>
    <ul>
      <li><strong>Epigraphy & Early Christian Archaeology:</strong> Physical inscriptions, house-churches, and mosaics directly hailing Jesus as God (e.g., Megiddo Mosaic, House of Peter).</li>
      <li><strong>High Christology Biblical Papyri:</strong> Early manuscript copies (P45, P46, P52, P66, P75) transmitting Johannine and Pauline high Christology.</li>
      <li><strong>The Nomina Sacra & Documentary Transmission:</strong> The universal Christian scribal practice of contracting divine titles (Lord, God, Jesus, Christ, Spirit) analogously to the Hebrew Tetragrammaton (YHWH).</li>
      <li><strong>Patristic Defenses & Early Liturgy:</strong> The writings of apostolic and ante-Nicene church fathers (Ignatius of Antioch, Justin Martyr, Irenaeus, Tertullian) confirming universal worship of Jesus as God.</li>
      <li><strong>Hostile Corroborations & Heretical Attestations:</strong> Roman governors (Pliny the Younger), pagan critics (Celsus, Lucian), and heretical sects attesting that Christians sang hymns to Christ "as to a god."</li>
      <li><strong>Extra-Biblical & Syncretic Amulets:</strong> Folk religion and protective amulets calling upon Jesus with divine power.</li>
    </ul>
    """)
    
    body.append("<h2>Part 2: Chronological Evidence Catalog (42 Artifacts)</h2>")
    
    for i, item in enumerate(sorted_items, 1):
        title = item.get('Title', 'Untitled')
        date_str = item.get('date string', 'Unknown Date')
        category = item.get('category', 'General')
        location = item.get('location found', 'Unknown')
        summary = item.get('short summary', '')
        desc = item.get('Description', '')
        quotes = item.get('quotes', [])
        links = item.get('links', [])
        
        body.append(f"""
        <div class="evidence-card highlight">
          <div class="card-header">
            <div class="card-title">{i}. {clean_text(title)}</div>
            <div class="card-badges">
              <span class="badge date">{clean_text(date_str)}</span>
              <span class="badge category">{clean_text(category)}</span>
              {f'<span class="badge type">📍 {clean_text(location)}</span>' if location != 'Unknown' else ''}
            </div>
          </div>
        """)
        
        if summary:
            body.append(f"<p><strong>Summary:</strong> {format_inline_md(summary)}</p>")
            
        if desc:
            body.append(f"<div class='card-desc'>{md_to_html_blocks(desc)}</div>")
            
        if quotes:
            for q in quotes:
                orig = q.get('quote', '')
                trans = q.get('translation', '')
                speaker = q.get('speaker', '')
                work = q.get('work', '')
                citation = f"— {speaker}" if speaker else ""
                if work:
                    citation += f", <em>{work}</em>"
                
                body.append(f"""
                <div class="quote-box">
                  {f'<div class="quote-original">{clean_text(orig)}</div>' if orig and orig != trans else ''}
                  <div class="quote-translation">“{format_inline_md(trans if trans else orig)}”</div>
                  {f'<div class="quote-citation">{citation}</div>' if citation else ''}
                </div>
                """)
                
        if links:
            body.append("<div style='margin-top:6px; font-size:8pt; color:#64748b;'><strong>Sources / Citations:</strong> ")
            link_strs = []
            for l in links:
                if isinstance(l, dict):
                    link_strs.append(f"{clean_text(l.get('title', 'Reference'))} ({clean_text(l.get('url', ''))})")
                else:
                    link_strs.append(clean_text(str(l)))
            body.append("; ".join(link_strs) + "</div>")
            
        body.append("</div>")
        
    body.append("""
    <h2>Part 3: Master Chronological Matrix</h2>
    <table>
      <thead>
        <tr>
          <th>Artifact / Evidence</th>
          <th>Date</th>
          <th>Domain</th>
          <th>Location</th>
          <th>Christological Significance</th>
        </tr>
      </thead>
      <tbody>
    """)
    for item in sorted_items:
        body.append(f"""
        <tr>
          <td><strong>{clean_text(item.get('Title'))}</strong></td>
          <td>{clean_text(item.get('date string'))}</td>
          <td>{clean_text(item.get('category'))}</td>
          <td>{clean_text(item.get('location found'))}</td>
          <td>{clean_text(item.get('short summary', '')[:120])}...</td>
        </tr>
        """)
    body.append("</tbody></table>")
    
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook / Opening:</strong> Expose the modern pop-culture myth (from <em>The Da Vinci Code</em> and Muslim apologetics) that Constantine created Jesus's divinity at Nicaea in 325 AD.</li>
        <li><strong>The 1st-Century Reality:</strong> Showcase the House of Peter in Capernaum (c. AD 75) and early epigraphic graffiti hailing Jesus as Lord and God.</li>
        <li><strong>Hostile Pagan Witness:</strong> Examine Pliny the Younger's letter to Emperor Trajan (c. AD 112) documenting Christians chanting hymns to Christ "as to a God" under threat of execution.</li>
        <li><strong>Archaeological Crown Jewel:</strong> Spotlight the Megiddo Mosaic (c. AD 230) inscribed: "Akeptous, who loves God, offered the table to God Jesus Christ as a memorial."</li>
        <li><strong>The Nomina Sacra Scribal Tradition:</strong> Explain how 2nd-century Christian papyri (P45, P46, P66, P75) treated Jesus's name with the exact same sacred contractions reserved for Yahweh in Jewish tradition.</li>
        <li><strong>Conclusion / Verdict:</strong> The historical and archaeological evidence proves an unbroken, 300-year continuity of Christ's divinity preceding Nicaea by centuries.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="Archaeological Evidence of the Divine Christ",
        subtitle="42 Ante-Nicene Archaeological, Epigraphic, Papyrological, and Historical Testimonies Preceding the Council of Nicaea",
        category="Christianity · Historical Archaeology",
        is_islamic=False,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "divinity-timeline.html"
    pdf_file = DOWNLOADS_DIR / "divinity-timeline.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 2. QURAN PRESERVATION
# ==============================================================================
def build_quran_preservation():
    with open(REPO_ROOT / 'src/data/discover/islam/scripture/quran_preservation.json') as f:
        data = json.load(f)
        
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> A central dogma of traditional Islamic apologetics is the claim that the Quran has been preserved perfectly, letter-for-letter, dot-for-dot, without the slightest alteration, addition, or omission from the lips of Muhammad to the modern printed edition. This claim is termed <em>hifz</em> (miraculous textual preservation).</p>
      <p><strong>Historical Reality:</strong> Canonical Islamic primary sources (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami` at-Tirmidhi, and Tarikh al-Tabari) alongside physical manuscript discoveries (the Sana'a Palimpsest) present an entirely different history. The canonical record documents: (1) Muhammad forgetting verses; (2) Mass death of reciters leading to panic collection; (3) Major competing companion codices with differing chapter counts; (4) Uthman's violent burning of all competing manuscripts; (5) Entire lost surahs and missing verses (including the Stoning Verse and Suckling Verses); and (6) Modern regional variant readings (Qira'at) with substantive theological differences.</p>
    </div>
    """)
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure</h3>
      <ul class="toc-list">
        <li><strong>Stage 1:</strong> The Human Element (The Prophet's Era — Forgetfulness & Ahruf Conflict)</li>
        <li><strong>Stage 2:</strong> The Panic at Yamama (Abu Bakr's Collection & Solitary Witnesses)</li>
        <li><strong>Stage 3:</strong> Competing Companion Codices (Ibn Masud vs Ubayy ibn Ka'b vs Ali)</li>
        <li><strong>Stage 4:</strong> Uthman's Fire (Standardization by Human Editorial Override & Mass Burning)</li>
        <li><strong>Stage 5:</strong> Missing & Lost Verses (The Stoning Verse, Adult Suckling, Two Lost Surahs)</li>
        <li><strong>Stage 6:</strong> Hard Archaeology (The Sana'a Palimpsest Ṣanʿā' 1 Subtext)</li>
        <li><strong>Stage 7:</strong> The Qira'at (Regional Variants & The 1924 Cairo Edition)</li>
        <li><strong>Stage 8:</strong> Theological Defense & Textual Loss Rationalization (Naskh & Ahruf)</li>
        <li><strong>Conclusion:</strong> Video Generation Blueprint & Core Talking Points</li>
      </ul>
    </div>
    """)
    
    def render_node(node, depth=1):
        title = node.get('title', 'Untitled')
        level = node.get('level', depth)
        content = node.get('content', '')
        hadiths = node.get('hadiths', [])
        children = node.get('children', [])
        readers_table = node.get('readers_table', [])
        readers_cols = node.get('readers_table_columns', [])
        
        tag = f"h{min(level + 1, 4)}"
        body.append(f"<{tag}>{clean_text(title)}</{tag}>")
        
        if content:
            body.append(f"<div class='section-content'>{md_to_html_blocks(content)}</div>")
            
        if hadiths:
            for h in hadiths:
                ref = h.get('reference', '')
                eng = h.get('english_text', '')
                arb = h.get('arabic_text', '')
                narrator = h.get('narrator', '')
                
                body.append(f"""
                <div class="evidence-card highlight">
                  <div class="card-header">
                    <div class="card-title">📜 Canonical Hadith Witness</div>
                    <div class="card-badges">
                      <span class="badge category">{format_inline_md(ref)}</span>
                    </div>
                  </div>
                  {f'<div class="quote-original" dir="rtl" style="text-align:right; font-family:serif; font-size:10pt; color:#1e293b; margin-bottom:6px;">{clean_text(arb)}</div>' if arb else ''}
                  <div class="quote-box islamic">
                    <div class="quote-translation">“{format_inline_md(eng)}”</div>
                    {f'<div class="quote-citation">— Narrated by {clean_text(narrator)}</div>' if narrator else ''}
                  </div>
                </div>
                """)
                
        if readers_table:
            body.append("<h4>Comparison Table: Transmission Lines</h4>")
            body.append("<table><thead><tr>")
            for c in readers_cols:
                col_label = c.get('label', c.get('id', 'Column')) if isinstance(c, dict) else str(c)
                body.append(f"<th>{clean_text(col_label)}</th>")
            body.append("</tr></thead><tbody>")
            for row in readers_table:
                body.append("<tr>")
                for c in readers_cols:
                    col_id = c.get('id', str(c)) if isinstance(c, dict) else str(c)
                    val = row.get(col_id, '')
                    body.append(f"<td>{format_inline_md(str(val))}</td>")
                body.append("</tr>")
            body.append("</tbody></table>")
            
        for child in children:
            render_node(child, depth + 1)
            
    for root_item in data:
        render_node(root_item, 1)
        
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> Challenge the ubiquitous internet claim that the Quran is the only religious text preserved letter-for-letter without a single variant.</li>
        <li><strong>The Earliest Crisis:</strong> Detail the Battle of Yamama (AD 632) where hundreds of Qurra (memorizers) were slaughtered, forcing Abu Bakr and Umar to scramble for written fragments on palm leaves and shoulder bones.</li>
        <li><strong>The Companion Codices:</strong> Explain how Muhammad's top four reciters (Abdullah ibn Masud, Ubayy ibn Ka'b, etc.) had radically different codices with missing or extra surahs (Ibn Masud rejected Surah 113 and 114; Ubayy had two extra surahs: al-Hafd and al-Khal').</li>
        <li><strong>Uthman's Extreme Measure:</strong> Highlight why Caliph Uthman ordered all competing Quranic manuscripts burned across the Islamic empire, proving intense textual dispute rather than perfect uniformity.</li>
        <li><strong>Lost Passages:</strong> Cite Aisha's explicit Sahih hadith regarding the lost Stoning Verse and Adult Breastfeeding verses that were recited until Muhammad died, and then eaten by a domestic animal.</li>
        <li><strong>Archaeological Proof:</strong> Examine the Sana'a Palimpsest (Ṣanʿā' 1), where UV imaging reveals an erased lower text with major textual differences and different surah orders beneath the standard Uthmanic text.</li>
        <li><strong>The Qira'at Reality:</strong> Disclose that modern Muslims read different print editions (Hafs 1924, Warsh, Qalun, al-Duri) containing hundreds of word-level differences that change theological meanings.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="The Myth of the Preservation of the Quran",
        subtitle="An Evidentiary Examination of Textual Variants, Missing Verses, Companion Codices, and Uthmanic Burning",
        category="Islamics · Scripture & Textual Criticism",
        is_islamic=True,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "quran-preservation.html"
    pdf_file = DOWNLOADS_DIR / "quran-preservation.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 3. ISLAMIC DILEMMA
# ==============================================================================
def build_islamic_dilemma():
    with open(REPO_ROOT / 'src/data/discover/islam/scripture/islamic_dilemma.md') as f:
        md_text = f.read()
        
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>The Syllogism:</strong> The Islamic Dilemma is a fatal, internal logical contradiction at the core of Islamic theology regarding the Christian Scriptures (the Gospel / <em>Injil</em> and Torah / <em>Tawrat</em>):</p>
      <ol style="margin:4px 0; padding-left:20px;">
        <li>The Quran explicitly affirms that the Christian Gospel in the hands of 7th-century Christians is the authentic, authoritative Word of God (Surah 5:46–47, 5:68, 10:94).</li>
        <li>The Quran commands Christians in the 7th century to judge by what God revealed in the Gospel (Surah 5:47).</li>
        <li>The Quran insists that no one can alter or corrupt God's words (Surah 18:27, 6:115).</li>
        <li>The historical 7th-century Gospel—verified by complete ancient codices (Codex Sinaiticus, Vaticanus, Alexandrinus)—unambiguously proclaims the Deity, Sonship, Crucifixion, and Resurrection of Jesus Christ.</li>
        <li>The Quran explicitly denies the Deity, Sonship, Crucifixion, and Resurrection of Jesus Christ (Surah 4:157, 5:72, 9:30).</li>
      </ol>
      <p><strong>Conclusion:</strong> If the Bible is true, Islam is false (the Bible contradicts Islam). If the Bible is false/corrupted, Islam is still false (the Quran falsely affirmed a corrupted book and commanded Christians to judge by it). <strong>Islam self-destructs either way.</strong></p>
    </div>
    """)
    
    body.append(md_to_html_blocks(md_text))
    
    body.append("""
    <h2>Manuscript Evidence Timeline (600 AD Synchronicity)</h2>
    <p>To prove that the Gospel in the 7th century was identical to the Christian Bible today, we examine the great complete Greek codices that existed centuries before Muhammad:</p>
    <table>
      <thead>
        <tr>
          <th>Manuscript / Codex</th>
          <th>Date</th>
          <th>Location / Provenance</th>
          <th>Key Content Verified</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Codex Vaticanus (B, 03)</strong></td>
          <td>c. AD 300–325</td>
          <td>Vatican Library, Rome</td>
          <td>Complete New Testament proclaiming Jesus as God (John 1:1, John 20:28), His bodily resurrection (Matt 28, Luke 24), and substitutionary atonement.</td>
        </tr>
        <tr>
          <td><strong>Codex Sinaiticus (א, 01)</strong></td>
          <td>c. AD 330–360</td>
          <td>British Library, London</td>
          <td>Oldest complete Greek Bible. Contains all 27 New Testament books containing the full crucifixion narratives and divine Sonship.</td>
        </tr>
        <tr>
          <td><strong>Codex Alexandrinus (A, 02)</strong></td>
          <td>c. AD 400–440</td>
          <td>British Library, London</td>
          <td>Complete Byzantine/Alexandrian text witness actively read in Eastern Mediterranean churches during Muhammad's lifetime.</td>
        </tr>
        <tr>
          <td><strong>Papyrus 66 (P66)</strong></td>
          <td>c. AD 175–200</td>
          <td>Bodmer Library, Geneva</td>
          <td>Contains near-complete Gospel of John proclaiming "In the beginning was the Word, and the Word was with God, and the Word was God" (John 1:1).</td>
        </tr>
        <tr>
          <td><strong>Papyrus 75 (P75)</strong></td>
          <td>c. AD 175–225</td>
          <td>Vatican Library</td>
          <td>Oldest surviving text of Luke and John confirming high Christology and bodily resurrection.</td>
        </tr>
      </tbody>
    </table>
    """)
    
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Opening Hook:</strong> Introduce the logical chess puzzle: "How the Quran forces Muslims into a trap where Islam is false no matter which answer they give."</li>
        <li><strong>The Quranic Proof Texts:</strong> Walk through Surah 5:47 ("Let the People of the Gospel judge by what God has revealed in it"), Surah 10:94 ("If you are in doubt, ask those who have been reading the Scripture before you"), and Surah 5:68.</li>
        <li><strong>Classical Tafsir Consensus:</strong> Quote Ibn Kathir and Al-Tabari proving classical scholars recognized Christians possessed the true Gospel during Muhammad's era.</li>
        <li><strong>The Historical Manuscript Fact:</strong> Show that by the 7th century, hundreds of complete Bible manuscripts were spread from Britain to Persia, all teaching Christ's death and resurrection.</li>
        <li><strong>Dismantling Modern Excuses:</strong> Refute the "Lost Book" theory (Jesus never wrote a single book called Injil; the Greek New Testament was the Gospel), the "Paul corrupted it" claim (manuscripts predate Muhammad by centuries), and the misapplication of Surah 2:79.</li>
        <li><strong>Final Verdict:</strong> The inescapable conclusion: If the Gospel is preserved, Islam is false. If the Gospel was lost, the Quran is false for commanding Christians to judge by it.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="The Islamic Dilemma: Why the Quran Self-Destructs on the Christian Bible",
        subtitle="A Comprehensive Logical, Scriptural, and Textual Dissection of the Quran's Affirmation of the 7th-Century Gospel",
        category="Islamics · Comparative Scripture & Logic",
        is_islamic=True,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "islamic-dilemma.html"
    pdf_file = DOWNLOADS_DIR / "islamic-dilemma.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 4. EXTRABIBLICAL EVIDENCE FOR JESUS
# ==============================================================================
def build_extrabiblical_evidence():
    with open(REPO_ROOT / 'src/data/extrabiblical-evidence-for-jesus.json') as f:
        data = json.load(f)
        
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> Mythicists and skeptics frequently argue that Jesus of Nazareth never existed, or that the details of His life, crucifixion, and resurrection claims were invented by Christian mythmakers with no external historical grounding.</p>
      <p><strong>Evidentiary Rebuttal:</strong> This document presents <strong>62 verified non-Christian, Roman, Jewish, Samaritan, and archaeological sources</strong> from the Ante-Nicene era (before AD 325). Using strictly non-Christian and hostile witnesses (Tacitus, Josephus, Pliny the Younger, Suetonius, Mara bar Serapion, Lucian of Samosata, the Babylonian Talmud, Celsus, and imperial Roman inscriptions), historians can independently reconstruct the entire core narrative of Jesus's life, ministry, crucifixion under Pontius Pilate, empty tomb reports, and early divine worship without opening the New Testament.</p>
    </div>
    """)
    
    themes = data.get('themes', [])
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure (5 Core Thematic Pillars)</h3>
      <ul class="toc-list">
    """)
    for i, t in enumerate(themes, 1):
        body.append(f"<li><strong>Theme {i}:</strong> {clean_text(t.get('title'))} ({len(t.get('evidences', []))} sources)</li>")
    body.append("</ul></div>")
    
    for t_idx, theme in enumerate(themes, 1):
        t_title = theme.get('title', 'Theme')
        t_desc = theme.get('description', '')
        evidences = theme.get('evidences', [])
        
        body.append(f"<h2>Theme {t_idx}: {clean_text(t_title)}</h2>")
        if t_desc:
            body.append(f"<p>{format_inline_md(t_desc)}</p>")
            
        for e_idx, e in enumerate(evidences, 1):
            name = e.get('name', 'Evidence')
            name_desc = e.get('nameDesc', '')
            date_str = e.get('dateStr', 'Ancient')
            source_type = e.get('sourceType', 'Historical')
            summary = e.get('shortSummary', '')
            desc = e.get('description', '')
            quotes = e.get('quotes', [])
            
            body.append(f"""
            <div class="evidence-card highlight">
              <div class="card-header">
                <div class="card-title">{t_idx}.{e_idx} {clean_text(name)}</div>
                <div class="card-badges">
                  <span class="badge date">{clean_text(date_str)}</span>
                  <span class="badge type">{clean_text(source_type)}</span>
                </div>
              </div>
            """)
            
            if name_desc:
                body.append(f"<p style='font-size:8.5pt; color:#475569;'><strong>Author / Context:</strong> {format_inline_md(name_desc)}</p>")
            if summary:
                body.append(f"<p><strong>Summary:</strong> {format_inline_md(summary)}</p>")
            if desc:
                body.append(f"<div class='card-desc'>{md_to_html_blocks(desc)}</div>")
                
            if quotes:
                for q in quotes:
                    orig = q.get('quote', '')
                    trans = q.get('translation', '')
                    speaker = q.get('speaker', '')
                    work = q.get('work', '')
                    citation = f"— {speaker}" if speaker else ""
                    if work:
                        citation += f", <em>{work}</em>"
                    body.append(f"""
                    <div class="quote-box">
                      {f'<div class="quote-original">{clean_text(orig)}</div>' if orig and orig != trans else ''}
                      <div class="quote-translation">“{format_inline_md(trans if trans else orig)}”</div>
                      {f'<div class="quote-citation">{citation}</div>' if citation else ''}
                    </div>
                    """)
            body.append("</div>")
            
    body.append("""
    <h2>Master Reconstruction: The Secular Biography of Jesus</h2>
    <p>If every Christian manuscript had been destroyed, we would still know the following facts about Jesus from secular, Jewish, and hostile Roman sources alone:</p>
    <table>
      <thead>
        <tr>
          <th>Historical Fact</th>
          <th>Non-Christian & Hostile Sources</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Jesus lived in Judea during the reign of Tiberius</strong></td>
          <td>Tacitus (<em>Annals</em> 15.44), Josephus (<em>Antiquities</em> 18.3.3)</td>
        </tr>
        <tr>
          <td><strong>He was a wise teacher and worked wondrous deeds</strong></td>
          <td>Josephus (<em>Antiquities</em> 18.3.3), Babylonian Talmud (<em>Sanhedrin</em> 43a)</td>
        </tr>
        <tr>
          <td><strong>He had a brother named James</strong></td>
          <td>Josephus (<em>Antiquities</em> 20.9.1)</td>
        </tr>
        <tr>
          <td><strong>He was executed by crucifixion under Pontius Pilate</strong></td>
          <td>Tacitus, Josephus, Lucian of Samosata, Mara bar Serapion</td>
        </tr>
        <tr>
          <td><strong>His execution occurred on the eve of Passover</strong></td>
          <td>Babylonian Talmud (<em>Sanhedrin</em> 43a)</td>
        </tr>
        <tr>
          <td><strong>His tomb was reported empty, leading to Roman grave-robbery edicts</strong></td>
          <td>The Nazareth Inscription, Celsus (<em>True Doctrine</em>)</td>
        </tr>
        <tr>
          <td><strong>His followers worshipped Him as God and sang hymns to Him</strong></td>
          <td>Pliny the Younger (<em>Letters</em> 10.96), Lucian (<em>Peregrinus</em> 11–13)</td>
        </tr>
        <tr>
          <td><strong>His movement exploded across Judea and Rome despite persecution</strong></td>
          <td>Tacitus, Pliny the Younger, Suetonius</td>
        </tr>
      </tbody>
    </table>
    """)
    
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> "What if I told you that using only hostile Roman and Jewish sources who hated Christianity, we can reconstruct the life, execution, and resurrection claims of Jesus?"</li>
        <li><strong>The Roman Imperial Witnesses:</strong> Dive into Tacitus's description of Nero's persecutions and the execution of "Christus" under Pontius Pilate, and Pliny's interrogation of Christians.</li>
        <li><strong>The Jewish Testimony:</strong> Analyze Josephus's <em>Testimonium Flavianum</em> (and its Arabic/Syriac neutral recensions) and the Talmud's admission that Jesus practiced miracles (labeled "sorcery") and was hanged on Passover eve.</li>
        <li><strong>The Nazareth Inscription:</strong> Explain the 1st-century imperial Caesar decree establishing capital punishment for disturbing sealed tombs, specifically found in Nazareth.</li>
        <li><strong>The Archaeological Corroborations:</strong> Examine the Pilate Stone in Caesarea, the Caiaphas Ossuary, and the Erastus Inscription in Corinth.</li>
        <li><strong>Conclusion:</strong> Jesus is one of the most securely attested historical figures of ancient antiquity, far surpassing contemporary figures like Tiberius Caesar or Pontius Pilate in hostile and secular citations.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="Extrabiblical & Historical Evidence for Jesus Christ",
        subtitle="An Exhaustive Compilation of 62 Ante-Nicene Non-Christian, Roman, Jewish, and Archaeological Testimonies",
        category="Christianity · Historical Evidence",
        is_islamic=False,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "extrabiblical-evidence-for-jesus.html"
    pdf_file = DOWNLOADS_DIR / "extrabiblical-evidence-for-jesus.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 5. TRUSTWORTHINESS OF THE BIBLE
# ==============================================================================
def build_trustworthiness_bible():
    with open(REPO_ROOT / 'src/data/trustworthiness-of-the-bible.json') as f:
        data = json.load(f)
        
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> Skeptics frequently claim the Bible is a collection of unreliable myths and corrupted oral traditions passed down through centuries like a game of 'telephone.' In reality, the Old and New Testaments possess greater manuscript attestation, earlier documentary proximity, more archaeological corroboration, and tighter internal eyewitness criteria than any other document of classical antiquity.</p>
      <p><strong>The 4-Stage Evidentiary Case:</strong> This repository catalogs <strong>92 rigorous evidences</strong> structured across four progressive stages: (1) Textual Transmission & Manuscript Statistics; (2) Archaeological & External Historical Corroboration; (3) Internal Eyewitness Marks & Historiographical Credibility (Onomastics, Undesigned Coincidences, Embarrassment); and (4) Patristic Quotations & Canonical Recognition.</p>
    </div>
    """)
    
    themes = data.get('themes', [])
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure (4 Progressive Stages across 12 Themes)</h3>
      <ul class="toc-list">
    """)
    for i, t in enumerate(themes, 1):
        body.append(f"<li><strong>Theme {i}:</strong> {clean_text(t.get('title'))} ({len(t.get('evidences', []))} items)</li>")
    body.append("</ul></div>")
    
    for t_idx, theme in enumerate(themes, 1):
        t_title = theme.get('title', 'Theme')
        t_desc = theme.get('description', '')
        evidences = theme.get('evidences', [])
        
        body.append(f"<h2>Theme {t_idx}: {clean_text(t_title)}</h2>")
        if t_desc:
            body.append(f"<p>{format_inline_md(t_desc)}</p>")
            
        for e_idx, e in enumerate(evidences, 1):
            name = e.get('name', 'Evidence')
            date_str = e.get('dateStr', '')
            source_type = e.get('sourceType', '')
            autograph = e.get('autographDate', '')
            earliest_copy = e.get('earliestCopyDate', '')
            time_gap = e.get('timeGapYears', '')
            total_mss = e.get('totalSurvivingMss', '')
            desc = e.get('description', '')
            quotes = e.get('quotes', [])
            
            body.append(f"""
            <div class="evidence-card highlight">
              <div class="card-header">
                <div class="card-title">{t_idx}.{e_idx} {clean_text(name)}</div>
                <div class="card-badges">
                  {f'<span class="badge date">{clean_text(date_str)}</span>' if date_str else ''}
                  {f'<span class="badge type">{clean_text(source_type)}</span>' if source_type else ''}
                </div>
              </div>
            """)
            
            if autograph or total_mss:
                body.append(f"""
                <div style="background:#f8fafc; padding:6px 10px; border-radius:4px; margin-bottom:6px; font-size:8pt; display:flex; flex-wrap:wrap; gap:12px;">
                  {f'<span><strong>Autograph:</strong> {clean_text(autograph)}</span>' if autograph else ''}
                  {f'<span><strong>Earliest Copy:</strong> {clean_text(earliest_copy)}</span>' if earliest_copy else ''}
                  {f'<span><strong>Time Gap:</strong> {clean_text(str(time_gap))} years</span>' if time_gap else ''}
                  {f'<span><strong>Surviving Copies:</strong> {clean_text(str(total_mss))}</span>' if total_mss else ''}
                </div>
                """)
                
            if desc:
                body.append(f"<div class='card-desc'>{md_to_html_blocks(desc)}</div>")
                
            if quotes:
                for q in quotes:
                    orig = q.get('quote', '')
                    trans = q.get('translation', '')
                    speaker = q.get('speaker', '')
                    work = q.get('work', '')
                    citation = f"— {speaker}" if speaker else ""
                    if work:
                        citation += f", <em>{work}</em>"
                    body.append(f"""
                    <div class="quote-box">
                      {f'<div class="quote-original">{clean_text(orig)}</div>' if orig and orig != trans else ''}
                      <div class="quote-translation">“{format_inline_md(trans if trans else orig)}”</div>
                      {f'<div class="quote-citation">{citation}</div>' if citation else ''}
                    </div>
                    """)
            body.append("</div>")
            
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Manuscript Wealth vs Classical Antiquity:</strong> Contrast the New Testament (5,800+ Greek MSS, 10,000+ Latin, 9,300+ versions, time gap ~30–100 years) against Homer's <em>Iliad</em> (650 MSS), Plato (210 MSS, 1,000-year gap), and Tacitus (3 MSS, 800-year gap).</li>
        <li><strong>The 400,000 Variants Myth:</strong> Explain that ~75% of variants are simple spelling differences (like 'colour' vs 'color'), 24% are non-translatable word-order shifts, and less than 0.1% affect meaning—with zero affecting any core Christian doctrine.</li>
        <li><strong>Onomastics & Palestinian Name Frequencies:</strong> Showcase Richard Bauckham's statistical evidence: the Gospels perfectly match the highly specific name frequencies of 1st-century Roman Palestine (Simon, Joseph, Mary) rather than Egyptian or diaspora Jewish names, proving authentic eyewitness origin.</li>
        <li><strong>Undesigned Coincidences:</strong> Present interlocking details where one Gospel writer casually mentions a minor detail that only makes sense when read alongside another independent Gospel (e.g., green grass at Passover in Mark 6:39 / John 6:4; Philip being asked where to buy bread in John 6:5 / Luke 9:10).</li>
        <li><strong>Criterion of Embarrassment:</strong> Highlight that the Gospel writers recorded facts no fabricator would invent (disciples fleeing, Peter denying Christ three times, women being the first witnesses of the resurrection in a patriarchal legal culture).</li>
        <li><strong>Patristic Citations:</strong> Demonstrate that over 36,000 New Testament verses are quoted by Ante-Nicene Church Fathers, allowing the entire New Testament to be reconstructed from patristic letters alone.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="The Trustworthiness of the Bible: From Ancient Manuscripts to Historical Reality",
        subtitle="An Evidentiary Repository Establishing the Textual, Archaeological, Historical, and Statistical Reliability of Scripture",
        category="Christianity · Textual & Historical Apologetics",
        is_islamic=False,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "trustworthiness-of-the-bible.html"
    pdf_file = DOWNLOADS_DIR / "trustworthiness-of-the-bible.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 6. CONVENIENT REVELATIONS
# ==============================================================================
def build_convenient_revelations():
    with open(REPO_ROOT / 'src/data/convenient-revelations.json') as f:
        data = json.load(f)
        
    dataset = data.get('dataset', [])
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> Throughout Muhammad's Medinan career, numerous Quranic revelations descended at precise moments of acute personal crisis, marital dispute, financial desire, or military embarrassment—granting Muhammad exclusive exemptions, sexual privileges, moral overrides, and wealth allotments.</p>
      <p><strong>Aisha's Canonical Observation:</strong> This phenomenon was observed firsthand by Muhammad's favorite wife, Aisha, who famously declared in Sahih al-Bukhari 4788: <em>“I feel that your Lord hastens for you to fulfill your wishes and desires”</em> (ما أرى ربك إلا يسارع في هواك).</p>
      <p><strong>12 Detailed Case Studies:</strong> This document examines 12 undeniable historical case studies from orthodox canonical sources (Sahih Bukhari, Sahih Muslim, Tafsir Ibn Kathir, and Tarikh al-Tabari) comparing the claim, the primary source texts, the standard apologetic defense, and the devastating counter-critique.</p>
    </div>
    """)
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure (12 Case Studies)</h3>
      <ul class="toc-list">
    """)
    for i, c in enumerate(dataset, 1):
        body.append(f"<li><strong>Case {i}:</strong> {clean_text(c.get('title'))} ({clean_text(c.get('theme'))})</li>")
    body.append("</ul></div>")
    
    for i, case in enumerate(dataset, 1):
        title = case.get('title', 'Case Study')
        theme = case.get('theme', 'General')
        claim = case.get('the_claim', '')
        sources = case.get('orthodox_sources', [])
        defense = case.get('standard_apologetic_defense', '')
        counter = case.get('the_devastating_counter', '')
        
        body.append(f"""
        <div class="case-study">
          <div class="case-study-title">Case {i}: {clean_text(title)} <span class="badge category" style="float:right;">{clean_text(theme)}</span></div>
          
          <div class="case-section claim">
            <div class="case-section-title">1. The Historical Claim & Context</div>
            <div class="case-box claim">{format_inline_md(claim)}</div>
          </div>
          
          <div class="case-section sources">
            <div class="case-section-title">2. Orthodox Canonical Sources ({len(sources)} Citations)</div>
        """)
        
        for s in sources:
            stage = s.get('flow_stage', '')
            stype = s.get('source_type', '')
            sref = s.get('source_reference', '')
            squote = s.get('quote_or_summary', '')
            
            body.append(f"""
            <div style="margin-bottom:8px; background:#f0fdf4; border-left:3px solid #059669; padding:6px 10px; border-radius:4px;">
              <div style="font-weight:700; font-size:8.5pt; color:#065f46; margin-bottom:2px;">
                {clean_text(stage)} • <span style="font-weight:normal; color:#047857;">[{clean_text(stype)}] {clean_text(sref)}</span>
              </div>
              <div style="font-size:8.5pt; font-style:italic; color:#1e293b;">“{format_inline_md(squote)}”</div>
            </div>
            """)
            
        body.append(f"""
          </div>
          
          <div class="case-section defense">
            <div class="case-section-title">3. Standard Islamic Apologetic Defense</div>
            <div class="case-box defense">{format_inline_md(defense)}</div>
          </div>
          
          <div class="case-section counter">
            <div class="case-section-title">4. Devastating Counter-Analysis & Logical Dissection</div>
            <div class="case-box counter">{format_inline_md(counter)}</div>
          </div>
        </div>
        """)
        
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> Open with Aisha's explosive words in Sahih Bukhari 4788: "I feel that your Lord hastens to fulfill your desires."</li>
        <li><strong>The Marital Limits Case (Surah 33:50):</strong> Muslim men are capped at 4 wives, but a special verse descends giving Muhammad unlimited wives and female slaves with no dowry.</li>
        <li><strong>The Zaynab bint Jahsh Scandal (Surah 33:37):</strong> Muhammad desires the wife of his adopted son Zayd; Zayd divorces her, adoption is abolished across Arabia, and God performs the wedding in heaven to silence critics.</li>
        <li><strong>The Maria the Copt Oath (Surah 66:1–2):</strong> Caught by Hafsa with Maria on Hafsa's bed on her day, Muhammad promises never to touch Maria again; Surah 66 descends freeing Muhammad from his oath and threatening his wives with divorce.</li>
        <li><strong>Dinner Etiquette Revelation (Surah 33:53):</strong> Guests overstay their dinner after a wedding feast; rather than asking them to leave politely, a cosmic verse descends declaring that "God is not shy of the truth" and guests must leave immediately after eating.</li>
        <li><strong>Umar's Demands Validated (Surah 33:59):</strong> Umar follows Muhammad's wives into the dark fields urging seclusion; Surah 33 descends commanding the Hijab exactly as Umar demanded.</li>
        <li><strong>The 4-Witness Rule for Aisha (Surah 24:4):</strong> When Aisha is accused of adultery, revelation halts for a month until political tensions boil, at which point Surah 24 descends establishing the nearly impossible standard of 4 eyewitnesses to exonerate her.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="Convenient Revelations: Self-Serving Medinan Revelations in Canonical Islamic Sources",
        subtitle="Examining the Timeline, Fiqh Rulings, and Classical Commentary on Specific Revelations Serving Muhammad's Personal Interests",
        category="Islamics · Prophetic Biography & Revelation",
        is_islamic=True,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "convenient-revelations.html"
    pdf_file = DOWNLOADS_DIR / "convenient-revelations.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 7. MUHAMMAD & SLAVERY
# ==============================================================================
def build_muhammad_slavery():
    with open(REPO_ROOT / 'src/data/discover/islam/prophet/slavery.json') as f:
        data = json.load(f)
        
    categories = data.get('categories', [])
    quran_tafsir = data.get('quran_slavery_tafsir', {})
    faqs = data.get('faqs', [])
    meta = data.get('metadata', {})
    
    body = []
    
    body.append(f"""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> Modern Islamic apologetics often presents slavery in early Islam as a benign, temporary institution that Islam sought to abolish, claiming enslaved persons were merely treated as 'brothers' or 'household servants.' In contrast, the canonical Islamic sources document that Muhammad owned dozens of personal slaves, engaged in commercial slave trading, captured women in warfare for concubinage, permitted sex with married captive women, practiced coitus interruptus (<em>'Azl</em>) with captives, and legally classified human beings as property subject to commercial barter and inheritance laws.</p>
      <p><strong>The Verified Evidence:</strong> This document compiles <strong>{meta.get('hadith_count', 190)}+ verified hadiths</strong> from the Sahihayn (Bukhari & Muslim), <strong>16 foundational Quranic passages</strong> with classical Tafsir from Ibn Kathir and Al-Tabari, and <strong>9 counter-apologetic FAQs</strong> establishing the legal and historical reality of slavery in Islamic law.</p>
    </div>
    """)
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure</h3>
      <ul class="toc-list">
        <li><strong>Pillar 1:</strong> The Prophet's Practice (7 Categories of Canonical Hadiths)</li>
        <li><strong>Pillar 2:</strong> The Quranic Witness & Classical Tafsir (16 Quranic Verses)</li>
        <li><strong>Pillar 3:</strong> Counter-Apologetics & Refutations (9 In-Depth FAQs)</li>
        <li><strong>Pillar 4:</strong> Video Blueprint & Discussion Guide for Notebook LM</li>
      </ul>
    </div>
    """)
    
    body.append("<h2>Pillar 1: The Prophet's Practice (The Hadith Record)</h2>")
    
    for cat_idx, cat in enumerate(categories, 1):
        cat_title = cat.get('category_title', 'Category')
        cat_desc = cat.get('category_description', '')
        items = cat.get('items', [])
        
        if not items:
            continue
            
        body.append(f"<h3>Category {cat_idx}: {clean_text(cat_title)}</h3>")
        if cat_desc:
            body.append(f"<p>{format_inline_md(cat_desc)}</p>")
            
        for item_idx, item in enumerate(items, 1):
            i_title = item.get('title', 'Topic')
            i_desc = item.get('description', '')
            hadiths = item.get('hadiths', [])
            
            body.append(f"<h4>{cat_idx}.{item_idx} {clean_text(i_title)}</h4>")
            if i_desc:
                body.append(f"<p>{format_inline_md(i_desc)}</p>")
                
            for h in hadiths:
                body.append(f"""
                <div class="evidence-card highlight">
                  <div class="card-header">
                    <div class="card-title">📜 {clean_text(h.get('narrator', 'Hadith'))}</div>
                    <div class="card-badges">
                      <span class="badge category">{clean_text(h.get('reference', ''))}</span>
                    </div>
                  </div>
                  {f'<div class="quote-original" dir="rtl" style="text-align:right; font-family:serif; font-size:9.5pt; color:#1e293b; margin-bottom:4px;">{clean_text(h.get("arabic_text"))}</div>' if h.get("arabic_text") else ''}
                  <div class="quote-box islamic">
                    <div class="quote-translation">“{format_inline_md(h.get('english_text', ''))}”</div>
                  </div>
                </div>
                """)
                
    body.append("<h2>Pillar 2: The Quranic Witness & Classical Tafsir</h2>")
    verses = quran_tafsir.get('verses', [])
    
    for v_idx, v in enumerate(verses, 1):
        v_key = v.get('verse_key', '')
        surah_name = v.get('surah_name', '')
        theme = v.get('theme', '')
        trans = v.get('droge_translation', '')
        rulings = v.get('key_legal_rulings', '')
        tafsir_ik = v.get('tafsir_ibn_kathir', '')
        tafsir_tabari = v.get('tafsir_tabari', '')
        
        body.append(f"""
        <div class="evidence-card highlight">
          <div class="card-header">
            <div class="card-title">Surah {clean_text(v_key)} ({clean_text(surah_name)})</div>
            <div class="card-badges">
              <span class="badge category">{clean_text(theme)}</span>
            </div>
          </div>
          
          <div class="quote-box islamic">
            <div class="quote-translation">“{format_inline_md(trans)}”</div>
            <div class="quote-citation">— Droge Translation</div>
          </div>
          
          {f'<div style="margin-top:6px;"><strong>Key Legal Rulings:</strong> {format_inline_md(rulings)}</div>' if rulings else ''}
          
          {f'<div style="margin-top:6px; background:#faf5f5; padding:6px 10px; border-left:3px solid #974543; border-radius:4px; font-size:8.5pt;"><strong>Tafsir Ibn Kathir:</strong> {format_inline_md(tafsir_ik)}</div>' if tafsir_ik else ''}
          
          {f'<div style="margin-top:6px; background:#f0fdf4; padding:6px 10px; border-left:3px solid #059669; border-radius:4px; font-size:8.5pt;"><strong>Tafsir al-Tabari:</strong> {format_inline_md(tafsir_tabari)}</div>' if tafsir_tabari else ''}
        </div>
        """)
        
    body.append("<h2>Pillar 3: Counter-Apologetics & Refutations</h2>")
    
    for f_idx, faq in enumerate(faqs, 1):
        q = faq.get('question', '')
        claim = faq.get('apologetic_claim', '')
        short_ans = faq.get('short_answer', '')
        ans_md = faq.get('answer_markdown', '')
        
        body.append(f"""
        <div class="faq-box">
          <div class="faq-q">{f_idx}. {clean_text(q)}</div>
          
          {f'<div class="faq-claim"><strong>Apologetic Claim:</strong> {format_inline_md(claim)}</div>' if claim else ''}
          
          {f'<div style="margin-bottom:6px; font-size:9pt;"><strong>Core Summary:</strong> {format_inline_md(short_ans)}</div>' if short_ans else ''}
          
          <div class="faq-refutation">
            <strong>Exhaustive Refutation & Scholarly Evidence:</strong>
            {md_to_html_blocks(ans_md)}
          </div>
        </div>
        """)
        
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> Contrast modern apologetic claims ("Islam abolished slavery") with the cold facts of the Sahihayn: Muhammad was a slave-owner, slave-trader, and captured women in war.</li>
        <li><strong>Trading Slaves for Profit:</strong> Cite Sahih Muslim 1602 where Muhammad traded two black slaves for one Arab slave, proving racial stratification and commercial trading in Islamic law.</li>
        <li><strong>Sexual Slavery (Ma Malakat Aymanukum):</strong> Break down Surah 4:24 and Sahih Muslim 1456a (Battle of Awtas) where Muslim soldiers were permitted to have sexual intercourse with captured women whose pagan husbands were still alive.</li>
        <li><strong>The 'Azl (Coitus Interruptus) Hadiths:</strong> Explain why Muslim warriors practiced coitus interruptus on captives to avoid pregnancy so they could sell the women at slave markets for cash ransom.</li>
        <li><strong>Safiyya, Juwayriyya, and Maria:</strong> Unpack the capture of Safiyya bint Huyayy after her father, husband, and brother were executed at Khaybar, and how Muhammad consummated marriage with her on the return journey.</li>
        <li><strong>Overriding Slave Manumission:</strong> Cite Sahih Bukhari 2415 where a man freed 6 slaves on his deathbed, and Muhammad cast lots, freed only 2, and returned the other 4 to perpetual slavery.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="Muhammad & Slavery in Canonical Islamic Texts",
        subtitle="An Exhaustive Catalog of 228 Hadiths from the Sahihayn, 16 Quranic Passages with Classical Tafsir, and Counter-Apologetics",
        category="Islamics · Prophetic Biography & Jurisprudence (Fiqh)",
        is_islamic=True,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "muhammad-and-slavery.html"
    pdf_file = DOWNLOADS_DIR / "muhammad-and-slavery.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


# ==============================================================================
# 8. ORIGINS OF REVELATION
# ==============================================================================
def build_origins_revelation():
    with open(REPO_ROOT / 'src/data/discover/islam/scripture/demonic_revelation.json') as f:
        data = json.load(f)
        
    items = data.get('items', [])
    body = []
    
    body.append("""
    <div class="executive-summary">
      <h3>Executive Summary & Video Thesis</h3>
      <p><strong>Core Thesis:</strong> Traditional Islamic tradition claims Muhammad received revelations through the Archangel Gabriel (<em>Jibril</em>). However, when the earliest historical accounts (Ibn Ishaq's <em>Sirat Rasul Allah</em>, Tarikh al-Tabari, Sahih al-Bukhari, and Sahih Muslim) are analyzed, the physical phenomena, psychological trauma, and demonic vulnerabilities surrounding Muhammad's revelations bear striking similarities to mediumistic oppression and demonic encounter—and stand in direct opposition to biblical angelic encounters.</p>
      <p><strong>5 Comparative Stages:</strong> This comparative investigation evaluates: (1) The Initial Encounter of violent physical strangulation vs Biblical peace; (2) Muhammad's suicidal despair and fear of demon possession vs Biblical prophetic assurance; (3) Bodily symptoms of foaming, heavy snorting, and coma-like heaviness; (4) Muhammad falling victim to black magic (<em>Sihr</em>); and (5) The Satanic Verses incident where Muhammad recited demonic speech praising pagan goddesses.</p>
    </div>
    """)
    
    body.append("""
    <div class="toc-box">
      <h3>Document Structure</h3>
      <ul class="toc-list">
    """)
    for i, item in enumerate(items, 1):
        body.append(f"<li><strong>Stage {i}:</strong> {clean_text(item.get('title'))}</li>")
    body.append("</ul></div>")
    
    for s_idx, stage in enumerate(items, 1):
        title = stage.get('title', 'Stage')
        comps = stage.get('comparatives', [])
        closing = stage.get('closing_thought', '')
        
        body.append(f"<h2>Stage {s_idx}: {clean_text(title)}</h2>")
        
        for c_idx, comp in enumerate(comps, 1):
            theme_name = comp.get('theme', 'Comparative Analysis')
            iq_list = comp.get('islamic_quotes', [])
            bp_list = comp.get('biblical_parallels', [])
            
            body.append(f"<h3>{s_idx}.{c_idx} {clean_text(theme_name)}</h3>")
            
            body.append("<div class='comparison-grid'>")
            
            # Islamic side
            body.append("<div class='comparison-col islam'>")
            body.append("<div class='comparison-header'>☪️ Canonical Islamic Testimony</div>")
            for iq in iq_list:
                ref = iq.get('reference', '')
                quote = iq.get('quote', '')
                body.append(f"""
                <div style="margin-bottom:8px; font-size:8.5pt;">
                  <div style="font-weight:700; color:#065f46; margin-bottom:2px;">{format_inline_md(ref)}</div>
                  <div style="font-style:italic; color:#1e293b;">“{format_inline_md(quote)}”</div>
                </div>
                """)
            body.append("</div>")
            
            # Biblical side
            body.append("<div class='comparison-col christian'>")
            body.append("<div class='comparison-header'>✝️ Biblical Parallels & Contrasts</div>")
            for bp in bp_list:
                ref = bp.get('reference', '')
                quote = bp.get('quote', '')
                body.append(f"""
                <div style="margin-bottom:8px; font-size:8.5pt;">
                  <div style="font-weight:700; color:#1e40af; margin-bottom:2px;">{format_inline_md(ref)}</div>
                  <div style="font-style:italic; color:#1e293b;">“{format_inline_md(quote)}”</div>
                </div>
                """)
            body.append("</div>")
            
            body.append("</div>")
            
        if closing:
            body.append(f"""
            <div style="background:#faf8f5; border-left:4px solid #974543; padding:10px 14px; margin:10px 0; border-radius:4px;">
              <strong>Theological & Historical Analysis:</strong>
              <p style="margin:4px 0 0 0;">{format_inline_md(closing)}</p>
            </div>
            """)
            
    body.append("""
    <div class="video-outline-box">
      <h3>Video Blueprint & Key Discussion Points for Notebook LM</h3>
      <ol class="takeaways-list">
        <li><strong>Hook:</strong> "Did Muhammad encounter an angel of God, or something entirely different? Let's compare his own earliest words against biblical angelic visitations."</li>
        <li><strong>Physical Choking in the Cave:</strong> Detail the Cave of Hira account in Sahih Bukhari 3 where the entity violently seized and choked Muhammad three times until he was exhausted, contrasted with Gabriel in Luke 1 speaking words of comfort ("Do not be afraid").</li>
        <li><strong>Suicidal Despair:</strong> Cite Ibn Ishaq and Tabari where Muhammad's immediate reaction was terror that he had become a poet possessed by Jinn, leading him to attempt jumping off mountain cliffs to end his life.</li>
        <li><strong>Mediumistic Trances:</strong> Analyze the physical descriptions: sweating profusely on freezing days, falling unconscious, snoring like a young camel, and hearing clanging bells (which Muhammad explicitly called "the musical instruments of Satan" in Sahih Muslim 2114).</li>
        <li><strong>Vulnerability to Black Magic:</strong> Examine Sahih Bukhari 5765 where Muhammad was successfully bewitched by a Jewish sorcerer for months, imagining he had done things (including marital intercourse) which he had not done.</li>
        <li><strong>The Satanic Verses (Surah 22:52 & Tabari):</strong> Examine the incident where Satan cast verses onto Muhammad's tongue praising the pagan goddesses Al-Lat, Al-Uzza, and Manat, leading Muslims and pagans to prostrate together.</li>
      </ol>
    </div>
    """)
    
    html_content = wrap_html_document(
        title="Assessing the Origins of Islamic Revelation",
        subtitle="An Evidentiary Comparison of the Phenomena Surrounding Early Islamic Revelation Against Biblical Angelic and Demonic Accounts",
        category="Islamics · Scripture & Comparative Theology",
        is_islamic=True,
        content_body="\n".join(body)
    )
    
    html_file = HTML_TMP_DIR / "origins-of-revelation.html"
    pdf_file = DOWNLOADS_DIR / "origins-of-revelation.pdf"
    html_file.write_text(html_content, encoding="utf-8")
    convert_html_to_pdf(html_file, pdf_file)


def main():
    print("=" * 60)
    print("Ready Apologia: Generating Self-Contained Discover PDFs")
    print(f"Output Directory: {DOWNLOADS_DIR}")
    print("=" * 60)
    
    build_divinity_timeline()
    build_quran_preservation()
    build_islamic_dilemma()
    build_extrabiblical_evidence()
    build_trustworthiness_bible()
    build_convenient_revelations()
    build_muhammad_slavery()
    build_origins_revelation()
    
    print("=" * 60)
    print("All 8 Discover PDFs successfully generated in ~/Downloads/discover/")
    print("=" * 60)

if __name__ == "__main__":
    main()
