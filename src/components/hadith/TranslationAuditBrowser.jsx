/**
 * Translation audit list for one issue type (/hadith/translation-audit/<slug>): where the published
 * English softened, omitted or euphemized the Arabic. Rendered statically at build time — tabs are
 * plain links and "Why the wording matters" uses native <details>.
 */
import React from 'react';
import { HADITH_LABELS as L, TRANSLATION_ISSUE_TYPES } from '../../utils/hadith_config.js';
import { CardSource, Icon, MarkedText } from './HadithParts.jsx';

export default function TranslationAuditBrowser({ type, rows, tabs }) {
  const seen = new Set();
  return (
    <div>
      <nav className="hx-tabs" aria-label="Issue type">
        {tabs.map(t => (
          <a key={t.key} className="hx-tab" href={t.href} aria-current={t.key === type ? 'page' : undefined} data-astro-prefetch="hover">
            {t.label}<span className="count">{t.count}</span>
          </a>
        ))}
      </nav>
      <p className="hx-tab-blurb">{TRANSLATION_ISSUE_TYPES[type]?.blurb}</p>
      <ul className="hx-audit-list">
        {rows.map((r, i) => {
          const id = seen.has(r.slug) ? undefined : r.slug;
          seen.add(r.slug);
          return <AuditRow key={`${r.slug}-${i}`} id={id} row={r} />;
        })}
      </ul>
    </div>
  );
}

/**
 * One audit entry, readable on its own: which hadith, what it says, the published sentence with the
 * change redlined in place, the Arabic behind it, why the wording matters, and where to read more.
 */
function AuditRow({ id, row: r }) {
  return (
    <li id={id} className="hx-audit-row">
      <CardSource item={r} />

      <p className="hx-audit-headline">{r.headline}</p>

      {r.context ? (
        <blockquote className="hx-quote">
          <MarkedText text={r.context.text} ranges={r.context.ranges} />
        </blockquote>
      ) : (
        <div className="hx-audit-diff">
          {r.omitted ? <span className="omitted">(left out)</span> : <del>{r.published}</del>}
          <span className="arrow" aria-hidden="true">→</span>
          <ins>{r.literal}</ins>
        </div>
      )}

      {r.arabicTerm && (
        <div className="hx-audit-ar">
          <span className="lbl">Arabic</span>
          <span className="ar" lang="ar" dir="rtl">{r.arabicTerm}</span>
        </div>
      )}

      {/* explanationHtml is rendered at build time by hadithLoader (trusted data). */}
      {r.explanationHtml && (
        <details className="hx-audit-why">
          <summary>{L.whyWording} {Icon.expand(14)}</summary>
          <div className="hx-lex-prose" dangerouslySetInnerHTML={{ __html: r.explanationHtml }} />
        </details>
      )}

      <div className="hx-audit-foot">
        <a className="hx-audit-topic" href={r.sectionHref} data-astro-prefetch="hover">{r.subShort}</a>
        {r.permalink && (
          <a className="hx-text-btn" href={r.permalink} data-astro-prefetch="hover">{L.readFull} {Icon.arrowRight(14)}</a>
        )}
      </div>
    </li>
  );
}
