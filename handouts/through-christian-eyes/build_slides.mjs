// Builds the "Through Christian Eyes" handout as two native, editable Google Slides pages
// (11" × 8.5"), with a 0.5" safe margin on every edge and a 0.25" gutter each side of the fold.
//
// How it works: every text block is measured in headless Chrome with the same fonts and widths
// Slides will use, blocks are stacked per panel (shrinking a panel's font a step at a time until it
// fits), and the result is emitted as raw Slides API requests (text boxes with styled runs, shapes,
// lines) plus a list of QR images to upload.
//
// Usage: node build_slides.mjs <outDir>   → writes requests.json, qr/*.png, qr_placements.json

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || path.join(dir, 'slides_build'); // git-ignored
fs.mkdirSync(path.join(OUT, 'qr'), { recursive: true });
const qrJs = fs.readFileSync(path.resolve(dir, '../../promo_cards/qrcode.min.js'), 'utf-8');

// ---------------------------------------------------------------------------------------------
// Geometry (pt). Page 792 × 612. Safe margin 36 (0.5"). Fold at 396, gutter 18 each side.
// ---------------------------------------------------------------------------------------------
const M = 36, GUT = 12, PAGE_W = 792, PAGE_H = 612;
const PANELS = {
  back: { slide: 'tce_out', x0: M, x1: PAGE_W / 2 - GUT },
  cover: { slide: 'tce_out', x0: PAGE_W / 2 + GUT, x1: PAGE_W - M },
  p2: { slide: 'tce_in', x0: M, x1: PAGE_W / 2 - GUT },
  p3: { slide: 'tce_in', x0: PAGE_W / 2 + GUT, x1: PAGE_W - M },
};
const Y0 = M, Y1 = PAGE_H - M;
const INSET = 7.2; // Slides' fixed text-box padding
const QR_COL = 84, QR_GAP = 7, PAD = 4; // PAD: visible padding inside answer boxes

const C = { ink: '#1C1917', muted: '#57534E', red: '#883432', gold: '#B45309', amber: '#8A4B08', line: '#E2D8CA', quote: '#3B1F14', answerBg: '#F3EBE0', white: '#FFFFFF' };
const HOST = 'readyapologia.com';
const LINKS = {
  preservation: '/discover/quran-preservation', sources: '/evidence/quran_sources', origins: '/discover/origins-of-revelation',
  household: '/discover/convenient-revelations', hadith: '/hadith/', dilemma: '/discover/islamic-dilemma',
  claims: '/evidence/divinity_of_christ', divinity: '/discover/divinity-timeline', history: '/discover/extrabiblical-evidence-for-jesus',
  reliability: '/discover/hadith-reliability',
};

// ---------------------------------------------------------------------------------------------
// Inline markup: **bold**, _italic_, {q:quote}, {c:cite}, {u:url}, {r:red bold}, {a:Amiri}
// ---------------------------------------------------------------------------------------------
function parseRuns(src) {
  const re = /(\*\*[^*]+\*\*|\{q:[^}]+\}|\{c:[^}]+\}|\{u:[^}]+\}|\{r:[^}]+\}|\{a:[^}]+\}|_[^_]+_)/g;
  const runs = []; let last = 0, m;
  while ((m = re.exec(src))) {
    if (m.index > last) runs.push({ t: src.slice(last, m.index), s: '' });
    const tok = m[0];
    if (tok.startsWith('**')) runs.push({ t: tok.slice(2, -2), s: 'b' });
    else if (tok.startsWith('_')) runs.push({ t: tok.slice(1, -1), s: 'i' });
    else {
      const kind = tok[1]; const body = tok.slice(3, -1);
      if (kind === 'q') {
        // quotes may contain {a:…}? keep simple: Amiri marker inside quotes written as ⟪ ⟫
        runs.push({ t: '“' + body + '”', s: 'q' });
      } else runs.push({ t: body, s: kind });
    }
    last = re.lastIndex;
  }
  if (last < src.length) runs.push({ t: src.slice(last), s: '' });
  return runs;
}

// Base paragraph styles. size is filled per panel from the panel's base size S.
function styleFor(kind, S) {
  const base = { font: 'Public Sans', size: S, color: C.ink, align: 'START', spaceBelow: S * 0.35 };
  switch (kind) {
    case 'lead': return { ...base, color: C.muted };
    case 'label': return { ...base, size: S - 1.3, color: C.gold, bold: true, spaceBelow: 0 };
    case 'aside': return { ...base, size: S - 0.5, color: C.muted };
    case 'asideLabel': return { ...base, size: S - 1.3, color: C.muted, bold: true, spaceBelow: 0 };
    case 'pull': return { ...base, spaceBelow: 0 };
    case 'caption': return { ...base, size: 5.2, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0 };
    case 'title': return { ...base, font: 'Literata', size: S + 4.6, color: C.red, bold: true, spaceBelow: 0 };
    case 'small': return { ...base, size: S - 0.8, color: C.muted };
    default: return base;
  }
}
function runStyle(s, S, kind) {
  switch (s) {
    case 'b': return { bold: true };
    case 'i': return { italic: true };
    case 'q': return kind === 'pull'
      ? { font: 'Lora', italic: true, bold: true, color: C.amber, size: S + 2.4 }
      : { font: 'Lora', italic: true, color: C.quote, size: S + 0.3 };
    case 'c': return { color: C.muted, size: Math.max(S - 0.9, 4.5) };
    case 'u': return { font: 'JetBrains Mono', color: C.muted, size: kind === 'caption' ? 4.3 : Math.max(S - 2.2, 4.4) };
    case 'r': return { bold: true, color: C.red };
    case 'a': return { font: 'Amiri' };
    default: return {};
  }
}

