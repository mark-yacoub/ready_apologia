import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promoDir = __dirname;
const brainDir = '/usr/local/google/home/markyacoub/.gemini/jetski/brain/93c438b3-b745-4c11-8ed3-83eddc088049';

// -----------------------------------------------------------------------------
// 1. CARD CONFIGURATION & CONTENT
// -----------------------------------------------------------------------------

const CHRISTIAN_CARD = {
  theme: {
    primary: "#883432",   // Terracotta Crimson
    accent: "#B45309",    // Amber Gold
    bg: "#FAF8F5",        // Warm Parchment
    textDark: "#18181B",
    qrDark: "#5A1A18",
  },
  tag: "CHRISTIAN EVIDENCE & APOLOGETICS",
  title: "Why We Believe: Evidence, History & Hard Verses Answered",
  subtitle: null,
  pillars: [
    {
      icon: "🏛️",
      heading: "Archaeological & Scriptural Proofs",
      desc: "2nd-century papyri (P66, P75), historical artifacts & early Jewish writings."
    },
    {
      icon: "🛡️",
      heading: "Hard Verses & Contradictions Solved",
      desc: "Robust contextual exegesis by ancient church fathers & modern scholars."
    },
    {
      icon: "🎥",
      heading: "3,000+ Apologist Videos",
      desc: "Curated video breakdowns from top apologists linked directly per verse."
    }
  ],
  qrUrl: "https://readyapologia.com/bible/jn/14/28/videos",
  qrSub: "John 14:28 & Video Exegesis",
  footerBrand: "ReadyApologia.com",
  footerSub: "Verse-by-verse Bible app focusing on apologetics by the Catena Bible creators",
  footerRightTitle: "EXPLORE DEEP-DIVES",
  footerRightLink: "readyapologia.com/discover"
};

const ISLAMIC_CARD = {
  theme: {
    primary: "#064E3B",   // Deep Islamic Emerald
    accent: "#B45309",    // Amber Gold
    bg: "#F6FAF7",        // Soft Ivory Sand
    textDark: "#18181B",
    qrDark: "#063828",
  },
  tag: "EXPLORE PRIMARY ISLAMIC SOURCES",
  title: "Ever Wondered Why a Christian Finds It Hard to Accept the Quran or Muhammad as a Prophet?",
  subtitle: "Explore authentic sources for yourself: examine historical preservation, claims against prior scripture, and how teachings compare with biblical prophets.",
  pillars: [
    {
      icon: "📚",
      heading: "Unabridged Classical Tafsir",
      desc: "Read full, unedited English translations of primary classical commentaries (Ibn Kathir & Al-Tabari) on every verse."
    },
    {
      icon: "📜",
      heading: "Lost Verses & Early Codices",
      desc: "Examine passages preserved in Sahih Hadith missing from modern codices, plus variant companion readings."
    }
  ],
  qrUrl: "https://readyapologia.com/quran/0",
  qrSub: "Lost Verses in Sahih Hadith",
  footerBrand: "ReadyApologia.com/quran",
  footerSub: "Verse-by-verse Quran app linking to classical Tafsir & authentic Hadiths",
  footerRightTitle: "DEEP DIVE WITH AUTHENTIC SOURCES",
  footerRightLink: "readyapologia.com/discover#islamics"
};

// -----------------------------------------------------------------------------
// 2. HTML TEMPLATES & RENDERERS
// -----------------------------------------------------------------------------

const qrCodeJs = fs.readFileSync(path.resolve(promoDir, 'qrcode.min.js'), 'utf-8');

const COMMON_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&family=Public+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700&display=swap');
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #18181b;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

