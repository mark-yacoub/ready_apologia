import React, { useState, useMemo } from 'react';
import '../../../styles/trust-stage1.css';
import ManuscriptCarousel from '../../ManuscriptCarousel.jsx';
import defaultTrustworthinessData from '../../../data/trustworthiness-of-the-bible.json';

/* ==========================================================================
   Helper: Markdown-lite text formatter for bold (**text**) & italic (*text*)
   ========================================================================== */
function renderFormattedText(text) {
  if (!text) return null;
  const html = text
    .replace(/\[\[(.*?)\]\]/g, '<strong>[$1]</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ==========================================================================
   Helper: Numerical extractors for Classical Histogram Comparison
   ========================================================================== */
function getManuscriptTotal(item) {
  if (item?.manuscriptCount && typeof item.manuscriptCount === 'object') {
    return item.manuscriptCount.total || 0;
  }
  if (typeof item?.manuscriptCount === 'number') {
    return item.manuscriptCount;
  }
  return 0;
}

function getAccuracyPercentage(item) {
  if (typeof item?.accuracyPercentage === 'number') {
    return item.accuracyPercentage;
  }
  return 95.0; // fallback default
}

function getTimeGapNumeric(item) {
  if (typeof item?.timeGapYears === 'number') {
    return item.timeGapYears;
  }
  if (!item?.timeGapYears) {
    return 1000;
  }
  const clean = String(item.timeGapYears).replace(/,/g, '');
  const matches = clean.match(/\d+/g);
  if (matches && matches.length >= 2) {
    return Math.round((parseInt(matches[0], 10) + parseInt(matches[1], 10)) / 2);
  } else if (matches && matches.length === 1) {
    return parseInt(matches[0], 10);
  }
  return 1000;
}

function isBiblicalItem(item) {
  if (!item?.id) return false;
  return (
    item.id === 'nt-manuscripts' ||
    item.id === 'ot-manuscripts' ||
    item.sourceType?.toLowerCase().includes('scripture') ||
    item.tags?.includes('New Testament') ||
    item.tags?.includes('Old Testament')
  );
}

function determineIsNT(item, propIsNT) {
  if (typeof item?.isNT === 'boolean') return item.isNT;
  if (
    item?.id === 'great-isaiah-scroll-1qisaa' ||
    item?.id === '11q5-great-psalms-scroll' ||
    item?.id === 'ot-manuscripts'
  ) {
    return false;
  }
  if (item?.sourceType && item.sourceType.toLowerCase().includes('old testament')) {
    return false;
  }
  if (item?.tags && item.tags.some(t => t.toLowerCase().includes('old testament'))) {
    return false;
  }
  if (typeof propIsNT === 'boolean') {
    return propIsNT;
  }
  return true;
}

/* ==========================================================================
   Default Textual Variants Taxonomy List (Feature 2 Fallback)
   ========================================================================== */
const defaultVariantsList = [
  {
    id: "variant-cat1-spelling",
    name: "Category 1: Spelling & Nonsense Variants (~78% of All Variants)",
    category: "Spelling & Nonsense (~78%)",
    percentageOfTotal: 78.0,
    color: "#64748b",
    keyFact: "**~78% of all 400,000 variants are spelling differences** like *movable nu* or spelling *John* with one N vs. two Ns",
    quote: "**John** spelled **Ιωαννης** (two nus) vs. **Ιωανης** (one nu) — or **David** spelled **Δαβιδ** vs. **Δαυιδ**",
    explanation: "When skeptics claim there are '400,000 errors in the Bible', they conceal the fact that nearly 80% are spelling variations. In Greek, adding an optional 'N' at the end of a word before a vowel (a movable nu, identical to English 'a' vs. 'an') counts as a variant every single time it occurs across 5,800 manuscripts."
  },
  {
    id: "variant-cat2-synonyms",
    name: "Category 2: Untranslatable Synonyms & Word Order (~17% of All Variants)",
    category: "Synonyms & Word Order (~17%)",
    percentageOfTotal: 17.0,
    color: "#0284c7",
    keyFact: "**~17% of variants involve word order or synonyms** (*'Jesus Christ'* vs. *'Christ Jesus'*), with **zero impact on English translation**",
    quote: "**'Jesus Christ is Lord'** (Ιησους Χριστος) vs. **'Christ Jesus is Lord'** (Χριστος Ιησους) — or **'Jesus'** vs. **'the Jesus'** (ο Ιησους)",
    explanation: "In Greek, 'Paul loves Jesus' and 'Jesus loves Paul (with accusative ending)' can be written in six different word orders without changing the meaning. Every variation across thousands of copies adds to the variant count without altering the text's message."
  },
  {
    id: "variant-cat3-meaningful-not-viable",
    name: "Category 3: Meaningful but NOT Viable Variants (~4% of All Variants)",
    category: "Meaningful Not Viable (~4%)",
    percentageOfTotal: 4.0,
    color: "#d97706",
    keyFact: "**Obvious scribal blunders** like 1 Thess 2:7 where a scribe accidentally wrote **'horses'** instead of **'gentle'**",
    quote: "1 Thessalonians 2:7 — **'we were gentle among you'** (ηπιοι, epioi) vs. **'we were horses among you'** (ιπποι, hippoi, found in one late medieval scribe's slip)",
    explanation: "Because Greek letters H (eta) and I (iota) sounded similar in Byzantine Greek, a sleepy medieval scribe dropped an H and turned 'gentle' into 'horses'. While meaningful, this variant is not viable—it is immediately detected and dismissed by textual critics."
  },
  {
    id: "variant-cat4-meaningful-and-viable",
    name: "Category 4: Meaningful AND Viable Variants (~0.8% of All Variants)",
    category: "Meaningful & Viable (~0.8%)",
    percentageOfTotal: 0.8,
    color: "#059669",
    keyFact: "**Less than 1% of variants are meaningful and viable**, and **ZERO percent affect any core doctrine** of Christian faith",
    quote: "Romans 5:1 — **'we have peace with God'** (εχομεν, indicative) vs. **'let us have peace with God'** (εχωμεν, subjunctive)... 1 John 1:4 — **'our joy'** vs. **'your joy'**",
    explanation: "Even among the <1% of variants where scholars debate the original reading, no Christian creed, moral command, or theological doctrine hangs in the balance. Whether Romans 5:1 is a declaration ('we have peace') or an exhortation ('let us have peace'), justification by faith remains bedrock biblical truth."
  },
  {
    id: "bracketed-passages",
    name: "Category 5: Bracketed Passages — Mark 16 & John 8 (~0.2% of All Variants)",
    category: "Bracketed Passages (~0.2%)",
    percentageOfTotal: 0.2,
    color: "#9333ea",
    keyFact: "**Transparently bracketed in modern translations** (Mark 16:9–20 & John 7:53–8:11), demonstrating **complete intellectual honesty** of Bible translators",
    quote: "Mark 16:9–20: [[Now when he rose early on the first day...]]\nJohn 7:53–8:11: [[Let him who is without sin among you...]]",
    explanation: "Rather than hiding textual variants, modern English translations openly bracket Mark 16:9–20 and John 7:53–8:11 with explanatory footnotes. Furthermore, every resurrection appearance and teaching in Mark 16 is corroborated in Matthew, Luke, John, and Acts—proving no doctrine is lost either way."
  }
];

function getVariantsTaxonomy(variantEvidences) {
  if (!variantEvidences || variantEvidences.length === 0) {
    return defaultVariantsList;
  }
  const cat1 = variantEvidences.find(v => v.id === 'variant-cat1-spelling') || defaultVariantsList[0];
  const cat2 = variantEvidences.find(v => v.id === 'variant-cat2-synonyms') || defaultVariantsList[1];
  const cat3 = variantEvidences.find(v => v.id === 'variant-cat3-meaningful-not-viable') || defaultVariantsList[2];
  const cat4 = variantEvidences.find(v => v.id === 'variant-cat4-meaningful-and-viable') || defaultVariantsList[3];
  
  const bracketedMark = variantEvidences.find(v => v.id === 'bracketed-longer-ending-mark');
  const bracketedJohn = variantEvidences.find(v => v.id === 'bracketed-pericope-adulterae');
  const cat5 = (bracketedMark || bracketedJohn) ? {
    id: "bracketed-passages",
    name: "Category 5: Bracketed Passages (Mark 16:9–20 & John 7:53–8:11)",
    category: "Bracketed Passages (~0.2%)",
    percentageOfTotal: 0.2,
    color: "#9333ea",
    keyFact: "**Openly bracketed in modern Bibles**, demonstrating the **complete intellectual honesty** of Christian Bible translators",
    quote: "Mark 16:9–20: [[Now when he rose early on the first day...]]\nJohn 7:53–8:11: [[Let him who is without sin among you...]]",
    explanation: "Modern English translations transparently bracket Mark 16:9–20 and John 7:53–8:11 with footnotes explaining their absence in the oldest 4th-century uncials (Sinaiticus & Vaticanus). No Christian doctrine is affected by either passage."
  } : defaultVariantsList[4];

  return [
    { ...cat1, percentageOfTotal: 78.0, color: "#64748b" },
    { ...cat2, percentageOfTotal: 17.0, color: "#0284c7" },
    { ...cat3, percentageOfTotal: 4.0, color: "#d97706" },
    { ...cat4, percentageOfTotal: 0.8, color: "#059669" },
    { ...cat5, percentageOfTotal: 0.2, color: "#9333ea" }
  ];
}

/* ==========================================================================
   SVG Donut Slices Renderer
   ========================================================================== */
function renderDonutSlices(slices, selectedIdx, onSelect) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // 502.6548245743669
  let accumulatedPercent = 0;

  return slices.map((slice, idx) => {
    const percent = slice.percentageOfTotal || 0;
    const dashLength = (percent / 100) * circumference;
    const gapLength = circumference - dashLength;
    const offset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;

    const isSelected = selectedIdx === idx;

    return (
      <circle
        key={slice.id || idx}
        cx="100"
        cy="100"
        r={radius}
        fill="transparent"
        stroke={slice.color}
        strokeWidth={isSelected ? "26" : "20"}
        strokeDasharray={`${dashLength} ${gapLength}`}
        strokeDashoffset={offset}
        className={`donut-slice ${isSelected ? "donut-slice-selected" : ""}`}
        onClick={() => onSelect(idx)}
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: '100px 100px'
        }}
      />
    );
  });
}

