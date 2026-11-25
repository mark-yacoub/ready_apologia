import React, { useRef, useState, useEffect } from 'react';

export default function ScrollableTrack({ children, containerClass, activeTrigger }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 2);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    const t = setTimeout(checkScroll, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, [children]);

  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('.active');
      if (activeEl) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const scrollPos =
          containerRef.current.scrollLeft +
          (elRect.left - containerRect.left) -
          containerRect.width / 2 +
          elRect.width / 2;
        containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
    const t = setTimeout(checkScroll, 300);
    return () => clearTimeout(t);
  }, [activeTrigger]);

  const scroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    });
  };

  const wrapperClasses = [
    'scrollable-track-wrapper',
    showLeft ? 'has-left-fade' : '',
    showRight ? 'has-right-fade' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollable-track-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .scrollable-track-wrapper > div {
          width: 100%;
        }
        /* Edge-fade masks signal horizontal scroll cleanly without overlapping tab labels */
        .scrollable-track-wrapper.has-left-fade::before,
        .scrollable-track-wrapper.has-right-fade::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 1px;
          width: 28px;
          pointer-events: none;
          z-index: 5;
        }
        .scrollable-track-wrapper.has-left-fade::before {
          left: 0;
          background: linear-gradient(to right, var(--ra-track-fade, var(--ra-paper, #fbf9f5)) 15%, transparent);
        }
        .scrollable-track-wrapper.has-right-fade::after {
          right: 0;
          background: linear-gradient(to left, var(--ra-track-fade, var(--ra-paper, #fbf9f5)) 15%, transparent);
        }
        /* Subtle arrow buttons on desktop pointers only (phones swipe naturally without covered text) */
        .scroll-arrow-btn {
          display: none;
        }
        @media (min-width: 768px) {
          .scroll-arrow-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: var(--ra-surface, #ffffff);
            color: var(--ra-ink-2, #57514a);
            border: 1px solid var(--ra-line-strong, #d8d0c4);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(27, 25, 23, 0.08);
            transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
            padding: 0;
          }
          .scroll-arrow-btn:hover {
            background-color: var(--ra-accent-bg, #f3efe8);
            color: var(--ra-accent, #1b1917);
            border-color: var(--ra-accent-rule, #d8d0c4);
          }
          .scroll-arrow-btn svg {
            width: 13px;
            height: 13px;
          }
          .scroll-arrow-btn.left {
            left: -10px;
          }
          .scroll-arrow-btn.right {
            right: -10px;
          }
        }
      `}} />
      {showLeft && (
        <button className="scroll-arrow-btn left" onClick={() => scroll(-1)} aria-label="Scroll left" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className={containerClass} ref={containerRef} onScroll={checkScroll}>
        {children}
      </div>
      {showRight && (
        <button className="scroll-arrow-btn right" onClick={() => scroll(1)} aria-label="Scroll right" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
