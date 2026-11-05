import React, { useState, useMemo } from 'react';
import { Chevron } from './Chevron.jsx';
import { getSourceCount } from '../../utils/evidenceCounters.js';

// Renders a quote with every occurrence of `phrase` emphasised.
const HighlightedQuote = ({ text = '', phrase }) => {
  if (!phrase) return text;
  const parts = text.split(phrase);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <strong className="attribution-phrase">{phrase}</strong>}
    </React.Fragment>
  ));
};

const SourceBlock = ({ sourceName, sData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sourceCount = useMemo(() => getSourceCount(sData), [sData]);

  return (
    <div className={`father-block ${isOpen ? 'is-expanded' : ''}`}>
      <div
        className="father-header-box"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <h3 className="father-name">
          {sourceName}
          {sData?.author_date && <span className="father-author-date"> {sData.author_date}</span>}
          <span className="item-count"> ({sourceCount})</span>
        </h3>
        <Chevron open={isOpen} />
      </div>

      {isOpen && (
        <div className="father-content animate-fade-in">
          {sData?.note && <div className="father-note-box">{sData.note}</div>}
          {Object.keys(sData?.works || {}).map(keyOrIndex => {
            const isWorkList = Array.isArray(sData.works);
            const workObj = sData.works[keyOrIndex] || {};
            const workName = isWorkList ? workObj.title : keyOrIndex;
            const workQuotes = workObj.quotes || [];
            const workDate = workObj.date;
            const workNote = workObj.note;
            return (
              <div key={workName} className="patristic-work-group">
                <div className="work-header-meta">
                  <h4 className="work-title">
                    {workName} {workDate && <span className="work-date-badge">({workDate})</span>} <span className="item-count">({workQuotes.length})</span>
                  </h4>
                  {workNote && <p className="work-note-text">{workNote}</p>}
                </div>
                <div className="verse-group-list">
                  {workQuotes.map((q, idx) => {
                    const handleQuoteClick = () => {
                      if (q?.url) window.open(q.url, '_blank', 'noopener,noreferrer');
                    };
                    const hasChapter = q?.chapter && q.chapter !== 'N/A';
                    return (
                      <div
                        key={q?.quote_id ?? idx}
                        className="clean-verse-card"
                        onClick={handleQuoteClick}
                        role={q?.url ? "button" : undefined}
                        tabIndex={q?.url ? 0 : undefined}
                        onKeyDown={q?.url ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleQuoteClick();
                          }
                        } : undefined}
                      >
                        {(hasChapter || q?.url) && (
                          <div className="verse-card-header">
                            <span className="verse-ref-pill">
                              {hasChapter ? q.chapter : 'Source'} {q?.url && <span className="ref-arrow">&gt;</span>}
                            </span>
                          </div>
                        )}
                        <p className="verse-card-text">
                          "<HighlightedQuote text={q?.quote} phrase={q?.highlight_phrase} />"
                        </p>
                        {q?.note && (
                          <div className="verse-note-tooltip">
                            {q.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export { SourceBlock };
