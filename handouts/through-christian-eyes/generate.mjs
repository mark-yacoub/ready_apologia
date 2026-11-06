// Bi-fold handout: "Through Christian Eyes: Why We Cannot Accept Islam as Divine Revelation".
// From Orthodox Evangelism, St. Moses & St. Katherine Coptic Orthodox Church (smsk.ca).
//
// US Letter landscape (11" × 8.5"), printed double-sided and folded once into four 5.5" × 8.5" panels.
//   Sheet 1 (outside): left = Panel 4 (back cover), right = Panel 1 (front cover)
//   Sheet 2 (inside):  left = Panel 2,              right = Panel 3
// Print: 100% / actual size, duplex "flip on short edge".
//
// Every quotation is verbatim from its cited source; sources.md records where each was checked.
// Quotations of Scripture, Qurʾān, hadith and commentary are wrapped in q`…` so they print in the quote face.
// Run:  NODE=$(ls ~/.vscode-server/cli/servers/*/server/node | head -1); $NODE handouts/through-christian-eyes/generate.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const qrJs = fs.readFileSync(path.resolve(dir, '../../promo_cards/qrcode.min.js'), 'utf-8');

const HOST = 'readyapologia.com';
const LINKS = {
  preservation: '/discover/quran-preservation',
  sources: '/evidence/quran_sources',
  origins: '/discover/origins-of-revelation',
  household: '/discover/convenient-revelations',
  hadith: '/hadith/',
  dilemma: '/discover/islamic-dilemma',
  claims: '/evidence/divinity_of_christ',
  divinity: '/discover/divinity-timeline',
  history: '/discover/extrabiblical-evidence-for-jesus',
  reliability: '/discover/hadith-reliability',
};

const C = { ink: '#1C1917', muted: '#57534E', red: '#883432', gold: '#B45309', paper: '#FBF8F3', line: '#E2D8CA', quote: '#3B1F14' };

/** A quotation from a source (Scripture, Qurʾān, hadith, commentary): printed in the quote face. */
const q = (s, ...v) => `<span class="q">“${String.raw(s, ...v)}”</span>`;

/** QR code with its label and full printed link. side: 'left' | 'right' sets text alignment. */
const qr = (id, label, { size = 0.68, side = 'right' } = {}) => `
  <figure class="qr qr-${side}">
    <div class="qr-code" data-qr="https://${HOST}${LINKS[id]}" style="width:${size}in;height:${size}in"></div>
    <figcaption><b>${label}</b><span class="url">${(HOST + LINKS[id]).replace(/\//g, '/<wbr>')}</span></figcaption>
  </figure>`;

/** A paragraph with a QR code beside it (left or right). */
const withQr = (body, id, label, side = 'right', size) => `
  <div class="with-qr ${side}">
    ${side === 'left' ? qr(id, label, { size, side }) : ''}
    <div class="with-qr-body">${body}</div>
    ${side === 'right' ? qr(id, label, { size, side }) : ''}
  </div>`;

const hz = '<span class="hz">ʾ</span>'; // tightens the hamza glyph in the serif headings

// ---------------------------------------------------------------------------------------------
// PANEL 1: FRONT COVER
// ---------------------------------------------------------------------------------------------
const panel1 = `
<section class="panel cover">
  <div class="cover-top">
    <div class="brand">ORTHODOX EVANGELISM</div>
    <div class="kicker">An answer to a question we are often asked</div>
  </div>

  <div class="cover-title">
    <h1>Through Christian Eyes</h1>
    <div class="rule"></div>
    <h2>Why We Cannot Accept Islam as Divine Revelation</h2>
  </div>

  <p class="cover-intro">Muslim friends often ask us: <em>“You honour Moses and Jesus. Why not Muhammad too?”</em></p>
  <p class="cover-intro">This leaflet is our honest answer, given with respect. We have not quoted critics of Islam. Every line comes from the sources Muslims trust most, with the reference printed so you can check it yourself.</p>

  <div class="pledge">
    <div class="pledge-h">Our sources</div>
    <div class="pledge-list">Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim · Tafsīr al-Ṭabarī · Tafsīr Ibn Kathīr · the Qurʾān as printed today (Ḥafṣ and Warsh)</div>
  </div>

  <ol class="toc">
    <li><span>1</span> Was the Qurʾān kept letter for letter?</li>
    <li><span>2</span> How did revelation come to Muhammad?</li>
    <li><span>3</span> Does his life follow the way of the prophets?</li>
    <li><span>4</span> Which Gospel does the Qurʾān point to?</li>
    <li><span>5</span> Why we worship Jesus as God</li>
  </ol>
</section>`;

