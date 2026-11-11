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
