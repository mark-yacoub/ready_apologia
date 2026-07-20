import React, { useRef, useState, useEffect } from 'react';

export default function ScrollableTrack({ children, containerClass, activeTrigger }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Show left arrow if we have scrolled right from start (with 2px tolerance)
    setShowLeft(scrollLeft > 2);
    // Show right arrow if we haven't reached the end (with 2px tolerance)
    setShowRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    // Check again on window resize
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);

    // Check after fonts/layout settle
    const t = setTimeout(checkScroll, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, [children]);

  useEffect(() => {
    // Center active child
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('.active');
      if (activeEl) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const scrollPos = containerRef.current.scrollLeft + (elRect.left - containerRect.left) - (containerRect.width / 2) + (elRect.width / 2);
        containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
    // Re-check scroll buttons after scrolling
    const t = setTimeout(checkScroll, 300);
    return () => clearTimeout(t);
  }, [activeTrigger]);

  const scroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6; // Scroll by 60% of visible width
    el.scrollBy({
      left: direction * amount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="scrollable-track-wrapper">
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
        .scroll-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--color-surface, #ffffff);
          color: var(--color-primary, #0f172a);
          border: 1px solid var(--color-outline-variant, #e2e8f0);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
          padding: 0;
        }
        .scroll-arrow-btn:hover {
          background-color: var(--color-surface-container-low, #f8fafc);
          color: var(--color-secondary, #974543);
          border-color: var(--color-secondary, #974543);
        }
        .scroll-arrow-btn:active {
          transform: translateY(-50%) scale(0.9);
        }
        .scroll-arrow-btn svg {
          width: 12px;
          height: 12px;
        }
        .scroll-arrow-btn.left {
          left: -12px;
        }
        .scroll-arrow-btn.right {
          right: -12px;
        }
      `}} />
      {showLeft && (
        <button className="scroll-arrow-btn left" onClick={() => scroll(-1)} aria-label="Scroll left" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      <div
        className={containerClass}
        ref={containerRef}
        onScroll={checkScroll}
      >
        {children}
      </div>
      {showRight && (
        <button className="scroll-arrow-btn right" onClick={() => scroll(1)} aria-label="Scroll right" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}
