import React from 'react';

export default function VerseTabs({ 
  msCount, 
  ctCount, 
  apCount, 
  activeTab,
  book,
  chapter,
  verse,
  manuscripts,
  contradictions,
  apologetics
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
    }
  };

  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleOpen = () => setIsEditing(true);
    window.addEventListener('open-tab-settings', handleOpen);
    return () => window.removeEventListener('open-tab-settings', handleOpen);
  }, []);

  React.useEffect(() => {
    if (containerRef.current && !isEditing) {
      // Small timeout ensures the DOM has settled layout before calculating scroll
      setTimeout(() => {
        const activeEl = containerRef.current.querySelector('.active');
        if (activeEl && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const elRect = activeEl.getBoundingClientRect();
          
          const scrollPos = containerRef.current.scrollLeft + (elRect.left - containerRect.left) - (containerRect.width / 2) + (elRect.width / 2);
          
          containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [activeTab, isEditing]);

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
      <div className="tab-segmented-bar" ref={containerRef}>
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
      </div>

      {/* Displays ONLY the active slot content directly inside the pre-rendered static page! */}
      <div className="tab-panels-window">
        {activeTab === 'manuscripts' && manuscripts}
        {activeTab === 'contradictions' && contradictions}
        {activeTab === 'apologetics' && apologetics}
      </div>

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
      <style>{`
        .tabs-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 12px;
        }

        /* Sleek Segmented Pill Track (Apple visual layout) */
        .tab-segmented-bar {
          display: flex;
          background-color: var(--color-surface-container-low);
          padding: 4px;
          border-radius: 10px;
          gap: 2px;
          position: relative;
          overflow-x: auto;
          scrollbar-width: none;
          border: 1px solid var(--color-outline-variant);
          scroll-behavior: smooth;
        }
        .tab-segmented-bar::-webkit-scrollbar {
          display: none;
        }

        /* Pill Anchor Links */
        .segmented-pill-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          color: var(--color-on-surface-variant);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          white-space: nowrap;
        }

        .segmented-pill-btn:hover {
          color: var(--color-primary);
          background-color: rgba(0, 0, 0, 0.02);
        }

        /* Active Terracotta Highlight pill state */
        .segmented-pill-btn.active {
          background-color: var(--color-secondary); /* Terracotta active color */
          color: #ffffff !important;
          box-shadow: 0 2px 6px rgba(151, 69, 67, 0.2);
        }

        /* Modal Styles */
        .reorder-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }

        .reorder-modal-card {
          background-color: var(--color-surface);
          border-radius: 16px;
          width: 100%;
          max-width: 360px;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: scale(0.95);
          animation: scaleUp 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95) translateY(10px); }
          to { transform: scale(1) translateY(0); }
        }

        .reorder-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .reorder-modal-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-primary);
          margin: 0;
        }

        .reorder-modal-close {
          background: none;
          border: none;
          color: var(--color-on-surface-variant);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.15s;
        }
        .reorder-modal-close:hover {
          background-color: var(--color-surface-container-low);
          color: var(--color-primary);
        }

        .reorder-modal-desc {
          font-size: 13px;
          color: var(--color-on-surface-variant);
          margin-top: 0;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .reorder-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reorder-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          border-radius: 10px;
        }

        .reorder-item-label {
          font-weight: 700;
          color: var(--color-primary);
          font-size: 14px;
        }

        .reorder-item-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .reorder-arrow-btn {
          background: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          color: var(--color-primary);
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .reorder-arrow-btn:hover:not(:disabled) {
          background: var(--color-secondary);
          color: white;
          border-color: var(--color-secondary);
        }
        .reorder-arrow-btn:active:not(:disabled) {
          transform: scale(0.9);
        }
        .reorder-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .reorder-modal-done-btn {
          width: 100%;
          padding: 12px;
          margin-top: 24px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .reorder-modal-done-btn:hover {
          opacity: 0.9;
        }
        .reorder-modal-done-btn:active {
          transform: scale(0.98);
        }

        .tab-panels-window {
          margin-top: 14px;
        }

        .empty-evidence-box {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-on-surface-variant);
          font-size: 13px;
          font-style: italic;
          border: 1px dashed var(--color-outline-variant);
          border-radius: 12px;
          background-color: var(--color-surface-container-low);
        }
      `}</style>

    </div>
  );
}