// ---------------------------------------------------------------------------------------------
// Content (wording settled in handout_copy.md v3 + Ḥafṣ reference fix)
// ---------------------------------------------------------------------------------------------
const head = (num, title) => ({ type: 'head', num, title });
const text = (kind, paras, opts = {}) => ({ type: 'text', kind, paras: [].concat(paras), ...opts });
const answer = (body, qr) => ({ type: 'text', kind: 'body', paras: ['{r:Our answer.} ' + body], bg: C.answerBg, qr });
const gap = (h) => ({ type: 'gap', h });
const rule = () => ({ type: 'rule' });
const qrs = (id, label, side = 'right', size = 38) => ({ id, label, side, size });

const CONTENT = {
  p2: { S: 7.7, blocks: [
    head(1, 'Was the Qurʾān kept letter for letter?'),
    text('body', ['{q:Surely We have sent down the Reminder, and surely We are indeed its Watchers.} {c:(Qurʾān 15:9)}']),
    text('label', ['THREE COMPANIONS CLOSEST TO THE PROPHET']), rule(),
    text('body', [
      '**Ibn Masʿūd**, the first of four men the Prophet named to learn the Qurʾān from {c:(Bukhārī 3808)}, held that Sūrahs 113 and 114 were not part of it {c:(Bukhārī 4977)}. In reports Ibn Ḥajar calls authentic, he erased them from his copy: {q:they are not from Allah’s Book} {c:(Fatḥ al-Bārī)}.',
      '**Ibn ʿAbbās**, for whom the Prophet prayed {q:O Allah! Bestow on him the knowledge of the Book} {c:(Bukhārī 75)}, recited 2:184 as _yuṭawwaqūnahu_, “those for whom it is a heavy burden”, where today’s Qurʾān has _yuṭīqūnahu_, “those who can afford it”. He said: {q:This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast} {c:(Bukhārī 4505)}. Al-Ṭabarī calls it {q:a recitation that contradicts the Muṣḥafs of the people of Islam}.',
      '**ʿĀʾishah** had a copy written for herself and dictated 2:238 as {q:the middle prayer and the afternoon prayer}: {q:This is how I have heard from the Messenger of Allah} {c:(Muslim 629)}. She also reported a verse of five sucklings: when the Prophet died, {q:they were among what is recited of the Qurʾān} {c:(Muslim 1452a)}. Neither wording is in today’s Qurʾān.',
    ]),
    text('label', ['TODAY’S PRINTED QURʾĀNS']), rule(),
    text('lead', ['Most Qurʾāns print the reading of Ḥafṣ; North and West Africa print Warsh. Both are recited as the Qurʾān.']),
    text('body', [
      '**12:110.** Ḥafṣ: the messengers {q:thought that they had been lied to} (_kudhibū_). Warsh: that they had been called liars (_kudhdhibū_). Asked which it is, ʿĀʾishah answers _kudhdhibū_; offered the other meaning, she says: {q:Allah forbid! The Apostles never suspected their Lord of such a thing} {c:(Bukhārī 4695)}.',
      '**37:12.** Ḥafṣ: {q:you are amazed} (_ʿajibta_, the Prophet). Ḥamzah and al-Kisāʾī, two of the seven canonical readers: “I am amazed” (_ʿajibtu_, God speaking). One vowel changes who speaks.',
      '**Ḥafṣ ibn Sulaymān**, whose reading most Muslims recite: al-Bukhārī said {q:They abandoned him}, and Muslim {q:Abandoned} {c:(Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401)}. {u:readyapologia.com/discover/hadith-reliability/hafs-ibn-sulayman}',
    ]),
    text('label', ['“OLD TALES”']), rule(),
    text('lead', ['When the Qurʾān was first recited, some who heard it said: {q:Old tales! He has written it down, and it is dictated to him morning and evening} (25:5). Some of those tales can still be read: folk stories and human sayings that no one ever held as the word of God.']),
    text('body', [
      '**A rabbi on his own studies.** Rabbi Eliezer (1st–2nd century), _Song of Songs Rabbah_ 1:3: {q:If all the seas were ink, … the swamps were quills, the heavens and the earth were scrolls, and all people were scribes, they would not suffice to write the matters of Torah that I have learned.} **Qurʾān 31:27**, as God’s speech: {q:Even if all the trees on the earth were pens, and the sea (were ink) – (and) extending it (were) seven seas after it – the words of God would (still) not give out.}',
      '**A 2nd-century fable** the Church never accepted, the _Infancy Gospel of Thomas_: the boy Jesus makes birds of clay that fly. Compare 3:49.',
    ], { qr: qrs('sources', '100 parallels with earlier tales and writings', 'right') }),
    gap(2),
    answer('We cannot receive as God’s word, kept letter for letter, a text that its first teachers recited differently, that is printed today in readings that disagree, and that speaks in God’s voice the words of folk tales and human sayings.', qrs('preservation', 'How was the Qurʾān preserved?', 'left')),
  ] },

  p3: { S: 7.0, blocks: [
    head(2, 'How did revelation come to Muhammad?'),
    text('lead', ['Muslims hold that Gabriel brought the Qurʾān. ʿĀʾishah reports how it began.']),
    text('body', [
      '**In the cave of Ḥirāʾ**, Muhammad said: {q:The angel caught me (forcefully) and pressed me so hard that I could not bear it any more}, three times. He went home to his wife Khadījah {q:with his heart beating severely}: {q:Cover me! Cover me!… I fear that something may happen to me} {c:(Bukhārī 3)}.',
      '**When revelation paused,** Muhammad {q:became so sad as we have heard that he intended several times to throw himself from the tops of high mountains}; the report says that each time, Gabriel appeared and calmed him {c:(Bukhārī 6982)}.',
      '**A spell** was worked on Muhammad {q:till Allah’s Messenger (ﷺ) started imagining that he had done a thing that he had not really done} {c:(Bukhārī 5763)}.',
      '**Qurʾān 22:52:** with every messenger and prophet, {q:Satan cast (something) into his wishful thinking. But God cancels what Satan casts.}',
    ]),
    answer('When God’s messenger comes to a prophet in the Bible, he strengthens him: {q:Fear not, man greatly beloved: peace be to you, quit yourself like a man, and be strong} (Daniel 10:19). Being seized and pressed past bearing, driven toward a fall, and having the mind clouded is what the Gospel describes of an unclean spirit: {q:whenever it seizes him, it slams him [to the ground]… It has often thrown him both into the fire and into the water to destroy him} (Mark 9:18, 22). We are told to {q:test the spirits to see whether they are from God} (1 John 4:1). Tested this way, we cannot receive this revelation as from the God of the prophets.', qrs('origins', 'His revelation contrasted with the Bible’s prophets', 'left')),
    gap(3),
    head(3, 'Does his life follow the way of the prophets?'),
    text('pull', ['{q:I feel that your Lord hastens in fulfilling your wishes and desires.}', '{c:ʿĀʾishah to Muhammad (Bukhārī 4788)}'], { bar: C.amber }),
    text('body', [
      '**When she said it:** she {q:used to look down upon those ladies who had given themselves to Allah’s Messenger} {c:(Bukhārī 4788)}. Then 33:50 allowed him {q:any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers}, and 33:51 let him {q:put off whomever you please of them.}',
      '**In the same sūrah**, Zayd, his adopted son {c:(Bukhārī 4782)}, divorced his wife, and 33:37 married her to Muhammad: {q:We married her to you, so that there should not be any blame on the believers concerning the wives of their adopted sons.}',
    ], { qr: qrs('household', 'More revelations about his household', 'right') }),
    answer('We read his life in Bukhārī and Muslim beside the Ten Commandments and the Sermon on the Mount, and could not see in it the way of the prophets before him. Read it yourself, topic by topic.', qrs('hadith', 'His life and conduct in Bukhārī and Muslim', 'left')),
    gap(3),
    head(4, 'Which Gospel does the Qurʾān point to?'),
    text('body', ['{q:So let the People of the Gospel judge by what God has sent down in it} {c:(5:47)}. {q:People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel} {c:(5:68)}. Papyri 66 and 75 (2nd–3rd century) already read {q:the Word was God} (John 1:1). Codex Sinaiticus (c. 330–360) holds all four Gospels, with Jesus’ crucifixion and resurrection. Both were copied centuries before 610.']),
    answer('If the Gospel had been changed by then, these verses send Christians to a changed book. If it had not, they send us to the Gospel we still read. That is where we stand.', qrs('dilemma', 'The dilemma, with al-Ṭabarī and Ibn Kathīr', 'right')),
  ] },

  back: { S: 8.3, blocks: [
    head(5, 'Why we worship Jesus as God'),
    text('body', ['{q:My Lord and my God!} {c:(the apostle Thomas to the risen Jesus, John 20:28)}']),
    text('body', ['**He claimed what belongs to God alone.** He told a paralysed man, {q:Son, your sins are forgiven}, and his hearers asked, {q:who can forgive sins but God alone?} (Mark 2:5–7). He said, {q:before Abraham was born, I am} (John 8:58). Asked by the high priest whether he was the Christ, he answered, {q:I am; and you shall see the Son of Man sitting at the right hand of power}, and was condemned for blasphemy (Mark 14:61–64).'],
      { qr: qrs('claims', 'His divinity, verse by verse', 'right', 44) }),
    text('body', ['**His first followers worshipped him as God, long before Nicaea (325).** Friends, enemies and the ground itself agree:',
      '•  Ignatius, bishop of Antioch, on his way to martyrdom, c. AD 107: {q:our God, Jesus Christ} (Ephesians 18).',
      '•  Pliny, a Roman governor, c. AD 112: Christians sang {q:a hymn to Christ as to a god} (Letters 10.96).',
      '•  A Roman wall-carving mocking a Christian before a crucified figure, c. AD 200: {q:Alexamenos worships [his] god.}',
      '•  A prayer hall at Megiddo, c. AD 230: a table offered {q:to God Jesus Christ.}'],
      { qr: qrs('divinity', '42 archaeological finds, from inscriptions to papyri', 'left', 44), tight: true }),
    text('body', ['**His death on the cross is history, told by those with no reason to invent it.** Tacitus, Roman historian, c. AD 116: {q:Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus} (Annals 15.44). The Talmud: {q:On the eve of Passover Yeshu was hanged} (Sanhedrin 43a). The Qurʾān, some 600 years later: {q:they did not kill him, nor did they crucify him} (4:157).'],
      { qr: qrs('history', 'Roman and Jewish sources on Jesus', 'right', 44) }),
    gap(4), rule(),
    text('asideLabel', ['“BUT I DON’T ACCEPT THOSE HADITH.”']),
    text('aside', ['Bukhārī and Muslim are where Muslims learn how the Prophet prayed, how the Hajj is performed and how the Qurʾān was collected (Bukhārī 4986). Set them aside, and those go with them.'],
      { qr: qrs('reliability', 'Can the hadith be trusted?', 'left', 38) }),
  ] },
};