// ---------------------------------------------------------------------------------------------
// PANEL 2: INSIDE LEFT (Q1)
// ---------------------------------------------------------------------------------------------
const answer = (html) => `<div class="answer"><span class="answer-h">Our answer.</span> ${html}</div>`;

const panel2 = `
<section class="panel p2">
  <div class="sec-head"><span class="sec-num">1</span><h3>Was the Qur${hz}ān kept letter for letter?</h3></div>
  <p class="claim">${q`Surely We have sent down the Reminder, and surely We are indeed its Watchers.`} <cite>(Qurʾān 15:9)</cite></p>

  <h4>Three Companions closest to the Prophet</h4>

  <div class="entry">
    <b>Ibn Masʿūd</b>, the first of four men the Prophet named to learn the Qurʾān from <cite>(Bukhārī 3808)</cite>, held that Sūrahs 113 and 114 were not part of it <cite>(Bukhārī 4977)</cite>. In reports Ibn Ḥajar calls authentic, he erased them from his copy: ${q`they are not from Allah’s Book`} <cite>(Fatḥ al-Bārī)</cite>.
  </div>

  <div class="entry">
    <b>Ibn ʿAbbās</b>, for whom the Prophet prayed ${q`O Allah! Bestow on him the knowledge of the Book`} <cite>(Bukhārī 75)</cite>, recited 2:184 as <i>yuṭawwaqūnahu</i>, “those for whom it is a heavy burden”, where today’s Qurʾān has <i>yuṭīqūnahu</i>, “those who can afford it”. He said: ${q`This Verse is not abrogated, but it is meant for old men and old women who have no strength to fast`} <cite>(Bukhārī 4505)</cite>. Al-Ṭabarī calls it ${q`a recitation that contradicts the Muṣḥafs of the people of Islam`}.
  </div>

  <div class="entry">
    <b>ʿĀʾishah</b> had a copy written for herself and dictated 2:238 as ${q`the middle prayer <u>and the afternoon prayer</u>`}: ${q`This is how I have heard from the Messenger of Allah`} <cite>(Muslim 629)</cite>. She also reported a verse of five sucklings: when the Prophet died, ${q`they were among what is recited of the Qur${hz}ān`} <cite>(Muslim 1452a)</cite>. Neither wording is in today’s Qurʾān.
  </div>

  <h4>Today’s printed Qurʾāns</h4>
  <p class="lead-in">Most Qurʾāns print the reading of Ḥafṣ; North and West Africa print Warsh. Both are recited as the Qurʾān.</p>

  <div class="entry">
    <b>12:110.</b> Ḥafṣ: the messengers ${q`thought that they had been <u>lied to</u>`} (<i>kudhibū</i>). Warsh: that they had been <u>called liars</u> (<i>kudhdhibū</i>). Asked which it is, ʿĀʾishah answers <i>kudhdhibū</i>; offered the other meaning, she says: ${q`Allah forbid! The Apostles never suspected their Lord of such a thing`} <cite>(Bukhārī 4695)</cite>.
  </div>

  <div class="entry">
    <b>37:12.</b> Ḥafṣ: ${q`<u>you</u> are amazed`} (<i>ʿajibta</i>, the Prophet). Ḥamzah and al-Kisāʾī, two of the seven canonical readers: “<u>I</u> am amazed” (<i>ʿajibtu</i>, God speaking). One vowel changes who speaks.
  </div>

  <div class="entry">
    <b>Ḥafṣ ibn Sulaymān</b>, whose reading most Muslims recite: al-Bukhārī said ${q`They abandoned him`}, and Muslim ${q`Abandoned`} <cite>(Ibn Ḥajar, Tahdhīb al-Tahdhīb 2/401)</cite>. <span class="inline-url">readyapologia.com/discover/hadith-reliability/hafs-ibn-sulayman</span>
  </div>

  <h4>“Old tales”</h4>
  <p class="lead-in">When the Qurʾān was first recited, some who heard it said: ${q`Old tales! He has written it down, and it is dictated to him morning and evening`} (25:5). Some of those tales can still be read: folk stories and human sayings that no one ever held as the word of God.</p>
  ${withQr(`
    <div class="entry"><b>A rabbi on his own studies.</b> Rabbi Eliezer (1st–2nd century), <i>Song of Songs Rabbah</i> 1:3: ${q`If all the seas were ink, … the swamps were quills, the heavens and the earth were scrolls, and all people were scribes, they would not suffice to write the matters of Torah that I have learned.`} <b>Qurʾān 31:27</b>, as God’s speech: ${q`Even if all the trees on the earth were pens, and the sea (were ink) – (and) extending it (were) seven seas after it – the words of God would (still) not give out.`}</div>
    <div class="entry"><b>A 2nd-century fable</b> the Church never accepted, the <i>Infancy Gospel of Thomas</i>: the boy Jesus makes birds of clay that fly. Compare 3:49.</div>`,
    'sources', '100 parallels with earlier tales and writings', 'right', 0.58)}

  ${withQr(answer(`We cannot receive as God’s word, kept letter for letter, a text that its first teachers recited differently, that is printed today in readings that disagree, and that speaks in God’s voice the words of folk tales and human sayings.`),
    'preservation', 'How was the Qurʾān preserved?', 'left', 0.6)}
</section>`;

