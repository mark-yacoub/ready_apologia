import React from 'react';

const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  let html = text;
  
  // Extract "A Question to Wonder:" into a custom UI box natively
  html = html.replace(/\*\*A Question to Wonder:\*\*\s*(.*)/g, '<div class="wonder-box"><div class="wonder-title"><span class="wonder-icon">🤔</span> A Question to Wonder</div><div class="wonder-text">$1</div></div>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline">$1</a>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
  return { __html: html };
};

export default function UthmansFireTimeline({ childrenNodes }) {
  if (!childrenNodes || childrenNodes.length === 0) return null;

  return (
    <div style={{ margin: '32px 0 16px 0', padding: '0' }}>
      <div style={{ position: 'relative', borderLeft: '4px solid #cbd5e1', paddingLeft: '40px', marginLeft: '12px' }}>
        {childrenNodes.map((node, index) => {
          const isFire = node.title.includes("Burn");
          const circleColor = isFire ? '#dc2626' : '#334155';
          const bgColor = isFire ? '#fef2f2' : '#f8fafc';
          const borderColor = isFire ? '#fecaca' : '#e2e8f0';

          return (
            <div key={index} style={{ marginBottom: index === childrenNodes.length - 1 ? '0' : '48px', position: 'relative' }}>
              {/* Timeline Connector Dot */}
              <div style={{ 
                position: 'absolute', 
                left: '-58.5px', 
                top: '0',
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: circleColor, 
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '15px',
                boxShadow: '0 0 0 6px #ffffff',
                zIndex: 10
              }}>
                {index + 1}
              </div>

              {/* Title & Desc */}
              <h4 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 800, color: circleColor, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                {node.title}
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: 1.6, color: '#475569' }}>
                {node.content}
              </p>

              {/* Hadith Blocks */}
              {node.hadiths && node.hadiths.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: node.post_content ? '24px' : '0' }}>
                  {node.hadiths.map((hadith, hIdx) => (
                    <div key={hIdx} style={{ 
                      backgroundColor: bgColor, 
                      border: `1px solid ${borderColor}`,
                      borderLeft: `4px solid ${circleColor}`, 
                      padding: '24px', 
                      borderRadius: '0 12px 12px 0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }} dangerouslySetInnerHTML={parseMarkdown(hadith.reference)} />
                      <div style={{ fontSize: '16px', lineHeight: 1.7, color: '#0f172a', marginBottom: '20px', fontStyle: 'italic', fontWeight: 500 }} dangerouslySetInnerHTML={parseMarkdown(hadith.english_text)} />
                      <div style={{ fontSize: '22px', lineHeight: 1.8, color: '#475569', textAlign: 'right' }} dir="rtl">
                         {hadith.arabic_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post Content (Question to Wonder) */}
              {node.post_content && (
                <div dangerouslySetInnerHTML={parseMarkdown(node.post_content)}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
