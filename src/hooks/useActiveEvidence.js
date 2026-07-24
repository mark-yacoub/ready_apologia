import { useState, useEffect } from 'react';

export function useActiveEvidence() {
  const [activeIds, setActiveIds] = useState([]);

  useEffect(() => {
    // Safely hydrate state only on the client *after* mount to prevent SSR hydration mismatch
    const syncActive = () => {
      let active = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('activeEvidence') || '[]');
        active = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing activeEvidence from localStorage', e);
      }

      // Legacy fallback
      const legacyEvidence = localStorage.getItem('activeEvidence');
      if (legacyEvidence && typeof legacyEvidence === 'string' && !legacyEvidence.startsWith('[')) {
        active = [legacyEvidence];
        localStorage.setItem('activeEvidence', JSON.stringify(active));
      }

      setActiveIds(active);
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
      // Dispatch a custom event to sync sibling React islands on the same page
      window.dispatchEvent(new Event('activeEvidenceChanged'));
      return next;
    });
  };

  return [activeIds, toggleHighlight];
}
