import React from 'react';

const QiraatTable = ({ qiraatExamples }) => {
  return (
    <div style={{ margin: '32px 0' }}>
      {qiraatExamples.map((categorySection, catIdx) => (
        <div key={catIdx} style={{ marginBottom: '48px' }}>
          
          {/* Category Header */}
          <div style={{ paddingBottom: '12px', borderBottom: '3px solid #cbd5e1', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
              {categorySection.category}
            </h3>
            {categorySection.description && (
              <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
                {categorySection.description}
              </p>
            )}
          </div>

          {/* Cards for this Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {categorySection.variants.map((ex, i) => (
              <div key={i} style={{
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                {/* Top Split: Hafs vs Warsh */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {/* Hafs Column */}
                  <div style={{ flex: '1 1 250px', padding: '20px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>
                      Hafs (Standard)
                    </div>
                    <div style={{ fontSize: '16px', color: '#1e293b', lineHeight: 1.6 }}
                         dangerouslySetInnerHTML={{ __html: ex.hafs_text.replace(/\(/g, '<br/><span style="color:#64748b; font-size:13px; font-style: italic;">(').replace(/\)/g, ')</span>') }} />
                  </div>
                  
                  {/* Warsh Column */}
                  <div style={{ flex: '1 1 250px', padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff7ed' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c2410c', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>
                      Warsh (Variant)
                    </div>
                    <div style={{ fontSize: '16px', color: '#9a3412', lineHeight: 1.6 }}
                         dangerouslySetInnerHTML={{ __html: ex.warsh_text.replace(/\(/g, '<br/><span style="color:#9a3412; font-size:13px; font-style: italic;">(').replace(/\)/g, ')</span>') }} />
                  </div>
                </div>
                
                {/* Bottom Row: Impact / Explanation */}
                <div style={{ padding: '16px 20px', backgroundColor: '#fff1f2', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#be123c', fontWeight: 800, letterSpacing: '0.5px' }}>
                        Impact on Meaning / Law
                      </div>
                      {ex.surah_ref && (
                        <a 
                          href={ex.surah_ref.replace(/\[quran\/(\d+)\/(\d+)\]/i, '/quran/$1#$2')}
                          style={{ fontSize: '11px', color: '#9f1239', fontWeight: 800, backgroundColor: '#ffe4e6', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fecdd3'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ffe4e6'}
                        >
                          {ex.surah_ref.replace(/\[quran\/(\d+)\/(\d+)\]/i, 'Quran $1:$2')}
                        </a>
                      )}
                    </div>
                    <div style={{ color: '#9f1239', fontWeight: 500, fontSize: '14.5px', lineHeight: 1.5 }}>
                      {ex.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QiraatTable;
