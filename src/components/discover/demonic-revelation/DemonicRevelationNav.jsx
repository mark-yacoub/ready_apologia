import React, { useState, useEffect, useRef } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import {
  scrollToSection,
  setupInitialHashScroll,
  setupSectionObserver
} from '../../../utils/section_navigator.js';

const STAGES = [
  { id: 'initial-encounter', title: 'Initial Encounter' },
  { id: 'suicidal-despair', title: 'Suicidal Despair' },
  { id: 'physiological-manifestations', title: 'Physiological Trances' },
  { id: 'vulnerability-to-black-magic', title: 'Black Magic' },
  { id: 'interception-of-revelation', title: 'Satanic Verses' },
  { id: 'biblical-mandate', title: 'Testing the Spirits' }
];

export default function DemonicRevelationNav() {
  const [activeId, setActiveId] = useState('initial-encounter');
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const validIds = STAGES.map(s => s.id);
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
      selector: '.revelation-stage-section, .mandate-section',
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
    <nav className="rev-sticky-nav" aria-label="Article Stage Navigation">
      <ScrollableTrack containerClass="rev-nav-scroller" activeTrigger={activeId}>
        {STAGES.map((stage) => {
          const isActive = activeId === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleNavClick(stage.id)}
              className={`rev-nav-pill ${isActive ? 'is-active active' : ''}`}
            >
              <span className="pill-title">{stage.title}</span>
            </button>
          );
        })}
      </ScrollableTrack>

      <style>{`
        .rev-sticky-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 8px 16px;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        .rev-nav-scroller {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          max-width: 960px;
          margin: 0 auto;
          padding: 2px 4px;
        }

        .rev-nav-scroller::-webkit-scrollbar {
          display: none;
        }

        .rev-nav-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          border-radius: 9999px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          background: var(--color-surface, #ffffff);
          color: var(--color-on-surface-variant, #71717a);
          font-family: var(--font-body, -apple-system, sans-serif);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .rev-nav-pill:hover {
          border-color: #d4d4d8;
          color: var(--color-on-surface, #09090b);
          transform: translateY(-1px);
        }

        .rev-nav-pill:active {
          transform: translateY(0);
        }

        .rev-nav-pill.is-active {
          background: var(--color-primary, #09090b);
          border-color: var(--color-primary, #09090b);
          color: #ffffff;
          box-shadow: 0 3px 10px rgba(9, 9, 11, 0.18);
        }

        .pill-title {
          font-weight: 600;
        }

        @media (min-width: 768px) {
          .rev-sticky-nav {
            padding: 10px 24px;
          }
          .rev-nav-pill {
            padding: 8px 16px;
            font-size: 13.5px;
          }
        }
      `}</style>
    </nav>
  );
}
