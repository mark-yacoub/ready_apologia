# 📜 Ready Apologia Promotional Cards (8-Up Printable US Letter)

This directory contains the automated generator and print-ready production assets for double-sided **ReadyApologia.com** promotional mini-cards.

---

## 📁 Directory Structure & Key Files

* `generate_cards.mjs`: Complete standalone Node script that generates the HTML templates, compiles the print-ready double-sided vector PDF, and exports high-res PNG previews.
* `qrcode.min.js`: Client-side QR code generator bundled locally (no internet access required).
* `ReadyApologia_Cards_8up_Letter.pdf`: Print-ready 2-page vector PDF (Page 1: 8 Christian Fronts, Page 2: 8 Islamic Backs).
* `ReadyApologia_Single_Cards_Front_Back.png`: High-resolution preview of single front and back cards.
* `ReadyApologia_Sheet_Page1_Front.png`: Full sheet preview of Page 1 (Fronts).
* `ReadyApologia_Sheet_Page2_Back.png`: Full sheet preview of Page 2 (Backs).
* `cards_8up_printable.html`: HTML layout template for the 8-up letter sheets.
* `single_cards.html`: HTML preview for individual cards.

---

## 🛠️ How to Regenerate or Modify

To update copy, colors, URLs, or layout:
1. Edit `promo_cards/generate_cards.mjs` (all content strings and styles are defined in `CHRISTIAN_CARD` and `ISLAMIC_CARD` at the top of the file).
2. Run the script using the VS Code embedded Node binary:
   ```bash
   ~/.vscode-server/cli/servers/*/server/node promo_cards/generate_cards.mjs
   ```

---

## 📐 Layout & Dimensions

* **Paper**: US Letter ($8.5'' \times 11.0''$)
* **Grid**: 2 columns $\times$ 4 rows (8 cards per sheet)
* **Card Dimensions**: $4.00'' \text{ width} \times 2.625'' \text{ height}$
* **Margins**:
  * **Top & Bottom Margins**: $0.25''$ ($6.35\text{ mm} > 0.5\text{ cm}$) — protects headers and footers from roller clipping.
  * **Left & Right Margins**: $0.25''$ ($6.35\text{ mm} > 0.5\text{ cm}$) — prevents side edge clipping.

---

## 🖨️ Printing & Cutting Instructions

1. **Printer Dialog Settings**:
   * Paper Size: **US Letter (8.5" × 11")**
   * Scaling: **100% / Actual Size** (Do NOT scale to fit).
   * Two-Sided: **Duplex / Flip on Long Edge**.
2. **Cutting Sequence**:
   * **1 Center Vertical Cut**: $x = 4.25''$
   * **3 Inner Horizontal Cuts**: $y = 2.875'', 5.50'', 8.125''$
   * **Trim 4 Outer Margin Strips**: Left ($x = 0.25''$), Right ($x = 8.25''$), Top ($y = 0.25''$), Bottom ($y = 10.75''$)
