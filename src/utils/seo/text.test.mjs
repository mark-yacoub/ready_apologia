import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STOP_TAIL_RE,
  fitText,
  clampDescription,
  quoteTail,
  cleanItemTitle,
  cleanVideoTitle,
  sanitizeQuestionText,
  formatList
} from './text.js';

test('fitText never exceeds maxLen and never ends on a stop word before ellipsis', () => {
  const samples = [
    'The Deity of Christ in the Gospel of John and Early Patristic Writings',
    'How Does John 1:1 Fit With the Rest of the New Testament Canon?',
    'Crucifixion Darkness and Historical Accounts From the First Century',
    'Preservation of the Text Through the Centuries in the Church',
    'A Short Title',
    '"Quoted Title With Dangling Preposition at the End of It"',
    'Antidisestablishmentarianism in the Nineteenth Century Debate'
  ];

  for (const sample of samples) {
    for (let maxLen = 1; maxLen <= 65; maxLen++) {
      const res = fitText(sample, maxLen);
      assert.ok(
        res.length <= maxLen,
        `fitText("${sample}", ${maxLen}) produced length ${res.length}: "${res}"`
      );
      if (res.endsWith('…')) {
        const withoutEllipsis = res.slice(0, -1);
        // If there are multiple words remaining, the final word must not be a stop word
        if (withoutEllipsis.includes(' ')) {
          assert.equal(
            STOP_TAIL_RE.test(withoutEllipsis),
            false,
            `fitText("${sample}", ${maxLen}) ended on a stop word: "${res}"`
          );
        }
      }
    }
  }

  assert.equal(fitText('', 20), '');
  assert.equal(fitText('Hello world', 0), '');
  assert.equal(fitText('The Deity of Christ in the Gospel of John', 28), 'The Deity of Christ…');
});

test('clampDescription respects maxLen and prefers sentence boundaries when available', () => {
  const short = 'Explore ancient manuscripts and Early Church Father commentary for John 1:1.';
  assert.equal(clampDescription(short), short);

  const twoSentences =
    'Earliest manuscript of John 1:1: Papyrus 66 (c. AD 200), held at the Martin Bodmer Library in Cologny. Compare 12 ancient manuscripts and high-resolution scans across the collection.';
  const clamped = clampDescription(twoSentences, 158);
  assert.ok(clamped.length <= 158);
  assert.equal(
    clamped,
    'Earliest manuscript of John 1:1: Papyrus 66 (c. AD 200), held at the Martin Bodmer Library in Cologny.'
  );

  const singleLongSentence =
    'Read 5 textual and historical answers comparing John 1:1 with parallel passages across the Old and New Testaments including Genesis 1:1 and Hebrews 1:8 in full context.';
  const wordClamped = clampDescription(singleLongSentence, 158);
  assert.ok(wordClamped.length <= 158);
  assert.ok(wordClamped.endsWith('…'));
});

test('quoteTail wraps text in straight or smart quotes with terminal punctuation inside', () => {
  assert.equal(quoteTail('The Word Was God', false), '"The Word Was God."');
  assert.equal(quoteTail('The Word Was God', true), '“The Word Was God.”');
  assert.equal(quoteTail('Did Jesus Claim Divinity?', false), '"Did Jesus Claim Divinity?"');
  assert.equal(quoteTail('Did Jesus Claim Divinity?', true), '“Did Jesus Claim Divinity?”');
  assert.equal(quoteTail(''), '.');
});

test('cleanItemTitle and cleanVideoTitle strip prefixes, channel suffixes, and outer quotes', () => {
  assert.equal(
    cleanItemTitle('"John 1:1 — Was the Word God or a god?"', 'John 1:1'),
    'Was the Word God or a god?'
  );
  assert.equal(
    cleanItemTitle('John 1:1: Luke 2:4 - Chronology Question', 'John 1:1', 'Luke 2:4'),
    'Chronology Question'
  );
  assert.equal(
    cleanVideoTitle('"Why John 1:1 Proves the Trinity | Sam Shamoun"'),
    'Why John 1:1 Proves the Trinity'
  );
});

test('sanitizeQuestionText and formatList handle formatting cleanly', () => {
  assert.equal(
    sanitizeQuestionText('  <p>What does **John 1:1** mean in *Greek*?</p> '),
    'What does John 1:1 mean in Greek?'
  );
  assert.equal(formatList([]), '');
  assert.equal(formatList(['A']), 'A');
  assert.equal(formatList(['A', 'B']), 'A and B');
  assert.equal(formatList(['A', 'B', 'C']), 'A, B, and C');
});
