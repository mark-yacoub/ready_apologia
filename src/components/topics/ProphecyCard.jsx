import React from 'react';
import { formatBookName } from '../../utils/topicHelpers.js';

const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

const ProphecyCard = ({ prophecy, verseTexts, topicId }) => {
  const otBookId = prophecy.ot_verses?.[0]?.split('_')[0];
  const bookName = otBookId ? formatBookName(otBookId) : '';
  const otText = (prophecy.ot_verses || []).map(vId => verseTexts[vId] || '').filter(Boolean).join(' ');

  return (
    <div className="prophecy-card">
      <div className="prophecy-card-header">
        <div className="prophecy-header-top">
          <h2 className="prophecy-title">{prophecy.name}</h2>
          {prophecy.type && <span className="prophecy-type-badge">{prophecy.type}</span>}
        </div>
        {prophecy.date && <p className="prophecy-date-meta">{prophecy.date}</p>}
      </div>

      <div className="prophecy-card-body">
        <div className="prophecy-ot-pane">
          <h4 className="prophecy-pane-label">Old Testament Promise {bookName ? `(${bookName})` : ''}</h4>
          <div className="prophecy-ot-text">{otText}</div>
          <div className="prophecy-ot-refs">
            {(prophecy.ot_verses || []).map(vId => {
              const p = vId.split('_');
              return (
                <a key={vId} href={`${base}/bible/${p[0]}/${p[1]}#${p.slice(2).join('_')}`} className="verse-ref-link" onClick={(e) => {
                  e.stopPropagation();
                }}>
                  <span className="verse-ref-pill">{formatBookName(p[0])} {p[1]}:{p.slice(2).join('_')} <span className="ref-arrow">&gt;</span></span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="prophecy-nt-pane">
          <h4 className="prophecy-pane-label">New Testament Fulfillment</h4>
          <div className="prophecy-nt-stack">
            {(prophecy.nt_fulfillments || []).map((nt, idx) => {
              const ntText = (nt.verses || []).map(vId => verseTexts[vId] || '').filter(Boolean).join(' ');
              return (
                <div key={idx} className="prophecy-nt-block">
                  {idx > 0 && <div className="prophecy-nt-divider" />}
                  <div className="prophecy-nt-text">{ntText}</div>
                  <div className="prophecy-nt-refs">
                    {(nt.verses || []).map(vId => {
                      const p = vId.split('_');
                      return (
                        <a key={vId} href={`${base}/bible/${p[0]}/${p[1]}#${p.slice(2).join('_')}`} className="verse-ref-link" onClick={(e) => {
                          e.stopPropagation();
                        }}>
                          <span className="verse-ref-pill">{formatBookName(p[0])} {p[1]}:{p.slice(2).join('_')} <span className="ref-arrow">&gt;</span></span>
                        </a>
                      );
                    })}
                  </div>
                  {nt.note && <div className="prophecy-nt-note">{nt.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


export { ProphecyCard };
