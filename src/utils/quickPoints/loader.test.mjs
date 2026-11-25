import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadQuickPoints,
  validateQuickPoints,
  clearQuickPointsCache,
  toPageKey,
  parseQuickHash,
  isQuickHash,
  isQuickHashTransition,
} from './loader.node.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));

test('loader.js contains zero node:* imports so client bundles can never pull node:fs', () => {
  const browserSrc = fs.readFileSync(path.join(DIR, 'loader.js'), 'utf8');
  const pathsSrc = fs.readFileSync(path.join(DIR, 'paths.js'), 'utf8');
  assert.doesNotMatch(browserSrc, /from\s+['"]node:/);
  assert.doesNotMatch(pathsSrc, /from\s+['"]node:/);
});

test('toPageKey normalises trailing slashes and strips BASE without ambiguity', () => {
  assert.equal(toPageKey('/discover/quran-preservation/', ''), '/discover/quran-preservation');
  assert.equal(toPageKey('/sub/discover/quran-preservation/', '/sub/'), '/discover/quran-preservation');
  assert.equal(toPageKey('/sub-other/discover/foo', '/sub'), '/sub-other/discover/foo');
});

test('parseQuickHash, isQuickHash, and isQuickHashTransition share one canonical parser', () => {
  assert.deepEqual(parseQuickHash('#quick'), { pointId: null });
  assert.deepEqual(parseQuickHash('#quick:umar-stoning-verse'), { pointId: 'umar-stoning-verse' });
  assert.deepEqual(parseQuickHash('https://example.com/discover/qp#quick:pt%201'), { pointId: 'pt 1' });
  assert.deepEqual(parseQuickHash('#quick:   '), { pointId: null });
  assert.equal(parseQuickHash('#quick-other'), null);
  assert.equal(parseQuickHash('#section-1'), null);
  assert.equal(parseQuickHash(''), null);

  assert.equal(isQuickHash('#quick'), true);
  assert.equal(isQuickHash('#quick:id-1'), true);
  assert.equal(isQuickHash('#other'), false);

  assert.equal(
    isQuickHashTransition({ oldURL: 'https://x.test/p#quick', newURL: 'https://x.test/p#sec' }),
    true,
  );
  assert.equal(
    isQuickHashTransition({ oldURL: 'https://x.test/p#sec1', newURL: 'https://x.test/p#sec2' }),
    false,
  );
});

test('loadQuickPoints returns null when the article JSON file is missing', () => {
  clearQuickPointsCache();
  assert.equal(loadQuickPoints('non-existent-article-slug'), null);
  assert.equal(loadQuickPoints(''), null);
  assert.equal(loadQuickPoints(null), null);
});

test('validateQuickPoints ref contract: trims string, maps null/absent to null, and rejects "[" or "]"', () => {
  const makeDoc = (refValue, includeKey = true) => ({
    article: 'ref-topic',
    title: 'Ref Topic',
    groups: [
      {
        category: 'Citations',
        points: [
          {
            id: 'p1',
            statement: 'Statement one',
            target: '/discover/ref-topic#a',
            ...(includeKey ? { ref: refValue } : {}),
          },
        ],
      },
    ],
  });

  assert.equal(
    validateQuickPoints(makeDoc('  Muslim 1452a  '), 'ref-topic').groups[0].points[0].ref,
    'Muslim 1452a',
  );
  assert.equal(validateQuickPoints(makeDoc(null), 'ref-topic').groups[0].points[0].ref, null);
  assert.equal(validateQuickPoints(makeDoc(undefined, false), 'ref-topic').groups[0].points[0].ref, null);

  for (const badRef of ['[Muslim 1452a]', '[Muslim 1452a', 'Muslim 1452a]']) {
    assert.throws(
      () => validateQuickPoints(makeDoc(badRef), 'ref-topic'),
      /must not contain "\[" or "\]"/,
    );
  }
});

test('validateQuickPoints passes ref & pageKey through, handles null/absent ref, orders caveats last, and excludes needsReview', () => {
  const fixture = {
    article: 'sample-topic',
    title: 'Sample Topic Title',
    basePath: '/discover/sample-topic',
    status: 'in_progress',
    groups: [
      {
        category: 'First Category',
        points: [
          {
            id: 'pt-lead',
            statement: 'First lead statement',
            ref: '  Bukhari 3547; Muslim 2347a  ',
            target: '/discover/sample-topic#sec-1',
            role: 'lead',
            impactScore: 9,
          },
          {
            id: 'pt-caveat',
            statement: 'Disputed context note placed before support in JSON',
            ref: null,
            target: '/discover/sample-topic#caveat-1',
            role: 'caveat',
            impactScore: 4,
          },
          {
            id: 'pt-default',
            statement: 'Second support statement (absent role & absent ref)',
            target: '/discover/sample-topic/sub-page/',
            impactScore: 8,
          },
        ],
      },
      {
        category: 'Second Category',
        points: [
          {
            id: 'pt-four',
            statement: 'Fourth statement pointing to subpage anchor',
            ref: 'Quran 9:29',
            target: '/discover/sample-topic/sub-page#card-4',
            role: 'support',
            impactScore: 7,
          },
        ],
      },
    ],
    needsReview: [
      {
        id: 'draft-unapproved',
        target: '/discover/sample-topic#draft',
        lastDraft: {
          category: 'Drafts',
          statement: 'Must never appear in loader output',
          target: '/discover/sample-topic#draft',
        },
      },
    ],
  };

  const out = validateQuickPoints(fixture, 'sample-topic', { base: '/preview/' });
  assert.equal(out.slug, 'sample-topic');
  assert.equal(out.title, 'Sample Topic Title');
  assert.equal(out.total, 4);
  assert.equal(out.groups.length, 2);
  assert.equal('needsReview' in out, false);

  const flat = out.groups.flatMap((g) => g.points);
  assert.deepEqual(
    flat.map((p) => p.n),
    [1, 2, 3, 4],
  );
  assert.deepEqual(flat[0], {
    n: 1,
    id: 'pt-lead',
    statement: 'First lead statement',
    ref: 'Bukhari 3547; Muslim 2347a',
    role: 'lead',
    href: '/preview/discover/sample-topic#sec-1',
    path: '/preview/discover/sample-topic',
    pageKey: '/discover/sample-topic',
    hash: 'sec-1',
  });
  assert.deepEqual(flat[1], {
    n: 2,
    id: 'pt-default',
    statement: 'Second support statement (absent role & absent ref)',
    ref: null,
    role: 'support',
    href: '/preview/discover/sample-topic/sub-page',
    path: '/preview/discover/sample-topic/sub-page',
    pageKey: '/discover/sample-topic/sub-page',
    hash: '',
  });
  assert.deepEqual(flat[2], {
    n: 3,
    id: 'pt-caveat',
    statement: 'Disputed context note placed before support in JSON',
    ref: null,
    role: 'caveat',
    href: '/preview/discover/sample-topic#caveat-1',
    path: '/preview/discover/sample-topic',
    pageKey: '/discover/sample-topic',
    hash: 'caveat-1',
  });
  assert.deepEqual(flat[3], {
    n: 4,
    id: 'pt-four',
    statement: 'Fourth statement pointing to subpage anchor',
    ref: 'Quran 9:29',
    role: 'support',
    href: '/preview/discover/sample-topic/sub-page#card-4',
    path: '/preview/discover/sample-topic/sub-page',
    pageKey: '/discover/sample-topic/sub-page',
    hash: 'card-4',
  });
});

test('validateQuickPoints aggregates all shape, uniqueness, statement, role, ref-bracket, and target errors at once', () => {
  const broken = {
    article: 'wrong-slug',
    title: '   ',
    groups: [
      {
        category: '',
        points: [
          {
            id: 'dup-id',
            statement: 'Valid statement',
            ref: '[Muslim 1452a]',
            role: 'invalid-role',
            target: '/discover/right-slug#ok',
          },
          {
            id: 'dup-id',
            statement: '   ',
            ref: '   ',
            target: '/discover/right-slug-other#bad-boundary',
          },
          {
            id: 'empty-hash',
            statement: 'Trailing hash is invalid',
            ref: 123,
            target: '/discover/right-slug#',
          },
        ],
      },
    ],
  };

  assert.throws(
    () => validateQuickPoints(broken, 'right-slug'),
    (err) => {
      assert.match(err.message, /article must equal "right-slug"/);
      assert.match(err.message, /title must be a non-empty string/);
      assert.match(err.message, /groups\[0\]\.category must be a non-empty string/);
      assert.match(err.message, /"dup-id" is duplicated/);
      assert.match(err.message, /ref "\[Muslim 1452a\]" must not contain "\[" or "\]"/);
      assert.match(err.message, /ref must be a non-empty string or null/);
      assert.match(err.message, /ref must be a string or null/);
      assert.match(err.message, /role "invalid-role" must be "lead", "support", or "caveat"/);
      assert.match(err.message, /statement must be a non-empty string/);
      assert.match(err.message, /must start with "\/discover\/right-slug"/);
      assert.match(err.message, /has an empty "#hash"/);
      return true;
    },
  );
});

test('loadQuickPoints memoises results and validates every JSON file present in src/utils/quickPoints/', () => {
  clearQuickPointsCache();
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  for (const file of files) {
    const slug = file.slice(0, -5);
    const first = loadQuickPoints(slug);
    const second = loadQuickPoints(slug);
    assert.ok(first, `Expected non-null output for ${file}`);
    assert.equal(first, second, `Expected memoised reference for ${slug}`);
    assert.equal(first.slug, slug);
    assert.ok(first.title.length > 0);
    assert.ok(first.total > 0);

    const flat = first.groups.flatMap((g) => g.points);
    assert.equal(flat.length, first.total);
    const ids = new Set();
    flat.forEach((pt, idx) => {
      assert.equal(pt.n, idx + 1);
      assert.equal(ids.has(pt.id), false);
      ids.add(pt.id);
      assert.ok(pt.statement.length > 0);
      assert.ok(pt.ref === null || (typeof pt.ref === 'string' && pt.ref.length > 0 && !/[\[\]]/.test(pt.ref)));
      assert.ok(['lead', 'support', 'caveat'].includes(pt.role));
      assert.ok(
        pt.pageKey === `/discover/${slug}` || pt.pageKey.startsWith(`/discover/${slug}/`),
        `Unexpected pageKey ${pt.pageKey} for ${slug}`,
      );
    });
  }
});
