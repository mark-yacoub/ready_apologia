import React, { useState } from 'react';
import { renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function InterpretiveFrameworksSection({ section, base = '' }) {
  if (!section) return null;
  const { title, intro, frameworks } = section;
  const [activeFw, setActiveFw] = useState(frameworks?.[0]?.id || 'traditionalist');

  return (
    <section id="interpretive-frameworks" className="mm-section-block frameworks-section">
      <div className="section-header-block">
        <span className="section-badge">SECTION 07</span>
        <h2 className="section-title">{title}</h2>
        {intro && <div className="section-intro">{renderFormattedMarkdown(intro)}</div>}
      </div>

      {frameworks && (
        <div className="frameworks-container">
          <div className="frameworks-nav" role="tablist" aria-label="Interpretive Frameworks">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                type="button"
                role="tab"
                aria-selected={activeFw === fw.id}
                onClick={() => setActiveFw(fw.id)}
                className={`fw-tab-btn ${activeFw === fw.id ? 'is-active' : ''}`}
              >
                <span className="fw-tab-title">{fw.name}</span>
              </button>
            ))}
          </div>

          <div className="framework-display-card animate-fade-in">
            {frameworks.map((fw) => {
              if (fw.id !== activeFw) return null;
              return (
                <div key={fw.id} className="fw-content-box">
                  <div className="fw-header">
                    <span className="fw-badge">HERMENEUTICAL PERSPECTIVE</span>
                    <h3 className="fw-title">{fw.name}</h3>
                  </div>
                  <div className="fw-stance">{renderFormattedMarkdown(fw.stance)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .frameworks-section {
          margin-bottom: 36px;
        }

        .frameworks-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 12px;
          padding: 12px;
        }

        .frameworks-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
          background: var(--color-background, #f4f4f5);
          padding: 4px;
          border-radius: 8px;
        }

        .fw-tab-btn {
          padding: 8px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #71717a);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fw-tab-btn.is-active {
          background: #ffffff;
          color: var(--color-primary, #09090b);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          font-weight: 700;
        }

        .framework-display-card {
          background: #fafafa;
          border: 1px solid #f4f4f5;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 8px;
          padding: 14px 12px;
        }

        .fw-header {
          margin-bottom: 8px;
        }

        .fw-badge {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--color-secondary, #974543);
          display: block;
          margin-bottom: 2px;
        }

        .fw-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .fw-stance {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--color-on-surface, #09090b);
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
          margin: 0 0 6px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .frameworks-nav {
            flex-direction: row;
          }
          .fw-tab-btn {
            flex: 1;
            text-align: center;
          }
          .frameworks-container {
            padding: 16px 14px;
          }
        }
      `}</style>
    </section>
  );
}
