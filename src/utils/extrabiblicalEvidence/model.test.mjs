/**
 * Unit tests for /discover/extrabiblical-evidence-for-jesus copy, philology, anchors, and tone.
 *
 * Run:
 *   node --test src/utils/extrabiblicalEvidence/*.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import DATA from '../../data/extrabiblical-evidence-for-jesus.json' with { type: 'json' };
import * as C from './config.js';
import * as T from './content.js';
import { WITNESSES } from './overrides.js';
import { toneHit } from './tone.js';
import { buildModel, fill, mdInline } from './model.js';
import { verbatimProblem } from '../originsOfRevelation/verbatim.js';

const model = buildModel(T);
const cloneContent = () => structuredClone({ ...T });
const cloneWitnesses = () => structuredClone(WITNESSES);

test('data contract: preserves 100% of all 5 theme IDs and all 52 unique #evidence-<id> anchors uniquely', () => {
  const jsonThemeIds = DATA.themes.map(t => t.id);
  const jsonEvIds = [...new Set(DATA.themes.flatMap(t => t.evidences.map(e => e.id)))];
  assert.equal(jsonThemeIds.length, 5);
  assert.equal(jsonEvIds.length, 52);

  for (const tid of jsonThemeIds) {
    assert.ok(model.emittedIds.has(tid), `missing legacy theme anchor #${tid}`);
  }
  for (const eid of jsonEvIds) {
    assert.ok(model.emittedIds.has(`evidence-${eid}`), `missing legacy evidence anchor #evidence-${eid}`);
  }
  assert.equal(model.cardCount, 40);
  assert.equal(model.evidenceAnchorCount, 52);

  const rawBytes = fs.readFileSync(C.DATA_FILE);
  assert.equal(
    crypto.createHash('sha256').update(rawBytes).digest('hex'),
    C.EXPECTED_DATA_SHA256,
  );
  assert.throws(
    () => buildModel(T, { expectedDataSha256: '0'.repeat(64) }),
    /SHA-256 mismatch/,
  );
});

test('dropping or duplicating any JSON theme ID or evidence ID fails the build', () => {
  const missingAlias = cloneWitnesses();
  missingAlias.find(w => w.id === 'lucian-peregrinus').aliases.pop();
  assert.throws(() => buildModel(T, { witnesses: missingAlias }), /missing from overrides\.js/);

  const dupAlias = cloneWitnesses();
  dupAlias[0].aliases.push('pliny-letters-10-96');
  assert.throws(() => buildModel(T, { witnesses: dupAlias }), /duplicate|already/);

  const missingTheme = cloneContent();
  missingTheme.SECTIONS[0].aliases = ['crucifixion'];
  assert.throws(() => buildModel(missingTheme), /legacy theme alias "#resurrection"/);
});

test('closed schema rejects unknown keys and missing required labels', () => {
  const badSeo = cloneContent();
  badSeo.SEO.extraField = 'nope';
  assert.throws(() => buildModel(badSeo), /unknown field "extraField"/);

  const badWitness = cloneWitnesses();
  badWitness[0].typoKey = 'nope';
  assert.throws(() => buildModel(T, { witnesses: badWitness }), /unknown field "typoKey"/);

  const missingLabel = cloneContent();
  delete missingLabel.LABELS.verifyAria;
  assert.throws(() => buildModel(missingLabel), /LABELS\.verifyAria is required/);

  assert.throws(() => fill('hello {unknown}', { n: 1 }), /unknown placeholder/);
});

test('H1 counts (16 literary, 10 archaeology) and 5 numbered At-a-Glance categories match the model', () => {
  assert.equal(model.literaryAuthorCount, 16);
  assert.equal(model.archaeologyCount, 10);
  assert.equal(model.itemCount, 5);
  assert.equal(model.glance.length, 5);
  assert.equal(model.sections.find(s => s.id === 'corroborative-and-disputed').n, null);

  const mismatchH1 = cloneContent();
  mismatchH1.HEADER.h1 = '17 Non-Christian Literary Sources and 10 Archaeological Finds for Jesus';
  assert.throws(() => buildModel(mismatchH1), /HEADER\.h1 numbers/);
});

test('link policy rejects non-https, protocol-relative, Wikipedia, BibleGateway, come-and-hear, and non-sliced Bible books', () => {
  const withMd = text => {
    const c = cloneContent();
    c.SECTIONS[0].classicalMd = text;
    return () => buildModel(c);
  };
  assert.throws(withMd('See [x](//evil.example/a).'), /protocol-relative/);
  assert.throws(withMd('See [x](http://www.perseus.tufts.edu/hopper/).'), /must use https/);
  assert.throws(withMd('See [x](https://en.wikipedia.org/wiki/Tacitus).'), /not in config\.HOSTS/);
  assert.throws(withMd('See [x](https://www.biblegateway.com/passage/?search=John+1).'), /not in config\.HOSTS/);
  assert.throws(withMd('See [x](https://www.come-and-hear.com/sanhedrin/sanhedrin_43.html).'), /not in config\.HOSTS/);
  assert.throws(withMd('See [x](https://quran.com/4/157).'), /internal tafsir routes/);
  assert.throws(withMd('See [Rev 1:17](/bible/rev/1#17).'), /Bible book id "rev"/);
  assert.throws(withMd('See [missing](#no-such-anchor).'), /missing anchors/);

  assert.match(
    mdInline('[Perseus](https://www.perseus.tufts.edu/hopper/)'),
    /target="_blank" rel="noopener noreferrer"/,
  );
  assert.doesNotMatch(mdInline('[Acts 18:2](/bible/acts/18#2)'), /target=/);
  assert.match(mdInline('[Acts 18:2](/bible/acts/18#2)'), /data-astro-prefetch="false"/);
  assert.match(mdInline('[Qurʾān 4:157](/quran/4/157/tafsir/tabari)'), /data-astro-prefetch="false"/);
  assert.doesNotMatch(mdInline('[Divinity Timeline](/discover/divinity-timeline)'), /data-astro-prefetch/);

  let internalScriptureRefs = 0;
  for (const grp of model.sources) {
    for (const item of grp.items) {
      if (/^\/(bible|quran)\//.test(item.href)) {
        internalScriptureRefs += 1;
        assert.equal(item.attrs['data-astro-prefetch'], 'false', `missing no-prefetch on ${item.href}`);
      }
    }
  }
  assert.ok(internalScriptureRefs >= 5, `expected >= 5 internal scripture sources, got ${internalScriptureRefs}`);
});

test('showcase and hero witness excerpts are verbatim in the witness quotes they cite', () => {
  const bad = cloneContent();
  bad.SECTIONS[0].showcase.left.items[0].textMd = '“words invented out of thin air”';
  assert.throws(() => buildModel(bad), /not verbatim/);
});

test('Philippians 2:6–11 quote matches repo NASB phil.json verbatim', () => {
  const phil = JSON.parse(fs.readFileSync('src/data/scripture/nasb/phil.json', 'utf8'));
  const ch2 = Object.assign({}, ...phil['2']);
  const verses = [6, 7, 8, 9, 10, 11].map(v => ch2[String(v)]).join(' ');
  const card = WITNESSES.find(w => w.id === 'carmen-christi-philippians-2-6-11');
  assert.equal(verbatimProblem(card.quote, verses), null);
});

test('key philological remediations from RECON_AUDIT.md are preserved', () => {
  // 1. Josephus Ant. 20.200 precedes Ant. 18.63-64, and Ant. 18.63-64 carries a 2-column redline comparison.
  const josIds = model.sections.find(s => s.id === 'josephus').groups[0].cards.map(c => c.id);
  assert.deepEqual(josIds, ['josephus-antiquities-20-9-1', 'josephus-antiquities-18-3-3']);
  const tf = model.sections.find(s => s.id === 'josephus').groups[0].cards[1];
  assert.ok(tf.redline && tf.redline.sc.a.html.includes('<mark>'), 'Testimonium carries marked Greek vs Agapius redline');

  // 2. Phlegon omits the misattributed Contra Celsum 2.59 nail-pierced hands quote.
  const phlegon = WITNESSES.find(w => w.id === 'phlegon-of-tralles-olympiads');
  assert.ok(!/prints of the nails/i.test(phlegon.quote), 'Phlegon quote must not include Origen 2.59');

  // 3. Pilate stone repairs [PRAE]CTVS -> [PRAEF]ECTVS.
  const pilate = WITNESSES.find(w => w.id === 'pilate-stone');
  assert.match(pilate.originalScript.text, /\[PRAEF\]ECTVS/);

  // 4. Uninscribed topographical excavations use kind === "finding" (not fake blockquotes).
  for (const id of ['pool-of-bethesda', 'pool-of-siloam', 'capernaum-synagogue']) {
    assert.equal(WITNESSES.find(w => w.id === id).kind, 'finding');
  }
});

test('editorial voice passes Playbook §2.3 tone checks and Rule 1 academic register (zero strawmen, zero first-person we/us/our)', () => {
  const SKIP = new Set([
    'quote', 'quoteMd', 'textMd', 'htmlMd', 'originalScript', 'ref', 'href', 'id', 'aliases',
    'witnessIds', 'collapsedIds', 'authorKey', 'section', 'group', 'key', 'kind', 'keywords', 'lang', 'dir',
  ]);
  const HEADLINE = new Set([
    'nav', 'h2', 'title', 'label', 'caption', 'collapsedSummary', 'summary', 'whosWhoSummary',
    'heading', 'eyebrow', 'h1', 'name', 'position', 'ogAlt', 'description', 'chips', 'findingTag',
    'evaluationLabel',
  ]);
  const voice = [];
  function walk(v, path, headline = false) {
    if (typeof v === 'string') {
      voice.push([path, v, headline]);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${path}[${i}]`, headline));
      return;
    }
    if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (SKIP.has(k)) continue;
        walk(x, `${path}.${k}`, headline || HEADLINE.has(k) || path === 'LABELS');
      }
    }
  }
  for (const k of ['SEO', 'CATALOG', 'HEADER', 'HERO_WITNESSES', 'LABELS', 'SECTIONS', 'CLOSING']) {
    walk(T[k], k, ['SEO', 'CATALOG'].includes(k));
  }
  walk(WITNESSES, 'WITNESSES', false);
  for (const w of WITNESSES.filter(x => x.kind === 'finding')) {
    voice.push([`WITNESSES(${w.id}).quote`, w.quote, false]);
  }

  const hits = voice
    .map(([p, v, h]) => [p, toneHit(v, { headline: h })])
    .filter(([, hit]) => hit)
    .map(([p, hit]) => `${p}: "${hit}"`);
  assert.deepEqual(hits, []);
});

test('nav labels are concise (<= 18 chars) and chip labels contain no raw URLs', () => {
  for (const s of T.SECTIONS) {
    assert.ok([...s.nav].length <= 18, `nav label too long: "${s.nav}"`);
  }
  const allChips = model.sections.flatMap(s => s.groups.flatMap(g => g.cards.flatMap(c => c.chips)));
  for (const ch of allChips) {
    assert.ok(!/https?:|\/\//.test(ch.label), `raw URL in chip label: ${ch.label}`);
  }
});

test('Pass 3 Round 2 philological, epigraphic, DOI, and Perseus/Livius URL regressions are locked', () => {
  const byId = Object.fromEntries(WITNESSES.map(w => [w.id, w]));

  // B1 & B2: accessible primary/scholarly records and zero mispointed or bot-gated URLs.
  assert.ok(
    byId['nazareth-inscription'].chips.some(c => c.href === 'https://openalex.org/works/W3003474637'),
    'Nazareth Inscription must link Harper et al. (2020) JAS: Reports 30, 102228 accessible OpenAlex work page',
  );
  assert.ok(
    byId['pool-of-bethesda'].chips.some(c => c.href === 'https://archive.org/details/palestine-exploration-quarterly_1888-07'),
    'Pool of Bethesda must link Schick PEQ 20 (1888) primary excavation report on Archive.org',
  );
  assert.ok(
    byId['pool-of-siloam'].chips.some(c => c.href === 'https://doi.org/10.1515/9781575066592-015'),
    'Pool of Siloam must link Reich & Shukron (2011) primary excavation chapter',
  );

  // B3: H1 and framing explicitly cover "Jesus and the Early Christians" + 3-tier stratification (11 + 4 + 1 = 16).
  assert.match(T.HEADER.h1, /Jesus and the Early Christians/);
  assert.match(T.HEADER.framingMd, /11 literary sources name or unambiguously identify Jesus or Christ/);
  assert.match(T.HEADER.framingMd, /4 preserve anonymous or debated allusions/);
  assert.match(T.HEADER.framingMd, /1 author.*mentions Christians without naming Jesus/);

  // Original-language philological & epigraphic spellings (M6, M21, M26, MINOR 9, MINOR 12).
  assert.match(byId['tacitus-annals-15-44'].originalScript.text, /Tiberio imperitante/);
  assert.match(byId['josephus-antiquities-20-9-1'].originalScript.text, /παρέδωκε λευσθησομένους/);
  assert.ok(byId['josephus-antiquities-18-3-3'].originalScript?.text.includes('Γίνεται δὲ κατὰ τοῦτον τὸν χρόνον'));
  assert.equal(byId['yehohanan-heel-bone'].originalScript.text, 'יהוחנן בן חגקול');
  assert.equal(byId['caiaphas-ossuary'].originalScript.text, 'יהוסף בר קיפא · יהוסף בר קפא');
  assert.match(byId['melito-on-the-passover'].originalScript.text, /ὁ δεσπότης ὕβρισται/);

  // M22 + bonus link check: zero broken/mismatched Perseus, Livius, New Advent, or unverified URLs anywhere.
  const allUrls = [
    ...WITNESSES.flatMap(w => w.chips.map(c => c.href)),
    ...WITNESSES.flatMap(w => [w.redline?.a?.ref?.href, w.redline?.b?.ref?.href].filter(Boolean)),
  ];
  const forbiddenSubstrings = [
    '10.1016/j.jas.2020.105093',
    '10.1179/003103205x62990',
    '2008.01.0450',
    '1999.01.0216',
    'life%3Dner.',
    'life=ner.',
    'jerusalem-pool-of-bethesda',
    'jerusalem-pool-of-siloam',
    'fathers/01288.htm',
    'rpearse/manuscripts/josephus_testimonium.htm',
  ];
  for (const bad of forbiddenSubstrings) {
    assert.ok(!allUrls.some(u => u.includes(bad)), `forbidden dead/mispointed URL substring still present: ${bad}`);
  }

  // Pass 3 Round 3 bibliographic venue & page-range locks (R2-M1..R2-M6, R2-m1, R2-m2).
  assert.match(byId['erastus-inscription'].noteMd, /Novum Testamentum\* 38, 1996, pp\. 218–223/);
  assert.match(byId['erastus-inscription'].noteMd, /NTS\* 57, 2011, pp\. 583–593/);
  assert.match(byId['capernaum-synagogue'].quote, /Judaism in Late Antiquity\* III\.4, Brill, 2001, pp\. 1–48/);
  assert.match(byId['caiaphas-ossuary'].noteMd, /Le Monde de la Bible\* 80, 1993, pp\. 42–47/);
  assert.match(byId['pool-of-bethesda'].quote, /Jerusalem Through the Ages\*, Israel Exploration Society, 1968, pp\. 48\*–57\*/);
  assert.match(byId['alexamenos-graffito'].noteMd, /The Reception of Jesus in the First Three Centuries\*, vol\. 3, T&T Clark, 2020, pp\. 105–139/);
  const s2 = T.SECTIONS.find(s => s.id === 'josephus');
  const s3 = T.SECTIONS.find(s => s.id === 'pagan-critics');
  const s5 = T.SECTIONS.find(s => s.id === 'archaeology');
  assert.match(s2.classicalMd, /489–514/);
  assert.match(s3.glance.takeawayMd, /in Galen’s case, as the founder of a philosophical school/);
  assert.match(s5.evaluationMd, /Jerusalem Through the Ages\*, Israel Exploration Society, 1968, pp\. 48\*–57\*/);
});

