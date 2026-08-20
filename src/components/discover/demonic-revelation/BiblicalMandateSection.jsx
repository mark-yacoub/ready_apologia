import React from 'react';

export default function BiblicalMandateSection({ base = '' }) {
  return (
    <section id="biblical-mandate" className="mandate-section" aria-labelledby="mandate-heading">
      <header className="mandate-header">
        <span className="mandate-badge">THE BIBLICAL MANDATE</span>
        <h2 id="mandate-heading" className="mandate-title">Testing the Spirits</h2>
        <p className="mandate-subtitle">
          How Scripture equips believers to evaluate supernatural encounters, angelic claims, and prophetic consistency.
        </p>
      </header>

      <div className="mandate-grid">
        {/* 1. The Warning (The Disguise) */}
        <div className="mandate-card">
          <div className="card-top">
            <span className="step-tag">1. THE WARNING</span>
            <h3 className="card-heading">The Disguise of Adversarial Spirits</h3>
          </div>
          <p className="card-lead">
            The Bible explicitly warns that adversarial spirits do not always appear as monsters; their most dangerous tactic is mimicking divine messengers.
          </p>
          <blockquote className="mandate-quote-box">
            <p className="mandate-quote">
              “No wonder, for even <strong>Satan disguises himself as an angel of light</strong>.”
            </p>
            <footer className="quote-footer">
              <a href={`${base}/bible/2cor/11#14`} className="bible-link-pill" title="Read 2 Corinthians 11:14">
                <span>2 CORINTHIANS 11:14</span>
                <svg aria-hidden="true" className="link-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </a>
            </footer>
          </blockquote>
        </div>

        {/* 2. The Imperative (The Command to Test) */}
        <div className="mandate-card">
          <div className="card-top">
            <span className="step-tag">2. THE IMPERATIVE</span>
            <h3 className="card-heading">The Command to Test All Spirits</h3>
          </div>
          <p className="card-lead">
            Because deception is possible, Scripture commands believers never to blindly accept a supernatural encounter merely because it is miraculous or terrifying. It demands rigorous testing.
          </p>
          <blockquote className="mandate-quote-box">
            <p className="mandate-quote">
              “Beloved, do not believe every spirit, but <strong>test the spirits to see whether they are from God</strong>, because many false prophets have gone out into the world.”
            </p>
            <footer className="quote-footer">
              <a href={`${base}/bible/1jn/4#1`} className="bible-link-pill" title="Read 1 John 4:1">
                <span>1 JOHN 4:1</span>
                <svg aria-hidden="true" className="link-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </a>
            </footer>
          </blockquote>
        </div>

        {/* 3. The Ultimate Tests (Theology and Consistency) */}
        <div className="mandate-card full-width-card">
          <div className="card-top">
            <span className="step-tag">3. THE ULTIMATE TESTS</span>
            <h3 className="card-heading">Theological & Gospel Consistency</h3>
          </div>
          <p className="card-lead">
            How are spirits tested? The biblical standard is never based on the sensory power of an encounter, but entirely on theological consistency with the established revelation of Jesus Christ.
          </p>

          <div className="subtests-grid">
            {/* Test A */}
            <div className="subtest-box">
              <div className="subtest-header">
                <span className="subtest-label">TEST A</span>
                <h4 className="subtest-title">The Incarnation & Sonship of Christ</h4>
              </div>
              <blockquote className="mandate-quote-box">
                <p className="mandate-quote">
                  “By this you know the Spirit of God: every spirit that confesses that Jesus Christ has come in the flesh is from God; and <strong>every spirit that does not confess Jesus is not from God; this is the spirit of the antichrist...</strong>”
                </p>
                <footer className="quote-footer">
                  <a href={`${base}/bible/1jn/4#2`} className="bible-link-pill" title="Read 1 John 4:2-3">
                    <span>1 JOHN 4:2-3</span>
                    <svg aria-hidden="true" className="link-arrow" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </a>
                </footer>
              </blockquote>
              <p className="subtest-context-note">
                <strong>Diagnostic Outcome:</strong> Islam explicitly and repeatedly denies that Jesus is the Son of God (<a href={`${base}/quran/9#30`} className="note-quran-link">Surah 9:30</a>), failing this foundational biblical test.
              </p>
            </div>

            {/* Test B */}
            <div className="subtest-box">
              <div className="subtest-header">
                <span className="subtest-label">TEST B</span>
                <h4 className="subtest-title">The Gospel Consistency Test</h4>
              </div>
              <blockquote className="mandate-quote-box">
                <p className="mandate-quote">
                  “But <strong>even if we, or an angel from heaven, should preach to you a gospel contrary</strong> to what we have preached to you, he is to be accursed!”
                </p>
                <footer className="quote-footer">
                  <a href={`${base}/bible/gal/1#8`} className="bible-link-pill" title="Read Galatians 1:8">
                    <span>GALATIANS 1:8</span>
                    <svg aria-hidden="true" className="link-arrow" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </a>
                </footer>
              </blockquote>
              <p className="subtest-context-note">
                <strong>Diagnostic Outcome:</strong> Paul specifically anticipated a scenario where an "angel from heaven" brings a different gospel, and commanded believers to reject it unconditionally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Callout */}
      <div className="mandate-synthesis-callout">
        <p className="synthesis-text">
          Paul explicitly forewarned that even if a literal entity appearing as an <em>“angel from heaven”</em> delivers a message contradicting the Gospel of Christ, it must be rejected. The encounter in the cave of Hira introduced a theology that actively denies the Crucifixion (<a href={`${base}/quran/4#157`} className="synthesis-link">Surah 4:157</a>) and the divine Sonship of Jesus Christ—directly failing the apostolic test of 1 John 4.
        </p>
      </div>

      <style>{`
        .mandate-section {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 2px solid var(--color-outline-variant, #e4e4e7);
        }

        .mandate-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 24px;
        }

        .mandate-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #974543;
          background: rgba(151, 69, 67, 0.08);
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .mandate-title {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 800;
          color: var(--color-on-surface, #09090b);
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .mandate-subtitle {
          font-size: 13.5px;
          color: var(--color-on-surface-variant, #71717a);
          line-height: 1.5;
          margin: 0;
        }

        .mandate-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mandate-card {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-outline-variant, #e4e4e7);
          border-radius: 14px;
          padding: 14px 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        @media (min-width: 640px) {
          .mandate-card {
            border-radius: 16px;
            padding: 20px 22px;
          }
        }

        .card-top {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .step-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #52525b;
        }

        .card-heading {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: 15.5px;
          font-weight: 700;
          color: var(--color-on-surface, #09090b);
          margin: 0;
        }

        .card-lead {
          font-size: 13px;
          line-height: 1.5;
          color: #3f3f46;
          margin: 0 0 10px;
        }

        .mandate-quote-box {
          background: #f8fafc;
          border-left: 3px solid #94a3b8;
          border-radius: 0 8px 8px 0;
          padding: 10px 12px;
          margin: 0 0 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mandate-quote {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: 13.5px;
          line-height: 1.55;
          color: #1e293b;
          margin: 0;
        }

        .quote-footer {
          display: flex;
          justify-content: flex-end;
        }

        .bible-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #475569;
          background: #e2e8f0;
          border-radius: 9999px;
          padding: 3px 8px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .bible-link-pill:hover {
          color: #0f172a;
          background: #cbd5e1;
        }

        .link-arrow {
          width: 12px;
          height: 12px;
        }

        .subtests-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        @media (min-width: 768px) {
          .subtests-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }

        .subtest-box {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .subtest-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 8px;
        }

        .subtest-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #974543;
        }

        .subtest-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #18181b;
          margin: 0;
        }

        .subtest-context-note {
          font-size: 12px;
          line-height: 1.45;
          color: #52525b;
          margin: 0;
          padding-top: 4px;
        }

        .note-quran-link, .synthesis-link {
          color: #974543;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* Synthesis Callout */
        .mandate-synthesis-callout {
          margin-top: 20px;
          padding: 14px 16px;
          background: #faf5f5;
          border: 1px solid #fecdd3;
          border-radius: 12px;
        }

        @media (min-width: 640px) {
          .mandate-synthesis-callout {
            padding: 18px 22px;
          }
        }

        .synthesis-text {
          font-family: var(--font-display, 'Literata', Georgia, serif);
          font-size: 13.5px;
          line-height: 1.6;
          color: #881337;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
