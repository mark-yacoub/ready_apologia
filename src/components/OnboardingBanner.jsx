import React, { useEffect, useRef } from 'react';
import { useOnboardingSequence } from '../hooks/useOnboardingSequence.js';
import { trackOnboardingInteraction } from '../utils/analytics.js';

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
    <div className="onboarding-smart-banner animate-fade-in-up" key={activeTip.id}>
      <div className="banner-content">
        <p>{activeTip.text}</p>
      </div>
      <button className="banner-close" onClick={handleDismiss} aria-label="Dismiss tip">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .onboarding-smart-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-primary-container, #e0e7ff);
          color: var(--color-on-primary-container, #3730a3);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(55, 48, 163, 0.15);
          box-shadow: 0 4px 12px -2px rgba(55, 48, 163, 0.1);
        }
        .banner-content {
          flex: 1;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
        }
        .banner-content p {
          margin: 0;
        }
        .banner-close {
          background: rgba(55, 48, 163, 0.08);
          border: none;
          color: inherit;
          padding: 6px;
          border-radius: 50%;
          margin-left: 12px;
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .banner-close:hover {
          opacity: 1;
          background: rgba(55, 48, 163, 0.15);
        }
        @keyframes fadeInUpSmart {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUpSmart 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />
    </div>
  );
}