// Closing on the back panel, pinned to the bottom.
const CLOSING = [
  { kind: 'invite', paras: ['We believe God is merciful toward what we could not know, but asks us not to turn away from what we could. If God is the Truth, the least we owe Him is to look honestly at the evidence placed before us, and to pray, as the Qurʾān’s opening prayer asks, to be guided {q:to the straight path} (1:6), wherever it leads and whatever it costs. If you have never read a Gospel, read one. If it is false, you have lost an afternoon. If it is true, you have found everything.'] },
  { kind: 'rule' },
  { kind: 'love', paras: ['Made with love by Orthodox Christians.'] },
  { kind: 'footp', paras: ['Orthodoxy is the faith {q:which the Lord gave, the Apostles preached, and the Fathers kept.} What it teaches about who God is and why Jesus died may be quite different from what you have heard of Christianity in the West: God is not an angry judge to be appeased; He is Love, who became man to heal us and unite us to Himself. Its beliefs and worship are rooted in the practice of the early Church, kept for 2,000 years.'] },
  { kind: 'site', paras: ['smsk.ca'] },
];
const closingStyle = (kind, S) => ({
  invite: { font: 'Public Sans', size: S - 0.3, color: C.ink, align: 'START', spaceBelow: 0 },
  love: { font: 'Literata', size: 9.5, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0 },
  footp: { font: 'Literata', size: 6.6, color: C.muted, italic: true, align: 'CENTER', spaceBelow: 0 },
  site: { font: 'Cinzel', size: 11, color: C.red, bold: true, align: 'CENTER', spaceBelow: 0 },
}[kind]);