function renderCard(side, qrId) {
  const data = side === 'christian' ? CHRISTIAN_CARD : ISLAMIC_CARD;
  const isChr = side === 'christian';
  const { primary, accent, bg, textDark } = data.theme;

  return `
  <div class="clean-card" style="
    width: 4.00in;
    height: 2.625in;
    background: ${bg};
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  ">
    <!-- Subtle hairline border -->
    <div style="position: absolute; inset: 0.05in; border: 1px solid ${primary}25; pointer-events: none; border-radius: 2px;"></div>

    <!-- Main Body -->
    <div style="padding: 0.10in 0.14in 0.04in 0.14in; flex: 1; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 1;">
      
      <!-- Header -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.02in;">
          <span style="font-size: 5.6pt; font-weight: 800; letter-spacing: 0.08em; color: ${accent}; text-transform: uppercase;">
            ${data.tag}
          </span>
          <span style="font-size: 6.8pt; font-weight: 800; color: ${primary}; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">
            READY APOLOGIA
          </span>
        </div>
        <h1 style="
          font-family: 'Literata', Georgia, serif;
          font-size: ${isChr ? '9.8pt' : '8.8pt'};
          line-height: 1.15;
          font-weight: 700;
          color: ${primary};
          margin: 0 0 0.015in 0;
        ">
          ${data.title}
        </h1>
        ${data.subtitle ? `
          <p style="font-size: 5.6pt; line-height: 1.18; color: #4B5563; font-style: italic; margin-top: 0.01in;">
            ${data.subtitle}
          </p>
        ` : ''}
      </div>

      <!-- Center Split (Pillars + QR) -->
      <div style="flex: 1; display: flex; gap: 0.10in; align-items: center; margin: auto 0;">
        
        <!-- Pillars -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: ${data.pillars.length === 2 ? '0.07in' : '0.04in'};">
          ${data.pillars.map(p => `
            <div style="display: flex; align-items: flex-start; gap: 0.04in;">
              <span style="font-size: 9pt; line-height: 1; margin-top: 1px;">${p.icon}</span>
              <div>
                <div style="font-size: 7.0pt; font-weight: 800; color: ${textDark}; line-height: 1.15;">
                  ${p.heading}
                </div>
                <div style="font-size: 5.6pt; color: #4B5563; line-height: 1.18; margin-top: 1px;">
                  ${p.desc}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- QR Code Box (without 'Scan to Explore' banner) -->
        <div style="
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #ffffff;
          padding: 0.04in 0.06in;
          border-radius: 5px;
          border: 1px solid ${primary}25;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        ">
          <div id="${qrId}" style="width: 56px; height: 56px;"></div>
          <div style="font-size: 4.8pt; font-weight: 700; color: ${primary}; max-width: 68px; line-height: 1.15; margin-top: 0.02in;">
            ${data.qrSub}
          </div>
        </div>

      </div>

    </div>

    <!-- Grounded Footer -->
    <div style="
      background: ${primary};
      color: #ffffff;
      padding: 0.044in 0.14in;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid ${accent};
      position: relative;
      z-index: 1;
    ">
      <div style="max-width: 2.3in;">
        <div style="font-size: 7.0pt; font-weight: 800; letter-spacing: 0.04em; color: #ffffff; line-height: 1.1;">
          ${data.footerBrand}
        </div>
        <div style="font-size: 4.4pt; color: #E5E7EB; opacity: 0.95; line-height: 1.15; margin-top: 1px;">
          ${data.footerSub}
        </div>
      </div>
      <div style="text-align: right; flex-shrink: 0; max-width: 1.45in;">
        <div style="font-size: 4.6pt; font-weight: 700; color: #FEF3C7; text-transform: uppercase; letter-spacing: 0.03em; line-height: 1.15;">
          ${data.footerRightTitle}
        </div>
        <div style="font-size: 5.0pt; font-weight: 600; color: #ffffff; margin-top: 1px;">
          ${data.footerRightLink}
        </div>
      </div>
    </div>

  </div>
  `;
}

function generateSingleCardsHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ready Apologia - Promo Cards Preview</title>
  <style>
    ${COMMON_STYLES}
    body {
      background: #F4F4F5;
      padding: 0.3in;
      display: flex;
      gap: 0.3in;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card-frame {
      box-shadow: 0 8px 25px rgba(0,0,0,0.12);
      border-radius: 4px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="card-frame">
    ${renderCard('christian', 'qr_single_chr')}
  </div>
  <div class="card-frame">
    ${renderCard('islamic', 'qr_single_isl')}
  </div>

  <script>${qrCodeJs}</script>
  <script>
    new QRCode(document.getElementById("qr_single_chr"), {
      text: "${CHRISTIAN_CARD.qrUrl}",
      width: 56,
      height: 56,
      colorDark: "${CHRISTIAN_CARD.theme.qrDark}",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    new QRCode(document.getElementById("qr_single_isl"), {
      text: "${ISLAMIC_CARD.qrUrl}",
      width: 56,
      height: 56,
      colorDark: "${ISLAMIC_CARD.theme.qrDark}",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  </script>
</body>
</html>`;
}

