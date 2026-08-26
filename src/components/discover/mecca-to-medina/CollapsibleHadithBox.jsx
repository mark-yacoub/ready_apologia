import React, { useState } from "react";
import { renderFormattedMarkdown } from "./meccaMedinaUtils.jsx";

export default function CollapsibleHadithBox({ hadith, threshold = 320 }) {
  if (!hadith || !hadith.text) return null;
  const [isExpanded, setIsExpanded] = useState(false);
  const text = String(hadith.text).trim();
  const isLong = text.length > threshold;

  const displayText = isLong && !isExpanded
    ? text.slice(0, threshold).trim() + "..."
    : text;

  return (
    <div className={`hadith-item-card ${isExpanded ? "is-expanded" : "is-collapsed"}`}>
      <div className="hadith-header-row">
        <span className="hadith-badge">{hadith.collection}</span>
        {hadith.reference && <span className="hadith-ref-label">{hadith.reference}</span>}
      </div>

      <div className="hadith-quote">
        "{renderFormattedMarkdown(displayText)}"
      </div>

      <div className="hadith-actions-row">
        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hadith-expand-btn"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </>
            ) : (
              <>
                <span>Read full narration ({text.length} chars)</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </>
            )}
          </button>
        )}

        {hadith.url && (
          <a
            href={hadith.url}
            target="_blank"
            rel="noopener noreferrer"
            className="external-sunnah-link"
            title="Verify this narration on Sunnah.com"
          >
            <span>Verify on Sunnah.com</span>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>

      <style>{`
        .hadith-item-card {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 8px;
          padding: 10px 12px;
          margin-top: 6px;
          transition: all 0.2s ease;
        }

        .hadith-item-card.is-expanded {
          background: #fffdf5;
          border-color: #fde68a;
          box-shadow: 0 2px 8px rgba(180, 83, 9, 0.06);
        }

        .hadith-header-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .hadith-badge {
          font-size: 11px;
          font-weight: 800;
          color: #b45309;
        }

        .hadith-ref-label {
          font-size: 11px;
          color: #78350f;
          font-weight: 600;
        }

        .hadith-quote {
          font-size: 12.5px;
          line-height: 1.5;
          color: #451a03;
          margin-bottom: 8px;
        }

        .hadith-quote .mm-para {
          margin: 0 0 4px;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .hadith-quote .mm-para:last-child {
          margin-bottom: 0;
        }

        .hadith-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(180, 83, 9, 0.1);
        }

        .hadith-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
          color: #b45309;
          background: rgba(180, 83, 9, 0.08);
          border: 1px solid rgba(180, 83, 9, 0.2);
          border-radius: 4px;
          padding: 3px 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .hadith-expand-btn:hover {
          background: rgba(180, 83, 9, 0.15);
          color: #78350f;
        }

        .external-sunnah-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #b45309;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }

        .external-sunnah-link:hover {
          color: #78350f;
        }
      `}</style>
    </div>
  );
}
