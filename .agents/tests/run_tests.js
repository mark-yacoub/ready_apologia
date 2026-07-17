import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

function testTestCase12() {
  console.log("Running Test Case 12...");
  const htmlPath1 = path.join(process.cwd(), 'dist/quran/1/index.html');
  const html1 = fs.readFileSync(htmlPath1, 'utf-8');
  
  // Verse 4 exists
  assert(html1.includes('id="v-4"') || html1.includes('id="4"'), "Verse 4 should exist in Surah 1");
  
  // Verse 4 English and Arabic highlighting
  assert(html1.includes('<span class="qiraat-highlight">Master</span>') || html1.includes('<span class="qiraat-highlight">master</span>'), "English word 'Master' should be highlighted");
  assert(html1.includes('<span class="qiraat-highlight">مَٰلِكِ</span>'), "Arabic word 'مَٰلِكِ' should be highlighted");
  
  // Verse 4 Summary pill
  assert(html1.includes('class="qiraat-summary"'), "Should contain qiraat-summary");
  assert(html1.includes('class="qiraat-pill"'), "Should contain qiraat-pill");
  assert(html1.includes('Change Meaning (general semantic shift)'), "Should mention Change Meaning");
  
  const htmlPath2 = path.join(process.cwd(), 'dist/quran/2/index.html');
  const html2 = fs.readFileSync(htmlPath2, 'utf-8');
  
  // Verse 184 exists
  assert(html2.includes('id="v-184"') || html2.includes('id="184"'), "Verse 184 should exist in Surah 2");
  
  // Extract Verse 184 block roughly
  const v184Start = html2.indexOf('id="v-184"') > -1 ? html2.indexOf('id="v-184"') : html2.indexOf('id="184"');
  const v185Start = html2.indexOf('id="v-185"') > -1 ? html2.indexOf('id="v-185"') : html2.indexOf('id="185"');
  const v184Block = html2.substring(v184Start, v185Start > -1 ? v185Start : undefined);
  
  // Verse 184 has both competing-pill and qiraat-pill
  assert(v184Block.includes('class="competing-pill"'), "Verse 184 should have competing-pill");
  assert(v184Block.includes('class="qiraat-pill"'), "Verse 184 should have qiraat-pill");
  
  console.log("Test Case 12 passed!");
}

function testTestCase13() {
  console.log("Running Test Case 13...");
  const htmlPath = path.join(process.cwd(), 'dist/quran/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Top header reads "Evidence & Filters" and dropdown is hidden
  assert(html.includes('Evidence &amp; Filters') || html.includes('Evidence & Filters'), "Header should be Evidence & Filters");
  assert(!html.includes('id="surah-dropdown-menu"'), "Dropdown menu should be hidden or removed"); // Depending on how hideDropdown is implemented, maybe just check class
  assert(html.includes('no-dropdown'), "Should have no-dropdown class");
  
  // Lost Verses card displays a total count badge
  assert(html.includes('Lost Verses'), "Should have Lost Verses card");
  assert(html.includes('count-badge light'), "Should have count badge light");
  
  // Competing Codices displays companion pills with numerical counts
  assert(html.includes('Abdullah bin Umar'), "Should have Abdullah bin Umar");
  assert(html.match(/Abdullah bin Umar.*?count-badge/s), "Should have count badge near companion");
  
  const variantPath = path.join(process.cwd(), 'dist/quran/variant/effect-change-meaning-general-semantic-shift/index.html');
  const variantHtml = fs.readFileSync(variantPath, 'utf-8');
  
  assert(variantHtml.includes('Change Meaning (general semantic shift)'), "Should have correct header");
  assert(variantHtml.includes('no-dropdown'), "Should hide dropdown");
  assert(variantHtml.includes('class="qiraat-highlight"'), "Should highlight variant words");
  
  console.log("Test Case 13 passed!");
}

try {
  testTestCase12();
  testTestCase13();
  console.log("All tests completed successfully!");
} catch (e) {
  console.error("Test failed:", e.message);
  process.exit(1);
}
