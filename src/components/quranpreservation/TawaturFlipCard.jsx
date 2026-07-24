import React, { useState } from 'react';

const TawaturFlipCard = ({ llmText, hadith }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return { __html: html };
  };

  return (
    <div style={{ margin: '24px 0', perspective: '1200px', width: '100%', boxSizing: 'border-box' }}>
      <div 
        style={{
          display: 'grid',
          width: '100%',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          boxSizing: 'border-box'
        }}
      >
        {/* Front Panel (Infographic) */}
        <div 
          style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
             <div style={{ background: '#334155', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: 800, fontSize: '14px', display: 'inline-block' }}>Tawatur (Mass Consensus Claimed)</div>
             <div style={{ margin: '12px 0', fontSize: '24px', color: '#94a3b8' }}>↓</div>
             <div style={{ background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: 800, fontSize: '14px', display: 'inline-block' }}>Abu Khuzaima (Single Thread)</div>
          </div>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: '0 0 24px 0', textAlign: 'left' }}>
            {llmText}
          </p>
          <button 
            onClick={() => setIsFlipped(true)}
            style={{ 
              background: '#0f172a', 
              color: 'white', 
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              marginTop: 'auto'
            }}
          >
            Reveal Hadith Proof ↺
          </button>
        </div>

        {/* Back Panel (Hadith) */}
        <div 
          style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderLeft: '4px solid #b91c1c',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            borderRight: '1px solid #e2e8f0',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ flex: 1 }}>
            <div 
              className="hadith-ref-text-flip"
              style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}
              dangerouslySetInnerHTML={parseMarkdown(hadith.reference)}
            />
            {hadith.arabic_text && (
              <div 
                dir="rtl"
                style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#334155', marginBottom: '16px', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={parseMarkdown(hadith.arabic_text)}
              />
            )}
            <div 
              style={{ fontFamily: 'var(--font-body, system-ui, sans-serif)', fontSize: '15px', color: '#1e293b', lineHeight: 1.6, marginBottom: '24px' }}
              dangerouslySetInnerHTML={parseMarkdown(hadith.english_text)}
            />
          </div>
          
          <button 
            onClick={() => setIsFlipped(false)}
            style={{ 
              background: '#f1f5f9', 
              color: '#0f172a', 
              border: '1px solid #cbd5e1',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              alignSelf: 'center',
              marginTop: 'auto'
            }}
          >
            ↺ Back to Diagram
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hadith-ref-text-flip a {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.2s;
        }
        .hadith-ref-text-flip a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default TawaturFlipCard;
