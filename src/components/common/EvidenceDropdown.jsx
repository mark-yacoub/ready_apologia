import React from 'react';

const Chevron = ({ open }) => (
  <svg className={`chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const EvidenceDropdown = ({
  tTitle,
  currentEvidenceId,
  evidenceOptions,
  dropdownOpen,
  setDropdownOpen,
  base
}) => {
  return (
    <div className="hero-title-wrapper select-none" onClick={(e) => e.stopPropagation()}>
      <button
        className="hero-title-selector-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        title="Switch evidence"
      >
        <h1 className="hero-title-text">{tTitle}</h1>
        <span className="hero-switch-badge">
          <span>Switch Evidence</span>
          <Chevron open={dropdownOpen} />
        </span>
      </button>

      {dropdownOpen && (
        <div className="hero-dropdown-sheet animate-fade-in">
          <div className="dropdown-sheet-header">Available Evidence</div>
          <div className="dropdown-sheet-list">
            {evidenceOptions.map(opt => {
              const isSelected = opt.id === currentEvidenceId;
              return (
                <a
                  key={opt.id}
                  href={`${base}/evidence/${opt.id}`}
                  className={`dropdown-sheet-item ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="sheet-item-title">{opt.title}</span>
                  <div className="sheet-item-right">
                    <span className="sheet-item-count">{opt.count}</span>
                    {isSelected && (
                      <svg className="sheet-checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
