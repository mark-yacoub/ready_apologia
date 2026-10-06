/**
 * "Torn page" hadith card.
 *
 * Collapsed: source line, then the crisp problematic excerpt between real (blurred) context fringes,
 * then the note explaining it. "Read full hadith" is the single way to see more: it fetches the
 * narration lazily and resolves the blur in place with the excerpt highlighted. Translation issues
 * are shown as an inline redline (published wording struck, literal wording inserted) plus a lexical card.
 */
import React, { useEffect, useRef, useState } from 'react';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';
import { hadithJsonUrl, prefetchJson, shareLink, stickyHeaderBottom, useLazyJson } from './hadithClient.js';
import { CardSource, Icon, LexicalCard, LoadError, MarkedText, Skeleton, useToast } from './HadithParts.jsx';
import { FullNarration, ParallelPanel } from './HadithNarration.jsx';

const CLAMP_EN = 640;
const CLAMP_AR = 420;

const hasFringe = f => Boolean(f?.before || f?.after);

/**
 * Collapsed state: the crisp excerpt between blurred fringes of the real surrounding text.
 * There is one way to see more: "Read full hadith". It shows whenever something is hidden —
 * surrounding text (the fringes) or the tail of a long excerpt (clamped and faded out).
 */
function ExcerptView({ ann, lang, arabic, onArabicRetry, redRanges, onRedlineClick, onExpand, onIntent }) {
  const fringe = lang === 'ar' ? arabic?.fringe : ann.fringeEn;
  const fringeDir = lang === 'ar' ? 'rtl' : undefined;
  const clampedEn = lang !== 'ar' && ann.excerptEn.length > CLAMP_EN;
  const clampedAr = lang !== 'en' && (arabic?.excerpt?.length || 0) > CLAMP_AR;
  const arabicMore = arabic ? hasFringe(arabic.fringe) : lang !== 'en'; // unknown until the pack loads: assume more
  const hasMore = clampedEn || clampedAr
    || (lang !== 'ar' && hasFringe(ann.fringeEn))
    || (lang !== 'en' && arabicMore);
  const showBottomFringe = Boolean(fringe?.after) && !clampedEn && !clampedAr;
  // The button overlaps only when the element directly above it (bottom fringe or bottom quote) fades out.
  const overlay = showBottomFringe || (lang === 'en' ? clampedEn : clampedAr);
  let arabicQuote = null;
  if (lang !== 'en') {
    if (arabic) {
      arabicQuote = (
        <blockquote className={`hx-quote${lang === 'both' ? ' hx-parallel-ar' : ''}${clampedAr ? ' is-clamped' : ''}`} dir="rtl" lang="ar">
          <MarkedText text={arabic.excerpt} ranges={arabic.terms || []} />
        </blockquote>
      );
    } else {
      arabicQuote = onArabicRetry ? <LoadError onRetry={onArabicRetry} /> : <Skeleton lines={2} />;
    }
  }

  return (
    <div className="hx-passage">
      {fringe?.before && <div className="hx-fringe top" dir={fringeDir} aria-hidden="true">{fringe.before}</div>}
      {lang !== 'ar' && (
        <blockquote className={`hx-quote${clampedEn ? ' is-clamped' : ''}`}>
          <MarkedText text={ann.excerptEn} ranges={redRanges} onRedlineClick={onRedlineClick} />
        </blockquote>
      )}
      {arabicQuote}
      {showBottomFringe && <div className="hx-fringe bottom" dir={fringeDir} aria-hidden="true">{fringe.after}</div>}
      {hasMore && (
        <div className={`hx-reveal-row${overlay ? '' : ' no-fringe'}`}>
          <button type="button" className="hx-reveal-btn" onClick={onExpand} onFocus={onIntent} aria-expanded="false">
            {L.readFull} {Icon.expand(14)}
          </button>
        </div>
      )}
    </div>
  );
}

/** Expanded state: the whole narration with this card's passage highlighted. */
function FullTextView({ ann, lang, json, onRedlineClick, onCollapse }) {
  return (
    <div className="hx-passage">
      <div className="hx-full-bar">
        <span>{L.fullNarration}</span>
        <button type="button" onClick={onCollapse} aria-expanded="true">{L.showExcerpt} {Icon.collapse(12)}</button>
      </div>
      {json.loading && <Skeleton lines={6} />}
      {json.error && <LoadError onRetry={json.retry} />}
      {json.data && (
        <FullNarration data={json.data} lang={lang} annIndexes={[ann.annIndex]} onRedlineClick={onRedlineClick} />
      )}
      <div className="hx-full-foot">
        <button type="button" className="hx-text-btn" onClick={onCollapse}>{Icon.collapse(14)} {L.showExcerpt}</button>
      </div>
    </div>
  );
}

function DefensePanel({ annData, json }) {
  let body;
  if (annData) body = <div className="hx-prose" dangerouslySetInnerHTML={{ __html: annData.defenseHtml }} />;
  else if (json.error) body = <LoadError onRetry={json.retry} />;
  else body = <Skeleton lines={3} />;
  return (
    <div className="hx-panel">
      <div className="hx-defense">
        <p className="hx-eyebrow">{L.defenseHeading}</p>
        {body}
      </div>
    </div>
  );
}

