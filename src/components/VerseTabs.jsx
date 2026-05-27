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
    { id: 'contradictions', label: `Contradictions (${ctCount})`, show: ctCount > 0 },
    { id: 'apologetics', label: `Apologetics (${apCount})`, show: apCount > 0 }
  ].filter(t => t.show);

  if (tabs.length === 0) {
    return (
      <div className="empty-evidence-box">
        No evidence data mapped for this verse yet.
      </div>
    );
  }

  return (
    <div className="tabs-wrapper select-none">
      
      {/* Category Segmented Pill Headers (Sleek Apple-Style Static Slider Links) */}
      <div className="tab-segmented-bar">
        {tabs.map(tab => {
          const targetUrl = `/bible/${book}/${chapter}/${verse}/${tab.id}`;
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
          display: inline-block;
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
