import React from 'react';
import { renderFormattedMarkdown } from './meccaMedinaUtils.jsx';

export default function ConclusionSection({ section, base = '' }) {
  if (!section) return null;
  const { title, text } = section;

  return (
    <section id="conclusion" className="mm-section-block conclusion-section">
      <div className="conclusion-card">
        <div className="conclusion-badge-row">
          <span className="conclusion-badge">THE HISTORICAL & THEOLOGICAL VERDICT</span>
        </div>
        <h2 className="conclusion-title">{title}</h2>
        <div className="conclusion-body">{renderFormattedMarkdown(text)}</div>
      </div>

      <style>{`
        .conclusion-section {
          margin-bottom: 40px;
        }

        .conclusion-card {
          background: #09090b;
          color: #ffffff;
          border-radius: 14px;
          padding: 20px 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .conclusion-badge-row {
          margin-bottom: 8px;
        }

        .conclusion-badge {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f59e0b;
          display: inline-block;
        }

        .conclusion-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px;
          color: #ffffff;
        }

        .conclusion-body {
          font-size: 14px;
          line-height: 1.65;
          color: #e4e4e7;
        }

        .mm-bold {
          font-weight: 700;
          color: inherit;
        }

        .mm-em {
          font-style: italic;
          color: inherit;
        }

        .mm-quran-bracket {
          background: #fef2f2;
          color: #7f1d1d;
          border: 1px solid #fecaca;
          font-family: var(--font-display, Georgia, serif);
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-block;
          font-style: normal;
        }

        .mm-para {
          margin: 0 0 8px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .conclusion-card {
            padding: 24px 20px;
          }
          .conclusion-title {
            font-size: 20px;
          }
          .conclusion-body {
            font-size: 14.5px;
          }
        }
      `}</style>
    </section>
  );
}