test('Pass 4 Round 1 cold-reader link, attribution, calibration, and UX/dev-leak regressions are locked', () => {
  const byId = Object.fromEntries(WITNESSES.map(w => [w.id, w]));
  const allUrls = [
    ...WITNESSES.flatMap(w => w.chips.map(c => c.href)),
    ...WITNESSES.flatMap(w => [w.redline?.a?.ref?.href, w.redline?.b?.ref?.href].filter(Boolean)),
  ];

  // P0-1..P0-4, P0-8 & Pass 7 accessible primary links (replacing bot-gated EDH/PHI/papyri.info/403 DOIs):
  assert.ok(byId['erastus-inscription'].chips.some(c => c.href === 'https://www.ascsa.edu.gr/uploads/media/oa_ebooks/oa_corinth/Corinth_VIII_3.pdf'));
  assert.ok(byId['pilate-stone'].chips.some(c => c.href === 'https://archive.org/details/pontius-pilate-helen-k.-bond'));
  assert.ok(byId['sergius-paulus-inscription'].chips.some(c => c.href === 'https://archive.org/details/inscriptioneslat21dess'));
  assert.ok(byId['sergius-paulus-inscription'].chips.some(c => c.href === 'https://archive.org/details/inscriptionesgra03cagnuoft'));
  assert.ok(byId['sergius-paulus-inscription'].chips.some(c => c.href === 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/54*.html'));
  assert.ok(byId['caiaphas-ossuary'].chips.some(c => c.href === 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0145%3Abook%3D18%3Asection%3D35'));
  assert.ok(byId['yehohanan-heel-bone'].chips.some(c => c.href === 'https://archive.org/details/corpusinscriptio0000unse_v5l8'));
  assert.ok(byId['gallio-inscription'].chips.some(c => c.href === 'https://archive.org/details/syllogeinscripti02dittuoft'));
  assert.ok(byId['tosefta-hullin-talmud-abodah-zarah-27b'].chips.some(c => c.href === 'https://www.sefaria.org/Tosefta_Chullin.2.6?lang=bi'));
  assert.ok(byId['polycarp-philippians-12-2'].chips.some(c => c.href === 'https://archive.org/details/apostolicfathers00lighuoft'));
  assert.ok(byId['galen-de-pulsuum'].chips.some(c => c.href === 'https://archive.org/details/galenonjewschris0000rich'));
  assert.ok(byId['nazareth-inscription'].chips.some(c => c.href === 'https://archive.org/details/sim_revue-historique_january-april-1930_163_2'));
  assert.ok(byId['claudius-letter-to-alexandrians'].chips.some(c => c.href === 'https://archive.org/details/mdp.39015010705583'));
  assert.ok(byId['claudius-letter-to-alexandrians'].chips.some(c => c.href === 'https://archive.org/details/in.ernet.dli.2015.183447'));

  for (const dead of [
    'HD019729',
    'HD031661',
    'imj.org.il',
    'Tosefta_Chullin.2.22',
    '248465',
    '298952',
    '287185',
    'earlychristianwritings.com/galen.html',
    'epigraphy.packhum.org',
    'edh.ub.uni-heidelberg.de',
    'papyri.info',
  ]) {
    assert.ok(!allUrls.some(u => u.includes(dead)), `dead/mismatched/bot-gated URL substring still present: ${dead}`);
  }

  // P0-5, P0-6, P2-UX: exact showcase attribution labels on Suetonius Nero 16.2, Celsus 8.12, Porphyry, and Hierocles.
  const s1 = model.sections.find(s => s.id === 'roman-records');
  const s2 = model.sections.find(s => s.id === 'josephus');
  const s3 = model.sections.find(s => s.id === 'pagan-critics');
  const s4 = T.SECTIONS.find(s => s.id === 'rabbinic-sources');
  assert.equal(s1.showcase.sc.right.items[1].ref.label, 'Suetonius, Nero 16.2');
  assert.equal(s3.showcase.sc.left.items[1].ref.label, 'Celsus, in Origen, Contra Celsum 8.12');
  assert.equal(s3.showcase.sc.right.items[0].ref.label, 'Porphyry, in Augustine, City of God 19.23');
  assert.equal(s3.showcase.sc.right.items[1].ref.label, 'Hierocles, in Eusebius, Against Hierocles 2');

  // P0-7, P0-9, P1-10, P1-11, P1-16, P1-19:
  assert.match(T.SECTIONS[0].evaluationMd, /Ida Giovanna Rao/);
  assert.match(s2.showcase.sc.left.titleHtml, /The James Passage \(Near-Consensus Authenticity\)/);
  assert.ok(!s2.showcase.sc.right.items[0].html.includes('principal men'));
  assert.match(s4.classicalMd, /#### Qurʾān 4:157 and Classical Substitution Exegesis/);
  assert.match(s4.evaluationMd, /argue, against \*\*Johann Maier’s\*\* \(1978\) separation thesis, that/);
  assert.match(s4.evaluationMd, /Simon of Cyrene/);

  // P2-UX & P2-TONE: zero raw [#evidence-...] link labels or "legacy anchor" dev-note leaks.
  const allMd = JSON.stringify([T.HEADER, T.SECTIONS, T.CLOSING, WITNESSES]);
  assert.doesNotMatch(allMd, /\[#evidence-/);
  assert.doesNotMatch(allMd, /legacy anchor/i);
  assert.doesNotMatch(allMd, /#evidence-…/);
});

test('Pass 6 full line-by-line fact-check verbatim, museum-registry, and primary-edition locks', () => {
  const byId = Object.fromEntries(WITNESSES.map(w => [w.id, w]));

  // 1. Andresen (1902) cols. 780–781; Baur (1847) pp. 244–245, 331–332; Loisy (1903) p. 386.
  assert.match(T.SECTIONS[0].evaluationMd, /cols\. 780–781/);
  const s5 = T.SECTIONS.find(s => s.id === 'archaeology');
  assert.match(s5.classicalMd, /1847, pp\. 244–245, 331–332/);
  assert.match(s5.classicalMd, /1903, p\. 386/);
  assert.match(byId['pool-of-bethesda'].noteMd, /1903, p\. 386/);
  assert.match(byId['pool-of-bethesda'].noteMd, /1847, pp\. 244–245, 331–332/);

  // 2. Perseus English editions accurately labelled; LacusCurtius Latin chips added on Suetonius.
  assert.ok(!byId['tacitus-annals-15-44'].chips.some(c => /Perseus Latin/.test(c.label)));
  assert.ok(!byId['suetonius-lives-of-the-twelve-caesars'].chips.some(c => /Perseus Latin/.test(c.label)));
  assert.ok(
    byId['suetonius-lives-of-the-twelve-caesars'].chips.some(
      c => c.href === 'https://penelope.uchicago.edu/Thayer/L/Roman/Texts/Suetonius/12Caesars/Claudius*.html',
    ),
  );
  assert.ok(
    byId['suetonius-lives-of-the-twelve-caesars'].chips.some(
      c => c.href === 'https://penelope.uchicago.edu/Thayer/L/Roman/Texts/Suetonius/12Caesars/Nero*.html',
    ),
  );

  // 3. Verified museum/corpus numbers (Caiaphas IAA 91-468 / CIIP I.1 no. 461; Yehoḥanan Rahmani no. 218).
  assert.match(byId['caiaphas-ossuary'].label, /IAA 91-468 \/ \*CIIP\* I\.1, no\. 461/);
  assert.doesNotMatch(byId['caiaphas-ossuary'].label, /1990-596/);
  assert.match(byId['yehohanan-heel-bone'].label, /Rahmani no\. 218/);
  assert.doesNotMatch(byId['yehohanan-heel-bone'].label, /1968-33/);

  // 4. Verbatim primary-edition translations (Fowler, Conybeare, Dods, Crombie, Chadwick, Lightfoot, Hawthorne, McGiffert) & Aramaic אסקיה.
  assert.match(byId['lucian-peregrinus'].quote, /You see, these misguided creatures.*worship the crucified sage/);
  assert.match(byId['celsus-contra-celsum'].quote, /If these men worshipped no other God but one, perhaps they would have a valid argument/);
  assert.match(byId['numenius-on-the-good'].quote, /I know, moreover, that Numenius.*he quotes also a narrative/);
  assert.match(byId['porphyry-against-christians'].quote, /To one who inquired what god he should propitiate in order to recall his wife/);
  assert.match(byId['sossianus-hierocles-against-hierocles-2'].quote, /contrast our own accurate and well-established judgment.*him who wrought such feats/);
  assert.match(byId['babylonian-talmud-gittin-57a'].originalScript.text, /אסקיה/);
  assert.match(byId['polycarp-philippians-12-2'].quote, /who shall believe on our Lord and God Jesus Christ/);
  assert.match(byId['melito-on-the-passover'].quote, /has been destroyed by the right hand of Israel/);
  assert.match(byId['hegesippus-eusebius-hist-eccl-3-20'].quote, /Of the family of the Lord there were still living/);
  assert.match(byId['phos-hilaron'].quote, /O gladsome radiance of the holy glory of the Father immortal/);
  assert.match(byId['claudius-letter-to-alexandrians'].quote, /Wherefore I conjure you yet once again.*sail down to Alexandria from Syria or Egypt/);
  assert.match(byId['acts-of-pilate-forgery'].quote, /to the whole of the empire subject to him, with written commands/);
});
