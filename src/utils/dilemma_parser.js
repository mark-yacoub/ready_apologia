import fs from 'fs';
import path from 'path';

function extractBetween(text, startMarker, endMarker, isOptionalEnd = false) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(`Parser Error: Expected marker "${startMarker}" not found in markdown.`);
  }
  
  let endIdx = text.length;
  if (endMarker) {
    endIdx = text.indexOf(endMarker, startIdx + startMarker.length);
    if (endIdx === -1) {
      if (!isOptionalEnd) {
        throw new Error(`Parser Error: Expected end marker "${endMarker}" not found after "${startMarker}".`);
      }
      endIdx = text.length;
    }
  }
  
  return text.substring(startIdx + startMarker.length, endIdx).trim();
}

function parseMarkdownTable(rawTableString) {
  const lines = rawTableString.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lines.length < 3) return [];
  
  const headers = lines[0].split('|').map(s => s.trim()).filter(Boolean);
  
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].split('|').map(s => s.trim()).slice(1, -1);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] || '';
    });
    rows.push(rowObj);
  }
  return rows;
}

export function parseDilemmaMarkdown() {
  const mdPath = path.join(process.cwd(), 'src/data/discover/islam/scripture/islamic_dilemma.md');
  const rawMd = fs.readFileSync(mdPath, 'utf8');

  // Exact Headers to match
  const H1_CORE = "## 1. The Core Question: Can a Muslim Respect the Christian Scriptures Without Destroying Islam?";
  const H2_AFFIRM = "## 2. Step 1: The Quran and Classical Tafsir Affirm the 7th-Century Bible";
  const H3_IMMUTABLE = "## 3. Step 2: God's Words Cannot Be Corrupted";
  const H4_BIBLE = "## 4. Step 3: What Did the 7th-Century Bible Actually Say?";
  const H5_CONTRADICT = "## 5. Step 4: The Fatal Contradiction";
  const H6_OBJECTIONS = "## 6. Common Islamic Objections Refuted";
  const H7_CONCLUSION = "## 7. Conclusion: An Invitation to the Unbroken Word";

  const content = {
    heroQuote: "",
    section1: { title: "Can a Muslim Respect the Christian Scriptures Without Destroying Islam?", content: "" },
    section2: { title: "The Quran and Classical Tafsir Affirm the 7th-Century Bible", content: "", pillarsContent: "", tableData: [] },
    section3: { title: "God's Words Cannot Be Corrupted", content: "" },
    section4: { title: "What Did the 7th-Century Bible Actually Say?", content: "" },
    section5: { title: "The Fatal Contradiction", content: "" },
    section6: { title: "Common Islamic Objections Refuted", content: "" },
    section7: { title: "An Invitation to the Unbroken Word", content: "", tableData: [] }
  };

  try {
    content.heroQuote = extractBetween(rawMd, "> *\"So let the People of the Gospel", "---");
    content.section1.content = extractBetween(rawMd, H1_CORE, H2_AFFIRM);
    
    const sec2Full = extractBetween(rawMd, H2_AFFIRM, H3_IMMUTABLE);
    content.section2.content = extractBetween(sec2Full, "", "### A.");
    content.section2.pillarsContent = extractBetween(sec2Full, "### A.", "### Key Quranic Verses");
    const s2rawTable = extractBetween(sec2Full, "### Key Quranic Verses Affirming the Present-Tense Bible", null, true);
    content.section2.tableData = parseMarkdownTable(s2rawTable);

    content.section3.content = extractBetween(rawMd, H3_IMMUTABLE, H4_BIBLE);
    
    content.section4.content = extractBetween(rawMd, H4_BIBLE, H5_CONTRADICT);
    if (!content.section4.content.includes("command to llm: display all ancient manuscripts")) {
        throw new Error("Missing LLM commands in Section 4");
    }

    content.section5.content = extractBetween(rawMd, H5_CONTRADICT, H6_OBJECTIONS);
    
    // Parse Objections
    const sec6Full = extractBetween(rawMd, H6_OBJECTIONS, H7_CONCLUSION);
    content.section6.content = extractBetween(sec6Full, "", "### Objection 1");
    content.section6.objectionsList = parseObjectionsFromArray(sec6Full);
    
    const sec7Full = extractBetween(rawMd, H7_CONCLUSION, null, true);
    content.section7.content = extractBetween(sec7Full, "", "### Primary Reference Summary Table");
    const s7rawTable = extractBetween(sec7Full, "### Primary Reference Summary Table", null, true);
    content.section7.tableData = parseMarkdownTable(s7rawTable);

  } catch (error) {
    throw new Error(`Islamic Dilemma MD Parser Failed: ${error.message}. This means the source of truth markdown structure was changed. UI must be updated to match.`);
  }

  return content;
}

export function parseObjectionsFromArray(rawSectionText) {
  const objections = [];
  const parts = rawSectionText.split('### Objection ');
  
  for (let i = 1; i < parts.length; i++) {
    const text = parts[i];
    const firstLineEnd = text.indexOf('\n');
    const titleLine = text.substring(0, firstLineEnd).trim();
    const objectionText = titleLine.split(': ').slice(1).join(': ').replace(/^"/, '').replace(/"$/, '');
    
    const refMarker = '* **The Refutation:**';
    const refStart = text.indexOf(refMarker);
    if (refStart !== -1) {
      let refText = text.substring(refStart + refMarker.length).trim();
      const endMarker = '\n---';
      if (refText.indexOf(endMarker) !== -1) {
        refText = refText.substring(0, refText.indexOf(endMarker)).trim();
      }
      objections.push({
        id: 'obj-' + i,
        num: String(i).padStart(2, '0'),
        objection: objectionText,
        rawRefutation: refText
      });
    }
  }
  return objections;
}
