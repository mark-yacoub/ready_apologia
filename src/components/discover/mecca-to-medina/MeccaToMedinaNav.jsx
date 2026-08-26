import React, { useState, useEffect, useRef } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import {
  scrollToSection,
  setupInitialHashScroll,
  setupSectionObserver
} from '../../../utils/section_navigator.js';

const SECTIONS = [
  { id: 'abstract', title: 'Overview' },
  { id: 'sociopolitical-backdrop', title: '1. Two Eras' },
  { id: 'four-stages-of-warfare', title: '2. Stages of Warfare' },
  { id: 'relations-with-jewish-tribes', title: '3. Jewish Relations' },
  { id: 'christological-shift', title: '4. Christology' },
  { id: 'doctrine-of-naskh', title: '5. Naskh (Abrogation)' },
  { id: 'comparative-synthesis', title: '6. Comparative Synthesis' },
  { id: 'interpretive-frameworks', title: '7. Frameworks' }
];

export default function MeccaToMedinaNav() {
  const [activeId, setActiveId] = useState('abstract');
  const [scrollProgress, setScrollProgress] = useState(0);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const validIds = SECTIONS.map(s => s.id);
    const cleanup = setupInitialHashScroll({
      validIds,
      onHashFound: (id) => setActiveId(id),
      onComplete: () => {
        isInitialMountRef.current = false;
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = setupSectionObserver({
      selector: '.mm-section-block',
      rootMargin: '-20% 0px -60% 0px',
      isLocked: () => isInitialMountRef.current,
      onActiveIdChange: (id) => setActiveId(id),
      updateUrl: true
    });
    return cleanup;
  }, []);

  const handleNavClick = (id) => {
    setActiveId(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
    scrollToSection(id, { behavior: 'smooth' });
  };

  return (
    <nav className="mm-sticky-nav" aria-label="Article Section Navigation">
      <div
        className="mm-reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading progress"
      />
      <ScrollableTrack containerClass="mm-nav-scroller" activeTrigger={activeId}>
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleNavClick(section.id)}
              className={`mm-nav-pill ${isActive ? 'is-active active' : ''}`}
            >
              <span className="pill-title">{section.title}</span>
            </button>
          );
        })}
      </ScrollableTrack>

      <style>{`
        .mm-sticky-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 8px 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          position: sticky;
        }

        .mm-reading-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2.5px;
          background: var(--color-secondary, #974543);
          transition: width 0.1s linear;
          z-index: 60;
        }

        .mm-nav-scroller {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          max-width: 900px;
          margin: 0 auto;
          padding: 2px 2px;
        }

        .mm-nav-scroller::-webkit-scrollbar {
          display: none;
        }

        .mm-nav-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          background: var(--color-surface, #ffffff);
          color: var(--color-on-surface-variant, #71717a);
          font-family: var(--font-body, -apple-system, sans-serif);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .mm-nav-pill:hover {
          border-color: #d4d4d8;
          color: var(--color-on-surface, #09090b);
          transform: translateY(-1px);
        }

        .mm-nav-pill:active {
          transform: translateY(0);
        }

        .mm-nav-pill.is-active {
          background: var(--color-primary, #09090b);
          border-color: var(--color-primary, #09090b);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(9, 9, 11, 0.16);
        }

        .pill-title {
          font-weight: 600;
        }

        @media (min-width: 768px) {
          .mm-sticky-nav {
            padding: 10px 20px;
          }
          .mm-nav-scroller {
            gap: 8px;
          }
          .mm-nav-pill {
            padding: 7px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </nav>
  );
}
