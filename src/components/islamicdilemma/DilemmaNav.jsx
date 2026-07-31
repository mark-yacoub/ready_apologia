import React, { useState, useEffect } from 'react';
import ScrollableTrack from '../ScrollableTrack.jsx';

const STAGES = [
  { id: 'stage-1', num: '01', title: 'Core Question' },
  { id: 'stage-2', num: '02', title: 'Quran Affirmation' },
  { id: 'stage-3', num: '03', title: 'Immutability' },
  { id: 'stage-4', num: '04', title: '7th-Century Bible' },
  { id: 'stage-5', num: '05', title: 'Fatal Contradiction' },
  { id: 'stage-6', num: '06', title: 'Objections Refuted' },
  { id: 'stage-7', num: '07', title: 'Conclusion' }
];

export default function DilemmaNav() {
  const [activeId, setActiveId] = useState('stage-1');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    STAGES.forEach((stage) => {
      const el = document.getElementById(stage.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id) => {
    setActiveId(id);
    const target = document.getElementById(id);
    if (target) {
      const scrollContainer = document.querySelector('.main-content') || window;
      const navOffset = 80;
      
      if (scrollContainer === window) {
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        const elementPosition = target.getBoundingClientRect().top;
        const containerPosition = scrollContainer.getBoundingClientRect().top;
        const currentScroll = scrollContainer.scrollTop;
        
        scrollContainer.scrollTo({
          top: currentScroll + (elementPosition - containerPosition) - navOffset,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <nav className="dilemma-sticky-nav" aria-label="Islamic Dilemma Step Navigation">
      <ScrollableTrack containerClass="dilemma-nav-scroller" activeTrigger={activeId}>
        {STAGES.map((stage) => {
          const isActive = activeId === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleNavClick(stage.id)}
              className={`dilemma-nav-pill ${isActive ? 'is-active active' : ''}`}
            >
              <span className="pill-num">{stage.num}</span>
              <span className="pill-title">{stage.title}</span>
            </button>
          );
        })}
      </ScrollableTrack>

      <style>{`
        .dilemma-sticky-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 10px 16px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .dilemma-nav-scroller {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2px 4px;
        }

        .dilemma-nav-scroller::-webkit-scrollbar {
          display: none;
        }

        .dilemma-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
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

        .dilemma-nav-pill:hover {
          border-color: #d4d4d8;
          color: var(--color-on-surface, #09090b);
          transform: translateY(-1px);
        }

        .dilemma-nav-pill:active {
          transform: translateY(0);
        }

        .dilemma-nav-pill.is-active {
          background: var(--color-primary, #09090b);
          border-color: var(--color-primary, #09090b);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(9, 9, 11, 0.2);
        }

        .pill-num {
          font-size: 11px;
          font-weight: 800;
          opacity: 0.75;
          letter-spacing: 0.03em;
        }

        .pill-title {
          font-weight: 700;
        }

        @media (min-width: 768px) {
          .dilemma-sticky-nav {
            padding: 12px 24px;
          }
          .dilemma-nav-pill {
            padding: 8px 16px;
            font-size: 13.5px;
          }
        }
      `}</style>
    </nav>
  );
}
