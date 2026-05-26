import fs from 'node:fs';
import path from 'node:path';

const SOURCE_ESV = '/usr/local/google/home/markyacoub/Documents/data_collection/bible/esv/output';
const SOURCE_LXX = '/usr/local/google/home/markyacoub/Documents/data_collection/bible/lxx2012/output';

const DEST_ESV = './src/data/scripture/esv';
const DEST_LXX = './src/data/scripture/lxx2012';

// 27 Books of the New Testament (ESV)
const NT_BOOKS = [
  'mt', 'mk', 'lk', 'jn', 'acts', 'rom', '1cor', '2cor', 'gal', 'eph', 
  'phil', 'col', '1thes', '2thes', '1tm', '2tm', 'ti', 'phlm', 'heb', 'jas', 
  '1pt', '2pt', '1jn', '2jn', '3jn', 'jude', 'rv'
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function importScripture() {
  ensureDirectory(DEST_ESV);
  ensureDirectory(DEST_LXX);

  console.log('\n--- Importing New Testament (ESV) ---');
  NT_BOOKS.forEach(book => {
    const srcFile = path.join(SOURCE_ESV, `${book}.json`);
    const destFile = path.join(DEST_ESV, `${book}.json`);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✓ Imported NT: ${book}.json`);
    } else {
      console.warn(`⚠️ Missing NT book file: ${srcFile}`);
    }
  });

  console.log('\n--- Importing Old Testament (LXX2012) ---');
  if (fs.existsSync(SOURCE_LXX)) {
    const files = fs.readdirSync(SOURCE_LXX).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const srcFile = path.join(SOURCE_LXX, file);
      const destFile = path.join(DEST_LXX, file);

      fs.copyFileSync(srcFile, destFile);
      console.log(`✓ Imported OT: ${file}`);
    });
  } else {
    console.error(`❌ Old Testament source directory not found: ${SOURCE_LXX}`);
  }

  console.log('\n🎉 Scripture import completed!');
}

importScripture();