// Cover
const COVER = {
  brand: { text: 'ORTHODOX EVANGELISM', st: { font: 'Cinzel', size: 8.5, color: C.red, bold: true, align: 'START', spaceBelow: 0 } },
  kicker: { text: 'AN ANSWER TO A QUESTION WE ARE OFTEN ASKED', st: { font: 'Public Sans', size: 5.8, color: C.gold, bold: true, align: 'END', spaceBelow: 0 } },
  h1: { text: 'Through Christian Eyes', st: { font: 'Literata', size: 30, color: C.red, bold: true, weight: 800, align: 'START', spaceBelow: 0, lineSpacing: 90 } },
  h2: { text: 'Why We Cannot Accept Islam as Divine Revelation', st: { font: 'Literata', size: 16, color: C.ink, weight: 600, align: 'START', spaceBelow: 0 } },
  intro: { paras: ['Muslim friends often ask us: {r:“You honour Moses and Jesus. Why not Muhammad too?”}', 'This leaflet is our honest answer, given with respect. We have not quoted critics of Islam. Every line comes from the sources Muslims trust most, with the reference printed so you can check it yourself.'],
    st: { font: 'Literata', size: 9.8, color: C.ink, align: 'START', spaceBelow: 8 } },
  pledge: { paras: ['OUR SOURCES', 'Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim · Tafsīr al-Ṭabarī · Tafsīr Ibn Kathīr · the Qurʾān as printed today (Ḥafṣ and Warsh)'],
    st: { font: 'Public Sans', size: 8.6, color: C.ink, bold: true, align: 'START', spaceBelow: 2 } },
  toc: ['Was the Qurʾān kept letter for letter?', 'How did revelation come to Muhammad?', 'Does his life follow the way of the prophets?', 'Which Gospel does the Qurʾān point to?', 'Why we worship Jesus as God'],
  tocSt: { font: 'Public Sans', size: 9.2, color: C.ink, align: 'START', spaceBelow: 0 },
};

