import fs from 'node:fs';
import path from 'node:path';

const SOURCE_IMAGES_DIR = '/usr/local/google/home/markyacoub/Documents/data_collection/manuscripts/images';
const DEST_IMAGES_DIR = './public/images/manuscripts';

const SAMPLE_IMAGES = [
  'p4_fragC_recto.jpg',
  'p4_fragA_recto.jpg',
  'p5_0001a.jpg',
  'p10_rom1.jpg',
  'p17_heb9_recto.jpg',
  'p17_heb9_verso.jpg'
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function findFileRecursive(dir, fileName) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const filePath = path.join(dir, f);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const found = findFileRecursive(filePath, fileName);
      if (found) return found;
    } else if (f.toLowerCase() === fileName.toLowerCase()) {
      return filePath;
    }
  }
  return null;
}

function copySampleImages() {
  ensureDirectory(DEST_IMAGES_DIR);

  console.log('\n--- Copying Sample Manuscript Images ---');
  SAMPLE_IMAGES.forEach(imgName => {
    console.log(`Searching for ${imgName}...`);
    const srcPath = findFileRecursive(SOURCE_IMAGES_DIR, imgName);
    if (srcPath) {
      const destPath = path.join(DEST_IMAGES_DIR, imgName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${imgName} from ${srcPath}`);
    } else {
      console.warn(`⚠️ Could not find image: ${imgName} in ${SOURCE_IMAGES_DIR}`);
    }
  });

  console.log('\n🎉 Sample images copy completed!');
}

copySampleImages();
