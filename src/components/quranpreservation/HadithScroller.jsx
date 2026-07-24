import React, { useRef } from 'react';

const HadithScroller = ({ hadiths }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return { __html: html };
  };

  return (
    <div style={{ position: 'relative', margin: '24px 0' }}>
      {hadiths.length > 1 && (
        <div className="hadith-scroller-controls">
          <button 
            onClick={() => scroll('left')}
            className="hadith-scroll-btn"
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="hadith-scroll-btn"
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}

      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'auto', 
          paddingBottom: '16px', 
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // hide on firefox
          msOverflowStyle: 'none', // hide on IE
        }}
        className="hide-scrollbar"
      >
        {hadiths.map((h, i) => (
          <div 
            key={i} 
            style={{ 
              minWidth: hadiths.length > 1 ? '75%' : '100%', 
              maxWidth: hadiths.length > 1 ? '380px' : 'none',
              scrollSnapAlign: 'start',
              borderLeft: '4px solid #b91c1c',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '0 8px 8px 0',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div 
              className="hadith-ref-text"
              style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}
              dangerouslySetInnerHTML={parseMarkdown(h.reference)}
            />
            
            {h.arabic_text && (
              <div 
                dir="rtl"
                style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#334155', marginBottom: '12px', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={parseMarkdown(h.arabic_text)}
              />
            )}
            
            <div 
              style={{ fontFamily: 'var(--font-body, system-ui, sans-serif)', fontSize: '15px', color: '#1e293b', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={parseMarkdown(h.english_text)}
            />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hadith-ref-text a {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.2s;
        }
        .hadith-ref-text a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hadith-scroller-controls {
          display: none; /* Hidden on mobile */
          position: absolute;
          top: 50%;
          left: -40px;
          right: -40px;
          transform: translateY(-50%);
          z-index: 10;
        }
        .hadith-scroll-btn {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transition: all 0.2s;
        }
        .hadith-scroll-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        @media (min-width: 768px) {
          .hadith-scroller-controls {
            display: flex; /* Show controls on desktop */
            justify-content: space-between;
            pointer-events: none; /* Let clicks pass through empty space */
          }
          .hadith-scroll-btn {
            pointer-events: auto; /* Enable clicks on buttons */
          }
        }
      `}} />
    </div>
  );
};

export default HadithScroller;
