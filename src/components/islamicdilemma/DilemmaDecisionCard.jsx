import React from 'react';

export default function DilemmaDecisionCard() {
  return (
    <div className="decision-card-container">
      <div className="decision-question-box">
        <span className="question-tag">The Fundamental Dilemma</span>
        <h3 className="question-title">
          Is the 7th-Century Gospel (<em style={{ fontStyle: 'italic' }}>Injil</em>) and Torah the Authentic, Uncorrupted Word of God?
        </h3>
      </div>

      <div className="decision-paths-grid">
        {/* YES PATH */}
        <div className="path-card path-yes">
          <div className="path-header">
            <span className="path-badge badge-yes">IF YES</span>
            <h4 className="path-title">The Gospel is True & Uncorrupted</h4>
          </div>
          <p className="path-reason">
            The historical Gospel unambiguously teaches the Crucifixion, bodily Resurrection, divine Sonship, and Deity of Jesus Christ—doctrines that Islam explicitly rejects.
          </p>
          <div className="path-result">
            <span className="collapse-badge">ISLAM IS FALSE</span>
            <p className="result-text">Surah 4:157 & 5:72 contradict true historical revelation.</p>
          </div>
        </div>

        {/* NO PATH */}
        <div className="path-card path-no">
          <div className="path-header">
            <span className="path-badge badge-no">IF NO</span>
            <h4 className="path-title">The Gospel is False & Corrupted</h4>
          </div>
          <p className="path-reason">
            The Quran itself commands 7th-century Christians to judge by their Scriptures (<a href="/quran/5/47" className="inline-quran-link">Surah 5:47</a>), declares them "guidance and light", and insists God's words cannot be changed.
          </p>
          <div className="path-result">
            <span className="collapse-badge">ISLAM IS FALSE</span>
            <p className="result-text">God commands Christians to obey a corrupted text and fails His promise.</p>
          </div>
        </div>
      </div>

      <div className="decision-footer">
        <span className="footer-highlight">Inescapable Conclusion:</span>
        Either way, Islam is logically self-defeating from within its own foundational claims.
      </div>

      <style>{`
        .decision-card-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 20px;
          padding: 28px;
          margin: 24px 0;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
        }

        .decision-question-box {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 28px auto;
        }

        .question-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-secondary, #974543);
          background: rgba(151, 69, 67, 0.08);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 10px;
        }

        .question-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 21px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--color-on-surface, #09090b);
          margin: 0;
        }

        .decision-paths-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (min-width: 640px) {
          .decision-paths-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .path-card {
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          border: 1px solid transparent;
        }

        .path-yes {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .path-no {
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .path-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .path-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          width: fit-content;
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .badge-yes {
          background: #dcfce7;
          color: #166534;
        }

        .badge-no {
          background: #ffe4e6;
          color: #9f1239;
        }

        .path-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #09090b;
        }

        .path-reason {
          font-size: 13px;
          line-height: 1.55;
          color: #334155;
          margin: 0;
        }

        .inline-quran-link {
          color: #974543;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .path-result {
          background: #7f1d1d;
          color: #ffffff;
          border-radius: 12px;
          padding: 12px 14px;
          text-align: center;
        }

        .path-yes .path-result {
          background: #14532d;
        }

        .collapse-badge {
          display: block;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .result-text {
          font-size: 12px;
          opacity: 0.95;
          margin: 0;
          line-height: 1.35;
        }

        .decision-footer {
          text-align: center;
          font-size: 14px;
          color: var(--color-on-surface-variant, #475569);
          padding: 14px;
          background: var(--color-surface-container-low, #f4f4f5);
          border-radius: 12px;
        }

        .footer-highlight {
          font-weight: 700;
          color: var(--color-on-surface, #09090b);
          margin-right: 6px;
        }
      `}</style>
    </div>
  );
}