export default function HadithCard({ item, lang, arabic, onArabicRetry, base, anchorId, shareHref, spyIndex }) {
  const { ann } = item;
  const cardRef = useRef(null);
  const moveFocus = useRef(false); // set by the expand/collapse buttons, consumed after the swap renders
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState(null); // 'lex' | 'defense' | 'parallels'
  const [toast, showToast] = useToast();

  const jsonUrl = hadithJsonUrl(base, item.slug);
  const json = useLazyJson(jsonUrl, expanded || panel === 'defense');
  const annData = json.data?.annotations?.[ann.annIndex];

  const redRanges = ann.redline?.anchored ? ann.redline.ranges : [];
  const togglePanel = name => setPanel(p => (p === name ? null : name));
  const openLex = ann.issue ? () => togglePanel('lex') : undefined;
  // Warm the cache on real intent only (mouse hover, keyboard focus) — never while touch-scrolling.
  const onIntent = () => prefetchJson(jsonUrl);
  const onPointerEnter = e => { if (e.pointerType === 'mouse') onIntent(); };

  // The toggle that was activated unmounts with its view: hand focus to its counterpart.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    cardRef.current?.querySelector(expanded ? '.hx-full-bar button' : '.hx-reveal-btn')?.focus({ preventScroll: true });
  }, [expanded]);

  // After the full text resolves, keep the highlighted passage in view.
  useEffect(() => {
    if (!expanded || !json.data) return;
    const mark = cardRef.current?.querySelector('.hx-full mark');
    if (!mark) return;
    const r = mark.getBoundingClientRect();
    if (r.top < stickyHeaderBottom() + 8 || r.top > window.innerHeight * 0.7) mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [expanded, json.data]);

  const expand = () => {
    moveFocus.current = true;
    setExpanded(true);
  };

  const collapse = () => {
    moveFocus.current = true;
    setExpanded(false);
    requestAnimationFrame(() => {
      const el = cardRef.current;
      // The card's top may now be hidden under the sticky header (or above the viewport): bring it back.
      if (el && el.getBoundingClientRect().top < stickyHeaderBottom()) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };

  const onShare = async () => {
    const res = await shareLink({ url: shareHref, title: item.displayRef, text: ann.headline });
    if (res === 'copied') showToast(L.linkCopied);
    else if (res === 'failed') showToast(L.copyFailed);
  };

  return (
    <article className="hx-card" id={anchorId} data-idx={spyIndex} tabIndex={-1} ref={cardRef} onPointerEnter={onPointerEnter}>
      <CardSource item={item} />

      {expanded ? (
        <FullTextView ann={ann} lang={lang} json={json} onRedlineClick={openLex} onCollapse={collapse} />
      ) : (
        <ExcerptView
          ann={ann}
          lang={lang}
          arabic={arabic}
          onArabicRetry={onArabicRetry}
          redRanges={redRanges}
          onRedlineClick={openLex}
          onExpand={expand}
          onIntent={onIntent}
        />
      )}

      {/* The note explains the passage above it, so it reads quieter than the hadith itself. */}
      <div className="hx-note" dangerouslySetInnerHTML={{ __html: ann.noteHtml }} />

      {ann.issue && (
        <button type="button" className="hx-badge" aria-expanded={panel === 'lex'} onClick={openLex}>
          {Icon.alert(14)} {ann.issue.badge} <span className="sub">· {L.compare}</span>
        </button>
      )}
      {panel === 'lex' && ann.issue && <LexicalCard issue={ann.issue} />}

      {item.otherFilings?.length > 0 && (
        <p className="hx-also">
          {L.alsoFiled}{' '}
          {item.otherFilings.map((f, i) => (
            <React.Fragment key={f.href}>{i > 0 && ', '}<a href={f.href} data-astro-prefetch="hover">{f.label}</a></React.Fragment>
          ))}
        </p>
      )}

      <div className="hx-actions">
        <button type="button" className="hx-action" aria-expanded={panel === 'defense'} onClick={() => togglePanel('defense')} onFocus={onIntent}>
          {Icon.shield(17)} {L.muslimResponse}
        </button>
        {ann.parallels.length > 0 && (
          <button type="button" className="hx-action" aria-expanded={panel === 'parallels'} onClick={() => togglePanel('parallels')}>
            {Icon.layers(17)} {L.parallels} <span className="count">{ann.parallels.length}</span>
          </button>
        )}
        <span className="hx-action-spacer" />
        <button type="button" className="hx-action" onClick={onShare} aria-label={`${L.share} ${item.displayRef}`}>
          {Icon.share(17)}
        </button>
      </div>

      {panel === 'defense' && <DefensePanel annData={annData} json={json} />}
      {panel === 'parallels' && <ParallelPanel parallels={ann.parallels} lang={lang} base={base} />}
      {toast}
    </article>
  );
}