// ---------------------------------------------------------------------------------------------
// Measurement in Chrome
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function cssOf(st) {
  return `font-family:'${st.font}';font-size:${st.size}pt;color:${st.color};${st.bold ? 'font-weight:700;' : ''}${st.weight ? `font-weight:${st.weight};` : ''}${st.italic ? 'font-style:italic;' : ''}`;
}
function runsHtml(runs, st, kind) {
  return runs.map((r) => {
    const rs = { ...runStyle(r.s, st.size, kind) };
    const css = `${rs.font ? `font-family:'${rs.font}';` : ''}${rs.size ? `font-size:${rs.size}pt;` : ''}${rs.color ? `color:${rs.color};` : ''}${rs.bold ? 'font-weight:700;' : ''}${rs.italic ? 'font-style:italic;' : ''}`;
    return css ? `<span style="${css}">${esc(r.t)}</span>` : esc(r.t);
  }).join('');
}
function boxHtml(id, width, paras, st, kind) {
  const ls = (st.lineSpacing || 100) / 100;
  const ps = paras.map((p, i) => `<p style="margin:0 0 ${i < paras.length - 1 ? st.spaceBelow : 0}pt 0;text-align:${st.align === 'CENTER' ? 'center' : st.align === 'END' ? 'right' : 'left'};">${runsHtml(parseRuns(p), st, kind)}</p>`).join('');
  return `<div class="m" id="${id}" style="width:${width}pt;${cssOf(st)}line-height:${ls === 1 ? 'normal' : ls * 1.2};">${ps}</div>`;
}
function measure(items) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..700&family=Public+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@700&family=Lora:ital,wght@1,400;1,700&family=JetBrains+Mono&display=swap');
    body{margin:0} .m{position:relative;margin-bottom:20px;overflow-wrap:break-word}
    </style></head><body>${items.map((it) => boxHtml(it.id, it.width, it.paras, it.st, it.kind)).join('')}
    <pre id="out"></pre><script>
    document.fonts.ready.then(()=>{ const o={}; document.querySelectorAll('.m').forEach(e=>o[e.id]=e.getBoundingClientRect().height*0.75); document.getElementById('out').textContent=JSON.stringify(o); });
    </script></body></html>`;
  const f = path.join(OUT, 'measure.html'); fs.writeFileSync(f, html);
  const dom = execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=10000 --dump-dom "file://${f}"`, { maxBuffer: 64 << 20 }).toString();
  const m = dom.match(/<pre id="out">(.*?)<\/pre>/s);
  return JSON.parse(m[1].replace(/&quot;/g, '"'));
}

// ---------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------
function capParas(label, id) { return [`**${label}**`, `{u:${(HOST + LINKS[id])}}`]; }
const capSt = { font: 'Public Sans', size: 5, color: C.red, align: 'CENTER', spaceBelow: 0.5 };

