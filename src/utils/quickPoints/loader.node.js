/**
 * Node-only Quick Points loader (`node --test` and build-audit CLI scripts).
 * Uses `node:fs` to read `./*.json` when Vite's `import.meta.glob` is unavailable.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE,
  toPageKey,
  parseQuickHash,
  isQuickHash,
  isQuickHashTransition,
} from './paths.js';
import {
  ALLOWED_ROLES,
  validateQuickPoints,
  createQuickPointsLoader,
} from './loader.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const JSON_EXT = '.json';

const { loadQuickPoints, clearQuickPointsCache } = createQuickPointsLoader(() => {
  const map = new Map();
  if (fs.existsSync(DIR)) {
    for (const entry of fs.readdirSync(DIR, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(JSON_EXT)) continue;
      const slug = entry.name.slice(0, -JSON_EXT.length);
      const fullPath = path.join(DIR, entry.name);
      map.set(slug, JSON.parse(fs.readFileSync(fullPath, 'utf8')));
    }
  }
  return map;
});

export {
  BASE,
  ALLOWED_ROLES,
  toPageKey,
  parseQuickHash,
  isQuickHash,
  isQuickHashTransition,
  validateQuickPoints,
  loadQuickPoints,
  clearQuickPointsCache,
};
