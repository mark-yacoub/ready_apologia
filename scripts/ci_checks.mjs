#!/usr/bin/env node
/**
 * CI quality gate: runs the repo's own checks and fails the deploy if any of them fails.
 *
 *   node scripts/ci_checks.mjs unit    # before the build: unit tests and source audits (~1 min)
 *   node scripts/ci_checks.mjs dist    # after the build: audits of the built pages in dist/
 *
 * Every check runs even after a failure, so one CI log lists everything to fix; the exit code is
 * 1 if any failed. Add a new `test:*` / `audit:*` script to the matching list below.
 *
 * Browser-driven checks (test:discover-layout, test:quick-points-flows) need a running server and
 * Chrome, so they stay local-only. Discover catalog cards: the user kept the current card wording
 * (Nov 2026), so the three audits that gate on it run with their documented "pending data" flag
 * (warning instead of failure). Drop the flag once the catalog copy changes.
 */
import { spawnSync } from 'node:child_process';

const SQLITE = { NODE_OPTIONS: '--experimental-sqlite' };

/** @type {Record<string, Array<{ name: string, cmd: string, env?: object }>>} */
const STAGES = {
  unit: [
    { name: 'test:shared-utils', cmd: 'node --test src/utils/markdown.test.mjs src/utils/urlFactory.test.mjs src/utils/scripture_mapper.test.mjs src/utils/discoverService.test.mjs src/utils/sectionTheme.test.mjs src/utils/onboardingRoutes.test.mjs' },
    { name: 'test:path-generator', cmd: 'node --test src/utils/path_generator.test.mjs src/utils/verseRouting.test.mjs', env: SQLITE },
    { name: 'test:history', cmd: 'node scripts/test_history_api.mjs' },
    { name: 'test:reel', cmd: 'node --test src/components/reel/reelItems.test.mjs' },
    { name: 'test:og-image', cmd: 'node --test src/utils/ogImageResolver.test.mjs', env: SQLITE },
    { name: 'test:verse-response', cmd: 'node --test src/utils/verseResponse/labels.test.mjs src/utils/verseResponse/data_contract.test.mjs', env: SQLITE },
    { name: 'test:convenient-revelations', cmd: 'node --test src/utils/convenientRevelations/model.test.mjs' },
    { name: 'test:orv (unit)', cmd: 'node --test src/utils/originsOfRevelation/*.test.mjs', env: SQLITE },
    { name: 'test:quran-preservation', cmd: 'node --test src/utils/quranPreservation/loader.test.mjs' },
    { name: 'test:discover-audio', cmd: 'node --test src/utils/discoverAudio.test.mjs' },
    { name: 'test:muhammad-slavery', cmd: 'node --test src/utils/muhammadSlavery/*.test.mjs', env: SQLITE },
    { name: 'test:quran-sources', cmd: 'node --test src/utils/quranSources/contract.test.mjs' },
    { name: 'test:apologists', cmd: 'node --test src/utils/apologistsLoader.test.mjs', env: SQLITE },
    { name: 'test:divinity-timeline', cmd: 'node --test src/utils/divinityTimeline/*.test.mjs' },
    { name: 'test:extrabiblical-evidence', cmd: 'node --test src/utils/extrabiblicalEvidence/*.test.mjs' },
    { name: 'test:trustworthiness-bible', cmd: 'node --test src/utils/trustworthinessBible/*.test.mjs', env: SQLITE },
    { name: 'test:quick-points', cmd: 'node --test src/utils/quickPoints/loader.test.mjs' },
    { name: 'test:mecca-to-medina (unit)', cmd: 'node --test src/utils/meccaToMedina/model.test.mjs' },
    { name: 'test:through-christian-eyes (unit)', cmd: 'node --test src/utils/throughChristianEyes/model.test.mjs' },
    { name: 'audit:palette', cmd: 'node scripts/test_palette.mjs' },
  ],
  dist: [
    { name: 'audit:seo', cmd: 'node scripts/test_seo_titles.mjs' },
    { name: 'audit:internal-links', cmd: 'node scripts/test_internal_links.mjs --strict-anchors' },
    { name: 'audit:convenient-revelations', cmd: 'node scripts/test_convenient_revelations.mjs' },
    { name: 'audit:mecca-to-medina', cmd: 'node scripts/test_mecca_to_medina.mjs' },
    { name: 'audit:discover-audio', cmd: 'node scripts/test_discover_audio.mjs' },
    { name: 'audit:quran-preservation', cmd: 'node scripts/test_quran_preservation.mjs' },
    { name: 'audit:through-christian-eyes', cmd: 'node scripts/test_through_christian_eyes.mjs' },
    { name: 'audit:muhammad-slavery (pending catalog)', cmd: 'node scripts/test_muhammad_slavery.mjs --allow-pending-data', env: SQLITE },
    { name: 'audit:quran-sources', cmd: 'node scripts/test_quran_sources.mjs' },
    { name: 'audit:apologists', cmd: 'node scripts/test_apologist_pages.mjs' },
    { name: 'audit:divinity-timeline', cmd: 'node scripts/test_divinity_timeline.mjs' },
    { name: 'audit:extrabiblical-evidence', cmd: 'node scripts/test_extrabiblical_evidence.mjs --offline' },
    { name: 'audit:trustworthiness-bible', cmd: 'node scripts/test_trustworthiness_of_the_bible.mjs', env: SQLITE },
    { name: 'audit:quick-points', cmd: 'node scripts/test_quick_points.mjs' },
    { name: 'audit:hadith-reliability', cmd: 'node scripts/test_hadith_reliability.mjs', env: SQLITE },
    { name: 'audit:origins-of-revelation (pending catalog)', cmd: 'node scripts/test_origins_of_revelation.mjs --pending-catalog', env: SQLITE },
    { name: 'audit:islamic-dilemma (pending catalog)', cmd: 'node scripts/test_islamic_dilemma.mjs --pending-catalog', env: SQLITE },
  ],
};

const stage = process.argv[2];
if (!STAGES[stage]) {
  console.error(`usage: node scripts/ci_checks.mjs <${Object.keys(STAGES).join('|')}>`);
  process.exit(2);
}

const inCi = !!process.env.GITHUB_ACTIONS;
const results = [];
for (const { name, cmd, env } of STAGES[stage]) {
  console.log(inCi ? `::group::${name}` : `\n>>> ${name}: ${cmd}`);
  const started = Date.now();
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', env: { ...process.env, ...env } });
  const ok = r.status === 0;
  results.push({ name, ok, secs: ((Date.now() - started) / 1000).toFixed(1) });
  if (inCi) console.log('::endgroup::');
  if (!ok) console.log(inCi ? `::error title=${name}::failed (exit ${r.status ?? r.signal})` : `<<< ${name} FAILED (exit ${r.status ?? r.signal})`);
}

console.log(`\n${stage} checks:`);
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  (${r.secs}s)`);
const failed = results.filter(r => !r.ok);
console.log(failed.length ? `\n${failed.length} of ${results.length} checks failed` : `\nAll ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