// ---------------------------------------------------------------------------------------------
// PANEL 3: INSIDE RIGHT (Q2, Q3, Q4)
// ---------------------------------------------------------------------------------------------
const panel3 = `
<section class="panel p3">
  <div class="sec-head"><span class="sec-num">2</span><h3>How did revelation come to Muhammad?</h3></div>
  <p class="lead-in">Muslims hold that Gabriel brought the Qurʾān. ʿĀʾishah reports how it began.</p>

  <div class="entry"><b>In the cave of Ḥirāʾ</b>, Muhammad said: ${q`The angel caught me (forcefully) and pressed me so hard that I could not bear it any more`}, three times. He went home to his wife Khadījah ${q`with his heart beating severely`}: ${q`Cover me! Cover me!… I fear that something may happen to me`} <cite>(Bukhārī 3)</cite>.</div>
  <div class="entry"><b>When revelation paused,</b> Muhammad ${q`became so sad as we have heard that he intended several times to throw himself from the tops of high mountains`}; the report says that each time, Gabriel appeared and calmed him <cite>(Bukhārī 6982)</cite>.</div>
  <div class="entry"><b>A spell</b> was worked on Muhammad ${q`till Allah’s Messenger <span class="ar">(ﷺ)</span> started imagining that he had done a thing that he had not really done`} <cite>(Bukhārī 5763)</cite>.</div>
  <div class="entry"><b>Qurʾān 22:52:</b> with every messenger and prophet, ${q`Satan cast (something) into his wishful thinking. But God cancels what Satan casts.`}</div>

  ${withQr(answer(`When God’s messenger comes to a prophet in the Bible, he strengthens him: ${q`Fear not, man greatly beloved: peace be to you, quit yourself like a man, and be strong`} (Daniel 10:19). Being seized and pressed past bearing, driven toward a fall, and having the mind clouded is what the Gospel describes of an unclean spirit: ${q`whenever it seizes him, it slams him [to the ground]… It has often thrown him both into the fire and into the water to destroy him`} (Mark 9:18, 22). We are told to ${q`test the spirits to see whether they are from God`} (1 John 4:1). Tested this way, we cannot receive this revelation as from the God of the prophets.`),
    'origins', 'His revelation contrasted with the Bible’s prophets', 'left', 0.5)}

  <div class="sec-head"><span class="sec-num">3</span><h3>Does his life follow the way of the prophets?</h3></div>
  <p class="pull">${q`I feel that your Lord hastens in fulfilling your wishes and desires.`} <cite>ʿĀʾishah to Muhammad (Bukhārī 4788)</cite></p>
  ${withQr(`
    <div class="entry"><b>When she said it:</b> she ${q`used to look down upon those ladies who had given themselves to Allah’s Messenger`} <cite>(Bukhārī 4788)</cite>. Then 33:50 allowed him ${q`any believing woman, if she gives herself to the prophet… (That is) exclusively for you, apart from the believers`}, and 33:51 let him ${q`put off whomever you please of them.`}</div>
    <div class="entry"><b>In the same sūrah</b>, Zayd, his adopted son <cite>(Bukhārī 4782)</cite>, divorced his wife, and 33:37 married her to Muhammad: ${q`We married her to you, so that there should not be any blame on the believers concerning the wives of their adopted sons.`}</div>`,
    'household', 'More revelations about his household', 'right', 0.5)}
  ${withQr(answer(`We read his life in Bukhārī and Muslim beside the Ten Commandments and the Sermon on the Mount, and could not see in it the way of the prophets before him. Read it yourself, topic by topic.`),
    'hadith', 'His life and conduct in Bukhārī and Muslim', 'left', 0.5)}

  <div class="sec-head"><span class="sec-num">4</span><h3>Which Gospel does the Qur${hz}ān point to?</h3></div>
  <div class="entry">${q`So let the People of the Gospel judge by what God has sent down in it`} <cite>(5:47)</cite>. ${q`People of the Book! You are (standing) on nothing until you observe the Torah and the Gospel`} <cite>(5:68)</cite>. Papyri 66 and 75 (2nd–3rd century) already read ${q`the Word was God`} (John 1:1). Codex Sinaiticus (c. 330–360) holds all four Gospels, with Jesus’ crucifixion and resurrection. Both were copied centuries before 610.</div>
  ${withQr(answer(`If the Gospel had been changed by then, these verses send Christians to a changed book. If it had not, they send us to the Gospel we still read. That is where we stand.`),
    'dilemma', 'The dilemma, with al-Ṭabarī and Ibn Kathīr', 'right', 0.5)}
</section>`;

