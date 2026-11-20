import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadQuickPoints, validateQuickPoints, clearQuickPointsCache } from './loader.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));

test('loadQuickPoints returns null when the article JSON file is missing', () => {
  clearQuickPointsCache();
  assert.equal(loadQuickPoints('non-existent-article-slug'), null);
  assert.equal(loadQuickPoints(''), null);
  assert.equal(loadQuickPoints(null), null);
});

test('validateQuickPoints numbers points continuously, orders caveats at end of category, prefixes BASE, and excludes needsReview', () => {
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
            target: '/discover/sample-topic#sec-1',
            role: 'lead',
            impactScore: 9,
          },
          {
            id: 'pt-caveat',
            statement: 'Disputed context note placed before support in JSON',
            target: '/discover/sample-topic#caveat-1',
            role: 'caveat',
            impactScore: 4,
          },
          {
            id: 'pt-default',
            statement: 'Second support statement (absent role defaults to support)',
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
  // Within First Category: lead -> support -> caveat
  assert.deepEqual(
    out.groups[0].points.map((p) => [p.n, p.id, p.role]),
    [
      [1, 'pt-lead', 'lead'],
      [2, 'pt-default', 'support'],
      [3, 'pt-caveat', 'caveat'],
    ],
  );
  assert.deepEqual(flat[0], {
    n: 1,
    id: 'pt-lead',
    statement: 'First lead statement',
    role: 'lead',
    href: '/preview/discover/sample-topic#sec-1',
    path: '/preview/discover/sample-topic',
    hash: 'sec-1',
  });
  assert.deepEqual(flat[1], {
    n: 2,
    id: 'pt-default',
    statement: 'Second support statement (absent role defaults to support)',
    role: 'support',
    href: '/preview/discover/sample-topic/sub-page',
    path: '/preview/discover/sample-topic/sub-page',
    hash: '',
  });
  assert.deepEqual(flat[2], {
    n: 3,
    id: 'pt-caveat',
    statement: 'Disputed context note placed before support in JSON',
    role: 'caveat',
    href: '/preview/discover/sample-topic#caveat-1',
    path: '/preview/discover/sample-topic',
    hash: 'caveat-1',
  });
  assert.deepEqual(flat[3], {
    n: 4,
    id: 'pt-four',
    statement: 'Fourth statement pointing to subpage anchor',
    role: 'support',
    href: '/preview/discover/sample-topic/sub-page#card-4',
    path: '/preview/discover/sample-topic/sub-page',
    hash: 'card-4',
  });
});

test('validateQuickPoints aggregates all shape, uniqueness, statement, role, and target prefix errors at once', () => {
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
            role: 'invalid-role',
            target: '/discover/right-slug#ok',
          },
          {
            id: 'dup-id',
            statement: '   ',
            target: '/discover/right-slug-other#bad-boundary',
          },
          {
            id: 'empty-hash',
            statement: 'Trailing hash is invalid',
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
      assert.ok(['lead', 'support', 'caveat'].includes(pt.role));
      assert.ok(
        pt.path === `/discover/${slug}` || pt.path.startsWith(`/discover/${slug}/`),
        `Unexpected path ${pt.path} for ${slug}`,
      );
    });
  }
});
