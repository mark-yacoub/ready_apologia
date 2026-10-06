/**
 * Full-narration views shared by feed cards and permalink pages:
 *   - FullNarration: EN / AR / both, with annotations highlighted (+ redlines, Arabic term underlines)
 *   - ParallelPanel: one chip per parallel narration; each is fetched lazily and shown in full
 */
import React, { useState } from 'react';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';
import { hadithJsonUrl, useLazyJson } from './hadithClient.js';
import { Icon, LoadError, MarkedText, Skeleton } from './HadithParts.jsx';

const markRange = r => (r ? [{ kind: 'mark', start: r[0], end: r[1] }] : []);

/** Full narration (EN / AR / both) with one or more annotations highlighted. */
export function FullNarration({ data, lang, annIndexes, onRedlineClick }) {
  const anns = annIndexes.map(i => data.annotations[i]).filter(Boolean);
  const enRanges = anns.flatMap(a => [...markRange(a.marks?.en), ...(a.redline || [])]);
  const arRanges = anns.flatMap(a => [...markRange(a.marks?.ar), ...(a.terms || [])]);
  return (
    <>
      {lang !== 'ar' && (
        <div className="hx-full">
          <MarkedText text={data.english} ranges={enRanges} onRedlineClick={onRedlineClick} />
        </div>
      )}
      {lang !== 'en' && (
        <div className="hx-full" dir="rtl" lang="ar">
          <MarkedText text={data.arabic} ranges={arRanges} />
        </div>
      )}
    </>
  );
}

export function ParallelPanel({ parallels, lang, base }) {
  const [active, setActive] = useState(null);
  const current = parallels.find(p => p.slug === active) || null;
  const { data, error, loading, retry } = useLazyJson(current ? hadithJsonUrl(base, current.slug) : null, Boolean(current));
  return (
    <div className="hx-panel">
      <div className="hx-par-chips" role="group" aria-label={L.parallels}>
        {parallels.map(p => (
          <button key={p.slug} type="button" className="hx-par-chip" aria-pressed={active === p.slug}
            onClick={() => setActive(a => (a === p.slug ? null : p.slug))}>{p.shortRef}</button>
        ))}
      </div>
      {current && (
        <div className="hx-par-view">
          {loading && <Skeleton lines={4} />}
          {error && <LoadError onRetry={retry} />}
          {data && <FullNarration data={data} lang={lang} annIndexes={data.annotations.map((_, i) => i)} />}
          <div className="hx-full-foot">
            <a className="hx-text-btn" href={current.sunnahUrl} target="_blank" rel="noopener noreferrer">
              Sunnah.com {Icon.external(13)}
            </a>
            {current.permalink && (
              <a className="hx-text-btn" href={current.permalink} data-astro-prefetch="hover">
                {L.open} {current.shortRef} {Icon.arrowRight(14)}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
