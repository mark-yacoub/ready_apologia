import React from 'react';
import '../../../styles/trust-overview.css';

export default function TrustworthinessOverview() {
  const navigateToStage = (stageId) => {
    // Dispatch custom event for Astro DOM controller
    window.dispatchEvent(new CustomEvent('trust-navigate-stage', { detail: { stage: stageId } }));
    
    // Fallback: trigger click on the corresponding tab pill
    const tabBtn = document.querySelector(`.trust-stage-pill[data-stage="${stageId}"]`);
    if (tabBtn) {
      tabBtn.click();
    }
  };

  return (
    <div className="trust-overview-container">
      
      {/* Top Apologetic Metric Dashboard */}
      <section aria-label="Key Apologetic Metrics">
        <div className="trust-metrics-grid">
          <div className="trust-metric-card">
            <span className="trust-metric-value">24,000+</span>
            <span className="trust-metric-label">Ancient Manuscripts</span>
            <span className="trust-metric-desc">Surviving Greek, Latin, and early translation copies of the New Testament.</span>
          </div>
          <div className="trust-metric-card">
            <span className="trust-metric-value">99.5%</span>
            <span className="trust-metric-label">Textual Fidelity</span>
            <span className="trust-metric-desc">Accuracy across 20+ centuries of copying, with 0% affecting core doctrines.</span>
          </div>
          <div className="trust-metric-card">
            <span className="trust-metric-value">8</span>
            <span className="trust-metric-label">Secular Historians</span>
            <span className="trust-metric-desc">Non-Christian classical Roman & Jewish authors attesting to Jesus and early Christians.</span>
          </div>
          <div className="trust-metric-card">
            <span className="trust-metric-value">36,000+</span>
            <span className="trust-metric-label">Patristic Citations</span>
            <span className="trust-metric-desc">Pre-Nicene quotations capable of reconstructing the New Testament without manuscripts.</span>
          </div>
        </div>
      </section>

      {/* 4 Interactive Chapter Cards */}
      <section aria-label="Exhaustive Evidence Chapters">
        <h2 className="trust-chapters-heading">Explore the 4 Sequential Chapters</h2>
        <div className="trust-chapters-grid">
          
          {/* Chapter 1 */}
          <div
            className="trust-chapter-card"
            onClick={() => navigateToStage('stage1')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToStage('stage1');
              }
            }}
            data-goto-stage="stage1"
            role="button"
            tabIndex={0}
            aria-label="Explore Chapter 1: Textual Transmission and Ancient Manuscripts"
          >
            <div className="trust-chapter-header">
              <span className="trust-chapter-number">CHAPTER 1 // FOUNDATION (37 EVIDENCES)</span>
              <h3 className="trust-chapter-title">Textual Transmission & Ancient Manuscripts</h3>
              <p className="trust-chapter-desc">
                Examine comparative histograms against 15 classical authors, explore the 4-category variant taxonomy, and inspect 14 cornerstone papyri and codices.
              </p>
              <div className="trust-chapter-highlights">
                <span className="trust-chapter-pill">P52 Rylands Papyrus</span>
                <span className="trust-chapter-pill">Codex Sinaiticus</span>
                <span className="trust-chapter-pill">Great Isaiah Scroll</span>
              </div>
            </div>
            <button type="button" className="trust-chapter-action-btn" onClick={(e) => { e.stopPropagation(); navigateToStage('stage1'); }}>
              <span>Explore Chapter 1 →</span>
            </button>
          </div>

          {/* Chapter 2 */}
          <div
            className="trust-chapter-card"
            onClick={() => navigateToStage('stage2')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToStage('stage2');
              }
            }}
            data-goto-stage="stage2"
            role="button"
            tabIndex={0}
            aria-label="Explore Chapter 2: Historical and Archaeological Corroboration"
          >
            <div className="trust-chapter-header">
              <span className="trust-chapter-number">CHAPTER 2 // CORROBORATION (27 EVIDENCES)</span>
              <h3 className="trust-chapter-title">Historical & Archaeological Corroboration</h3>
              <p className="trust-chapter-desc">
                Excavate physical monuments, inscriptions, and coinage across the New and Old Testaments, and inspect dossiers from 8 classical secular historians.
              </p>
              <div className="trust-chapter-highlights">
                <span className="trust-chapter-pill">Pilate Stone</span>
                <span className="trust-chapter-pill">Tel Dan Stele</span>
                <span className="trust-chapter-pill">Tacitus & Josephus</span>
              </div>
            </div>
            <button type="button" className="trust-chapter-action-btn" onClick={(e) => { e.stopPropagation(); navigateToStage('stage2'); }}>
              <span>Explore Chapter 2 →</span>
            </button>
          </div>

          {/* Chapter 3 */}
          <div
            className="trust-chapter-card"
            onClick={() => navigateToStage('stage3')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToStage('stage3');
              }
            }}
            data-goto-stage="stage3"
            role="button"
            tabIndex={0}
            aria-label="Explore Chapter 3: Eyewitness Credibility and Onomastic Demography"
          >
            <div className="trust-chapter-header">
              <span className="trust-chapter-number">CHAPTER 3 // AUTHENTICITY (17 EVIDENCES)</span>
              <h3 className="trust-chapter-title">Eyewitness Credibility & Onomastic Demography</h3>
              <p className="trust-chapter-desc">
                Evaluate 1st-century Palestinian Jewish name frequency data, uncover interlocking undesigned coincidences, and examine the criterion of embarrassment.
              </p>
              <div className="trust-chapter-highlights">
                <span className="trust-chapter-pill">Bauckham Name Data</span>
                <span className="trust-chapter-pill">Undesigned Coincidences</span>
                <span className="trust-chapter-pill">Honest Reporting</span>
              </div>
            </div>
            <button type="button" className="trust-chapter-action-btn" onClick={(e) => { e.stopPropagation(); navigateToStage('stage3'); }}>
              <span>Explore Chapter 3 →</span>
            </button>
          </div>

          {/* Chapter 4 */}
          <div
            className="trust-chapter-card"
            onClick={() => navigateToStage('stage4')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToStage('stage4');
              }
            }}
            data-goto-stage="stage4"
            role="button"
            tabIndex={0}
            aria-label="Explore Chapter 4: Canon, Patristic Quotations and The Verdict"
          >
            <div className="trust-chapter-header">
              <span className="trust-chapter-number">CHAPTER 4 // CAPSTONE & VERDICT (11 EVIDENCES)</span>
              <h3 className="trust-chapter-title">Canon, Patristic Quotations & The Verdict</h3>
              <p className="trust-chapter-desc">
                Analyze 36,000+ pre-Nicene Church Father citations, refute Da Vinci Code / Nicaea myths, and confront C.S. Lewis's Trilemma.
              </p>
              <div className="trust-chapter-highlights">
                <span className="trust-chapter-pill">36,000+ Citations</span>
                <span className="trust-chapter-pill">Nicaea Myth Debunked</span>
                <span className="trust-chapter-pill">C.S. Lewis Trilemma</span>
              </div>
            </div>
            <button type="button" className="trust-chapter-action-btn" onClick={(e) => { e.stopPropagation(); navigateToStage('stage4'); }}>
              <span>Explore Chapter 4 →</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
