import React, { useState } from 'react';

export default function RecitersInfographic({ tableData, tableColumns }) {
  if (!tableData || tableData.length === 0) return null;

  const reciters = tableData.map(row => {
    const name = row.bukhari_3808 || row.bukhari_5003 || row.bukhari_5004;
    return {
      name,
      in3808: !!row.bukhari_3808,
      in5003: !!row.bukhari_5003,
      in5004: !!row.bukhari_5004,
    };
  });

  const col1 = tableColumns?.[0] || { label: "Bukhari 3808", link: null };
  const col2 = tableColumns?.[1] || { label: "Bukhari 5003", link: null };
  const col3 = tableColumns?.[2] || { label: "Bukhari 5004", link: null };

  const TooltippedHeader = ({ col, type }) => {
    const [show, setShow] = useState(false);
    
    const tooltipText = type === 'command' 
      ? "Prophet's Command: Explicitly ordered by the Prophet." 
      : "Companion Observation: Merely an observation, not an explicit command.";
    
    const isCommand = type === 'command';
    const iconChar = isCommand ? '★' : 'ℹ';
    const iconColor = isCommand ? '#d97706' : '#94a3b8';

    return (
      <div style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '4px', textAlign: 'center', flexWrap: 'wrap', position: 'relative' }}>
        {col.link ? (
          <a href={col.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', textDecoration: 'none', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.opacity = '0.7'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            <span>{col.label}</span>
          </a>
        ) : (
          <span>{col.label}</span>
        )}
        
        <div 
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          onClick={() => setShow(!show)}
          style={{ cursor: 'pointer', color: iconColor, fontSize: '13px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}
        >
          {iconChar}
          
          {show && (
            <div style={{ 
              position: 'absolute', 
              bottom: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              marginBottom: '8px',
              backgroundColor: '#1e293b', 
              color: '#f8fafc', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              width: 'max-content',
              maxWidth: '180px',
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              zIndex: 50,
              whiteSpace: 'normal',
              pointerEvents: 'none',
              lineHeight: 1.4,
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: 'normal'
            }}>
              {tooltipText}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '6px',
                borderStyle: 'solid',
                borderColor: '#1e293b transparent transparent transparent'
              }}></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const GreenCheckIcon = () => (
    <div style={{ margin: '0 auto', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #10b981' }}>
      <svg style={{ width: '14px', height: '14px', color: '#059669', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
  );

  const AmberCheckIcon = () => (
    <div style={{ margin: '0 auto', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f59e0b' }}>
      <svg style={{ width: '14px', height: '14px', color: '#d97706', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
  );

  const DashIcon = () => (
    <div style={{ margin: '0 auto', width: '10px', height: '2px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
  );

  const CrossIcon = () => (
    <div style={{ margin: '0 auto', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ef4444' }}>
      <svg style={{ width: '14px', height: '14px', color: '#b91c1c', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
  );

  return (
    <div style={{ margin: '32px 0', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          Canonical Reciter Endorsements
        </h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.4 }}>
          Cross-referencing the Prophet's explicit commands (Sahih al-Bukhari)
        </p>
      </div>

      {/* Grid */}
      <div style={{ backgroundColor: '#ffffff', padding: '0' }}>
        {/* Grid Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1.5fr) 1fr 1fr 1fr', gap: '8px', padding: '12px 16px', backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', alignItems: 'center' }}>
          <div>Identity</div>
          <div style={{ textAlign: 'center' }}><TooltippedHeader col={col1} type="command" /></div>
          <div style={{ textAlign: 'center' }}><TooltippedHeader col={col2} type="observation" /></div>
          <div style={{ textAlign: 'center' }}><TooltippedHeader col={col3} type="observation" /></div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {reciters.map((reciter, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1.5fr) 1fr 1fr 1fr', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#334155' }}>
                {reciter.name}
              </div>
              <div style={{ textAlign: 'center' }}>{reciter.in3808 ? <GreenCheckIcon /> : <DashIcon />}</div>
              <div style={{ textAlign: 'center' }}>{reciter.in5003 ? <AmberCheckIcon /> : <DashIcon />}</div>
              <div style={{ textAlign: 'center' }}>{reciter.in5004 ? <AmberCheckIcon /> : <DashIcon />}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Red Alert Banner */}
      <div style={{ flexWrap: 'wrap', backgroundColor: '#fff1f2', borderTop: '2px solid #fecdd3', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#fecaca', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
             Critical Discrepancy
          </div>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#991b1b' }}>
            Abi Khuzaima is Missing
          </h5>
          <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: 1.5, fontWeight: 500 }}>
             Despite being the <strong>single isolated witness</strong> to the final verses of Surah 9 at Yamama, his name is completely absent from all Prophet-endorsed lists.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fecdd3', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>{col1.label}</div>
              <CrossIcon />
           </div>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>{col2.label}</div>
              <CrossIcon />
           </div>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>{col3.label}</div>
              <CrossIcon />
           </div>
        </div>
      </div>
    </div>
  );
}