function layoutPanel(name, S) {
  const P = PANELS[name], W = P.x1 - P.x0;
  const blocks = CONTENT[name].blocks;
  // 1. collect measure items
  const items = [];
  blocks.forEach((b, i) => {
    if (b.type === 'head') items.push({ id: `${name}_${i}`, width: W - 19, paras: [b.title], st: styleFor('title', S), kind: 'title' });
    if (b.type === 'text') {
      const st = styleFor(b.kind, S); if (b.tight) st.spaceBelow = S * 0.15;
      let w = b.qr ? W - QR_COL - QR_GAP : W;
      if (b.bg) w -= 2 * PAD; // padded box
      if (b.bar) w -= 8;
      items.push({ id: `${name}_${i}`, width: w, paras: b.paras, st, kind: b.kind });
      if (b.qr) items.push({ id: `${name}_${i}_cap`, width: QR_COL, paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
    }
  });
  if (name === 'back') CLOSING.forEach((c, j) => { if (c.paras) items.push({ id: `close_${j}`, width: W, paras: c.paras, st: closingStyle(c.kind, S), kind: c.kind }); });
  const H = measure(items);
  // 2. stack
  const out = []; let y = Y0;
  blocks.forEach((b, i) => {
    const id = `${name}_${i}`;
    if (b.type === 'gap') { y += b.h; return; }
    if (b.type === 'rule') { out.push({ t: 'line', x: P.x0, y: y + 1, w: W }); y += 4; return; }
    if (b.type === 'head') {
      if (i > 0) y += 4;
      const h = H[id];
      out.push({ t: 'circle', x: P.x0, y: y + (h - 14) / 2, d: 14, num: b.num });
      out.push({ t: 'text', x: P.x0 + 19, y, w: W - 19, h, paras: [b.title], st: styleFor('title', S), kind: 'title' });
      y += h + 4; return;
    }
    const st = styleFor(b.kind, S); if (b.tight) st.spaceBelow = S * 0.15;
    const hText = H[id];
    let bodyX = P.x0, bodyW = W, qrX = null;
    if (b.qr) {
      bodyW = W - QR_COL - QR_GAP;
      if (b.qr.side === 'left') { qrX = P.x0; bodyX = P.x0 + QR_COL + QR_GAP; } else { qrX = P.x1 - QR_COL; }
    }
    const boxH = b.bg ? hText + 2 * PAD : hText;
    const qrH = b.qr ? b.qr.size + 3 + H[`${id}_cap`] : 0;
    const rowH = Math.max(boxH, qrH);
    const ty = y + (rowH - boxH) / 2;
    if (b.bar) {
      out.push({ t: 'bar', x: bodyX, y: ty, h: hText, color: b.bar });
      out.push({ t: 'text', x: bodyX + 8, y: ty, w: bodyW - 8, h: hText, paras: b.paras, st, kind: b.kind });
    } else {
      if (b.bg) {
        out.push({ t: 'rect', x: bodyX, y: ty, w: bodyW, h: boxH, color: b.bg });
        out.push({ t: 'bar', x: bodyX, y: ty, h: boxH, color: C.red });
        out.push({ t: 'text', x: bodyX + PAD, y: ty + PAD, w: bodyW - 2 * PAD, h: hText, paras: b.paras, st, kind: b.kind });
      } else out.push({ t: 'text', x: bodyX, y: ty, w: bodyW, h: hText, paras: b.paras, st, kind: b.kind });
    }
    if (b.qr) {
      const qy = y + (rowH - qrH) / 2;
      out.push({ t: 'qr', id: b.qr.id, x: qrX + (QR_COL - b.qr.size) / 2, y: qy, size: b.qr.size });
      out.push({ t: 'text', x: qrX, y: qy + b.qr.size + 3, w: QR_COL, h: H[`${id}_cap`], paras: capParas(b.qr.label, b.qr.id), st: capSt, kind: 'caption' });
    }
    y += rowH + (b.kind === 'label' ? 1 : 4);
  });
  let bottom = y;
  if (name === 'back') {
    // closing pinned to bottom
    let ch = 0; const parts = [];
    CLOSING.forEach((c, j) => {
      if (c.kind === 'rule') { parts.push({ t: 'line', h: 8 }); ch += 8; return; }
      const h = H[`close_${j}`]; parts.push({ t: 'text', h, paras: c.paras, st: closingStyle(c.kind, S), kind: c.kind }); ch += h + 3;
    });
    let cy = Y1 - ch; const closeTop = cy;
    out.push({ t: 'line', x: P.x0, y: cy - 6, w: W });
    parts.forEach((p) => {
      if (p.t === 'line') { out.push({ t: 'line', x: P.x0, y: cy + 3, w: W }); cy += 8; return; }
      out.push({ t: 'text', x: P.x0, y: cy, w: W, h: p.h, paras: p.paras, st: p.st, kind: p.kind }); cy += p.h + 3;
    });
    bottom = y + (Y1 - closeTop) + 10; // must leave ≥10pt between body and closing
  }
  return { out, bottom, fits: bottom <= Y1 };
}

function layoutCover() {
  const P = PANELS.cover, W = P.x1 - P.x0;
  const items = [
    { id: 'c_h1', width: W, paras: [COVER.h1.text], st: COVER.h1.st },
    { id: 'c_h2', width: W, paras: [COVER.h2.text], st: COVER.h2.st },
    { id: 'c_intro', width: W, paras: COVER.intro.paras, st: COVER.intro.st },
    { id: 'c_pledge', width: W - 10, paras: COVER.pledge.paras, st: COVER.pledge.st },
    { id: 'c_toc', width: W - 20, paras: ['X'], st: COVER.tocSt },
    { id: 'c_brand', width: W / 2, paras: [COVER.brand.text], st: COVER.brand.st },
  ];
  const H = measure(items);
  const out = [];
  const tocLine = H.c_toc + 6;
  const groups = [
    { h: H.c_brand, draw: (y) => {
      out.push({ t: 'text', x: P.x0, y, w: W / 2, h: H.c_brand, paras: [COVER.brand.text], st: COVER.brand.st });
      out.push({ t: 'text', x: P.x0 + W / 2, y: y + 1.5, w: W / 2, h: H.c_brand, paras: [COVER.kicker.text], st: COVER.kicker.st });
    } },
    { h: H.c_h1 + 14 + H.c_h2, draw: (y) => {
      out.push({ t: 'text', x: P.x0, y, w: W, h: H.c_h1, paras: [COVER.h1.text], st: COVER.h1.st });
      out.push({ t: 'rect', x: P.x0, y: y + H.c_h1 + 5, w: 64, h: 2.5, color: C.gold });
      out.push({ t: 'text', x: P.x0, y: y + H.c_h1 + 14, w: W, h: H.c_h2, paras: [COVER.h2.text], st: COVER.h2.st });
    } },
    { h: H.c_intro, draw: (y) => out.push({ t: 'text', x: P.x0, y, w: W, h: H.c_intro, paras: COVER.intro.paras, st: COVER.intro.st }) },
    { h: H.c_pledge, draw: (y) => {
      out.push({ t: 'bar', x: P.x0, y, h: H.c_pledge, color: C.red });
      out.push({ t: 'text', x: P.x0 + 10, y, w: W - 10, h: H.c_pledge, paras: COVER.pledge.paras, st: COVER.pledge.st, kind: 'pledge' });
    } },
    { h: tocLine * 5, draw: (y) => COVER.toc.forEach((t, k) => {
      const ly = y + k * tocLine;
      out.push({ t: 'circle', x: P.x0, y: ly + (H.c_toc - 13) / 2, d: 13, num: k + 1 });
      out.push({ t: 'text', x: P.x0 + 20, y: ly, w: W - 20, h: H.c_toc, paras: [t], st: COVER.tocSt });
      out.push({ t: 'line', x: P.x0, y: ly + H.c_toc + 3, w: W });
    }) },
  ];
  const total = groups.reduce((s, g) => s + g.h, 0);
  const free = (Y1 - Y0) - total; const g = free / (groups.length - 1);
  let y = Y0; groups.forEach((gr) => { gr.draw(y); y += gr.h + g; });
  return { out };
}

// ---------------------------------------------------------------------------------------------
// Fit each panel
// ---------------------------------------------------------------------------------------------
const layouts = {};
for (const name of ['p2', 'p3', 'back']) {
  let S = CONTENT[name].S, L;
  for (;;) {
    L = layoutPanel(name, S);
    console.log(`${name}: S=${S.toFixed(2)} bottom=${L.bottom.toFixed(1)} (limit ${Y1})`);
    if (L.fits || S < 5.8) break;
    S = +(S - 0.1).toFixed(2);
  }
  layouts[name] = L.out;
}
layouts.cover = layoutCover().out;

// ---------------------------------------------------------------------------------------------
// Emit Slides requests
// ---------------------------------------------------------------------------------------------
const rgb = (hex) => ({ red: parseInt(hex.slice(1, 3), 16) / 255, green: parseInt(hex.slice(3, 5), 16) / 255, blue: parseInt(hex.slice(5, 7), 16) / 255 });
const pt = (v) => ({ magnitude: +v.toFixed(2), unit: 'PT' });
const reqs = [];
const qrPlacements = [];
let n = 0;
const ep = (slide, x, y, w, h) => ({ pageObjectId: slide, size: { width: pt(w), height: pt(h) }, transform: { scaleX: 1, scaleY: 1, translateX: +x.toFixed(2), translateY: +y.toFixed(2), unit: 'PT' } });

function textStyleReq(id, st, range) {
  const style = { foregroundColor: { opaqueColor: { rgbColor: rgb(st.color) } }, fontSize: pt(st.size), bold: !!st.bold, italic: !!st.italic };
  const fields = ['foregroundColor', 'fontSize', 'bold', 'italic'];
  if (st.font) { style.weightedFontFamily = { fontFamily: st.font, weight: st.weight || (st.bold ? 700 : 400) }; fields.push('weightedFontFamily'); }
  return { updateTextStyle: { objectId: id, textRange: range, style, fields: fields.join(',') } };
}
function emitText(slide, el) {
  const id = `tce_${slide === 'tce_out' ? 'o' : 'i'}_${++n}`;
  const padded = !!el.bg;
  const x = padded ? el.x : el.x - INSET, y = padded ? el.y : el.y - INSET;
  const w = padded ? el.w : el.w + 2 * INSET, h = (padded ? el.h + 2 * INSET : el.h + 2 * INSET) + 2;
  reqs.push({ createShape: { objectId: id, shapeType: 'TEXT_BOX', elementProperties: ep(slide, x, y, w, h) } });
  const paraRuns = el.paras.map(parseRuns);
  const full = paraRuns.map((rs) => rs.map((r) => r.t).join('')).join('\n');
  reqs.push({ insertText: { objectId: id, text: full, insertionIndex: 0 } });
  reqs.push(textStyleReq(id, el.st, { type: 'ALL' }));
  reqs.push({ updateParagraphStyle: { objectId: id, textRange: { type: 'ALL' }, style: { lineSpacing: el.st.lineSpacing || 100, spaceAbove: pt(0), spaceBelow: pt(el.st.spaceBelow || 0), alignment: el.st.align || 'START' }, fields: 'lineSpacing,spaceAbove,spaceBelow,alignment' } });
  // last paragraph: no space below
  let idx = 0;
  paraRuns.forEach((rs) => {
    rs.forEach((r) => {
      const len = r.t.length;
      if (r.s) {
        const rs2 = runStyle(r.s, el.st.size, el.kind);
        const st = { ...el.st, ...rs2 };
        if (rs2.font === undefined) st.font = el.st.font;
        reqs.push(textStyleReq(id, st, { type: 'FIXED_RANGE', startIndex: idx, endIndex: idx + len }));
      }
      idx += len;
    });
    idx += 1; // newline
  });
  if (el.kind === 'pledge') {
    const first = el.paras[0].length;
    reqs.push(textStyleReq(id, { ...el.st, size: 6.2, color: C.red }, { type: 'FIXED_RANGE', startIndex: 0, endIndex: first }));
  }
  const props = { contentAlignment: 'TOP', autofit: { autofitType: 'NONE' } };
  let fields = 'contentAlignment,autofit.autofitType';
  if (padded) { props.shapeBackgroundFill = { solidFill: { color: { rgbColor: rgb(el.bg) } } }; fields += ',shapeBackgroundFill.solidFill.color'; }
  reqs.push({ updateShapeProperties: { objectId: id, shapeProperties: props, fields } });
}
function emit(slide, els) {
  for (const el of els) {
    if (el.t === 'text') emitText(slide, el);
    else if (el.t === 'line') {
      const id = `tce_l_${++n}`;
      reqs.push({ createLine: { objectId: id, lineCategory: 'STRAIGHT', elementProperties: ep(slide, el.x, el.y, el.w, 0.01) } });
      reqs.push({ updateLineProperties: { objectId: id, lineProperties: { lineFill: { solidFill: { color: { rgbColor: rgb(C.line) } } }, weight: pt(0.75) }, fields: 'lineFill.solidFill.color,weight' } });
    } else if (el.t === 'circle') {
      const id = `tce_c_${++n}`;
      reqs.push({ createShape: { objectId: id, shapeType: 'ELLIPSE', elementProperties: ep(slide, el.x, el.y, el.d, el.d) } });
      reqs.push({ updateShapeProperties: { objectId: id, shapeProperties: { shapeBackgroundFill: { solidFill: { color: { rgbColor: rgb(C.red) } } }, outline: { propertyState: 'NOT_RENDERED' }, contentAlignment: 'MIDDLE' }, fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState,contentAlignment' } });
      reqs.push({ insertText: { objectId: id, text: String(el.num), insertionIndex: 0 } });
      reqs.push(textStyleReq(id, { font: 'Cinzel', size: el.d * 0.5, color: C.white, bold: true }, { type: 'ALL' }));
      reqs.push({ updateParagraphStyle: { objectId: id, textRange: { type: 'ALL' }, style: { alignment: 'CENTER' }, fields: 'alignment' } });
    } else if (el.t === 'bar' || el.t === 'rect') {
      const id = `tce_r_${++n}`;
      const w = el.t === 'bar' ? 2.5 : el.w;
      reqs.push({ createShape: { objectId: id, shapeType: 'RECTANGLE', elementProperties: ep(slide, el.x, el.y, w, el.h) } });
      reqs.push({ updateShapeProperties: { objectId: id, shapeProperties: { shapeBackgroundFill: { solidFill: { color: { rgbColor: rgb(el.color) } } }, outline: { propertyState: 'NOT_RENDERED' } }, fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState' } });
    } else if (el.t === 'qr') {
      qrPlacements.push({ slide, id: el.id, url: `https://${HOST}${LINKS[el.id]}`, x: +el.x.toFixed(2), y: +el.y.toFixed(2), size: el.size });
    }
  }
}
reqs.push({ createSlide: { objectId: 'tce_out', insertionIndex: Number(process.env.INSERT_AT || 38), slideLayoutReference: { predefinedLayout: 'BLANK' } } });
reqs.push({ createSlide: { objectId: 'tce_in', insertionIndex: Number(process.env.INSERT_AT || 38) + 1, slideLayoutReference: { predefinedLayout: 'BLANK' } } });
emit('tce_out', layouts.back); emit('tce_out', layouts.cover); emit('tce_in', layouts.p2); emit('tce_in', layouts.p3);
// fold guide (light, outside the print-critical area: a thin dashed line would print; skip)
fs.writeFileSync(path.join(OUT, 'requests.json'), JSON.stringify(reqs, null, 1));
fs.writeFileSync(path.join(OUT, 'qr_placements.json'), JSON.stringify(qrPlacements, null, 1));

// QR PNGs (rendered by Chrome with the same library as the PDF)
for (const q of qrPlacements) {
  const f = path.join(OUT, 'qr', `${q.id}.html`);
  fs.writeFileSync(f, `<!DOCTYPE html><html><body style="margin:0;background:#fff"><div id="q" style="padding:16px"></div><script>${qrJs}</script><script>new QRCode(document.getElementById('q'),{text:${JSON.stringify(q.url)},width:368,height:368,colorDark:'#2A0F0E',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});</script></body></html>`);
  execSync(`/usr/bin/google-chrome --headless --disable-gpu --hide-scrollbars --window-size=400,400 --screenshot="${path.join(OUT, 'qr', q.id + '.png')}" "file://${f}"`, { stdio: 'ignore' });
}
console.log(`requests: ${reqs.length}, qr: ${qrPlacements.length}`);