// ---------------------------------------------------------------------------------------------
// PANEL 4: BACK COVER
// ---------------------------------------------------------------------------------------------
const panel4 = `
<section class="panel back">
  <div class="sec-head"><span class="sec-num">5</span><h3>Why we worship Jesus as God</h3></div>
  <p class="claim">${q`My Lord and my God!`} <cite>(the apostle Thomas to the risen Jesus, John 20:28)</cite></p>

  ${withQr(`
    <div class="entry"><b>He claimed what belongs to God alone.</b> He told a paralysed man, ${q`Son, your sins are forgiven`}, and his hearers asked, ${q`who can forgive sins but God alone?`} (Mark 2:5–7). He said, ${q`before Abraham was born, I am`} (John 8:58). Asked by the high priest whether he was the Christ, he answered, ${q`I am; and you shall see the Son of Man sitting at the right hand of power`}, and was condemned for blasphemy (Mark 14:61–64).</div>`,
    'claims', 'His divinity, verse by verse', 'right', 0.62)}

  ${withQr(`
    <div class="entry"><b>His first followers worshipped him as God, long before Nicaea (325).</b> Friends, enemies and the ground itself agree:
      <ul class="witness">
        <li>Ignatius, bishop of Antioch, on his way to martyrdom, c. AD 107: ${q`our God, Jesus Christ`} (Ephesians 18).</li>
        <li>Pliny, a Roman governor, c. AD 112: Christians sang ${q`a hymn to Christ as to a god`} (Letters 10.96).</li>
        <li>A Roman wall-carving mocking a Christian before a crucified figure, c. AD 200: ${q`Alexamenos worships [his] god.`}</li>
        <li>A prayer hall at Megiddo, c. AD 230: a table offered ${q`to God Jesus Christ.`}</li>
      </ul>
    </div>`,
    'divinity', '42 archaeological finds, from inscriptions to papyri', 'left', 0.62)}

  ${withQr(`
    <div class="entry"><b>His death on the cross is history, told by those with no reason to invent it.</b> Tacitus, Roman historian, c. AD 116: ${q`Christus… suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus`} (Annals 15.44). The Talmud: ${q`On the eve of Passover Yeshu was hanged`} (Sanhedrin 43a). The Qurʾān, some 600 years later: ${q`they did not kill him, nor did they crucify him`} (4:157).</div>`,
    'history', 'Roman and Jewish sources on Jesus', 'right', 0.62)}

  <div class="aside">
    <h5>“But I don’t accept those hadith.”</h5>
    ${withQr(`<p>Bukhārī and Muslim are where Muslims learn how the Prophet prayed, how the Hajj is performed and how the Qurʾān was collected (Bukhārī 4986). Set them aside, and those go with them.</p>`,
      'reliability', 'Can the hadith be trusted?', 'left', 0.54)}
  </div>

  <div class="closing">
    <p class="invite">We believe God is merciful toward what we could not know, but asks us not to turn away from what we could. If God is the Truth, the least we owe Him is to look honestly at the evidence placed before us, and to pray, as the Qurʾān’s opening prayer asks, to be guided ${q`to the straight path`} (1:6), wherever it leads and whatever it costs. If you have never read a Gospel, read one. If it is false, you have lost an afternoon. If it is true, you have found everything.</p>
    <div class="foot">
      <div class="foot-love">Made with love by Orthodox Christians.</div>
      <p>Orthodoxy is the faith ${q`which the Lord gave, the Apostles preached, and the Fathers kept.`} What it teaches about who God is and why Jesus died may be quite different from what you have heard of Christianity in the West: God is not an angry judge to be appeased; He is Love, who became man to heal us and unite us to Himself. Its beliefs and worship are rooted in the practice of the early Church, kept for 2,000 years.</p>
      <div class="foot-site">smsk.ca</div>
    </div>
  </div>
</section>`;

