import test from 'node:test';
import assert from 'node:assert/strict';
import { toReelItems, displayApologistName } from './reelItems.js';

test('keeps order, dedupes and maps fields', () => {
  const rows = [
    { video_id: 'a', apologist_name: 'Sam Shamoun', original_url: 'https://youtu.be/x?t=30' },
    { video_id: 'b', apologist_name: 'Unknown' },
    { video_id: 'a', apologist_name: 'Sam Shamoun' },
    { video_id: 'c', apologist_name: 'Christian Apologist', original_url: 'http://insecure' },
    { title: 'no id' },
  ];
  assert.deepEqual(toReelItems(rows, { verseLabel: 'John 1:1', verseHref: '/bible/jn/1#1' }), [
    { videoId: 'a', apologistName: 'Sam Shamoun', verseLabel: 'John 1:1', verseHref: '/bible/jn/1#1', originalUrl: 'https://youtu.be/x?t=30' },
    { videoId: 'b', verseLabel: 'John 1:1', verseHref: '/bible/jn/1#1' },
    { videoId: 'c', verseLabel: 'John 1:1', verseHref: '/bible/jn/1#1' },
  ]);
});

test('accepts camelCase rows and no context', () => {
  assert.deepEqual(toReelItems([{ videoId: 'z', apologistName: ' Wes Huff ' }]), [{ videoId: 'z', apologistName: 'Wes Huff' }]);
  assert.deepEqual(toReelItems(null), []);
});

test('placeholder names are hidden', () => {
  for (const n of ['Unknown', 'unknown speaker', 'Christian Apologist', '', null]) assert.equal(displayApologistName(n), '');
  assert.equal(displayApologistName('David Wood'), 'David Wood');
});
