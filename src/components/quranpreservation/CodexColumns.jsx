import React from 'react';

// Reusable Markdown Format for the hadith ref links & text
const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none;">$1</a>');
  
  return { __html: html };
};

// Map colors explicitly based on the index
const getColumnColor = (index) => {
  const colors = [
    "#334155", // slate for Uthmanic
    "#be123c", // rose for Ibn Masud
    "#0369a1", // sky blue for Abu Musa
    "#047857"  // emerald as a fallback
  ];
  return colors[index % colors.length];
};

export default function CodexColumns({ childNode }) {
  if (!childNode || !childNode.codices) return null;

  const { codices, hadiths = [] } = childNode;

  return (
    <div style={{ margin: '24px 0' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Competing Chapter Counts</h4>
      
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollSnapType: 'x mandatory' }}>
        {codices.map((codex, index) => {
          // Attempt to map a hadith from the childNode to this codex based on its description contents.
          // Uthman doesn't have a supporting hadith here.
          // Abdullah bin Masud --> "111 Surahs"
          // Abu Musa --> "114+"
          const matchedHadith = hadiths.find(h => 
            (codex.chapter_count.includes("111") && h.english_text && h.english_text.includes("Ibn Mas`ud")) ||
            (codex.chapter_count.includes("114+") && h.english_text && h.english_text.includes("Abu Musa"))
          );

          const colColor = getColumnColor(index);

          return (
            <div 
              key={index} 
              style={{ 
                flex: '0 0 85%',
                maxWidth: '400px',
                border: `1px solid ${colColor}40`,
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                scrollSnapAlign: 'start',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '8px' }}>
                <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{codex.owner}</h5>
                <div style={{ 
                  backgroundColor: colColor, 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}>
                  {codex.chapter_count}
                </div>
              </div>
              
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px 0', flex: 1 }}>
                {codex.description}
              </p>
              
              {matchedHadith && (
                <div style={{ margin: 'auto 0 0 0', padding: '16px', backgroundColor: '#f8fafc', borderLeft: `4px solid ${colColor}`, borderRadius: '0 6px 6px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                  <div 
                    style={{ fontSize: '13px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}
                    dangerouslySetInnerHTML={parseMarkdown(matchedHadith.reference)}
                  ></div>
                  <blockquote style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.5 }}>
                     <span dangerouslySetInnerHTML={parseMarkdown(matchedHadith.english_text)}></span>
                  </blockquote>
                </div>
              )}
              
              {codex.link && (
                  <a 
                    href={codex.link} 
                    style={{ 
                        marginTop: '16px', 
                        display: 'inline-block',
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        color: colColor,
                        textDecoration: 'none' 
                    }}
                  >
                    View Manuscript Evidence →
                  </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
