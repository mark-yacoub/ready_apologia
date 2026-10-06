/**
 * Permalink page body for a single hadith (/hadith/bukhari/5134, /hadith/muslim/1422a).
 * Full narration with every annotated excerpt highlighted, then "Why it matters" per annotation.
 */
import React from 'react';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';
import { shareLink, useHadithLanguage } from './hadithClient.js';
import { Icon, LanguageToggle, LexicalCard, useToast } from './HadithParts.jsx';
import { FullNarration } from './HadithNarration.jsx';

const scrollToWhy = () => document.getElementById('why')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function HadithPermalink({ record }) {
  const [lang, setLang] = useHadithLanguage();
  const [toast, showToast] = useToast();
  const data = { english: record.english, arabic: record.arabic, annotations: record.annotations.map(a => a.full) };
  const allIdx = record.annotations.map((_, i) => i);

  const onShare = async () => {
    const res = await shareLink({ url: record.permalink, title: record.displayRef, text: record.annotations[0]?.noteText });
    if (res === 'copied') showToast(L.linkCopied);
    else if (res === 'failed') showToast(L.copyFailed);
  };

  return (
    <div className="hx-perma">
      <header className="hx-perma-head">
        <h1 className="hx-h1">{record.displayRef}</h1>
        <p className="hx-perma-meta">
          {[record.bookTitle, record.inBook].filter(Boolean).join(' · ')}
        </p>
        <div className="hx-btn-row">
          <a className="hx-btn primary" href={record.sunnahUrl} target="_blank" rel="noopener noreferrer">
            {L.openSunnah} {Icon.external(15)}
          </a>
          <button type="button" className="hx-btn" onClick={onShare}>{Icon.share(16)} {L.share}</button>
        </div>
      </header>

      <div className="hx-perma-tools">
        <button type="button" className="hx-text-btn" onClick={scrollToWhy}>{L.whyItMatters} {Icon.expand(14)}</button>
        <LanguageToggle lang={lang} onChange={setLang} />
      </div>

      <div className="hx-perma-text">
        <FullNarration data={data} lang={lang} annIndexes={allIdx} onRedlineClick={scrollToWhy} />
        <p className="hx-also">
          Highlighted passages are discussed below.
        </p>
      </div>

      <section className="hx-why" id="why" aria-labelledby="why-h">
        <h2 className="hx-eyebrow" id="why-h">{L.whyItMatters}</h2>
        {record.annotations.map((a, i) => (
          <div className="hx-why-block" key={i}>
            <div className="hx-note" dangerouslySetInnerHTML={{ __html: a.noteHtml }} />
            {a.issue && <LexicalCard issue={a.issue} />}
            <div className="hx-defense">
              <p className="hx-eyebrow">{L.defenseHeading}</p>
              <div className="hx-prose" dangerouslySetInnerHTML={{ __html: a.defenseHtml }} />
            </div>
            {a.parallels.length > 0 && (
              <>
                <h3 className="hx-eyebrow">{L.parallels}</h3>
                <div className="hx-par-chips">
                  {a.parallels.map(p => (
                    <a key={p.slug} className="hx-par-chip hx-par-link" href={p.permalink || p.sunnahUrl}
                      {...(p.permalink ? { 'data-astro-prefetch': 'hover' } : { target: '_blank', rel: 'noopener noreferrer' })}>
                      {p.shortRef}{!p.permalink && <> {Icon.external(11)}</>}
                    </a>
                  ))}
                </div>
              </>
            )}
            <a className="hx-crumb" href={a.sectionHref} data-astro-prefetch="hover">
              <span className="lbl">{L.filedUnder}</span> {a.catShort} › {a.subShort} {Icon.chevronRight(14)}
            </a>
          </div>
        ))}
      </section>

      {(record.prev || record.next) && (
        <nav className="hx-pager" aria-label="More in this topic">
          {record.prev && (
            <a href={record.prev.permalink}><span className="dir">← Previous</span><span className="ref">{record.prev.displayRef}</span></a>
          )}
          {record.next && (
            <a href={record.next.permalink} className="next"><span className="dir">Next →</span><span className="ref">{record.next.displayRef}</span></a>
          )}
        </nav>
      )}
      {toast}
    </div>
  );
}
