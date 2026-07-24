import React from 'react';

const SanaaViewer = ({ variants }) => {
  return (
    <div style={{ margin: '48px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '24px',
        borderRadius: '12px 12px 0 0',
        borderBottom: '4px solid #f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>🔬</span>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Forensic Textual Analysis
        </h3>
        <span style={{ marginLeft: 'auto', backgroundColor: '#334155', color: '#cbd5e1', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
          Scriptio Superior vs Inferior
        </span>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2px', 
        backgroundColor: '#cbd5e1', 
        border: '1px solid #cbd5e1',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        overflow: 'hidden'
      }}>
        {variants.map((v, i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>
                {v.surah}
              </div>
              <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }}></div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Standard Text Column */}
              <div style={{ 
                borderLeft: '3px solid #3b82f6', 
                paddingLeft: '20px'
              }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 700, marginBottom: '16px' }}>
                  Standard Uthmanic Canon
                </div>
                {v.standard_arabic !== "[-]" ? (
                  <div style={{ fontSize: '24px', lineHeight: 1.8, color: '#1e293b', textAlign: 'right', fontFamily: '"Scheherazade New", serif', marginBottom: '12px' }} dir="rtl">
                    {v.standard_arabic}
                  </div>
                ) : (
                  <div style={{ fontSize: '18px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px', textAlign: 'right' }}>
                    [No Equivalent Text]
                  </div>
                )}
                <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#334155' }}>
                  {v.standard}
                </div>
              </div>

              {/* Sana'a Erased Text Column */}
              <div style={{ 
                borderLeft: '3px solid #f59e0b', 
                paddingLeft: '20px' 
              }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#b45309', fontWeight: 700, marginBottom: '16px' }}>
                  Sana'a Erased Text (Pre-Uthmanic)
                </div>
                {v.sanaa_arabic !== "[-]" ? (
                  <div style={{ fontSize: '24px', lineHeight: 1.8, color: '#78350f', textAlign: 'right', fontFamily: '"Scheherazade New", serif', marginBottom: '12px' }} dir="rtl">
                    {v.sanaa_arabic}
                  </div>
                ) : (
                  <div style={{ fontSize: '18px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px', textAlign: 'right' }}>
                    [Missing from Manuscript]
                  </div>
                )}
                <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#92400e', fontWeight: 500 }}>
                  {v.sanaa}
                </div>
              </div>
            </div>

            {/* Significance Footer */}
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              borderRadius: '8px', 
              padding: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Theological Significance
                </strong>
                <span style={{ color: '#92400e', fontSize: '14px', lineHeight: 1.6, fontWeight: 500 }}>
                  {v.significance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SanaaViewer;
