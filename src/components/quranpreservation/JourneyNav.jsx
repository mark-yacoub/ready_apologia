import React, { useState, useEffect } from 'react';

const JourneyNav = ({ stages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(stages[0]?.id || '');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollContainer = document.querySelector('.main-content') || window;
    
    const handleScroll = () => {
      // Calculate progress
      const scrollY = scrollContainer.scrollTop || window.scrollY;
      const scrollHeight = scrollContainer.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = scrollContainer.clientHeight || window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      setProgress(maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0);

      // Determine active section
      let newActiveId = activeId;
      for (const stage of stages) {
        const el = document.getElementById(stage.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect = scrollContainer.tagName ? scrollContainer.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
          
          // Check if element is currently in the "viewing" zone (top of the scroll container + some offset)
          const offsetTop = rect.top - containerRect.top;
          const offsetBottom = rect.bottom - containerRect.top;
          
          if (offsetTop <= 150 && offsetBottom >= 150) {
            newActiveId = stage.id;
            break;
          }
        }
      }
      
      if (newActiveId !== activeId) {
        setActiveId(newActiveId);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();
    
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [stages, activeId]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    const scrollContainer = document.querySelector('.main-content') || window;
    
    if (el) {
      const navOffset = 60; // Approximate height of the nav bar
      
      if (scrollContainer === window) {
         const elementPosition = el.getBoundingClientRect().top;
         const offsetPosition = elementPosition + window.scrollY - navOffset;
         window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
         const elementPosition = el.getBoundingClientRect().top;
         const containerPosition = scrollContainer.getBoundingClientRect().top;
         const currentScroll = scrollContainer.scrollTop;
         
         scrollContainer.scrollTo({
            top: currentScroll + (elementPosition - containerPosition) - navOffset,
            behavior: 'smooth'
         });
      }
      
      setActiveId(id);
      setIsOpen(false);
    }
  };

  const activeTitle = stages.find(s => s.id === activeId)?.title || 'Journey';

  return (
    <div className="journey-sticky-nav" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      {/* Progress Bar Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', backgroundColor: '#e2e8f0', width: '100%', zIndex: 0 }} />
      {/* Progress Bar Fill */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', backgroundColor: '#ef4444', width: `${progress}%`, transition: 'width 0.2s ease', zIndex: 1 }} />
      
      <div 
        onClick={toggleDropdown}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', position: 'relative', zIndex: 2 }}
      >
        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '16px' }}>
          {activeTitle}
        </span>
        <svg style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', width: '20px', height: '20px', fill: 'none', stroke: '#64748b', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)', maxHeight: '70vh', overflowY: 'auto' }}>
          {stages.map((stage, idx) => (
            <div 
              key={stage.id} 
              onClick={() => scrollTo(stage.id)}
              style={{
                padding: '16px 20px',
                borderLeft: activeId === stage.id ? '4px solid #ef4444' : '4px solid transparent',
                backgroundColor: activeId === stage.id ? '#f8fafc' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeId === stage.id ? 700 : 500,
                color: activeId === stage.id ? '#0f172a' : '#475569',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '2px' }}>STAGE {idx}</div>
              {stage.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JourneyNav;
