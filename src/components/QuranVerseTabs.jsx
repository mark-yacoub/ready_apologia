import React from 'react';
import '../styles/evidence-tabs.css';
import ScrollableTrack from './ScrollableTrack.jsx';

export default function QuranVerseTabs({ 
  msCount, 
  christianFootnotesCount,
  islamicCommentariesCount,
  contradictionsCount,
  scientificErrorsCount,
  activeTab,
  surah,
  ayah,
}) {
  const tabs = [
    { id: 'scientific-errors', label: `Scientific Errors (${scientificErrorsCount})`, show: scientificErrorsCount > 0 },
    { id: 'contradictions', label: `Contradictions (${contradictionsCount})`, show: contradictionsCount > 0 },
    { id: 'christian-footnotes', label: `Christian Footnotes (${christianFootnotesCount})`, show: christianFootnotesCount > 0 },
    { id: 'islamic-commentaries', label: `Islamic Commentaries (${islamicCommentariesCount})`, show: islamicCommentariesCount > 0 },
    { id: 'manuscripts', label: `Manuscripts (${msCount})`, show: msCount > 0 },
  ].filter(t => t.show);

  if (tabs.length === 0) {
    return (
      <div className="empty-evidence-box">
        No evidence data mapped for this verse yet.
      </div>
    );
  }

  const [tabOrder, setTabOrder] = React.useState(['scientific-errors', 'contradictions', 'christian-footnotes', 'islamic-commentaries', 'manuscripts']);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('ready_apologia_quran_tab_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          setTabOrder(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const moveTab = (id, direction) => {
    const currentIndex = tabOrder.indexOf(id);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < tabOrder.length) {
      const newOrder = [...tabOrder];
      [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
      setTabOrder(newOrder);
      localStorage.setItem('ready_apologia_quran_tab_order', JSON.stringify(newOrder));
    }
  };

  React.useEffect(() => {
    const handleOpen = () => setIsEditing(true);
    window.addEventListener('open-quran-tab-settings', handleOpen);
    return () => window.removeEventListener('open-quran-tab-settings', handleOpen);
  }, []);

  const sortedTabs = [...tabs].sort((a, b) => {
    let idxA = tabOrder.indexOf(a.id);
    let idxB = tabOrder.indexOf(b.id);
    if (idxA === -1) idxA = 99;
    if (idxB === -1) idxB = 99;
    return idxA - idxB;
  });

  return (
    <div className="tabs-wrapper select-none">
      <ScrollableTrack containerClass="tab-segmented-bar" activeTrigger={`${activeTab}-${isEditing}`}>
        {sortedTabs.map((tab) => {
          const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
          const targetUrl = `${base}/quran/${surah}/${ayah}/${tab.id}`;
          const isActive = activeTab === tab.id;

          return (
            <a
              key={tab.id}
              href={targetUrl}
              className={`segmented-pill-btn ${isActive ? 'active' : ''}`}
              role="tab"
              aria-selected={isActive}
            >
              {tab.label}
            </a>
          );
        })}
      </ScrollableTrack>

      {isEditing && (
        <div className="reorder-modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="reorder-modal-card" onClick={e => e.stopPropagation()}>
            <div className="reorder-modal-header">
              <h3 className="reorder-modal-title">Customize Quran Tab Order</h3>
              <button className="reorder-modal-close" onClick={() => setIsEditing(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="reorder-modal-desc">Use the arrows to set your preferred Quran evidence tab order. This saves independently to your device.</p>
            
            <div className="reorder-list">
              {sortedTabs.map((tab, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sortedTabs.length - 1;
                
                return (
                  <div key={tab.id} className="reorder-list-item">
                    <span className="reorder-item-label">{tab.label}</span>
                    <div className="reorder-item-controls">
                      <button 
                        className="reorder-arrow-btn" 
                        onClick={() => moveTab(tab.id, -1)}
                        disabled={isFirst}
                        aria-label={`Move ${tab.label} up`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button 
                        className="reorder-arrow-btn" 
                        onClick={() => moveTab(tab.id, 1)}
                        disabled={isLast}
                        aria-label={`Move ${tab.label} down`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="reorder-modal-done-btn" onClick={() => setIsEditing(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
