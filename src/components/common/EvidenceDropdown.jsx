import React, { useEffect, useRef } from 'react';

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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen, setDropdownOpen]);

  return (
    <div ref={containerRef} className="hero-title-wrapper select-none" onClick={(e) => e.stopPropagation()}>
      <div className="hero-title-group">
        <h1 className="hero-title-text">{tTitle}</h1>
        <button
          type="button"
          className="hero-title-selector-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label={`Switch evidence topic from ${tTitle}`}
          title="Switch evidence"
        >
          <span className="hero-switch-badge">
            <span>Switch Evidence</span>
            <Chevron open={dropdownOpen} />
          </span>
        </button>
      </div>

      {dropdownOpen && (
        <div className="hero-dropdown-sheet animate-fade-in" role="listbox" aria-label="Available Evidence Topics">
          <div className="dropdown-sheet-header">Available Evidence</div>
          <div className="dropdown-sheet-list">
            {evidenceOptions.map(opt => {
              const isSelected = opt.id === currentEvidenceId;
              return (
                <a
                  key={opt.id}
                  href={`${base}/evidence/${opt.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`dropdown-sheet-item ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="sheet-item-title">{opt.title}</span>
                  <div className="sheet-item-right">
                    <span className="sheet-item-count">{opt.count}</span>
                    {isSelected && (
                      <svg className="sheet-checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
