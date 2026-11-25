#!/usr/bin/env node
/**
 * Archive Reading Room — Palette, Typography & Chrome Guardrail Audit
 *
 * Usage:
 *   node scripts/test_palette.mjs
 *
 * Enforces Playbook §5.6 visual-language discipline across UI source files:
 *   1. No forbidden saturated Tailwind / iOS neon hex colors in src/{styles,components,layouts,pages}
 *      or src/utils/evidenceColors.js.
 *   2. No decorative UI emojis in global chrome & statistics UI files (primary-source text and
 *      deliberate typographic marks † / ☾ are unaffected).
 *   3. Canonical --ra-* tokens, .sec-christian / .sec-islamic / .sec-neutral classes, and the
 *      3-font stack (Literata, Public Sans, Amiri) remain intact in Layout.astro, and the
 *      unused tailwind-input.css stays removed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SCAN_DIRS = ['src/styles', 'src/components', 'src/layouts', 'src/pages'];
const EXTRA_FILES = ['src/utils/evidenceColors.js'];
const SCAN_EXTS = new Set(['.css', '.astro', '.jsx', '.js', '.ts', '.tsx']);

// Saturated Tailwind / iOS neon hex codes eliminated during the Archive Reading Room overhaul.
const FORBIDDEN_HEX = new Map([
  // Neon / Tailwind / iOS greens
  ['#10b981', 'Tailwind emerald-500 (use --ra-islamic #33593a or --ra-verify #0e5e6f)'],
  ['#059669', 'Tailwind emerald-600 (use --ra-islamic #33593a)'],
  ['#047857', 'Tailwind emerald-700 (use --ra-islamic #33593a)'],
  ['#065f46', 'Tailwind emerald-800 (use --ra-islamic #33593a)'],
  ['#16a34a', 'Tailwind green-600 (use --ra-islamic #33593a)'],
  ['#15803d', 'Tailwind green-700 (use --ra-islamic #33593a)'],
  ['#166534', 'Tailwind green-800 (use --ra-islamic #33593a)'],
  ['#22c55e', 'Tailwind green-500 (use --ra-islamic #33593a)'],
  ['#34c759', 'iOS green (use --ra-islamic #33593a)'],
  ['#d1fae5', 'Tailwind emerald-100 wash (use --ra-islamic-bg #edf3ee)'],
  ['#a7f3d0', 'Tailwind emerald-200 wash (use --ra-islamic-rule #c2d6c6)'],
  ['#dcfce7', 'Tailwind green-100 wash (use --ra-islamic-bg #edf3ee)'],
  ['#bbf7d0', 'Tailwind green-200 wash (use --ra-islamic-rule #c2d6c6)'],
  // Alarm / Tailwind / iOS reds & pinks
  ['#ef4444', 'Tailwind red-500 (use --ra-christian #7a3530)'],
  ['#dc2626', 'Tailwind red-600 (use --ra-christian #7a3530)'],
  ['#b91c1c', 'Tailwind red-700 (use --ra-christian #7a3530)'],
  ['#991b1b', 'Tailwind red-800 (use --ra-christian #7a3530)'],
  ['#f43f5e', 'Tailwind rose-500 (use --ra-christian #7a3530)'],
  ['#e11d48', 'Tailwind rose-600 (use --ra-christian #7a3530)'],
  ['#ff3b30', 'iOS red (use --ra-christian #7a3530)'],
  ['#ff2d55', 'iOS pink (use --ra-christian #7a3530)'],
  ['#ec4899', 'Tailwind pink-500 (use muted editorial pigment)'],
  ['#db2777', 'Tailwind pink-600 (use muted editorial pigment)'],
  ['#fee2e2', 'Tailwind red-100 wash (use --ra-christian-bg #f6eeec)'],
  ['#fecaca', 'Tailwind red-200 wash (use --ra-christian-rule #dfc5c2)'],
  ['#fce7f3', 'Tailwind pink-100 wash (use neutral --ra-well)'],
  // Neon / Tailwind / iOS blues, indigos & cyans
  ['#3b82f6', 'Tailwind blue-500 (use --ra-verify #0e5e6f or slate navy #2c4a6b)'],
  ['#2563eb', 'Tailwind blue-600 (use --ra-verify #0e5e6f or slate navy #2c4a6b)'],
  ['#1d4ed8', 'Tailwind blue-700 (use slate navy #2c4a6b)'],
  ['#007aff', 'iOS blue (use --ra-verify #0e5e6f)'],
  ['#5ac8fa', 'iOS light blue (use --ra-verify #0e5e6f)'],
  ['#32ade6', 'iOS cyan (use --ra-verify #0e5e6f)'],
  ['#06b6d4', 'Tailwind cyan-500 (use --ra-verify #0e5e6f)'],
  ['#0891b2', 'Tailwind cyan-600 (use --ra-verify #0e5e6f)'],
  ['#6366f1', 'Tailwind indigo-500 (use muted archival indigo #3b4b75)'],
  ['#4f46e5', 'Tailwind indigo-600 (use muted archival indigo #3b4b75)'],
  ['#5856d6', 'iOS indigo (use muted archival indigo #3b4b75)'],
  ['#dbeafe', 'Tailwind blue-100 wash (use --ra-verify-bg #e8f2f3)'],
  ['#bfdbfe', 'Tailwind blue-200 wash (use --ra-verify-rule #bdd8dc)'],
  // Loud purples / violets
  ['#a855f7', 'Tailwind purple-500 (use muted plum #643f5c)'],
  ['#9333ea', 'Tailwind purple-600 (use muted plum #643f5c)'],
  ['#7c3aed', 'Tailwind violet-600 (use muted plum #643f5c)'],
  ['#af52de', 'iOS purple (use muted plum #643f5c)'],
  ['#ede9fe', 'Tailwind violet-100 wash (use muted editorial bg)'],
  ['#f3e8ff', 'Tailwind purple-100 wash (use muted editorial bg)'],
  // Banana yellows / neon oranges
  ['#f59e0b', 'Tailwind amber-500 (use antique ochre #855b26 / --ra-sand-rule #b8893a)'],
  ['#eab308', 'Tailwind yellow-500 (use --ra-sand-rule #b8893a)'],
  ['#ff9500', 'iOS orange (use burnt sienna #7c4a2d)'],
  ['#ffcc00', 'iOS yellow (use --ra-sand / --ra-mark)'],
  ['#f97316', 'Tailwind orange-500 (use burnt sienna #7c4a2d)'],
  ['#ea580c', 'Tailwind orange-600 (use burnt sienna #7c4a2d)'],
  ['#fef08a', 'Tailwind yellow-200 wash (use --ra-sand #f6efe3)'],
  ['#fef3c7', 'Tailwind amber-100 wash (use --ra-sand #f6efe3)'],
]);

// Global UI chrome & dashboard files where decorative emojis should be monochrome SVGs.
const CHROME_EMOJI_FILES = [
  'src/layouts/Layout.astro',
  'src/components/ScriptureNav.jsx',
  'src/components/OnboardingBanner.jsx',
  'src/components/ComingSoonBanner.astro',
  'src/pages/discover/statistics.astro',
];

const FORBIDDEN_CHROME_EMOJI_RE = /[🔍📖✨🔥🏆📚🎥🎬🛡⚖📜🕌⛪☪✝💡👆🌟💎🚀🎯⚡]/gu;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXTS.has(extname(entry)) && !entry.includes('.test.')) {
      out.push(full);
    }
  }
  return out;
}

const files = [
  ...SCAN_DIRS.flatMap(d => walk(join(ROOT, d))),
  ...EXTRA_FILES.map(f => join(ROOT, f)).filter(existsSync),
];

const failures = [];
let checkedHexLines = 0;

// 1. Forbidden neon / Tailwind / iOS hex audit
const hexRegex = /(?<![0-9a-fA-F])#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g;
for (const file of files) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    let m;
    while ((m = hexRegex.exec(line)) !== null) {
      checkedHexLines++;
      const hex = `#${m[1].toLowerCase()}`;
      if (FORBIDDEN_HEX.has(hex)) {
        failures.push(`[forbidden-hex] ${rel}:${idx + 1}: ${hex} — ${FORBIDDEN_HEX.get(hex)}`);
      }
    }
  });
}

// 2. Chrome emoji audit
for (const rel of CHROME_EMOJI_FILES) {
  const file = join(ROOT, rel);
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    const hits = line.match(FORBIDDEN_CHROME_EMOJI_RE);
    if (hits) {
      failures.push(`[chrome-emoji] ${rel}:${idx + 1}: decorative emoji (${[...new Set(hits)].join(', ')}) — use monochrome inline SVG`);
    }
  });
}

// 3. Canonical tokens, section themes, font stack, and removed Tailwind stub
const layoutPath = join(ROOT, 'src/layouts/Layout.astro');
const layoutSrc = readFileSync(layoutPath, 'utf8');
const requiredLayoutMarkers = [
  '--ra-paper:',
  '--ra-surface:',
  '--ra-ink:',
  '--ra-christian:',
  '--ra-islamic:',
  '--ra-verify:',
  '.sec-christian',
  '.sec-islamic',
  '.sec-neutral',
  'Literata',
  'Public+Sans',
  'Amiri',
];
for (const marker of requiredLayoutMarkers) {
  if (!layoutSrc.includes(marker)) {
    failures.push(`[canonical-tokens] src/layouts/Layout.astro missing required marker: ${marker}`);
  }
}

const forbiddenFonts = ['Cinzel', 'Newsreader', 'Playfair+Display', 'family=Inter'];
for (const font of forbiddenFonts) {
  if (layoutSrc.includes(font)) {
    failures.push(`[font-stack] src/layouts/Layout.astro re-introduced retired font: ${font}`);
  }
}

if (existsSync(join(ROOT, 'src/styles/tailwind-input.css'))) {
  failures.push('[dead-tailwind] src/styles/tailwind-input.css should remain deleted');
}

if (failures.length) {
  console.error(`Palette audit failed (${failures.length} issue(s)):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `Palette audit passed: ${files.length} source files (${checkedHexLines} hex literals checked), ${CHROME_EMOJI_FILES.length} chrome files, canonical --ra-* tokens & 3-font stack verified.`
);
