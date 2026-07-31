import React from 'react';

export default function ManuscriptTimeline() {
  const milestones = [
    {
      year: 'c. 300 AD',
      title: 'Codex Vaticanus',
      desc: 'Complete Greek Bible pre-dating Islam by ~330 years. Confirms fourfold Gospel.',
      tag: 'Pre-Islamic'
    },
    {
      year: 'c. 350 AD',
      title: 'Codex Sinaiticus',
      desc: 'Oldest complete New Testament codex. Explicitly affirms Christ’s Crucifixion & Deity.',
      tag: 'Pre-Islamic'
    },
    {
      year: 'c. 400 AD',
      title: 'Codex Alexandrinus',
      desc: 'Major Greek codex circulating across Mediterranean and Arabian trade routes.',
      tag: 'Pre-Islamic'
    },
    {
      year: 'c. 570 AD',
      title: "Muhammad's Birth",
      desc: 'Islam arises centuries after the New Testament text was universally established.',
      tag: 'Islamic Era',
      isIslam: true
    }
  ];

  return (
    <div className="ms-timeline-card">
      <div className="ms-timeline-header">
        <span className="ms-timeline-tag">Historical Manuscript Timeline</span>
        <h3 className="ms-timeline-title">Centuries of Preservation Before Islam</h3>
        <p className="ms-timeline-subtitle">
          When the Quran commands 7th-century Christians to judge by the Gospel in their hands, these were the Greek codices physically circulating across the ancient world.
        </p>
      </div>

      <div className="ms-timeline-track">
        {milestones.map((item, idx) => (
          <div key={idx} className={`timeline-milestone ${item.isIslam ? 'islamic-era' : 'christian-era'}`}>
            <div className="milestone-badge">{item.year}</div>
            <div className="milestone-content">
              <h4 className="milestone-title">{item.title}</h4>
              <p className="milestone-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="ms-timeline-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="banner-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span>
          <strong>100% Manuscript Agreement:</strong> All pre-Islamic manuscripts explicitly contain the Crucifixion, the bodily Resurrection, the Deity of Christ, and the Trinity.
        </span>
      </div>

      <style>{`
        .ms-timeline-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 20px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        .ms-timeline-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .ms-timeline-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-secondary, #974543);
          background: rgba(151, 69, 67, 0.08);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .ms-timeline-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-on-surface, #09090b);
          margin: 0 0 8px 0;
        }

        .ms-timeline-subtitle {
          font-size: 13.5px;
          color: var(--color-on-surface-variant, #71717a);
          line-height: 1.5;
          max-width: 650px;
          margin: 0 auto;
        }

        .ms-timeline-track {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          position: relative;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .ms-timeline-track {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .timeline-milestone {
          position: relative;
          background: var(--color-surface-container-low, #f4f4f5);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .timeline-milestone:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
        }

        .timeline-milestone.christian-era {
          border-top: 3px solid var(--color-secondary, #974543);
        }

        .timeline-milestone.islamic-era {
          background: #f8fafc;
          border-top: 3px solid #059669;
        }

        .milestone-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          color: var(--color-on-surface, #09090b);
          letter-spacing: -0.01em;
        }

        .timeline-milestone.islamic-era .milestone-badge {
          color: #059669;
        }

        .milestone-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--color-on-surface, #09090b);
        }

        .milestone-desc {
          font-size: 12.5px;
          color: var(--color-on-surface-variant, #71717a);
          line-height: 1.45;
          margin: 0;
        }

        .ms-timeline-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
          border: 1px solid rgba(151, 69, 67, 0.2);
          border-radius: 12px;
          padding: 14px 18px;
          color: #7f1d1d;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .banner-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: #991b1b;
        }

        @media (min-width: 768px) {
          .ms-timeline-card {
            padding: 32px;
          }
        }
      `}</style>
    </div>
  );
}
