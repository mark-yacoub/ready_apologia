import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, stripMarkdownToPlainText } from './markdown.js';

test('MD_LINK_SOURCE renders standard and nested-parenthesis URLs', () => {
  const md = 'See [Tacitus](https://en.wikipedia.org/wiki/Tacitus_(historian)#Notes) and [John 1:1](/bible/jn/1#1).';
  const html = parseMarkdown(md);
  assert.match(html, /href="https:\/\/en\.wikipedia\.org\/wiki\/Tacitus_\(historian\)#Notes"/);
  assert.match(html, /href="\/bible\/jn\/1#1"/);
  assert.equal(stripMarkdownToPlainText(md), 'See Tacitus and John 1:1.');
});

test('MD_LINK_SOURCE does not exhibit exponential backtracking on malformed links (heb_5_7)', () => {
  const malformed =
    'Compare [Luke 24:39](Hebrews_2.17-Genesis_4.26.php:Luke_24.39-Romans_8.3-Hebrews_2.14-Hebrews_4.15\n' +
    'and additional unclosed text '.repeat(8);
  const t0 = performance.now();
  const plain = stripMarkdownToPlainText(malformed);
  const html = parseMarkdown(malformed);
  const elapsedMs = performance.now() - t0;
  assert.ok(elapsedMs < 50, `Expected <50ms, took ${elapsedMs.toFixed(1)}ms`);
  assert.ok(plain.includes('Luke 24:39'));
  assert.ok(html.includes('Luke 24:39'));
});

test('MD_LINK_SOURCE handles repeated paren groups, leading parens, empty URLs, and whitespace safely in linear time', () => {
  // Worst-case repeated balanced parens inside an unclosed link
  const unclosedParens = `[Label](${'(a)'.repeat(100)}\n`;
  const t0 = performance.now();
  const plainUnclosed = stripMarkdownToPlainText(unclosedParens);
  const htmlUnclosed = parseMarkdown(unclosedParens);
  const elapsedMs = performance.now() - t0;
  assert.ok(elapsedMs < 50, `Expected <50ms on unclosed repeated parens, took ${elapsedMs.toFixed(1)}ms`);
  assert.ok(plainUnclosed.includes('[Label]('));
  assert.doesNotMatch(htmlUnclosed, /<a\b/);

  // Multiple balanced paren groups + leading paren group in URL + relative scheme guard
  const multi =
    'Compare [Multi](https://example.com/a_(b)_c_(d)) and [Lead](https://example.com/(foo)bar) and [Path](/(foo)bar) and [Rel]((foo)bar).';
  const multiHtml = parseMarkdown(multi);
  assert.match(multiHtml, /href="https:\/\/example\.com\/a_\(b\)_c_\(d\)"/);
  assert.match(multiHtml, /href="https:\/\/example\.com\/\(foo\)bar"/);
  assert.match(multiHtml, /href="\/\(foo\)bar"/);
  assert.match(multiHtml, /and Rel\.<\/p>/);
  assert.equal(stripMarkdownToPlainText(multi), 'Compare Multi and Lead and Path and Rel.');

  // Rejects empty URLs and URLs containing whitespace
  const invalid = 'Keep [Empty]() and [Spaced](https://example.com/a b) unlinked.';
  const invalidHtml = parseMarkdown(invalid);
  assert.doesNotMatch(invalidHtml, /<a\b/);
  assert.equal(stripMarkdownToPlainText(invalid), invalid);
});

test('parseMarkdown resolves site-relative links against the source site (sourceUrl)', () => {
  const src = 'https://apologeticspress.org/category/alleged-discrepancies/';
  const html = parseMarkdown('see [Lyons](/articles/3268), and [old](/apcontent.aspx?category=11&article=1349)', { sourceUrl: src });
  assert.match(html, /href="https:\/\/apologeticspress\.org\/articles\/3268" target="_blank"/);
  assert.match(html, /href="https:\/\/apologeticspress\.org\/apcontent\.aspx\?category=11&amp;article=1349"/);
  assert.doesNotMatch(html, /href="\/articles/);
});

test('parseMarkdown keeps in-app and absolute links when sourceUrl is set', () => {
  const html = parseMarkdown('[a](/quran/2/255) [b](/hadith/bukhari/1) [c](https://example.org/x) [d](//cdn.example.org/y)', { sourceUrl: 'https://defendinginerrancy.com/bible-difficulties/' });
  assert.doesNotMatch(html, /defendinginerrancy\.com\/quran/);
  assert.doesNotMatch(html, /defendinginerrancy\.com\/hadith/);
  assert.match(html, /href="https:\/\/example\.org\/x"/);
  assert.match(html, /href="\/\/cdn\.example\.org\/y"/);
});

test('parseMarkdown leaves site-relative links unchanged without a usable sourceUrl', () => {
  for (const sourceUrl of [undefined, '', 'not a url', 'javascript:alert(1)']) {
    assert.match(parseMarkdown('[x](/articles/1)', { sourceUrl }), /href="\/articles\/1"/);
  }
  assert.match(parseMarkdown('[x](/articles/1)'), /href="\/articles\/1"/);
});

test('parseMarkdown sends /hadith/ links without a built page to Sunnah.com (hadithPages)', () => {
  const hadithPages = new Set(['bukhari/1']);
  const html = parseMarkdown('[a](/hadith/bukhari/1) [b](/hadith/bukhari/6860)', { hadithPages });
  assert.match(html, /href="[^"]*\/hadith\/bukhari\/1"/);
  assert.match(html, /href="https:\/\/sunnah\.com\/bukhari:6860" target="_blank"/);
  assert.match(parseMarkdown('[b](/hadith/bukhari/6860)'), /href="[^"]*\/hadith\/bukhari\/6860"/);
});
