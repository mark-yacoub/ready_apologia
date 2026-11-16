import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYBOOK_BODY,
  PLAYBOOK_HEADLINE,
  PLAYBOOK_META,
  combinePatterns,
} from './playbookTone.js';

const RULE_10_PHRASES = [
  'AI-assisted translation',
  'machine-generated',
  'Highlighting ours',
  'emphasis added',
  'Bold inside quotations is ours',
  'the translation this site uses',
  'translation used on this site',
  'see the note on the linked commentary page',
  'Opens Tafsir al-Ṭabarī on this site',
  'Opens al-Ṭabarī or Ibn Kathīr on this site',
  'Opens Sunnah.com',
  'Opens the verse on this site',
];

const LEGITIMATE_PHRASES = [
  "“by prostitution” is the translator's gloss",
  'Printed works, no online link. Page numbers refer to A. Guillaume’s translation',
  'surviving Greek manuscripts',
];

test('PLAYBOOK_META catches every Playbook §2.10 housekeeping / provenance / link-mechanics phrase', () => {
  for (const phrase of RULE_10_PHRASES) {
    assert.match(phrase, PLAYBOOK_META, `expected PLAYBOOK_META to match "${phrase}"`);
  }
});

test('PLAYBOOK_BODY and PLAYBOOK_META allow legitimate philological, bibliographic and manuscript strings', () => {
  for (const phrase of LEGITIMATE_PHRASES) {
    assert.doesNotMatch(phrase, PLAYBOOK_BODY, `PLAYBOOK_BODY false-positived on "${phrase}"`);
    assert.doesNotMatch(phrase, PLAYBOOK_META, `PLAYBOOK_META false-positived on "${phrase}"`);
  }
});

test('PLAYBOOK_BODY and PLAYBOOK_HEADLINE enforce canonical §2.3 vocabulary', () => {
  assert.match('They survived until later', PLAYBOOK_BODY);
  assert.match('A major blunder in the report', PLAYBOOK_BODY);
  assert.match('Two Conflicting Accounts', PLAYBOOK_HEADLINE);
  assert.match('Systemic Defects in the Chain', PLAYBOOK_HEADLINE);
});

test('combinePatterns composes base patterns with article-specific extensions case-insensitively', () => {
  const combined = combinePatterns(PLAYBOOK_BODY, PLAYBOOK_META, /\bsurviv\w*\b/i);
  assert.match('surviving copies', combined);
  assert.match('Highlighting ours.', combined);
  assert.match('What really happened', combined);
  assert.doesNotMatch("“by prostitution” is the translator's gloss", combined);
});
