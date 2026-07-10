import React from 'react';
import '../styles/evidence-tabs.css';
import ScrollableTrack from './ScrollableTrack.jsx';
import { trackTabReorder } from '../utils/analytics.js';

export default function VerseTabs({ 
  msCount, 
  ctCount, 
  apCount, 
  activeTab,
  book,
  chapter,
  verse,
}) {
  
  // Build the horizontal links track. Switching tabs is now a standard, bookmarkable page link!
  const tabs = [
    { id: 'manuscripts', label: `Manuscripts (${msCount})`, show: msCount > 0 },
    { id: 'contradictions', label: `Alleged Contradictions (${ctCount})`, show: ctCount > 0 },
    { id: 'apologetics', label: `Apologetics (${apCount})`, show: apCount > 0 }
  ].filter(t => t.show);

  if (tabs.length === 0) {
    return (
      <div className="empty-evidence-box">
        No evidence data mapped for this verse yet.
      </div>
    );
  }

  const [tabOrder, setTabOrder] = React.useState(['manuscripts', 'contradictions', 'apologetics']);
  const [isEditing, setIsEditing] = React.useState(false);

  // Onboarding Goal Check: If verse has all 3 evidence types, permanently disable the tip
  React.useEffect(() => {
    if (msCount > 0 && ctCount > 0 && apCount > 0) {
      localStorage.setItem('ready_apologia_has_seen_full_evidence', 'true');
    }
  }, [msCount, ctCount, apCount]);

  React.useEffect(() => {
    const saved = localStorage.getItem('ready_apologia_tab_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
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
      localStorage.setItem('ready_apologia_tab_order', JSON.stringify(newOrder));
      trackTabReorder({ testament: 'Bible', topTab: newOrder[0], fullOrder: newOrder });
    }
  };

  React.useEffect(() => {
    const handleOpen = () => setIsEditing(true);
    window.addEventListener('open-tab-settings', handleOpen);
    return () => window.removeEventListener('open-tab-settings', handleOpen);
  }, []);

  // Sort the visible tabs according to the user's custom preference
  const sortedTabs = [...tabs].sort((a, b) => {
    let idxA = tabOrder.indexOf(a.id);
    let idxB = tabOrder.indexOf(b.id);
    if (idxA === -1) idxA = 99;
    if (idxB === -1) idxB = 99;
    return idxA - idxB;
  });

  return (
    <div className="tabs-wrapper select-none">
      
      {/* Category Segmented Pill Headers */}
      <ScrollableTrack containerClass="tab-segmented-bar" activeTrigger={`${activeTab}-${isEditing}`}>
        {sortedTabs.map((tab) => {
          const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
          const targetUrl = `${base}/bible/${book}/${chapter}/${verse}/${tab.id}`;
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

      {/* Settings Modal Popup */}
      {isEditing && (
        <div className="reorder-modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="reorder-modal-card" onClick={e => e.stopPropagation()}>
            <div className="reorder-modal-header">
              <h3 className="reorder-modal-title">Customize Tab Order</h3>
              <button className="reorder-modal-close" onClick={() => setIsEditing(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="reorder-modal-desc">Use the arrows to set your preferred tab order. This saves to your device.</p>
            
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
                        aria-label="Move up"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button 
                        className="reorder-arrow-btn" 
                        onClick={() => moveTab(tab.id, 1)}
                        disabled={isLast}
                        aria-label="Move down"
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

      {/* Custom Light-Only CSS Styles */}
      

    </div>
  );
}
