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
    if (containerRef.current && !isEditing) {
      const activeEl = containerRef.current.querySelector('.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
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
          const targetUrl = `/bible/${book}/${chapter}/${verse}/${tab.id}`;
          const isActive = activeTab === tab.id;
          const currentOrderIndex = tabOrder.indexOf(tab.id);

          if (isEditing) {
            return (
              <div key={tab.id} className="segmented-pill-btn edit-mode-pill active">
                <button 
                  className="reorder-arrow-btn" 
                  onClick={() => moveTab(tab.id, -1)}
                  disabled={currentOrderIndex === 0}
                  aria-label="Move left"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="edit-pill-label">{tab.label}</span>
                <button 
                  className="reorder-arrow-btn" 
                  onClick={() => moveTab(tab.id, 1)}
                  disabled={currentOrderIndex === tabOrder.length - 1}
                  aria-label="Move right"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            );
          }

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

        {/* Gear / Check icon to toggle Edit Mode */}
        <button 
          className={`reorder-toggle-btn ${isEditing ? 'active' : ''}`} 
          onClick={() => setIsEditing(!isEditing)}
          aria-label={isEditing ? "Finish reordering" : "Reorder tabs"}
          title="Reorder tabs"
        >
          {isEditing ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          )}
        </button>
      </div>

      {/* Displays ONLY the active slot content directly inside the pre-rendered static page! */}
      <div className="tab-panels-window">
        {activeTab === 'manuscripts' && manuscripts}
        {activeTab === 'contradictions' && contradictions}
        {activeTab === 'apologetics' && apologetics}
      </div>

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
        }
        .tab-segmented-bar::-webkit-scrollbar {
          display: none;
        }

        /* Pill Anchor Links (Replaces heavy JS buttons) */
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

        /* Edit Mode Styles */
        .edit-mode-pill {
          justify-content: space-between;
          padding: 6px 6px;
          gap: 6px;
          background-color: var(--color-surface) !important;
          color: var(--color-primary) !important;
          border: 1px dashed var(--color-outline-variant);
          box-shadow: none !important;
          animation: wiggle 0.3s ease-in-out infinite alternate;
        }
        
        .edit-pill-label {
          flex: 1;
          text-align: center;
        }

        .reorder-arrow-btn {
          background: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          color: var(--color-primary);
          border-radius: 6px;
          width: 24px;
          height: 24px;
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
        .reorder-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .reorder-toggle-btn {
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .reorder-toggle-btn:hover {
          color: var(--color-primary);
          background-color: rgba(0,0,0,0.04);
        }
        .reorder-toggle-btn.active {
          color: #16a34a; /* Green checkmark when active */
          background-color: rgba(22, 163, 74, 0.1);
        }

        @keyframes wiggle {
          0% { transform: rotate(-0.5deg); }
          100% { transform: rotate(0.5deg); }
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
