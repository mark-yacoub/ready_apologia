import { useState, useEffect } from 'react';

export const DEFAULT_ACTIVE_EVIDENCE = [
  'divinity_of_christ',
  'divinity_of_the_holy_spirit',
  'trinity',
  'prophecies'
];

const DEFAULT_MIGRATION_KEY = 'ready_apologia_highlight_default_v1';

export function getActiveEvidenceFromStorage() {
  if (typeof window === 'undefined') return [...DEFAULT_ACTIVE_EVIDENCE];

  try {
    // Ensure everyone has "Highlight in Scripture" turned on by default at least once
    if (!localStorage.getItem(DEFAULT_MIGRATION_KEY)) {
      localStorage.setItem('activeEvidence', JSON.stringify(DEFAULT_ACTIVE_EVIDENCE));
      localStorage.setItem(DEFAULT_MIGRATION_KEY, 'true');
      localStorage.removeItem('activeTopic');
      return [...DEFAULT_ACTIVE_EVIDENCE];
    }

    const raw = localStorage.getItem('activeEvidence');
    if (raw === null) {
      localStorage.setItem('activeEvidence', JSON.stringify(DEFAULT_ACTIVE_EVIDENCE));
      return [...DEFAULT_ACTIVE_EVIDENCE];
    }

    if (!raw.startsWith('[')) {
      const legacy = [raw];
      localStorage.setItem('activeEvidence', JSON.stringify(legacy));
      return legacy;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_ACTIVE_EVIDENCE];
  } catch (e) {
    console.error('Error parsing activeEvidence from localStorage', e);
    return [...DEFAULT_ACTIVE_EVIDENCE];
  }
}

export function useActiveEvidence() {
  const [activeIds, setActiveIds] = useState(DEFAULT_ACTIVE_EVIDENCE);

  useEffect(() => {
    const syncActive = () => {
      setActiveIds(getActiveEvidenceFromStorage());
    };

    syncActive();

    const onStorage = (e) => {
      if (e.key === 'activeEvidence') syncActive();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('activeEvidenceChanged', syncActive);
    document.addEventListener('astro:after-swap', syncActive);
    document.addEventListener('astro:page-load', syncActive);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('activeEvidenceChanged', syncActive);
      document.removeEventListener('astro:after-swap', syncActive);
      document.removeEventListener('astro:page-load', syncActive);
    };
  }, []);

  const toggleHighlight = (tId) => {
    setActiveIds(current => {
      const next = current.includes(tId) 
        ? current.filter(id => id !== tId) 
        : [...current, tId];
        
      localStorage.setItem('activeEvidence', JSON.stringify(next));
      localStorage.setItem(DEFAULT_MIGRATION_KEY, 'true');
      // Dispatch a custom event to sync sibling React islands on the same page
      window.dispatchEvent(new Event('activeEvidenceChanged'));
      return next;
    });
  };

  return [activeIds, toggleHighlight];
}
