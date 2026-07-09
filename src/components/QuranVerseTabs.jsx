import React from 'react';
import '../styles/evidence-tabs.css';
import ScrollableTrack from './ScrollableTrack.jsx';

export default function QuranVerseTabs({ 
  msCount, 
  christianFootnotesCount,
  activeTab,
  surah,
  ayah,
}) {
  const tabs = [
    { id: 'manuscripts', label: `Manuscripts (${msCount})`, show: msCount > 0 },
    { id: 'christian-footnotes', label: `Christian Footnotes (${christianFootnotesCount})`, show: christianFootnotesCount > 0 },
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
      <ScrollableTrack containerClass="tab-segmented-bar" activeTrigger={activeTab}>
        {tabs.map((tab) => {
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

      
    </div>
  );
}
