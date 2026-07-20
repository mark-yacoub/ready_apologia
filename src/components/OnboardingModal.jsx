import React, { useState, useEffect } from 'react';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has permanently dismissed the tip by achieving the goal
    const hasAchievedGoal = localStorage.getItem('ready_apologia_has_seen_full_evidence') === 'true';

    // Check if the user has already seen the tip during this specific browser session
    const hasSeenThisSession = sessionStorage.getItem('ready_apologia_session_tip_shown') === 'true';

    if (!hasAchievedGoal && !hasSeenThisSession) {
      setIsOpen(true);
      sessionStorage.setItem('ready_apologia_session_tip_shown', 'true');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="onboarding-modal-backdrop" onClick={() => setIsOpen(false)}>
      <div className="onboarding-modal-card" onClick={e => e.stopPropagation()}>
        <div className="onboarding-icon">🔍</div>
        <h3 className="onboarding-title">Welcome to Ready Apologia!</h3>
        <p className="onboarding-desc">
          This isn't just a Bible reader. Tap on any verse (e.g. <strong>John 1:1</strong>) to explore ancient <strong>Manuscript Evidence</strong>, <strong>Apologetics</strong>, and answers to alleged <strong>Contradictions</strong>.
        </p>
        <button className="onboarding-btn" onClick={() => setIsOpen(false)}>
          Start Exploring
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .onboarding-modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(9, 9, 11, 0.6);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.3s ease-out forwards;
          backdrop-filter: blur(2px);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .onboarding-modal-card {
          background-color: var(--color-surface);
          border-radius: 20px;
          width: 100%;
          max-width: 340px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: scale(0.95);
          animation: scaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95) translateY(10px); }
          to { transform: scale(1) translateY(0); }
        }
        .onboarding-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .onboarding-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          color: var(--color-primary);
          margin: 0 0 12px 0;
          line-height: 1.2;
        }
        .onboarding-desc {
          font-size: 14px;
          color: var(--color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .onboarding-desc strong {
          color: var(--color-primary);
        }
        .onboarding-btn {
          width: 100%;
          padding: 14px;
          background-color: var(--color-secondary);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .onboarding-btn:active {
          transform: scale(0.97);
        }
      `}} />
    </div>
  );
}
