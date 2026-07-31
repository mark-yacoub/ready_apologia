import React from 'react';

export default function LogicalTrapDiagram() {
  return (
    <div className="logical-trap-container">
      <div className="trap-header">
        <span className="trap-badge">The Logical Trap of Surah 5:47</span>
        <h3 className="trap-title">How Quranic Obedience Destroys Islamic Theology</h3>
      </div>

      <div className="trap-flow">
        {/* Step 1 */}
        <div className="trap-step-card">
          <div className="step-num">STEP 1</div>
          <h4 className="step-heading">Surah 5:47 Commands Christians to Judge by the 7th-Century Gospel (Injil)</h4>
          <p className="step-text">
            God explicitly orders contemporary Christians in 632 AD to judge by what was revealed in their Scriptures.
          </p>
        </div>

        <div className="trap-arrow">↓</div>

        {/* Step 2 */}
        <div className="trap-step-card">
          <div className="step-num">STEP 2</div>
          <h4 className="step-heading">What Did the 7th-Century Gospel Actually Proclaim?</h4>
          <p className="step-text">
            Historical manuscripts and archaeology prove the text in Christians' hands was the fourfold canonical Gospel.
          </p>
        </div>

        <div className="trap-arrow">↓</div>

        {/* Step 3: Dual Pillars */}
        <div className="trap-pillars-grid">
          <div className="proclamation-card">
            <span className="proc-tag">Gospel Proclamation 1</span>
            <h5 className="proc-title">"Christ Died for Our Sins & Rose the Third Day"</h5>
            <p className="proc-ref">1 Corinthians 15:3–4, Mark 15:39, All Four Gospels</p>
          </div>

          <div className="proclamation-card">
            <span className="proc-tag">Gospel Proclamation 2</span>
            <h5 className="proc-title">"In the Beginning was the Word... and the Word was God"</h5>
            <p className="proc-ref">John 1:1, 14, Colossians 2:9, Matthew 28:19</p>
          </div>
        </div>

        <div className="trap-arrow">↓</div>

        {/* Step 4: Conclusion */}
        <div className="trap-conclusion-card">
          <div className="conclusion-badge">LOGICAL NECESSITY</div>
          <h4 className="conclusion-title">CONCLUSION: THE QURAN IS FALSE</h4>
          <p className="conclusion-text">
            If a 7th-century Christian obeys Surah 5:47 and judges by his Gospel, he must reject Muhammad as a false prophet because Surah 4:157 (denying the Crucifixion) and Surah 5:72 (denying the Deity of Christ) contradict God's confirmed Word.
          </p>
        </div>
      </div>

      <style>{`
        .logical-trap-container {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 20px;
          padding: 24px;
          margin: 28px 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .trap-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .trap-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #b91c1c;
          background: #fef2f2;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .trap-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-on-surface, #09090b);
          margin: 0;
        }

        .trap-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 720px;
          margin: 0 auto;
        }

        .trap-step-card {
          width: 100%;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 14px;
          padding: 18px 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .step-num {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-on-surface-variant, #71717a);
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .step-heading {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-on-surface, #09090b);
          margin: 0 0 6px 0;
        }

        .step-text {
          font-size: 13px;
          color: var(--color-on-surface-variant, #71717a);
          line-height: 1.45;
          margin: 0;
        }

        .trap-arrow {
          font-size: 20px;
          font-weight: 900;
          color: #94a3b8;
          margin: 8px 0;
        }

        .trap-pillars-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .trap-pillars-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .proclamation-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 14px;
          padding: 16px;
          text-align: center;
        }

        .proc-tag {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #b45309;
        }

        .proc-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 14.5px;
          font-weight: 700;
          color: #78350f;
          margin: 6px 0;
        }

        .proc-ref {
          font-size: 11.5px;
          font-weight: 600;
          color: #92400e;
          margin: 0;
        }

        .trap-conclusion-card {
          width: 100%;
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(153, 27, 27, 0.25);
        }

        .conclusion-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          background: rgba(255, 255, 255, 0.15);
          padding: 3px 10px;
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .conclusion-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }

        .conclusion-text {
          font-size: 13.5px;
          line-height: 1.5;
          opacity: 0.95;
          margin: 0;
          max-width: 620px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .logical-trap-container {
            padding: 32px;
          }
        }
      `}</style>
    </div>
  );
}
