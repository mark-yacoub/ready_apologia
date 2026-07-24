import React from 'react';

const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  
  // Custom Markdown Parsing for Conclusion
  let html = text;
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italics
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Blockquotes
  html = html.replace(/(?:^|\n)> (.*?)(?:\n|$)/g, '<blockquote style="border-left: 4px solid #8b5cf6; margin: 24px 0; padding: 16px 24px; background-color: #f5f3ff; color: #4c1d95; font-size: 18px; font-style: italic; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">$1</blockquote>');
  
  // Headers (H3)
  html = html.replace(/(?:^|\n)### (.*?)(?:\n|$)/g, '<h3 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 24px;">$1</h3>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');
  
  // Paragraphs / Newlines
  html = html.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
  
  return { __html: html };
};

const ConclusionStage = ({ stage }) => {
  return (
    <div style={{
      margin: '64px 0 32px 0',
      padding: '48px 32px',
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
      borderRadius: '24px',
      borderTop: '6px solid #3b82f6',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Content Section */}
      <div 
        style={{ fontSize: '17px', lineHeight: 1.8, color: '#334155', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}
        dangerouslySetInnerHTML={parseMarkdown(stage.content)}
      />
      
      {/* LLM Text / Call to Action */}
      {stage.llmTexts && stage.llmTexts['Call to Action'] && (
        <div style={{ marginTop: '48px', padding: '32px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#1e40af', fontSize: '20px', fontWeight: 800 }}>THE CRITICAL VERDICT</h4>
          <p style={{ margin: 0, fontSize: '16px', color: '#1e3a8a', lineHeight: 1.6, fontWeight: 500 }}>
            {stage.llmTexts['Call to Action']}
          </p>
        </div>
      )}

      {/* Further Reading / Call to Action Buttons */}
      {stage.further_reading && stage.further_reading.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h4 style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
            Continue the Investigation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {stage.further_reading.map((link, idx) => (
              <a 
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  lineHeight: '1.4',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(220, 38, 38, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(220, 38, 38, 0.4)'; }}
              >
                {/* Play Button Icon */}
                <div style={{ flexShrink: 0, width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#dc2626">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span>{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ConclusionStage;
