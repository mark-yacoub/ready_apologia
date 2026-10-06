/**
 * Small presentational building blocks shared by the Sahih Hadith islands.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { buildSegments } from '../../utils/hadithText.js';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';

// ---------- Icons (inline SVG, currentColor) ----------
const svg = (size, children, extra = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>{children}</svg>
);
export const Icon = {
  external: (s = 14) => svg(s, <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>),
  share: (s = 18) => svg(s, <><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></>),
  shield: (s = 18) => svg(s, <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />),
  layers: (s = 18) => svg(s, <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>),
  expand: (s = 14) => svg(s, <><path d="M7 10l5 5 5-5" /></>),
  collapse: (s = 14) => svg(s, <><path d="M7 14l5-5 5 5" /></>),
  chevronRight: (s = 16) => svg(s, <path d="M9 6l6 6-6 6" />),
  arrowRight: (s = 16) => svg(s, <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>),
  list: (s = 18) => svg(s, <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="3" /></>),
  close: (s = 16) => svg(s, <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>),
  up: (s = 14) => svg(s, <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>),
  alert: (s = 14) => svg(s, <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>),
};

// ---------- Card source header ----------
/** Reference (→ permalink) with the book title beneath it, and an icon link to Sunnah.com. */
export function CardSource({ item }) {
  return (
    <div className="hx-src">
      <div className="hx-src-main">
        {item.permalink
          ? <a className="hx-src-ref" href={item.permalink} data-astro-prefetch="hover">{item.displayRef}</a>
          : <span className="hx-src-ref">{item.displayRef}</span>}
        {item.bookTitle && <span className="hx-src-book">{item.bookTitle}</span>}
      </div>
      {item.sunnahUrl && (
        <a className="hx-icon-btn" href={item.sunnahUrl} target="_blank" rel="noopener noreferrer"
          aria-label={`${L.openSunnah}: ${item.displayRef}`} title={L.openSunnah}>
          {Icon.external(17)}
        </a>
      )}
    </div>
  );
}

// ---------- Language toggle ----------
export function LanguageToggle({ lang, onChange }) {
  const opts = [
    { key: 'en', label: 'EN', aria: 'English' },
    { key: 'ar', label: 'عربي', aria: 'Arabic', cls: 'ar' },
    { key: 'both', label: 'Both', aria: 'English and Arabic' },
  ];
  return (
    <div className="hx-seg" role="group" aria-label="Text language">
      {opts.map(o => (
        <button key={o.key} type="button" className={o.cls} aria-pressed={lang === o.key}
          aria-label={o.aria} onClick={() => onChange(o.key)}>{o.label}</button>
      ))}
    </div>
  );
}

// ---------- Redlined / highlighted text ----------
/**
 * Renders `text` with highlight marks, Arabic term underlines and published→literal redlines.
 * @param {Function} onRedlineClick  tapping a redline opens the lexical card.
 */
export function MarkedText({ text, ranges = [], onRedlineClick }) {
  const segments = buildSegments(text, ranges);
  const redProps = onRedlineClick
    ? { role: 'button', tabIndex: 0, onClick: onRedlineClick, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRedlineClick(); } }, title: 'See the Arabic wording' }
    : {};
  return segments.map((seg, i) => {
    let node;
    if (seg.ins !== undefined) {
      node = seg.omission ? (
        <span className="hx-red" {...redProps}>
          {' '}<span className="omit-label">{L.omittedInline}</span>
          <ins>{seg.ins}</ins>
          {onRedlineClick && <span className="hx-info">i</span>}
        </span>
      ) : (
        <span className="hx-red" {...redProps}>
          {' '}<ins>{seg.ins}</ins>
          {onRedlineClick && <span className="hx-info">i</span>}
        </span>
      );
    } else if (seg.del) {
      node = <span className="hx-red" {...redProps}><del>{seg.text}</del></span>;
    } else {
      node = seg.text;
    }
    if (seg.term) node = <span className="hx-term">{node}</span>;
    if (seg.mark) node = <mark>{node}</mark>;
    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

// ---------- Lexical card (translation issue) ----------
export function LexicalCard({ issue }) {
  return (
    <div className="hx-lex">
      <dl>
        {issue.arabicTerm && <><dt>Arabic</dt><dd className="ar" lang="ar">{issue.arabicTerm}</dd></>}
        <dt>Published</dt>
        {issue.omitted
          ? <dd className="pub is-omitted">— (left out)</dd>
          : <dd className="pub">{issue.published}</dd>}
        <dt>Literal</dt>
        <dd className="lit">{issue.literal}</dd>
      </dl>
      {/* explanationHtml is rendered at build time by hadithLoader (trusted data). */}
      {issue.explanationHtml && <div className="hx-lex-prose" dangerouslySetInnerHTML={{ __html: issue.explanationHtml }} />}
    </div>
  );
}

export function Skeleton({ lines = 3 }) {
  return (
    <div className="hx-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <span key={i} style={{ width: `${i === lines - 1 ? 60 : 100 - i * 4}%` }} />)}
    </div>
  );
}

/** Inline fetch failure with an in-place retry. */
export function LoadError({ onRetry }) {
  return (
    <p className="hx-load-error" role="alert">
      <span>{L.loadError}</span>
      <button type="button" className="hx-text-btn" onClick={onRetry}>{L.retry}</button>
    </p>
  );
}

/** Toast hook: returns [node, show(message)]. */
export function useToast() {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const show = useCallback(m => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1800);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = msg ? <div className="hx-toast" role="status">{msg}</div> : null;
  return [node, show];
}
