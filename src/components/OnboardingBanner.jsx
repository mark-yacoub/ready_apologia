import React, { useEffect, useRef } from 'react';
import { useOnboardingSequence } from '../hooks/useOnboardingSequence.js';
import { trackOnboardingInteraction } from '../utils/analytics.js';

function TipIcon({ kind }) {
  if (kind === 'quran') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (kind === 'evidence') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  // Default: interactive verse guide icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  );
}

export default function OnboardingBanner() {
  const { activeTip, dismissCurrent } = useOnboardingSequence();

  const trackedViews = useRef(new Set());

  useEffect(() => {
    if (activeTip?.id && !trackedViews.current.has(activeTip.id)) {
      trackOnboardingInteraction({ tipId: activeTip.id, action: 'view' });
      trackedViews.current.add(activeTip.id);
    }
  }, [activeTip?.id]);

  const handleDismiss = () => {
    if (activeTip) {
      trackOnboardingInteraction({ tipId: activeTip.id, action: 'dismiss' });
    }
    dismissCurrent();
  };

  if (!activeTip) return null;

  return (
    <aside className="onboarding-smart-banner animate-fade-in-up" key={activeTip.id} aria-label="Quick guide">
      <div className="banner-icon-badge" aria-hidden="true">
        <TipIcon kind={activeTip.icon} />
      </div>
      <div className="banner-content">
        <div className="banner-kicker">Quick Guide</div>
        <p>{activeTip.text}</p>
      </div>
      <button type="button" className="banner-close" onClick={handleDismiss} aria-label="Dismiss tip">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .onboarding-smart-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background-color: var(--ra-surface, #ffffff);
          color: var(--ra-ink, #1b1917);
          padding: 12px 10px 12px 14px;
          border-radius: 12px;
          margin-bottom: 18px;
          border: 1px solid var(--ra-verify-rule, #bdd8dc);
          border-left: 3.5px solid var(--ra-verify, #0e5e6f);
          box-shadow: 0 4px 16px -4px rgba(14, 94, 111, 0.12), 0 1px 2px rgba(27, 25, 23, 0.04);
        }
        .banner-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background-color: var(--ra-verify-bg, #e8f2f3);
          color: var(--ra-verify, #0e5e6f);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .banner-content {
          flex: 1;
          min-width: 0;
        }
        .banner-kicker {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ra-verify, #0e5e6f);
          margin-bottom: 3px;
        }
        .banner-content p {
          margin: 0;
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.45;
          color: var(--ra-ink, #1b1917);
        }
        .banner-close {
          position: relative;
          background: transparent;
          border: 1px solid transparent;
          color: var(--ra-ink-3, #6b6560);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .banner-close::after {
          content: '';
          position: absolute;
          inset: -6px;
        }
        .banner-close:hover {
          background-color: var(--ra-well, #f3efe8);
          color: var(--ra-ink, #1b1917);
          border-color: var(--ra-line, #e8e2d9);
        }
        .banner-close:focus-visible {
          outline: 2px solid var(--ra-verify, #0e5e6f);
          outline-offset: 2px;
        }
        @keyframes fadeInUpSmart {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUpSmart 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up { animation: none; }
        }
      `}} />
    </aside>
  );
}
