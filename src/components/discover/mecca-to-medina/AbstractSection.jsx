import React from 'react';
import { renderFormattedMarkdown, renderInlineFormatting } from './meccaMedinaUtils.jsx';

export default function AbstractSection({ data, base = '' }) {
  if (!data) return null;
  const { summary, coreThemes } = data;

  return (
    <section id="abstract" className="mm-section-block abstract-section">
      <div className="mm-card summary-card">
        <div className="summary-text">{renderFormattedMarkdown(summary)}</div>
      </div>

      {/* Responsive Visual Flowchart */}
      <div className="flowchart-container">
        <div className="flowchart-header">
          <span className="flowchart-tag">THE MACRO DIVERGENCE</span>
          <h3 className="flowchart-title">The Hijrah Shift (622 AD)</h3>
        </div>

        <div className="flowchart-grid">
          {/* Meccan Phase */}
          <div className="flow-node mecca-node">
            <div className="node-phase-badge mecca-badge">MECCAN PERIOD (610–622 AD)</div>
            <h4 className="node-title">Weakness, Minority & Endurance</h4>
            <ul className="node-list">
              {[
                "**Persecuted Religious Minority**",
                "**Patience & Absolute Non-Violence** (*Sabr*)",
                "> *\"To you your religion and to me my religion\"* (109:6)",
                "**Jerusalem as Initial Qiblah** / Consultation of Prior Scriptures (10:94)"
              ].map((item, idx) => {
                const isQuote = item.startsWith('>');
                return (
                  <li key={idx} className={`node-item ${isQuote ? 'quote-node-item' : ''}`}>
                    <span className="bullet-icon">✦</span>
                    <div className="node-item-text">
                      {renderFormattedMarkdown(item)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Transition Arrow */}
          <div className="flow-transition">
            <div className="transition-line"></div>
            <div className="transition-badge">
              <span className="trans-year">622 AD</span>
              <span className="trans-event">HIJRAH TO MEDINA</span>
              <span className="trans-desc">Statehood & Military Power</span>
            </div>
            <div className="transition-line"></div>
          </div>

          {/* Medinan Phase */}
          <div className="flow-node medina-node">
            <div className="node-phase-badge medina-badge">MEDINAN PERIOD (622–632 AD)</div>
            <h4 className="node-title">Sovereignty, Law & Universal Conquest</h4>
            <ul className="node-list">
              {[
                "**Head of State & Military Commander**",
                "**Four Stages of Jihad** culminating in *Sword Verses* (9:5, 9:29)",
                "**Qiblah Changed to Mecca** (2:144) • Expulsion & Conflict with Jewish Tribes",
                "**Aggressive Polemics** against Trinity (5:73) & Divine Sonship (9:30)"
              ].map((item, idx) => {
                const isQuote = item.startsWith('>');
                return (
                  <li key={idx} className={`node-item ${isQuote ? 'quote-node-item' : ''}`}>
                    <span className="bullet-icon">⚔</span>
                    <div className="node-item-text">
                      {renderFormattedMarkdown(item)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Core Themes Grid */}
      {coreThemes && (
        <div className="core-themes-wrapper">
          <h3 className="section-subheading">Core Evidentiary Themes</h3>
          <div className="themes-grid">
            {coreThemes.map((theme, idx) => (
              <div key={theme.id || idx} className="theme-card">
                <div className="theme-header">
                  <span className="theme-number">0{idx + 1}</span>
                  <h4 className="theme-title">{theme.title}</h4>
                </div>
                <div className="theme-summary">{renderFormattedMarkdown(theme.summary)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .abstract-section {
          margin-bottom: 32px;
        }

        .summary-card {
          background: #fdfdfd;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-left: 4px solid var(--color-secondary, #974543);
          border-radius: 12px;
          padding: 16px 14px;
          margin-bottom: 20px;
        }

        .summary-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-on-surface, #09090b);
        }

        /* Flowchart */
        .flowchart-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 14px;
          padding: 16px 12px;
          margin-bottom: 24px;
        }

        .flowchart-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .flowchart-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--color-on-surface-variant, #71717a);
        }

        .flowchart-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 17px;
          font-weight: 700;
          margin: 4px 0 0;
          color: var(--color-primary, #09090b);
        }

        .flowchart-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .flow-node {
          border-radius: 10px;
          padding: 14px 12px;
          border: 1px solid var(--color-outline-variant, #e4e4e7);
        }

        .mecca-node {
          background: #fdfbf7;
          border-color: #e8ded2;
        }

        .medina-node {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .node-phase-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .mecca-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .medina-badge {
          background: #e2e8f0;
          color: #334155;
        }

        .node-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 10px;
          color: var(--color-primary, #09090b);
        }

        .node-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .node-list li {
          font-size: 13px;
          line-height: 1.45;
          color: var(--color-on-surface, #09090b);
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .node-item-text {
          flex: 1;
        }

        .node-item-text .mm-para {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
        }

        .node-item-text .mm-blockquote {
          margin: 0;
          padding: 4px 10px;
          background: rgba(151, 69, 67, 0.05);
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 0 4px 4px 0;
          font-family: var(--font-display, Georgia, serif);
          font-style: italic;
          font-size: 12.5px;
          line-height: 1.4;
        }

        .bullet-icon {
          flex-shrink: 0;
          font-size: 12px;
          color: var(--color-secondary, #974543);
          margin-top: 2px;
        }

        .flow-transition {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 4px 0;
        }

        .transition-line {
          flex: 1;
          height: 1px;
          background: var(--color-outline-variant, #e4e4e7);
        }

        .transition-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #09090b;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          text-align: center;
        }

        .trans-year {
          font-size: 10px;
          font-weight: 800;
          color: #f59e0b;
          letter-spacing: 0.05em;
        }

        .trans-event {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .trans-desc {
          font-size: 10px;
          opacity: 0.8;
        }

        /* Themes */
        .core-themes-wrapper {
          margin-top: 20px;
        }

        .section-subheading {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 12px;
          color: var(--color-primary, #09090b);
        }

        .themes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .theme-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 10px;
          padding: 12px 14px;
        }

        .theme-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }

        .theme-number {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-secondary, #974543);
        }

        .theme-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: var(--color-primary, #09090b);
        }

        .theme-summary {
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-on-surface-variant, #71717a);
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

        .mm-blockquote {
          margin: 8px 0;
          padding: 6px 12px;
          background: #f4f4f5;
          border-left: 3px solid var(--color-secondary, #974543);
          border-radius: 0 6px 6px 0;
          font-style: italic;
        }

        .mm-para {
          margin: 0 0 6px 0;
        }
        .mm-para:last-child {
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .themes-grid {
            grid-template-columns: 1fr 1fr;
          }
          .summary-card {
            padding: 18px 16px;
          }
          .flowchart-container {
            padding: 20px 18px;
          }
        }
      `}</style>
    </section>
  );
}
