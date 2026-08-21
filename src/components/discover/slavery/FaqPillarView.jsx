import React, { useState, useEffect } from 'react';

function renderMarkdownAnswer(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="faq-markdown-list">
          {currentList.map((item, idx) => (
            <li key={idx} className="faq-list-item">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (lineText) => {
    // Links: [[text](url)] or [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(lineText.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      const isExt = url.startsWith('http');
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target={isExt ? '_blank' : '_self'}
          rel={isExt ? 'noopener noreferrer' : undefined}
          className="faq-inline-link"
        >
          {label}
          {isExt && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="faq-link-icon">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          )}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }

    // Now format **bold** and *italic*
    return parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;

      const subParts = part.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return subParts.map((sub, sIdx) => {
        if (sub.startsWith('**') && sub.endsWith('**')) {
          return <strong key={`${pIdx}-${sIdx}`} className="faq-bold">{sub.slice(2, -2)}</strong>;
        }
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return <em key={`${pIdx}-${sIdx}`} className="faq-italic">{sub.slice(1, -1)}</em>;
        }
        return sub;
      });
    });
  };

  lines.forEach((line, lIdx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${lIdx}`} className="faq-md-heading">{parseInline(trimmed.replace(/^###\s+/, ''))}</h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(parseInline(trimmed.replace(/^[-*]\s+/, '')));
    } else if (trimmed.length > 0) {
      flushList();
      elements.push(
        <p key={`p-${lIdx}`} className="faq-md-para">{parseInline(trimmed)}</p>
      );
    }
  });

  flushList();
  return elements;
}

function FaqAccordionCard({ faq, index, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen || index === 0);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <article className={`faq-card ${isOpen ? 'is-open' : 'is-closed'}`}>
      <header className="faq-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="faq-header-left">
          <span className="faq-number-badge">FAQ {faq.faq_id || index + 1}</span>
          <h3 className="faq-question-title">{faq.question}</h3>
        </div>
        <div className="faq-header-right">
          <svg className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </header>

      {/* Claim & Short Verdict */}
      <div className="faq-summary-block">
        <div className="claim-box">
          <div className="claim-header">
            <svg className="claim-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="claim-label">APOLOGETIC CLAIM</span>
          </div>
          <p className="claim-text">"{faq.apologetic_claim}"</p>
        </div>

        <div className="verdict-box">
          <div className="verdict-header">
            <svg className="verdict-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="verdict-label">CONCISE VERDICT</span>
          </div>
          <p className="verdict-text">{faq.short_answer}</p>
        </div>
      </div>

      {/* Expandable Markdown Deep Dive */}
      {isOpen && (
        <div className="faq-deep-dive-block">
          <div className="deep-dive-divider">
            <span>Canonical & Historical Deconstruction</span>
          </div>
          <div className="deep-dive-body">
            {renderMarkdownAnswer(faq.answer_markdown)}
          </div>
        </div>
      )}

      {/* Expand / Collapse Action Footer */}
      <footer className="faq-footer" onClick={() => setIsOpen(!isOpen)}>
        <button type="button" className="faq-expand-btn">
          <span>{isOpen ? 'Show Less' : 'Read Full Evidentiary Deconstruction'}</span>
          <svg className={`btn-chevron ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </footer>
    </article>
  );
}

