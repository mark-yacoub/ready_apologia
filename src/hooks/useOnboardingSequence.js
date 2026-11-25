import { useState, useEffect } from 'react';

const ONBOARDING_TIPS = [
  {
    id: 'verse',
    icon: 'verse',
    storageKey: 'ready_apologia_tip_verse',
    text: "Tip: Tap on any verse below to explore its videos, apologetics, and manuscript evidence.",
    isRelevant: (path) =>
      path.includes('/bible/') ||
      path.includes('/quran/') ||
      (typeof document !== 'undefined' && Boolean(document.querySelector('[data-onboarding-trigger="verse"]'))),
    isCompletedTrigger: () => false // Handled exclusively by DOM clicks
  },
  {
    id: 'quran',
    icon: 'quran',
    storageKey: 'ready_apologia_tip_quran',
    text: "Tip: Check out the Quran section in the navigation menu on the left.",
    isRelevant: () => true,
    isCompletedTrigger: (path) => path.includes('/quran')
  },
  {
    id: 'evidence',
    icon: 'evidence',
    storageKey: 'ready_apologia_tip_evidence',
    text: "Tip: Explore the Evidence and Discover tabs to dive deeper into our catalog.",
    isRelevant: () => true,
    isCompletedTrigger: (path) => path.includes('/evidence') || path.includes('/discover')
  }
];

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return 'true';
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota / private-browsing errors
  }
}

export function useOnboardingSequence() {
  const [activeTipIndex, setActiveTipIndex] = useState(-1);

  const evaluateSequence = () => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;
    ONBOARDING_TIPS.forEach(tip => {
      if (tip.isCompletedTrigger(path)) {
        safeSetItem(tip.storageKey, 'true');
      }
    });

    const nextIndex = ONBOARDING_TIPS.findIndex(
      tip => safeGetItem(tip.storageKey) !== 'true' && tip.isRelevant(path)
    );

    setActiveTipIndex(nextIndex);
  };

  useEffect(() => {
    evaluateSequence();

    const handleNavigation = () => evaluateSequence();
    document.addEventListener('astro:page-load', handleNavigation);

    return () => {
      document.removeEventListener('astro:page-load', handleNavigation);
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-onboarding-trigger]') : null;
      if (!target) return;

      const triggerId = target.getAttribute('data-onboarding-trigger');

      if (
        triggerId === 'verse' &&
        activeTipIndex >= 0 &&
        ONBOARDING_TIPS[activeTipIndex].id === 'verse'
      ) {
        safeSetItem(ONBOARDING_TIPS[activeTipIndex].storageKey, 'true');
        evaluateSequence();
      }
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [activeTipIndex]);

  const dismissCurrent = (e) => {
    if (e) e.stopPropagation();
    if (activeTipIndex >= 0) {
      safeSetItem(ONBOARDING_TIPS[activeTipIndex].storageKey, 'true');
      evaluateSequence();
    }
  };

  const activeTip = activeTipIndex >= 0 ? ONBOARDING_TIPS[activeTipIndex] : null;

  return { activeTip, dismissCurrent };
}
