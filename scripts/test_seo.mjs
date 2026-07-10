import fs from 'node:fs';
import path from 'node:path';

function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findHtmlFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('Running SEO Verification Test...');

const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error("❌ Test Failed: /dist directory not found. Please run the astro build command first.");
  process.exit(1);
}

const allFiles = findHtmlFiles(distPath);
console.log(`Analyzing ${allFiles.length} generated pages...`);

let failures = 0;
let missingDescriptions = [];
let missingTitle = [];
let genericDescriptions = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const relativePath = file.replace(distPath, '');
  
  // Skip redirect purely empty pages or 404
  if (/<meta\s+http-equiv="refresh"/i.test(content) || relativePath.includes('404')) {
    return;
  }

  // 1. Must have <title>
  if (!/<title>.*<\/title>/i.test(content)) {
    missingTitle.push(relativePath);
    failures++;
  }

  // 2. Must have meta description
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!descMatch || descMatch[1].trim() === '') {
    missingDescriptions.push(relativePath);
    failures++;
  } else {
    // 3. Optional: flag if too many pages use the EXACT same generic fallback
    const descContent = descMatch[1];
    if (descContent === "Ready Apologia - Defending the Faith with Biblical Scripture and Early Church Fathers" && !relativePath.endsWith('/index.html') && !relativePath.includes('/topics/')) {
       // We allow the home page and topics landing to have the generic one, but other pages shouldn't.
       // genericDescriptions.push(relativePath);
    }
  }
});

if (failures > 0) {
  console.error(`\n❌ SEO Test Failed: ${failures} issues found.`);
  if (missingDescriptions.length > 0) {
    console.error(`----------------------------------------`);
    console.error(`Pages missing Meta Descriptions (${missingDescriptions.length}):`);
    missingDescriptions.slice(0, 15).forEach(f => console.error(`  - ${f}`));
    if (missingDescriptions.length > 15) console.error(`  ...and ${missingDescriptions.length - 15} more.`);
  }
  if (missingTitle.length > 0) {
    console.error(`----------------------------------------`);
    console.error(`Pages missing <title> tag (${missingTitle.length}):`);
    missingTitle.slice(0, 15).forEach(f => console.error(`  - ${f}`));
  }
  process.exit(1);
}

console.log("✅ SUCCESS: All parsed HTML pages successfully contain critical SEO metadata (Titles and Descriptions).");
process.exit(0);
