import React, { useState } from 'react';
import { parseMarkdown } from '../../utils/markdown.js';

export default function ObjectionsSection({ objections = [] }) {
  const [openIdx, setOpenIdx] = useState(0);

  if (objections.length === 0) return null;

  return (
    <div className="objections-showcase">
      <div className="objections-grid">
        {objections.map((item, index) => {
          const isOpen = openIdx === index;
          return (
            <div key={item.id} className={`objection-card ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="objection-header"
                onClick={() => setOpenIdx(isOpen ? -1 : index)}
              >
                <div className="obj-left">
                  <span className="obj-badge">OBJECTION {item.num}</span>
                  <h4 className="obj-title">{item.objection}</h4>
                </div>
                <span className="obj-toggle">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="refutation-body">
                  <div className="ref-badge">THE REFUTATION</div>
                  <div
                    className="ref-text-wrapper"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(item.rawRefutation) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
