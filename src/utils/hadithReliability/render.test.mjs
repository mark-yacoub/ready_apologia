/**
 * Unit tests for the Hadith Reliability renderer.
 *   node --test src/utils/hadithReliability/render.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, linkFor, linkAttrs, plainText, tl } from './render.js';

const r = createRenderer();

test('Qurʾān links go to the internal Tafsir al-Ṭabarī page, ranges use the first ayah', () => {
  assert.equal(linkFor('https://quran.com/9/101').href, '/quran/9/101/tafsir/tabari');
  assert.equal(linkFor('https://quran.com/110/1-3').href, '/quran/110/1/tafsir/tabari');
  assert.equal(linkFor('https://quran.com/96').href, '/quran/96');
  assert.equal(linkFor('https://quran.com/9/101').external, false);
});

test('Sunnah.com and classical libraries stay external', () => {
  assert.deepEqual([linkFor('https://sunnah.com/muslim:2353a').kind, linkFor('https://sunnah.com/muslim:2353a').external], ['sunnah', true]);
  assert.equal(linkFor('https://www.islamweb.net/ar/library/content/52/7097/').kind, 'classical');
  assert.equal(linkFor('https://shamela.ws/book/1/2').kind, 'classical');
});

test('editorial brackets stay literal; only `](http` makes a link', () => {
  const html = r.inline('subdivides [7 + 8] years ([*Ṣaḥīḥ Muslim* 2353e](https://sunnah.com/muslim:2353e))');
  assert.match(html, /\[7 \+ 8\]/);
  assert.match(html, /<a class="hrv-link hrv-link--sunnah" href="https:\/\/sunnah\.com\/muslim:2353e" target="_blank" rel="noopener noreferrer"><em>Ṣaḥīḥ Muslim<\/em> 2353e<\/a>/);
});

test('bold may contain italics (dataset pattern)', () => {
  assert.equal(r.inline('**two bowings per *rakʿah* (four total)**').replace(/<span class="hrv-tlm">ʿ<\/span>/g, 'ʿ'),
    '<strong>two bowings per <em>rakʿah</em> (four total)</strong>');
  assert.match(r.inline('***Ifrād* (Ḥajj Alone): text**'), /^<strong><em>Ifrād<\/em> \(Ḥajj Alone\): text<\/strong>$/);
});

test('code spans: isnād chain, Arabic and arithmetic get distinct styles', () => {
  assert.match(r.inline('`Ibn ʿAbbās ← ʿIkrimah`'), /class="hrv-chain"/);
  assert.match(r.inline('`بُعِثَ لأَرْبَعِينَ`'), /class="hrv-ar-inline" lang="ar" dir="rtl"/);
  assert.match(r.inline('`40 + 10 + 10 = 60`'), /class="hrv-math"/);
});

test('raw HTML is escaped except <br>', () => {
  const html = r.inline('a<br>b <script>x</script>');
  assert.match(html, /a<br>b/);
  assert.doesNotMatch(html, /<script>/);
});

test('blocks: headings, lists with continuation lines, paragraphs', () => {
  const html = r.block('### Title\n\n1. **One:**\n   continued\n2. Two\n\nPara');
  assert.match(html, /<h3 class="hrv-md-h">Title<\/h3>/);
  assert.match(html, /<ol><li><strong>One:<\/strong> continued<\/li><li>Two<\/li><\/ol>/);
  assert.match(html, /<p>Para<\/p>/);
});

test('bare Arabic runs (including «guillemets») are wrapped once', () => {
  const html = r.inline('he said «كَانَ حَفْصٌ» then');
  assert.equal((html.match(/hrv-ar-inline/g) || []).length, 1);
  assert.match(html, /«كَانَ حَفْصٌ»<\/span>/);
});

test('ʿayn/hamza get the tight Arabic-face span, in prose and via tl()', () => {
  assert.match(r.inline('Ibn ʿAbbās'), /Ibn <span class="hrv-tlm">ʿ<\/span>Abbās/);
  assert.equal(tl('Qurʾān & co'), 'Qur<span class="hrv-tlm">ʾ</span>ān &amp; co');
});

test('verification gate: blocked links render as text and are reported', () => {
  const seen = [];
  const gated = createRenderer({ isBlocked: u => u.endsWith('tirmidhi:3622'), onBlocked: u => seen.push(u) });
  const html = gated.inline('[Tirmidhī 3622](https://sunnah.com/tirmidhi:3622) and [Bukhārī 3902](https://sunnah.com/bukhari:3902)');
  assert.match(html, /<span class="hrv-unlinked">Tirmidhī 3622<\/span>/);
  assert.match(html, /href="https:\/\/sunnah\.com\/bukhari:3902"/);
  assert.deepEqual(seen, ['https://sunnah.com/tirmidhi:3622']);
});

test('plainText strips markup for meta/JSON-LD', () => {
  assert.equal(plainText('**Bold** [link](https://x.y) `code`<br>end'), 'Bold link code end');
  assert.equal(plainText('Medina is sacred [[from ʿAyr to Thawr]].'), 'Medina is sacred from ʿAyr to Thawr.');
});

test('one link policy: external opens in a new tab, nofollow only when asked, internal untouched', () => {
  assert.deepEqual(linkAttrs({ external: false }), {});
  assert.deepEqual(linkAttrs({ external: true }), { target: '_blank', rel: 'noopener noreferrer' });
  assert.deepEqual(linkFor('https://example.org/x', { nofollow: true }).attrs, { target: '_blank', rel: 'noopener noreferrer nofollow' });
  assert.deepEqual(linkFor('https://quran.com/10/36').attrs, {});
  const r2 = createRenderer();
  assert.match(r2.inline('[s](https://sunnah.com/bukhari:1)'), /target="_blank" rel="noopener noreferrer"/);
});

test('checkBlocked records a blocked URL and reports it', () => {
  const seen = [];
  const r2 = createRenderer({ isBlocked: u => u.includes('bad'), onBlocked: u => seen.push(u) });
  assert.equal(r2.checkBlocked('https://x/bad'), true);
  assert.equal(r2.checkBlocked('https://x/good'), false);
  assert.deepEqual(seen, ['https://x/bad']);
});

test('link text may contain one level of editorial brackets', () => {
  const html = r.inline('In [*Musnad Aḥmad* #18478 [ed. #18957]](https://www.islamweb.net/ar/library/content/6/18191/) and [years] later');
  assert.match(html, /<a class="hrv-link hrv-link--classical" href="https:\/\/www\.islamweb\.net\/ar\/library\/content\/6\/18191\/"[^>]*><em>Musnad Aḥmad<\/em> #18478 \[ed\. #18957\]<\/a>/);
  assert.match(html, /\[years\] later/);
});
