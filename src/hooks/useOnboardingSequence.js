import { useState, useEffect } from 'react';

const ONBOARDING_TIPS = [
  {
    id: 'verse',
    storageKey: 'ready_apologia_tip_verse',
    text: "💡 Tip: Tap on any verse below to explore its videos, apologetics, and manuscript evidence.",
    isCompletedTrigger: () => false // Handled exclusively by DOM clicks
  },
  {
    id: 'quran',
    storageKey: 'ready_apologia_tip_quran',
    text: "🌙 Tip: Check out the Quran section in the navigation menu on the left.",
    isCompletedTrigger: (path) => path.includes('/quran')
  },
  {
    id: 'evidence',
    storageKey: 'ready_apologia_tip_evidence',
    text: "🔍 Tip: Explore the Evidence and Discover tabs to dive deeper into our catalog.",
    isCompletedTrigger: (path) => path.includes('/evidence') || path.includes('/discover')
  }
];

export function useOnboardingSequence() {
  const [activeTipIndex, setActiveTipIndex] = useState(-1);

  const evaluateSequence = () => {
    if (typeof window === 'undefined') return;

    // 1. Process URL match rules to instantly autocomplete relevant tips
    const path = window.location.pathname;
    ONBOARDING_TIPS.forEach(tip => {
      if (tip.isCompletedTrigger(path)) {
        localStorage.setItem(tip.storageKey, 'true');
      }
    });

    // 2. Find the first tip that isn't functionally completed
    const nextIndex = ONBOARDING_TIPS.findIndex(
      tip => localStorage.getItem(tip.storageKey) !== 'true'
    );
    
    // 3. Sync clean React state
    setActiveTipIndex(nextIndex);
  };

  // Mount effects
  useEffect(() => {
    evaluateSequence();

    // 1. Astro SPA Router hook
    const handleNavigation = () => evaluateSequence();
    document.addEventListener('astro:after-swap', handleNavigation);

    return () => {
      document.removeEventListener('astro:after-swap', handleNavigation);
    };
  }, []);

  // Global interactions that depend on current sequence index
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('[data-onboarding-trigger]');
      if (!target) return;
      
      const triggerId = target.getAttribute('data-onboarding-trigger');
      
      // If we are currently showing the verse tip and they interacted with a verse...
      if (
        triggerId === 'verse' && 
        activeTipIndex >= 0 && 
        ONBOARDING_TIPS[activeTipIndex].id === 'verse'
      ) {
        localStorage.setItem(ONBOARDING_TIPS[activeTipIndex].storageKey, 'true');
        evaluateSequence();
      }
    };

    // Attach to capture phase for priority
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [activeTipIndex]);

  const dismissCurrent = (e) => {
    if (e) e.stopPropagation();
    if (activeTipIndex >= 0) {
      localStorage.setItem(ONBOARDING_TIPS[activeTipIndex].storageKey, 'true');
      evaluateSequence();
    }
  };

  const activeTip = activeTipIndex >= 0 ? ONBOARDING_TIPS[activeTipIndex] : null;

  return { activeTip, dismissCurrent };
}