export default function FaqPillarView({ faqs = [] }) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="faq-pillar-container">
      {/* Global Toggle Toolbar */}
      <div className="faq-toolbar">
        <span className="toolbar-count">{faqs.length} Questions & Answers</span>
        <button
          type="button"
          onClick={() => setExpandAll(!expandAll)}
          className="toggle-all-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`toggle-all-icon ${expandAll ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>{expandAll ? 'Collapse All FAQs' : 'Expand All FAQs'}</span>
        </button>
      </div>

      {/* FAQs List */}
      <div className="faqs-stack">
        {faqs.map((faq, idx) => (
          <FaqAccordionCard
            key={idx}
            faq={faq}
            index={idx}
            defaultOpen={expandAll}
          />
        ))}
      </div>

      <style>{`
        .faq-pillar-container {
          display: flex;
          flex-direction: column;
        }

        .faq-intro-card {
          border-radius: 16px;
          background: linear-gradient(180deg, #fdf2f2 0%, #ffffff 100%);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          padding: 18px 14px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 640px) {
          .faq-intro-card {
            padding: 24px 22px;
            border-radius: 20px;
            margin-bottom: 28px;
          }
        }

        .intro-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .intro-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #974543;
          background: #fdf2f2;
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(151, 69, 67, 0.15);
        }

        .intro-count {
          font-size: 12px;
          font-weight: 600;
          color: #71717a;
        }

        .intro-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.25rem, 3.5vw, 1.6rem);
          font-weight: 800;
          color: var(--color-primary, #09090b);
          margin: 0 0 8px 0;
          line-height: 1.25;
        }

        .intro-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: #52525b;
          margin: 0;
        }

        .faq-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .toolbar-count {
          font-size: 12.5px;
          font-weight: 700;
          color: #64748b;
        }

        .toggle-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #09090b;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          border-radius: 9999px;
          padding: 5px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toggle-all-btn:hover {
          background: #e4e4e7;
        }

        .toggle-all-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .faqs-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .faqs-stack {
            gap: 22px;
          }
        }

        .faq-card {
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }

        @media (min-width: 640px) {
          .faq-card {
            border-radius: 18px;
          }
        }

        .faq-card.is-open {
          border-color: #cbd5e1;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
        }

        .faq-header {
          padding: 14px 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }

        @media (min-width: 640px) {
          .faq-header {
            padding: 18px 18px;
          }
        }

        .faq-header-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .faq-number-badge {
          align-self: flex-start;
          font-size: 10.5px;
          font-weight: 800;
          color: #974543;
          background: #fdf2f2;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .faq-question-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 800;
          color: var(--color-primary, #09090b);
          margin: 0;
          line-height: 1.35;
        }

        @media (min-width: 640px) {
          .faq-question-title {
            font-size: 18px;
          }
        }

        .faq-header-right {
          padding-top: 2px;
        }

        .faq-chevron {
          width: 18px;
          height: 18px;
          color: #64748b;
          transition: transform 0.2s ease;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .faq-summary-block {
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fafafa;
        }

        @media (min-width: 640px) {
          .faq-summary-block {
            padding: 16px 18px;
            gap: 12px;
          }
        }

        .claim-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 10px 10px;
        }

        .claim-header {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 800;
          color: #b45309;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .claim-icon {
          width: 13px;
          height: 13px;
        }

        .claim-text {
          font-size: 13px;
          line-height: 1.45;
          color: #78350f;
          margin: 0;
          font-style: italic;
        }

        .verdict-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 3.5px solid #09090b;
          border-radius: 0 8px 8px 0;
          padding: 10px 10px;
        }

        .verdict-header {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 800;
          color: #09090b;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .verdict-icon {
          width: 13px;
          height: 13px;
        }

        .verdict-text {
          font-size: 13.5px;
          line-height: 1.5;
          color: #18181b;
          margin: 0;
          font-weight: 500;
        }

        .faq-deep-dive-block {
          padding: 14px 12px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
        }

        @media (min-width: 640px) {
          .faq-deep-dive-block {
            padding: 20px 18px;
          }
        }

        .deep-dive-divider {
          text-align: center;
          margin-bottom: 14px;
          position: relative;
        }

        .deep-dive-divider span {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .deep-dive-body {
          font-size: 13.5px;
          line-height: 1.6;
          color: #334155;
        }

        @media (min-width: 640px) {
          .deep-dive-body {
            font-size: 14.5px;
          }
        }

        .faq-md-heading {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 14px 0 6px 0;
        }

        .faq-md-para {
          margin: 0 0 10px 0;
        }

        .faq-markdown-list {
          margin: 0 0 12px 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .faq-list-item {
          font-size: 13.5px;
          line-height: 1.55;
          color: #334155;
        }

        .faq-bold {
          color: #09090b;
          font-weight: 700;
        }

        .faq-italic {
          font-style: italic;
        }

        .faq-inline-link {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .faq-inline-link:hover {
          color: #1d4ed8;
        }

        .faq-link-icon {
          width: 11px;
          height: 11px;
        }

        .faq-footer {
          padding: 8px 12px;
          background: #fafafa;
          border-top: 1px solid #f1f5f9;
          cursor: pointer;
          display: flex;
          justify-content: center;
        }

        .faq-expand-btn {
          background: transparent;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }

        .faq-expand-btn:hover {
          color: #09090b;
        }

        .btn-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}
