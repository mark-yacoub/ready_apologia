import React from 'react';
import { NAV_TABS, useNavTabs } from './navTabs.js';

/** Mobile bottom tab bar. Tabs, active state and the Scriptures destination come from navTabs.js. */
export default function BottomNav() {
  const { activeTab, hrefFor } = useNavTabs();

  return (
    <div className="bottom-nav">
      {NAV_TABS.map(tab => (
        <a
          key={tab.id}
          href={hrefFor(tab)}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'true' : undefined}
        >
          <div className="nav-icon-wrapper">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
            </svg>
          </div>
          <span className="label">{tab.label}</span>
        </a>
      ))}
    </div>
  );
}
