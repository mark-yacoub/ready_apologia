import React, { useState } from 'react';

export default function VerseTabs({ 
  hasManuscripts, 
  hasContradictions, 
  hasApologetics, 
  manuscripts, 
  contradictions, 
  apologetics 
}) {
  
  // Determine initial active tab based on what has content
  const getInitialTab = () => {
    if (hasManuscripts) return 'manuscripts';
    if (hasContradictions) return 'contradictions';
    if (hasApologetics) return 'apologetics';
    return 'manuscripts';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const tabs = [
    { id: 'manuscripts', label: '📜 Manuscripts', show: hasManuscripts },
    { id: 'contradictions', label: '⚖️ Contradictions', show: hasContradictions },
    { id: 'apologetics', label: '🛡️ Apologetics', show: hasApologetics }
  ].filter(t => t.show);

  if (tabs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
        No evidence data mapped for this verse yet.
      </div>
    );
  }

  return (
    <div className="tabs-container">
      {/* Tab Selectors */}
      <div className="tab-headers">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents (Indexable HTML structure for Google SEO) */}
      <div className="tab-panels-container">
        {/* Panel: Manuscripts */}
        <div className={`tab-panel ${activeTab === 'manuscripts' ? 'active-panel' : 'hidden-panel'}`}>
          {manuscripts}
        </div>

        {/* Panel: Contradictions */}
        <div className={`tab-panel ${activeTab === 'contradictions' ? 'active-panel' : 'hidden-panel'}`}>
          {contradictions}
        </div>

        {/* Panel: Apologetics */}
        <div className={`tab-panel ${activeTab === 'apologetics' ? 'active-panel' : 'hidden-panel'}`}>
          {apologetics}
        </div>
      </div>

      {/* Inline modular styling for clean isolation */}
      <style>{`
        .tabs-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 16px;
        }

        .tab-headers {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
          overflow-x: auto;
          scrollbar-width: none; /* Hide scrollbar Firefox */
        }
        .tab-headers::-webkit-scrollbar {
          display: none; /* Hide scrollbar Chrome/Safari */
        }
        .dark .tab-headers {
          border-bottom: 1px solid #1f2937;
        }

        .tab-btn {
          padding: 10px 16px;
          background: none;
          border: none;
          color: #4b5563;
          font-size: 13px;
          font-weight: 600;
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .dark .tab-btn {
          color: #9ca3af;
        }
        .tab-btn:hover {
          background-color: #f3f4f6;
        }
        .dark .tab-btn:hover {
          background-color: #1f2937;
        }

        .tab-btn.active {
          background-color: #2563eb;
          color: #ffffff;
        }
        .dark .tab-btn.active {
          background-color: #3b82f6;
          color: #ffffff;
        }

        .tab-panels-container {
          margin-top: 20px;
        }

        .tab-panel {
          transition: opacity 0.2s ease;
        }

        .active-panel {
          display: block;
          opacity: 1;
        }

        .hidden-panel {
          display: none; /* Client-side hidden, but still in raw HTML source for Google SEO index! */
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