// ---------------------------------------------------------------------------------------------
// DOCUMENT
// ---------------------------------------------------------------------------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..700&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Cinzel:wght@600;700&family=Amiri&family=JetBrains+Mono:wght@500&display=swap');
@page { size: 11in 8.5in; margin: 0; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Public Sans', sans-serif; color: ${C.ink}; }
.sheet { width: 11in; height: 8.5in; display: flex; position: relative; page-break-after: always; overflow: hidden; }
.sheet:last-child { page-break-after: auto; }
.fold { position: absolute; left: 5.5in; top: 0; bottom: 0; border-left: 1px dashed rgba(0,0,0,0.12); }
.panel { width: 5.5in; height: 8.5in; padding: 0.3in 0.34in 0.28in; background: ${C.paper}; display: flex; flex-direction: column; overflow: hidden; font-size: 7.7pt; line-height: 1.31; }

/* headings */
.sec-head { display: flex; align-items: center; gap: 0.07in; margin: 0.04in 0 0.04in; }
.sec-num { font-family: 'Cinzel', serif; font-weight: 700; font-size: 8pt; color: #fff; background: ${C.red}; width: 0.22in; height: 0.22in; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
h3 { font-family: 'Literata', serif; font-size: 12.5pt; line-height: 1.12; color: ${C.red}; font-weight: 800; }
h4 { font-size: 6.4pt; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${C.gold}; margin: 0.06in 0 0.03in; padding-bottom: 0.02in; border-bottom: 1px solid ${C.line}; }
h5 { font-size: 6.4pt; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.muted}; margin-bottom: 0.03in; }
.hz { margin: 0 -0.1em; }
.ar { font-family: 'Amiri', serif; font-style: normal; }
.p3 { font-size: 7.4pt; line-height: 1.27; }
.p3 h3 { font-size: 11.5pt; }
.p3 .with-qr { margin: 0.02in 0 0.05in; }
.p3 .entry { margin-bottom: 0.03in; }
.p3 .sec-head { margin: 0.02in 0 0.025in; }
.p3 .qr figcaption { margin-top: 0.015in; }
.p3 .pull .q { font-size: 9.6pt; }

/* text */
.q { font-family: 'Literata', serif; font-style: italic; color: ${C.quote}; font-size: 1.03em; }
.claim { margin-bottom: 0.03in; color: ${C.muted}; }
.claim .q { font-size: 8.6pt; }
.pull { margin: 0.01in 0 0.04in; padding-left: 0.1in; border-left: 3px solid #8A4B08; }
.pull .q { font-size: 10.5pt; font-weight: 600; color: #8A4B08; }
.pull cite { display: block; margin-top: 0.02in; }
.lead-in { color: ${C.muted}; margin-bottom: 0.04in; }
.entry { margin-bottom: 0.05in; }
.entry:last-child { margin-bottom: 0; }
cite { font-family: 'Public Sans', sans-serif; font-style: normal; color: ${C.muted}; font-size: 6.9pt; white-space: nowrap; }
u { text-decoration: none; background: linear-gradient(transparent 58%, #FDE7C2 58%); }
.inline-url { font-family: 'JetBrains Mono', monospace; font-size: 5.6pt; color: ${C.muted}; white-space: nowrap; }
.small { font-size: 6.9pt; color: ${C.muted}; }
.more { color: ${C.muted}; }
.ours { padding-left: 0.08in; border-left: 2px solid ${C.line}; color: ${C.ink}; }

/* QR */
.with-qr { display: flex; gap: 0.12in; align-items: center; margin: 0.03in 0 0.07in; }
.with-qr-body { flex: 1; min-width: 0; }
.with-qr-body p + p { margin-top: 0.035in; }
.qr { display: flex; flex-direction: column; align-items: center; text-align: center; flex-shrink: 0; width: 1.12in; }
.qr-code { background: #fff; padding: 3px; border: 1px solid ${C.line}; border-radius: 3px; }
.qr-code img, .qr-code canvas { width: 100% !important; height: 100% !important; display: block; image-rendering: pixelated; }
.qr figcaption { margin-top: 0.03in; line-height: 1.15; }
.qr figcaption b { display: block; font-size: 5.7pt; font-weight: 700; color: ${C.red}; }
.qr .url { display: block; font-family: 'JetBrains Mono', monospace; font-size: 4.9pt; color: ${C.muted}; overflow-wrap: anywhere; margin-top: 1px; }

/* low-emphasis asides (no box) */
.aside { margin-top: auto; padding-top: 0.06in; border-top: 1px solid ${C.line}; font-size: 7.1pt; color: ${C.muted}; }
.aside .q { color: #44403C; }
.aside .with-qr { margin-bottom: 0; }

/* cover */
.cover { justify-content: space-around; position: relative; }
.cover::before { content: ''; position: absolute; inset: 0.14in; border: 1px solid ${C.red}40; pointer-events: none; }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; }
.brand { font-family: 'Cinzel', serif; font-weight: 700; color: ${C.red}; letter-spacing: 0.08em; font-size: 8.5pt; }
.kicker { font-size: 6.4pt; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${C.gold}; }
.cover-title h1 { font-family: 'Literata', serif; font-size: 31pt; line-height: 1.02; color: ${C.red}; font-weight: 800; }
.cover-title .rule { width: 0.9in; height: 3px; background: ${C.gold}; margin: 0.12in 0; }
.cover-title h2 { font-family: 'Literata', serif; font-size: 17pt; line-height: 1.15; color: ${C.ink}; font-weight: 600; }
.cover-intro { font-family: 'Literata', serif; font-size: 10pt; line-height: 1.42; }
.cover-intro em { color: ${C.red}; }
.pledge { border-left: 3px solid ${C.red}; padding: 0.02in 0 0.02in 0.12in; }
.pledge-h { font-size: 6.4pt; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${C.red}; margin-bottom: 0.03in; }
.pledge-list { font-weight: 600; font-size: 8.8pt; line-height: 1.38; }
.pledge-note { font-size: 7.2pt; color: ${C.muted}; margin-top: 0.04in; }
.toc { list-style: none; font-size: 9.4pt; }
.toc li { display: flex; gap: 0.08in; align-items: center; padding: 0.032in 0; border-bottom: 1px solid ${C.line}; }
.toc li span { font-family: 'Cinzel', serif; font-weight: 700; color: #fff; background: ${C.red}; width: 0.19in; height: 0.19in; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 7pt; flex-shrink: 0; }
.toc em { color: ${C.muted}; font-style: normal; font-size: 7.4pt; }
.cover-foot, .closing { text-align: center; }
.foot-org { font-family: 'Cinzel', serif; font-weight: 700; color: ${C.red}; font-size: 11pt; letter-spacing: 0.06em; }
.foot-church { font-size: 7pt; color: ${C.muted}; margin-top: 0.02in; }

/* back */
.back { font-size: 8.4pt; line-height: 1.35; }
.back h3 { font-size: 14pt; }
.back .with-qr { margin: 0.03in 0 0.06in; }
.back .aside { margin-top: 0.1in; padding-top: 0.08in; font-size: 7.6pt; }
.back .aside h5 { margin-bottom: 0.05in; }
.back .closing { margin-top: auto; border-top: 1px solid ${C.line}; padding-top: 0.08in; }
.closing p { font-family: 'Literata', serif; font-style: italic; font-size: 9pt; margin-bottom: 0.05in; }
.disclosure { font-size: 6.3pt; color: ${C.muted}; margin-top: 0.03in; }
/* answers */
.answer { background: #F3EBE0; border-left: 3px solid ${C.red}; padding: 0.035in 0.07in; border-radius: 2px; }
.answer-h { font-weight: 800; color: ${C.red}; }
.witness { margin: 0.03in 0 0 0.14in; }
.witness li { margin-bottom: 0.015in; }
/* footer */
.closing .invite { font-family: 'Public Sans', sans-serif; font-style: normal; font-size: 7.6pt; margin-bottom: 0.06in; text-align: left; }
.foot { text-align: center; border-top: 1px solid ${C.line}; padding-top: 0.05in; }
.foot-love { font-family: 'Literata', serif; font-weight: 700; color: ${C.red}; font-size: 9.5pt; }
.foot p { font-size: 6.7pt; color: ${C.muted}; margin: 0.02in 0 0.03in; line-height: 1.3; }
.foot-site { font-family: 'Cinzel', serif; font-weight: 700; color: ${C.red}; font-size: 11pt; letter-spacing: 0.06em; }
`;

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Through Christian Eyes — bi-fold handout</title>
<style>${css}</style></head>
<body>
  <div class="sheet" id="outside">${panel4}${panel1}<div class="fold"></div></div>
  <div class="sheet" id="inside">${panel2}${panel3}<div class="fold"></div></div>
  <script>${qrJs}</script>
  <script>
    document.querySelectorAll('.qr-code').forEach(el => {
      new QRCode(el, { text: el.dataset.qr, width: 240, height: 240, colorDark: '#2A0F0E', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    });
    // Overflow check: any panel whose content runs past its bottom edge reports a positive number.
    const report = [...document.querySelectorAll('.panel')].map((p, i) => {
      const last = [...p.children].reduce((m, c) => Math.max(m, c.getBoundingClientRect().bottom), 0);
      return { i, over: Math.round(last - (p.getBoundingClientRect().bottom - 26)) };
    });
    document.title = JSON.stringify(report);
  </script>
</body></html>`;

const htmlPath = path.resolve(dir, 'handout.html');
const pdfPath = path.resolve(dir, 'ThroughChristianEyes_Bifold_Letter.pdf');
fs.writeFileSync(htmlPath, html);

console.log('Rendering PDF…');
execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=8000 --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file://${htmlPath}"`, { stdio: 'ignore' });

console.log('Overflow check…');
const dom = execSync(`/usr/bin/google-chrome --headless --disable-gpu --virtual-time-budget=8000 --window-size=1056,1632 --dump-dom "file://${htmlPath}"`).toString();
const title = (dom.match(/<title>(.*?)<\/title>/) || [])[1] || '';
console.log('  panel overflow past bottom padding (px, ≤0 is OK):', title.replace(/&quot;/g, '"'));

console.log('Rendering PNG previews…');
execSync(`pdftoppm -png -r 150 "${pdfPath}" "${path.resolve(dir, 'preview')}"`);
console.log('Done:', pdfPath);
