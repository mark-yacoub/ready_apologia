/**
 * Navigation-only "Outline" sheet for a subcategory feed (bottom sheet on mobile, floating panel
 * on desktop). Portaled into .app-container so it overlays the bounded app frame.
 *
 * Accessibility: modal dialog — focus moves to the current entry on open, Tab is trapped inside,
 * Escape closes, and focus returns to the opener on close.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HADITH_LABELS as L } from '../../utils/hadith_config.js';
import { Icon } from './HadithParts.jsx';

export default function OutlineSheet({ entries, activeIndex, onPick, onClose, onTop, title }) {
  const [host, setHost] = useState(null);
  const sheetRef = useRef(null);
  const listRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setHost(document.querySelector('.app-container') || document.body);
  }, []);

  // Keyboard: Escape closes, Tab cycles within the sheet. Restore focus to the opener on unmount.
  useEffect(() => {
    const opener = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const focusables = [...sheetRef.current.querySelectorAll('button')];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!sheetRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  // Once mounted: center the current entry in the list and move focus to it.
  useEffect(() => {
    if (!host) return;
    const active = listRef.current?.querySelector('[aria-current="true"]');
    active?.scrollIntoView({ block: 'center' });
    (active || sheetRef.current?.querySelector('.hx-sheet-close'))?.focus({ preventScroll: true });
  }, [host]);

  if (!host) return null;

  let lastGroup = null;
  return createPortal(
    <>
      <div className="hx-sheet-backdrop" onClick={onClose} />
      <div className="hx-sheet" role="dialog" aria-modal="true" aria-labelledby="hx-sheet-title" ref={sheetRef}>
        <div className="hx-sheet-grip" />
        <div className="hx-sheet-head">
          <h2 id="hx-sheet-title">{title}</h2>
          <div className="hx-sheet-tools">
            <button type="button" className="hx-sheet-top" onClick={onTop}>{Icon.up(13)} {L.backToTop}</button>
            <button type="button" className="hx-sheet-close" onClick={onClose} aria-label={L.closeOutline}>{Icon.close(16)}</button>
          </div>
        </div>
        <div className="hx-sheet-list" ref={listRef}>
          {entries.map((e, i) => {
            const group = e.group !== lastGroup ? e.group : null;
            lastGroup = e.group;
            const current = i === activeIndex;
            return (
              <React.Fragment key={e.id}>
                {group && <div className="hx-sheet-group">{group}</div>}
                <button type="button" className={`hx-sheet-item${current ? ' is-active' : ''}`} aria-current={current ? 'true' : undefined} onClick={() => onPick(e)}>
                  <span className="dot" aria-hidden="true" />
                  <span>
                    <span className="t">{e.headline}</span>
                    <span className="r">{e.displayRef}</span>
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>,
    host,
  );
}