/* ==========================================================================
   Main Component: Stage1TextualTransmission
   ========================================================================== */
export default function Stage1TextualTransmission({ evidences, isNT }) {
  // Navigation State: 'histogram', 'variants', 'manuscripts', or 'all'
  const [activeSection, setActiveSection] = useState('all');

  // Feature 1 State
  const [histogramMetric, setHistogramMetric] = useState('manuscripts'); // 'manuscripts', 'timeGap', 'fidelity'
  const [histogramScale, setHistogramScale] = useState('linear'); // 'linear', 'log'
  const [selectedClassicalId, setSelectedClassicalId] = useState('nt-manuscripts');

  // Feature 2 State (Default select Category 4: Meaningful & Viable to show 0% doctrine checkmark!)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(3);

  // Feature 3 State
  const [manuscriptFilter, setManuscriptFilter] = useState('all'); // 'all', 'papyri', 'uncials', 'dss'
  const [manuscriptSearch, setManuscriptSearch] = useState('');

  // 1. Resolve Dataset Categorization (Props vs Default JSON Fallback)
  const defaultThemes = defaultTrustworthinessData?.themes || [];
  const classicalTheme = defaultThemes.find(t => t.id === 'stage1-classical-comparison') || {};
  const manuscriptsTheme = defaultThemes.find(t => t.id === 'stage1-biblical-manuscripts') || {};
  const variantsTheme = defaultThemes.find(t => t.id === 'stage1-textual-variants') || {};

  const classicalItems = useMemo(() => {
    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return classicalTheme.evidences || [];
    }
    const found = evidences.filter(e =>
      e.id === 'nt-manuscripts' ||
      e.id === 'ot-manuscripts' ||
      e.tags?.includes('Classical Comparison') ||
      e.tags?.includes('Histograms') ||
      [
        'homer-iliad', 'caesar-gallic-wars', 'tacitus-annals-histories', 'herodotus-histories',
        'plato-tetralogies', 'thucydides-peloponnesian-war', 'suetonius-twelve-caesars', 'livy-history-of-rome',
        'aristotle-poetics-works', 'demosthenes-speeches', 'sophocles-tragedies', 'pliny-younger-epistulae',
        'lucretius-de-rerum-natura', 'catullus-poems', 'euripides-tragedies'
      ].includes(e.id)
    );
    return found.length > 0 ? found : (classicalTheme.evidences || []);
  }, [evidences, classicalTheme.evidences]);

  const manuscriptItems = useMemo(() => {
    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return manuscriptsTheme.evidences || [];
    }
    const found = evidences.filter(e =>
      e.id?.startsWith('p') ||
      e.id?.startsWith('codex-') ||
      e.id?.includes('scroll') ||
      [
        'p52-rylands-papyrus', 'p66-bodmer-papyrus-ii', 'p75-bodmer-papyrus-xiv-xv',
        'p46-chester-beatty-ii', 'p47-chester-beatty-iii', 'p72-bodmer-vii-ix',
        'codex-sinaiticus-01', 'codex-vaticanus-b', 'codex-alexandrinus-02',
        'codex-ephraemi-rescriptus-04', 'codex-bezae-05', 'great-isaiah-scroll-1qisaa',
        '11q5-great-psalms-scroll', 'p115-papyrus-115-revelation'
      ].includes(e.id) ||
      e.sourceType?.includes('Papyrus') ||
      e.sourceType?.includes('Codex') ||
      e.sourceType?.includes('Scroll')
    );
    return found.length > 0 ? found : (manuscriptsTheme.evidences || []);
  }, [evidences, manuscriptsTheme.evidences]);

  const variantItems = useMemo(() => {
    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return variantsTheme.evidences || [];
    }
    const found = evidences.filter(e =>
      e.id?.startsWith('variant-') ||
      e.id?.startsWith('bracketed-') ||
      e.tags?.includes('Textual Variants') ||
      e.category
    );
    return found.length > 0 ? found : (variantsTheme.evidences || []);
  }, [evidences, variantsTheme.evidences]);

  // 2. Sorted & Scaled Classical Comparison Histogram Data
  const sortedClassical = useMemo(() => {
    const list = [...classicalItems];
    if (histogramMetric === 'manuscripts') {
      return list.sort((a, b) => getManuscriptTotal(b) - getManuscriptTotal(a));
    }
    if (histogramMetric === 'timeGap') {
      return list.sort((a, b) => getTimeGapNumeric(a) - getTimeGapNumeric(b));
    }
    if (histogramMetric === 'fidelity') {
      return list.sort((a, b) => getAccuracyPercentage(b) - getAccuracyPercentage(a));
    }
    return list;
  }, [classicalItems, histogramMetric]);

  const maxClassicalValue = useMemo(() => {
    if (sortedClassical.length === 0) return 1;
    if (histogramMetric === 'manuscripts') {
      return Math.max(...sortedClassical.map(item => getManuscriptTotal(item)), 1);
    }
    if (histogramMetric === 'timeGap') {
      return Math.max(...sortedClassical.map(item => getTimeGapNumeric(item)), 1);
    }
    if (histogramMetric === 'fidelity') {
      return 100;
    }
    return 1;
  }, [sortedClassical, histogramMetric]);

  const selectedDossierItem = useMemo(() => {
    const match = sortedClassical.find(i => i.id === selectedClassicalId);
    return match || sortedClassical[0] || null;
  }, [sortedClassical, selectedClassicalId]);

  // 3. Textual Variants Slices Data
  const donutSlices = useMemo(() => {
    return getVariantsTaxonomy(variantItems);
  }, [variantItems]);

  const selectedVariantSlice = donutSlices[selectedVariantIdx] || donutSlices[0] || {};

  // 4. Filtered & Searched 14 Biblical Manuscripts
  const filteredManuscripts = useMemo(() => {
    return manuscriptItems.filter(item => {
      // Search check
      if (manuscriptSearch.trim() !== '') {
        const q = manuscriptSearch.toLowerCase();
        const textMatch =
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.nameDesc && item.nameDesc.toLowerCase().includes(q)) ||
          (item.keyFact && item.keyFact.toLowerCase().includes(q)) ||
          (item.quote && item.quote.toLowerCase().includes(q)) ||
          (item.explanation && item.explanation.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
        if (!textMatch) return false;
      }
      // Filter tab check
      if (manuscriptFilter === 'papyri') {
        return item.id?.startsWith('p') || item.sourceType?.toLowerCase().includes('papyrus');
      }
      if (manuscriptFilter === 'uncials') {
        return item.id?.startsWith('codex') || item.sourceType?.toLowerCase().includes('codex');
      }
      if (manuscriptFilter === 'dss') {
        return (
          item.id?.includes('scroll') ||
          item.sourceType?.toLowerCase().includes('scroll') ||
          item.tags?.includes('Dead Sea Scrolls') ||
          item.id === 'great-isaiah-scroll-1qisaa' ||
          item.id === '11q5-great-psalms-scroll'
        );
      }
      return true;
    });
  }, [manuscriptItems, manuscriptFilter, manuscriptSearch]);

  return (
    <div className="trust-stage1-container">

      {/* Section Navigation Segmented Bar */}
      <nav className="trust-stage1-nav-bar" aria-label="Stage 1 Section Navigation">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`trust-stage1-nav-btn ${activeSection === 'all' ? 'active-tab' : ''}`}
        >
          <span>All Sections (Complete Archive)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('histogram')}
          className={`trust-stage1-nav-btn ${activeSection === 'histogram' ? 'active-tab' : ''}`}
        >
          <span>1. Classical Comparison Histogram</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('variants')}
          className={`trust-stage1-nav-btn ${activeSection === 'variants' ? 'active-tab' : ''}`}
        >
          <span>2. Textual Variants Taxonomy (400k)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('manuscripts')}
          className={`trust-stage1-nav-btn ${activeSection === 'manuscripts' ? 'active-tab' : ''}`}
        >
          <span>3. Cornerstone Manuscripts (14)</span>
        </button>
      </nav>

      {/* ======================================================================
         FEATURE 1: Comparative Histogram / Bar Chart
         ====================================================================== */}
      {(activeSection === 'all' || activeSection === 'histogram') && (
        <section className="trust-histogram-card" aria-labelledby="histogram-section-title">
          <div className="trust-section-header">
            <div className="trust-section-title-wrap">
              <span className="trust-section-badge">FEATURE 1 • STATISTICAL HISTOGRAM</span>
              <h2 id="histogram-section-title" className="trust-section-title">
                Classical Antiquity vs. Biblical Manuscript Transmission
              </h2>
            </div>
          </div>

          {/* Controls Bar: Metric Toggles & Scale Switcher */}
          <div className="trust-histogram-controls">
            <div className="trust-histogram-metric-group" role="group" aria-label="Select comparison metric">
              <button
                type="button"
                onClick={() => setHistogramMetric('manuscripts')}
                className={`trust-histogram-metric-btn ${histogramMetric === 'manuscripts' ? 'active-metric' : ''}`}
              >
                Surviving Manuscripts
              </button>
              <button
                type="button"
                onClick={() => setHistogramMetric('timeGap')}
                className={`trust-histogram-metric-btn ${histogramMetric === 'timeGap' ? 'active-metric' : ''}`}
              >
                Time Gap to Earliest Copy
              </button>
              <button
                type="button"
                onClick={() => setHistogramMetric('fidelity')}
                className={`trust-histogram-metric-btn ${histogramMetric === 'fidelity' ? 'active-metric' : ''}`}
              >
                Textual Fidelity (%)
              </button>
            </div>

            {/* Linear vs Logarithmic/Visual Scale Toggle (Only relevant for manuscript count) */}
            {histogramMetric === 'manuscripts' && (
              <div className="trust-histogram-scale-group" role="group" aria-label="Select scale mode">
                <button
                  type="button"
                  onClick={() => setHistogramScale('linear')}
                  className={`trust-histogram-scale-btn ${histogramScale === 'linear' ? 'active-scale' : ''}`}
                  title="Linear scale shows the true 100% dominance of the New Testament"
                >
                  Linear Scale
                </button>
                <button
                  type="button"
                  onClick={() => setHistogramScale('log')}
                  className={`trust-histogram-scale-btn ${histogramScale === 'log' ? 'active-scale' : ''}`}
                  title="Visual logarithmic scale makes smaller classical counts readable"
                >
                  Logarithmic Scale
                </button>
              </div>
            )}
          </div>

          {/* Histogram Rows Chart */}
          <div className="trust-histogram-chart-wrap" role="list">
            {sortedClassical.map(item => {
              const isBiblical = isBiblicalItem(item);
              const isSelected = item.id === selectedClassicalId;

              // Calculate percentage width for visual bar
              let barPct = 10;
              let valueDisplay = '';
              let subDisplay = '';

              if (histogramMetric === 'manuscripts') {
                const totalMss = getManuscriptTotal(item);
                valueDisplay = `${totalMss.toLocaleString()} MSS`;
                subDisplay = item.timeGapYears ? `Gap: ${item.timeGapYears}` : '';

                if (histogramScale === 'linear') {
                  barPct = Math.max(1, (totalMss / maxClassicalValue) * 100);
                } else {
                  // Logarithmic visual mapping
                  barPct = Math.max(7, (Math.log10(totalMss + 1) / Math.log10(maxClassicalValue + 1)) * 100);
                }
              } else if (histogramMetric === 'timeGap') {
                const gapNum = getTimeGapNumeric(item);
                valueDisplay = item.timeGapYears || `${gapNum} years`;
                subDisplay = `Earliest Copy: ${item.earliestCopyDate || 'Unknown'}`;
                // For time gap, visualize gap length (NT 40 yrs small bar, Euripides 1500 yrs full bar)
                barPct = Math.max(8, (gapNum / maxClassicalValue) * 100);
              } else if (histogramMetric === 'fidelity') {
                const fidelityNum = getAccuracyPercentage(item);
                valueDisplay = `${fidelityNum}%`;
                subDisplay = item.accuracyPercentage ? 'Textual Agreement' : 'Estimated';
                // Map fidelity percentage from 80%-100% onto bar width
                barPct = Math.max(12, ((fidelityNum - 75) / 25) * 100);
              }

              return (
                <div
                  key={item.id}
                  role="listitem"
                  onClick={() => setSelectedClassicalId(item.id)}
                  className={`trust-histogram-row ${isSelected ? 'is-selected-row' : ''} ${isBiblical ? 'is-biblical-row' : ''}`}
                >
                  {/* Left Column: Author & Date */}
                  <div className="trust-histogram-label-col">
                    <span className="trust-histogram-author-name">
                      <span>{item.name}</span>
                      {isBiblical && (
                        <span className="trust-biblical-tag">
                          {item.id === 'nt-manuscripts' ? 'NT SCRIPTURE' : 'OT SCRIPTURE'}
                        </span>
                      )}
                    </span>
                    <span className="trust-histogram-date-sub">
                      Autograph: {item.autographDate || item.dateStr || 'Unknown'}
                    </span>
                  </div>

                  {/* Middle Column: Animated Bar Track */}
                  <div className="trust-histogram-bar-col">
                    <div className="trust-histogram-bar-track">
                      <div
                        className={`trust-histogram-bar-fill ${isBiblical ? 'is-biblical-fill' : 'is-classical-fill'}`}
                        style={{ width: `${Math.min(100, barPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Metric Value Tag */}
                  <div className="trust-histogram-value-col">
                    <span>{valueDisplay}</span>
                    {subDisplay && <span className="trust-histogram-value-sub">{subDisplay}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ancient Archive Dossier Card (Displays detail for clicked/selected author) */}
          {selectedDossierItem && (
            <div className="trust-archive-dossier-card" role="region" aria-label="Ancient Archive Dossier Card">
              <div className="dossier-header">
                <div className="dossier-title-wrap">
                  <span className="dossier-source-type">
                    ANCIENT ARCHIVE DOSSIER • {selectedDossierItem.sourceType || 'Classical Source'}
                  </span>
                  <h3 className="dossier-title">{selectedDossierItem.name}</h3>
                </div>
              </div>

              {/* Statistics Breakdown Grid */}
              <div className="dossier-stats-row">
                <div className="dossier-stat-box">
                  <span className="dossier-stat-label">Surviving Manuscripts</span>
                  <span className="dossier-stat-val">
                    {getManuscriptTotal(selectedDossierItem).toLocaleString()}
                  </span>
                </div>
                <div className="dossier-stat-box">
                  <span className="dossier-stat-label">Time Gap to Earliest Copy</span>
                  <span className="dossier-stat-val">
                    {selectedDossierItem.timeGapYears || 'Unknown'}
                  </span>
                </div>
                <div className="dossier-stat-box">
                  <span className="dossier-stat-label">Textual Fidelity (%)</span>
                  <span className="dossier-stat-val">
                    {getAccuracyPercentage(selectedDossierItem)}%
                  </span>
                </div>
                <div className="dossier-stat-box">
                  <span className="dossier-stat-label">Earliest Surviving Copy</span>
                  <span className="dossier-stat-val">
                    {selectedDossierItem.earliestCopyDate || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Primary Quotation */}
              {selectedDossierItem.quote && (
                <div className="dossier-quote-box">
                  {renderFormattedText(selectedDossierItem.quote)}
                </div>
              )}

              {/* Scholarly Analytical Explanation */}
              <p className="dossier-explanation">
                {renderFormattedText(selectedDossierItem.explanation || selectedDossierItem.keyFact)}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ======================================================================
         FEATURE 2: 4-Category Textual Variants Pie / Donut Chart
         ====================================================================== */}
      {(activeSection === 'all' || activeSection === 'variants') && (
        <section className="trust-variants-section" aria-labelledby="variants-section-title">
          <div className="trust-section-header">
            <div className="trust-section-title-wrap">
              <span className="trust-section-badge">FEATURE 2 • TEXTUAL CRITICISM TAXONOMY</span>
              <h2 id="variants-section-title" className="trust-section-title">
                The 400,000 Textual Variants: 4-Category Taxonomy
              </h2>
            </div>
          </div>

          <div className="trust-variants-layout">
            {/* Left Column: Interactive SVG Donut Chart */}
            <div className="trust-donut-wrap">
              <svg
                className="trust-donut-svg"
                viewBox="0 0 200 200"
                aria-label="4-Category Textual Variants Donut Chart"
              >
                {renderDonutSlices(donutSlices, selectedVariantIdx, setSelectedVariantIdx)}
              </svg>

              <div className="trust-donut-center-label">
                <span className="donut-center-num">
                  {selectedVariantSlice.percentageOfTotal ? `${selectedVariantSlice.percentageOfTotal}%` : '400,000'}
                </span>
                <span className="donut-center-sub">
                  {selectedVariantSlice.category ? 'Selected Slice' : 'Total Variants'}
                </span>
              </div>
            </div>

            {/* Right Column: Legend, Green Banner & Interactive Slices */}
            <div className="trust-variants-side">
              {/* Prominent Green Banner / Badge: 0% Affect Core Christian Doctrines */}
              <div className="trust-doctrinal-zero-banner" role="status" aria-label="Doctrinal integrity checkmark banner">
                <div className="doctrinal-zero-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '24px', height: '24px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="doctrinal-zero-content">
                  <h3 className="doctrinal-zero-title">0% AFFECT CORE CHRISTIAN DOCTRINES</h3>
                  <p className="doctrinal-zero-desc">
                    Across all ~400,000 textual variants in over 24,000 ancient manuscripts, not a single Christian creed, moral command, or theological doctrine—including the Trinity, the Resurrection, Justification by Faith, and the Deity of Christ—is altered or endangered.
                  </p>
                </div>
              </div>

              {/* Interactive Legend Buttons */}
              <div className="trust-variant-legend" role="list">
                {donutSlices.map((slice, idx) => {
                  const isSelected = selectedVariantIdx === idx;
                  return (
                    <button
                      type="button"
                      key={slice.id || idx}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`trust-variant-legend-btn ${isSelected ? 'active-legend-btn' : ''}`}
                    >
                      <div className="legend-btn-left">
                        <span className="legend-color-dot" style={{ backgroundColor: slice.color }} />
                        <span className="legend-cat-name">{slice.category || slice.name}</span>
                      </div>
                      <span className="legend-cat-pct">{slice.percentageOfTotal}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Category Detail Card Below Chart */}
          {selectedVariantSlice && (
            <div className="trust-variant-detail-card" role="region" aria-label="Selected Textual Variant Category Explanation">
              <div className="variant-detail-header">
                <h3 className="variant-detail-title">{selectedVariantSlice.name}</h3>
                <span className="variant-detail-pct-badge" style={{ backgroundColor: selectedVariantSlice.color || '#09090b' }}>
                  {selectedVariantSlice.percentageOfTotal}% of Total
                </span>
              </div>

              {/* Greek / Scripture Example Quote */}
              {selectedVariantSlice.quote && (
                <div className="variant-detail-quote">
                  {renderFormattedText(selectedVariantSlice.quote)}
                </div>
              )}

              {/* Key Fact */}
              {selectedVariantSlice.keyFact && (
                <div className="variant-detail-fact">
                  {renderFormattedText(selectedVariantSlice.keyFact)}
                </div>
              )}

              {/* Detailed Scholarly Explanation */}
              <p className="variant-detail-explanation">
                {renderFormattedText(selectedVariantSlice.explanation)}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ======================================================================
         FEATURE 3: 14 Cornerstone Biblical Manuscripts Cards
         ====================================================================== */}
      {(activeSection === 'all' || activeSection === 'manuscripts') && (
        <section className="trust-manuscripts-section" aria-labelledby="manuscripts-section-title">
          <div className="trust-section-header">
            <div className="trust-section-title-wrap">
              <span className="trust-section-badge">FEATURE 3 • CORNERSTONE BIBLICAL ARCHIVE</span>
              <h2 id="manuscripts-section-title" className="trust-section-title">
                14 Cornerstone Biblical Manuscripts &amp; Codices
              </h2>
            </div>
          </div>

          {/* Filter Toolbar & Search Input */}
          <div className="trust-manuscripts-toolbar">
            <div className="trust-manuscript-filters" role="group" aria-label="Filter manuscripts by source type">
              <button
                type="button"
                onClick={() => setManuscriptFilter('all')}
                className={`trust-manuscript-filter-btn ${manuscriptFilter === 'all' ? 'active-filter' : ''}`}
              >
                All Manuscripts ({manuscriptItems.length})
              </button>
              <button
                type="button"
                onClick={() => setManuscriptFilter('papyri')}
                className={`trust-manuscript-filter-btn ${manuscriptFilter === 'papyri' ? 'active-filter' : ''}`}
              >
                Papyri (7)
              </button>
              <button
                type="button"
                onClick={() => setManuscriptFilter('uncials')}
                className={`trust-manuscript-filter-btn ${manuscriptFilter === 'uncials' ? 'active-filter' : ''}`}
              >
                Uncial Codices (5)
              </button>
              <button
                type="button"
                onClick={() => setManuscriptFilter('dss')}
                className={`trust-manuscript-filter-btn ${manuscriptFilter === 'dss' ? 'active-filter' : ''}`}
              >
                Dead Sea Scrolls (OT) (2)
              </button>
            </div>

            <div className="trust-manuscript-search-wrap">
              <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search manuscripts, verses, quotes..."
                value={manuscriptSearch}
                onChange={e => setManuscriptSearch(e.target.value)}
                className="trust-manuscript-search-input"
                aria-label="Search manuscripts"
              />
            </div>
          </div>

          {/* 14 Manuscript Dossier Cards Grid */}
          <div className="trust-manuscripts-grid" role="list">
            {filteredManuscripts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#71717a', gridColumn: '1 / -1' }}>
                No manuscripts matched your filter or search query.
              </div>
            ) : (
              filteredManuscripts.map(item => {
                const itemIsNT = determineIsNT(item, isNT);
                const carouselManuscripts = item.manuscripts || [
                  {
                    ms_id: item.ms_id || item.id,
                    name: item.name,
                    image_name: item.folio_name || item.image_name,
                    date_range_english: item.dateStr,
                    earliest_date: item.dateInt,
                    interesting_info: item.keyFact
                  }
                ];

                return (
                  <article key={item.id} className="trust-manuscript-card" role="listitem">
                    {/* Header: Title, Source Type Badge, Date */}
                    <header className="trust-ms-header">
                      <div className="trust-ms-title-row">
                        <h3 className="trust-ms-name">{item.name}</h3>
                        <span className={`trust-ms-type-badge ${itemIsNT ? 'is-nt-badge' : 'is-ot-badge'}`}>
                          {itemIsNT ? 'NT SCRIPTURE' : 'OT SCRIPTURE'}
                        </span>
                      </div>
                      <div className="trust-ms-date-row">
                        <span>{item.dateStr || 'Unknown Date'}</span>
                        <span>•</span>
                        <span>{item.sourceType || (itemIsNT ? 'Greek Papyrus/Codex' : 'Hebrew Scroll')}</span>
                      </div>
                    </header>

                    {/* Card Body: Key Fact, Quote Box, Scholarly Explanation */}
                    <div className="trust-ms-body">
                      {item.keyFact && (
                        <div className="trust-ms-keyfact">
                          {renderFormattedText(item.keyFact)}
                        </div>
                      )}

                      {item.quote && (
                        <div className="trust-ms-quote">
                          <span className="trust-ms-quote-icon" aria-hidden="true">“</span>
                          {renderFormattedText(item.quote)}
                        </div>
                      )}

                      <p className="trust-ms-explanation">
                        {renderFormattedText(item.explanation)}
                      </p>
                    </div>

                    {/* Embedded Ready Apologia ManuscriptCarousel */}
                    <div className="trust-ms-carousel-wrap">
                      <div className="trust-ms-carousel-header">
                        <span>MANUSCRIPT SCAN ARCHIVE</span>
                        <span>{item.ms_id || item.id}</span>
                      </div>
                      <ManuscriptCarousel
                        manuscripts={carouselManuscripts}
                        verseId={item.verse_id || item.id}
                        verseLabel={item.verse_id ? item.verse_id.replace(/_/g, ' ').toUpperCase() : item.name}
                        isNT={itemIsNT}
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

    </div>
  );
}
