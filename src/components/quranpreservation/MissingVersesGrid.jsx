import React from 'react';

const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #ea580c; text-decoration: underline">$1</a>');
  html = html.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
  return { __html: html };
};

export default function MissingVersesGrid({ childrenNodes }) {
  if (!childrenNodes || childrenNodes.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      marginTop: '32px',
      marginBottom: '32px'
    }}>
      {childrenNodes.map((node, idx) => (
        <div key={idx} style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #ef4444',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
              {node.title}
            </h3>
            <span style={{ 
              backgroundColor: '#fee2e2', 
              color: '#991b1b', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              MISSING
            </span>
          </div>
          
          {/* Content Description */}
          <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#475569', marginBottom: '24px' }} dangerouslySetInnerHTML={parseMarkdown(node.content)} />

          {/* Hadith Evidences */}
          {node.hadiths && node.hadiths.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
              {node.hadiths.map((h, hIdx) => (
                <div key={hIdx} style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '6px',
                  borderLeft: '3px solid #cbd5e1'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }} dangerouslySetInnerHTML={parseMarkdown(h.reference)} />
                  {h.arabic_text && (
                    <div 
                      style={{ fontSize: '18px', lineHeight: 1.8, color: '#334155', textAlign: 'right', marginBottom: '12px', fontFamily: '"Scheherazade New", serif' }} 
                      dir="rtl"
                      dangerouslySetInnerHTML={parseMarkdown(h.arabic_text)}
                    />
                  )}
                  <div style={{ fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', color: '#0f172a' }} dangerouslySetInnerHTML={parseMarkdown(h.english_text)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