function generate8UpPrintableHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ready Apologia - 8-Up Printable Cards (US Letter - 0.25in Margins on All Sides)</title>
  <style>
    ${COMMON_STYLES}
    
    @page {
      size: letter portrait;
      margin: 0;
    }

    body {
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    .sheet-page {
      width: 8.5in;
      height: 11.0in;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      padding: 0.25in; /* 0.25in (6.35mm / >0.5cm) on all 4 sides */
      display: grid;
      grid-template-columns: 4.00in 4.00in;
      grid-template-rows: 2.625in 2.625in 2.625in 2.625in;
      box-sizing: border-box;
      overflow: hidden;
    }

    .cell {
      width: 4.00in;
      height: 2.625in;
      position: relative;
      box-sizing: border-box;
    }

    /* Cut guidelines */
    .grid-guide-vertical {
      position: absolute;
      top: 0.25in;
      bottom: 0.25in;
      left: 4.25in;
      width: 1px;
      border-left: 1px dashed rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 100;
    }

    .grid-guide-left-margin {
      position: absolute;
      top: 0.25in;
      bottom: 0.25in;
      left: 0.25in;
      width: 1px;
      border-left: 1px dashed rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: 100;
    }

    .grid-guide-right-margin {
      position: absolute;
      top: 0.25in;
      bottom: 0.25in;
      left: 8.25in;
      width: 1px;
      border-left: 1px dashed rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: 100;
    }

    .grid-guide-top-margin {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      top: 0.25in;
      height: 1px;
      border-top: 1px dashed rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: 100;
    }

    .grid-guide-h1 {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      top: 2.875in; /* 0.25 + 2.625 */
      height: 1px;
      border-top: 1px dashed rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 100;
    }
    .grid-guide-h2 {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      top: 5.50in; /* 0.25 + 5.25 */
      height: 1px;
      border-top: 1px dashed rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 100;
    }
    .grid-guide-h3 {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      top: 8.125in; /* 0.25 + 7.875 */
      height: 1px;
      border-top: 1px dashed rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 100;
    }
    .grid-guide-bottom-margin {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      top: 10.75in; /* 11.0 - 0.25 */
      height: 1px;
      border-top: 1px dashed rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: 100;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: CHRISTIAN FRONT (8 Cards) -->
  <div class="sheet-page" id="sheet_page_1">
    <div class="grid-guide-vertical"></div>
    <div class="grid-guide-left-margin"></div>
    <div class="grid-guide-right-margin"></div>
    <div class="grid-guide-top-margin"></div>
    <div class="grid-guide-h1"></div>
    <div class="grid-guide-h2"></div>
    <div class="grid-guide-h3"></div>
    <div class="grid-guide-bottom-margin"></div>

    ${[0,1,2,3,4,5,6,7].map(idx => `
      <div class="cell">
        ${renderCard('christian', 'qr_p1_' + idx)}
      </div>
    `).join('')}
  </div>

  <!-- PAGE 2: ISLAMIC BACK (8 Cards) -->
  <div class="sheet-page" id="sheet_page_2">
    <div class="grid-guide-vertical"></div>
    <div class="grid-guide-left-margin"></div>
    <div class="grid-guide-right-margin"></div>
    <div class="grid-guide-top-margin"></div>
    <div class="grid-guide-h1"></div>
    <div class="grid-guide-h2"></div>
    <div class="grid-guide-h3"></div>
    <div class="grid-guide-bottom-margin"></div>

    ${[0,1,2,3,4,5,6,7].map(idx => `
      <div class="cell">
        ${renderCard('islamic', 'qr_p2_' + idx)}
      </div>
    `).join('')}
  </div>

  <script>${qrCodeJs}</script>
  <script>
    for (let i = 0; i < 8; i++) {
      const el = document.getElementById('qr_p1_' + i);
      if (el) {
        new QRCode(el, {
          text: "${CHRISTIAN_CARD.qrUrl}",
          width: 56,
          height: 56,
          colorDark: "${CHRISTIAN_CARD.theme.qrDark}",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }

    for (let i = 0; i < 8; i++) {
      const el = document.getElementById('qr_p2_' + i);
      if (el) {
        new QRCode(el, {
          text: "${ISLAMIC_CARD.qrUrl}",
          width: 56,
          height: 56,
          colorDark: "${ISLAMIC_CARD.theme.qrDark}",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
  </script>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// 3. EXECUTION PIPELINE
// -----------------------------------------------------------------------------

console.log('Generating promotional cards in promo_cards/ ...');

// Write HTML templates
const singleHtmlPath = path.resolve(promoDir, 'single_cards.html');
const printableHtmlPath = path.resolve(promoDir, 'cards_8up_printable.html');
fs.writeFileSync(singleHtmlPath, generateSingleCardsHtml());
fs.writeFileSync(printableHtmlPath, generate8UpPrintableHtml());

// Generate Vector PDF
const pdfPath = path.resolve(promoDir, 'ReadyApologia_Cards_8up_Letter.pdf');
console.log('Rendering vector PDF via headless Chrome...');
execSync(`/usr/bin/google-chrome --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${printableHtmlPath}"`);

// Generate Sheet PNGs via pdftoppm
console.log('Rendering Sheet PNGs via pdftoppm...');
execSync(`pdftoppm -png -r 200 "${pdfPath}" "${path.resolve(promoDir, 'sheet_render')}"`);
fs.renameSync(path.resolve(promoDir, 'sheet_render-1.png'), path.resolve(promoDir, 'ReadyApologia_Sheet_Page1_Front.png'));
fs.renameSync(path.resolve(promoDir, 'sheet_render-2.png'), path.resolve(promoDir, 'ReadyApologia_Sheet_Page2_Back.png'));

// Generate Single Cards Preview PNG
console.log('Rendering Single Cards Preview PNG...');
const singlePngPath = path.resolve(promoDir, 'ReadyApologia_Single_Cards_Front_Back.png');
execSync(`/usr/bin/google-chrome --headless --disable-gpu --screenshot="${singlePngPath}" --window-size=1000,450 --hide-scrollbars "${singleHtmlPath}"`);

// Sync to brain artifacts directory for UI previews
if (fs.existsSync(brainDir)) {
  fs.copyFileSync(singlePngPath, path.resolve(brainDir, 'cards_preview.png'));
  fs.copyFileSync(path.resolve(promoDir, 'ReadyApologia_Sheet_Page1_Front.png'), path.resolve(brainDir, 'sheet_p1.png'));
  fs.copyFileSync(path.resolve(promoDir, 'ReadyApologia_Sheet_Page2_Back.png'), path.resolve(brainDir, 'sheet_p2.png'));
}

console.log('✅ All promo card assets generated in promo_cards/ successfully.');
