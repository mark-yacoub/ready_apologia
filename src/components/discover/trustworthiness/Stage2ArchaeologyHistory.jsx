import React, { useState, useMemo, useEffect } from 'react';
import '../../../styles/trust-stage2.css';
import defaultBibleData from '../../../data/trustworthiness-of-the-bible.json';

/**
 * Safely parses markdown inline formatting (**bold** and *italic*) into React elements.
 * Emphasizes bold phrases for quotes and key takeaways without needing external libraries.
 */
function renderInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return null;
  const regex = /(\*\*.*?\*\*|\*[^*]+\*)/g;
  const tokens = text.split(regex);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={index} className="md-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={index} className="md-italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

/**
 * Categorizes an artifact into a Museum Display category with appropriate tactile styling.
 */
function getArtifactCategory(evidence) {
  const id = (evidence.id || '').toLowerCase();
  const sourceType = (evidence.sourceType || '').toLowerCase();

  if (
    id.includes('bulla') ||
    id.includes('seal') ||
    sourceType.includes('seal') ||
    sourceType.includes('bulla')
  ) {
    return { label: 'Royal Seal / Bulla', className: 'badge-royal-seal', icon: '🔏' };
  }
  if (id.includes('coin') || sourceType.includes('coin')) {
    return { label: 'Ancient Coinage', className: 'badge-ancient-coinage', icon: '🪙' };
  }
  if (
    id.includes('pilate') ||
    id.includes('erastus') ||
    id.includes('gallio') ||
    sourceType.includes('roman') ||
    sourceType.includes('rescript')
  ) {
    return { label: 'Roman Inscription', className: 'badge-roman-inscription', icon: '🏛️' };
  }
  if (
    id.includes('prism') ||
    id.includes('cylinder') ||
    sourceType.includes('prism') ||
    sourceType.includes('cylinder')
  ) {
    return { label: 'Clay Prism / Cylinder', className: 'badge-clay-prism', icon: '📜' };
  }
  return { label: 'Stone Monument', className: 'badge-stone-monument', icon: '🗿' };
}

/**
 * Returns an authoritative historical credibility analysis for classical non-Christian authors.
 */
function getCredibilityNote(evidence) {
  const id = (evidence.id || '').toLowerCase();
  const name = (evidence.name || '').toLowerCase();

  if (id.includes('josephus') || name.includes('josephus')) {
    return "As a 1st-century Jewish Pharisee, military general, and Flavian court historian in Rome, Josephus wrote independently of early Christianity. His historical attestation of Jesus's crucifixion under Pontius Pilate, His miracles, and the martyrdom of James provides premier non-Christian Jewish corroboration.";
  }
  if (id.includes('tacitus') || name.includes('tacitus')) {
    return "Tacitus was a Roman senator, consul, and the premier Latin historian of the Roman Empire. Showing overt hostility toward Christianity ('a most mischievous superstition'), his record in Annals 15.44 of Christ's execution by Pontius Pilate under Emperor Tiberius is universally regarded by historians as unimpeachable hostile testimony.";
  }
  if (id.includes('pliny') || name.includes('pliny')) {
    return "Writing as Roman Governor of Bithynia-Pontus in an official administrative dispatch to Emperor Trajan (c. AD 112), Pliny provides our earliest Roman legal eyewitness report of Christian liturgy—confirming they worshipped Christ 'as to a god' and took solemn ethical oaths.";
  }
  if (id.includes('suetonius') || name.includes('suetonius')) {
    return "As imperial secretary and biographer under Emperor Hadrian, Suetonius had direct access to Roman imperial archives. His record of Claudius expelling Jews from Rome over 'Chrestus' (c. AD 49) directly corroborates the chronological setting of Acts 18:2.";
  }
  if (id.includes('lucian') || name.includes('lucian')) {
    return "A 2nd-century Assyrian-Greek satirist who mocked Christians as gullible, Lucian nevertheless confirmed that Christians worshipped a real 'crucified sage in Palestine' and lived in radical sacrificial brotherhood.";
  }
  if (id.includes('thallus') || name.includes('thallus')) {
    return "Writing around AD 52 (within twenty years of the crucifixion), Thallus attempted to explain away the three hours of midday darkness during Jesus's death as a solar eclipse. Because solar eclipses cannot occur during the Passover full moon, his naturalistic explanation inadvertently confirms the historical reality of the crucifixion darkness.";
  }
  if (id.includes('mara') || name.includes('mara')) {
    return "A Syriac Stoic philosopher writing from a Roman prison to his son, Mara bar Serapion independently compared the execution of Jesus ('the wise King of the Jews') to the unjust killings of Socrates and Pythagoras, noting that His teachings lived on.";
  }
  if (id.includes('celsus') || name.includes('celsus')) {
    return "As a 2nd-century Greek Platonist philosopher who authored the earliest comprehensive literary attack on Christianity, Celsus's attempts to debunk the Gospel accounts inadvertently prove that early Christians universally proclaimed the empty tomb, angels at the stone, and appearances first to Mary Magdalene.";
  }
  if (id.includes('talmud') || id.includes('sanhedrin') || name.includes('talmud')) {
    return "Ancient rabbinic Jewish traditions preserved in the Talmud never denied that Jesus performed supernatural signs; instead, they accused Him of 'sorcery' (corroborating the charge in Matthew 12:24) and confirmed His execution on Passover eve.";
  }
  return "This non-Christian classical source provides independent historical corroboration of New Testament events, rulers, and early Christian beliefs from outside the Christian community.";
}

/**
 * Categorizes whether an evidence belongs to Museum Artifact Placards (NT & OT Archaeology)
 * or Classical Secular Historian Dossiers.
 */
function getCategoryType(evidence) {
  if (evidence.categoryType) return evidence.categoryType;
  if (evidence.themeId === 'stage2-secular-historians') return 'historian';

  const id = (evidence.id || '').toLowerCase();
  const sourceType = (evidence.sourceType || '').toLowerCase();

  const isHistorianId = /josephus|tacitus|pliny|suetonius|lucian|thallus|mara|celsus|talmud|sanhedrin/i.test(
    id
  );
  const isHistorianSource = /historian|governor|biographer|satirist|philosopher|talmud|witness/i.test(
    sourceType
  );

  if (isHistorianId || isHistorianSource) {
    return 'historian';
  }
  return 'archaeology';
}

/**
 * Loads default Stage 2 evidences from trustworthiness-of-the-bible.json,
 * ensuring all NT Archaeology, OT Archaeology, and Classical Secular Historians
 * (including Thallus) are available as a fallback when no props are provided.
 */
function getDefaultStage2Evidences() {
  const stage2Ids = ['stage2-archaeology-nt', 'stage2-secular-historians', 'stage2-archaeology-ot'];
  const result = [];

  if (defaultBibleData && Array.isArray(defaultBibleData.themes)) {
    defaultBibleData.themes.forEach(theme => {
      if (stage2Ids.includes(theme.id) && Array.isArray(theme.evidences)) {
        theme.evidences.forEach(ev => {
          result.push({
            ...ev,
            themeId: theme.id,
            themeTitle: theme.title
          });
        });
      }
    });
  }

  // Guarantee Thallus is present in the classical historian dossiers list if not in the base json
  const hasThallus = result.some(item => (item.id || '').toLowerCase().includes('thallus'));
  if (!hasThallus) {
    result.push({
      id: 'thallus-histories',
      name: 'Thallus — Histories (3rd Book)',
      nameDesc:
        "Thallus was a secular 1st-century Mediterranean historian who wrote a three-volume history of the Eastern Mediterranean from the Trojan War down to about AD 52. While his works are lost, he is quoted by the Christian chronographer Julius Africanus (c. 221 AD), preserved in George Syncellus's Chronographia.",
      dateStr: 'c. AD 52',
      dateInt: 52,
      sourceType: 'Secular 1st-Century Historian',
      keyFact:
        '**1st-century secular confirmation of the midday darkness** during Jesus\'s crucifixion, which Thallus attempted to explain naturalistically as a solar eclipse',
      quote:
        'On the whole world there pressed a most **fearful darkness**; and the rocks were rent by an earthquake, and many places in Judea and other districts were thrown down. This darkness **Thallus**, in the third book of his History, **calls**, as appears to me without reason, **an eclipse of the sun**.',
      explanation:
        "Writing around AD 52—within 20 years of the crucifixion—Thallus attempted to explain away the three hours of darkness that covered the land (Matthew 27:45). Because a solar eclipse is astronomically impossible during Passover (a full moon), Thallus's naturalistic excuse inadvertently confirms that the midday darkness was an undisputed historical event in the 1st century.",
      urls: [
        {
          title: 'Wikipedia - Thallus (historian)',
          url: 'https://en.wikipedia.org/wiki/Thallus_(historian)'
        }
      ],
      tags: ['Thallus', 'Crucifixion Darkness', 'Solar Eclipse', 'Julius Africanus'],
      themeId: 'stage2-secular-historians'
    });
  }

  return result;
}

/**
 * Feature 1: Museum Artifact Placard Card Component
 * Styles archaeology items (Pilate Stone, Erastus Inscription, Tel Dan Stele, etc.)
 * as museum display placards with material category badges, date tags, exact inscriptions,
 * and highlighted key takeaways.
 */
function MuseumPlacardCard({ evidence }) {
  const badge = getArtifactCategory(evidence);
  const catalogId = (evidence.id || 'artifact').toUpperCase();

  return (
    <article className="museum-placard">
      <header className="placard-top-bar">
        <span className="placard-catalog-id">CATALOG // {catalogId}</span>
        <div className="placard-top-right">
          <span className={`placard-material-badge ${badge.className}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
          {evidence.dateStr && (
            <span className="placard-date-tag">{evidence.dateStr}</span>
          )}
        </div>
      </header>

      <div className="placard-body">
        <div>
          <h3 className="placard-title">{evidence.name}</h3>
          {evidence.nameDesc && (
            <p className="placard-desc">{renderInlineMarkdown(evidence.nameDesc)}</p>
          )}
        </div>

        {evidence.keyFact && (
          <div className="placard-keyfact-box">
            <span className="placard-keyfact-icon" aria-hidden="true">★</span>
            <p className="placard-keyfact-text">{renderInlineMarkdown(evidence.keyFact)}</p>
          </div>
        )}

        {evidence.quote && (
          <div className="placard-slab">
            <div className="placard-slab-header">
              <span className="placard-slab-label">EXCAVATED INSCRIPTION // TRANSLATION</span>
              <span className="placard-slab-badge">Primary Epigraph</span>
            </div>
            <blockquote className="placard-slab-quote">
              &ldquo;{renderInlineMarkdown(evidence.quote)}&rdquo;
            </blockquote>
          </div>
        )}

        {evidence.explanation && (
          <p className="placard-explanation">{renderInlineMarkdown(evidence.explanation)}</p>
        )}
      </div>

      {(evidence.urls || evidence.tags) && (
        <footer className="placard-footer">
          <div className="placard-urls">
            {evidence.urls &&
              Array.isArray(evidence.urls) &&
              evidence.urls.map((link, idx) => {
                const title =
                  typeof link === 'string'
                    ? 'Scholarly Source'
                    : link.title || link.url || 'Scholarly Source';
                const href = typeof link === 'string' ? link : link.url;
                if (!href) return null;
                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="placard-url-chip"
                  >
                    <span>🔗 {title}</span>
                    <span style={{ opacity: 0.65 }}>↗</span>
                  </a>
                );
              })}
          </div>

          {evidence.tags && Array.isArray(evidence.tags) && (
            <div className="item-tags-wrap">
              {evidence.tags.map((tag, idx) => (
                <span key={idx} className="item-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      )}
    </article>
  );
}

/**
 * Feature 2: Classical Roman Historian Dossier Component
 * Styles classical historians (Josephus, Tacitus, Pliny, Suetonius, Lucian, Thallus, etc.)
 * as classical attestation dossiers with an interactive "Author Biography & Credibility" drawer,
 * bolded primary quotes, historical explanations, and clickable primary scholarly URL chips.
 */
function HistorianDossierCard({ evidence, globalOpenSignal }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const credibilityNote = getCredibilityNote(evidence);

  useEffect(() => {
    if (globalOpenSignal !== undefined) {
      setIsDrawerOpen(globalOpenSignal);
    }
  }, [globalOpenSignal]);

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  return (
    <article className="historian-dossier">
      <header className="dossier-top-bar">
        <span className="dossier-class-badge">CLASSICAL ATTESTATION // NON-CHRISTIAN SOURCE</span>
        <div className="dossier-top-right">
          {evidence.sourceType && (
            <span className="dossier-source-type">{evidence.sourceType}</span>
          )}
          {evidence.dateStr && (
            <span className="dossier-date-badge">{evidence.dateStr}</span>
          )}
        </div>
      </header>

      <div className="dossier-body">
        <div className="dossier-title-row">
          <h3 className="dossier-title">{evidence.name}</h3>
        </div>

        {/* Interactive Author Biography & Credibility Drawer */}
        <div className="dossier-credibility-drawer">
          <button
            type="button"
            className={`dossier-drawer-toggle ${isDrawerOpen ? 'is-open' : ''}`}
            onClick={toggleDrawer}
            aria-expanded={isDrawerOpen}
          >
            <div className="drawer-toggle-left">
              <span>👤</span>
              <span>Author Biography &amp; Credibility</span>
            </div>
            <div className="drawer-toggle-right">
              <span className="drawer-credibility-pill">High Historical Value</span>
              <span className="drawer-chevron">{isDrawerOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          <div className={`dossier-drawer-content ${isDrawerOpen ? 'is-open' : ''}`}>
            {evidence.nameDesc && (
              <p className="dossier-bio-text">{renderInlineMarkdown(evidence.nameDesc)}</p>
            )}
            <div className="dossier-credibility-note">
              <strong>Historical Significance: </strong>
              <span>{credibilityNote}</span>
            </div>
          </div>
        </div>

        {/* Primary Quote Attesting to Jesus/Christians with Bold Highlights */}
        {evidence.quote && (
          <div className="dossier-quote-box">
            <span className="dossier-quote-label">PRIMARY SCHOLARLY ATTESTATION // QUOTE</span>
            <blockquote className="dossier-quote-text">
              &ldquo;{renderInlineMarkdown(evidence.quote)}&rdquo;
            </blockquote>
          </div>
        )}

        {evidence.keyFact && (
          <div className="dossier-keyfact-box">
            <span className="dossier-keyfact-icon" aria-hidden="true">◆</span>
            <p className="dossier-keyfact-text">{renderInlineMarkdown(evidence.keyFact)}</p>
          </div>
        )}

        {evidence.explanation && (
          <p className="dossier-explanation">{renderInlineMarkdown(evidence.explanation)}</p>
        )}
      </div>

      {(evidence.urls || evidence.tags) && (
        <footer className="dossier-footer">
          <div className="placard-urls">
            {evidence.urls &&
              Array.isArray(evidence.urls) &&
              evidence.urls.map((link, idx) => {
                const title =
                  typeof link === 'string'
                    ? 'Scholarly Source'
                    : link.title || link.url || 'Scholarly Source';
                const href = typeof link === 'string' ? link : link.url;
                if (!href) return null;
                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-url-chip"
                  >
                    <span>🔗 {title}</span>
                    <span style={{ opacity: 0.65 }}>↗</span>
                  </a>
                );
              })}
          </div>

          {evidence.tags && Array.isArray(evidence.tags) && (
            <div className="item-tags-wrap">
              {evidence.tags.map((tag, idx) => (
                <span key={idx} className="item-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      )}
    </article>
  );
}

/**
 * Main Stage 2 Historical & Archaeological Corroboration Component
 * Presents NT/OT Archaeology (Museum Artifact Placards) and Classical Secular Historians
 * (Historian Dossiers) with interactive tabs, search filtering, and drawer controls.
 */
export default function Stage2ArchaeologyHistory({ evidences }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalOpenSignal, setGlobalOpenSignal] = useState(undefined);

  const rawEvidences = useMemo(() => {
    if (evidences && Array.isArray(evidences) && evidences.length > 0) {
      return evidences;
    }
    return getDefaultStage2Evidences();
  }, [evidences]);

  const categorizedData = useMemo(() => {
    const archaeology = [];
    const historians = [];

    rawEvidences.forEach(item => {
      const cat = getCategoryType(item);
      if (cat === 'historian') {
        historians.push(item);
      } else {
        archaeology.push(item);
      }
    });

    return { archaeology, historians };
  }, [rawEvidences]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return categorizedData;
    }

    const matchesQuery = item => {
      const text = [
        item.name || '',
        item.nameDesc || '',
        item.keyFact || '',
        item.quote || '',
        item.explanation || '',
        item.sourceType || '',
        item.id || '',
        ...(Array.isArray(item.tags) ? item.tags : [])
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(query);
    };

    return {
      archaeology: categorizedData.archaeology.filter(matchesQuery),
      historians: categorizedData.historians.filter(matchesQuery)
    };
  }, [categorizedData, searchQuery]);

  const totalFilteredCount =
    filteredData.archaeology.length + filteredData.historians.length;

  const toggleAllDrawers = () => {
    setGlobalOpenSignal(prev => (prev === true ? false : true));
  };

  return (
    <section className="trust-stage2-container">
      {/* Hero Header Banner */}
      <header className="trust-stage2-header">
        <span className="trust-stage2-subtitle">
          STAGE 2 • HISTORICAL &amp; ARCHAEOLOGICAL CORROBORATION
        </span>
        <h2 className="trust-stage2-title">
          The Tangible Record: Stones, Seals, and Secular Historians
        </h2>
        <p className="trust-stage2-desc">
          Extra-biblical archaeology and classical Greco-Roman historians independently corroborate
          the New and Old Testaments. Excavated monuments, imperial inscriptions, royal bullae, and
          hostile classical chronicles affirm the exact names, titles, rulers, and early Christian
          worship recorded in Scripture.
        </p>
      </header>

      {/* Navigation Tabs & Search Bar */}
      <div className="trust-stage2-controls">
        <div className="trust-stage2-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`trust-stage2-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>✨ All Evidences</span>
            <span className="trust-stage2-tab-badge">
              {categorizedData.archaeology.length + categorizedData.historians.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'archaeology'}
            className={`trust-stage2-tab-btn ${activeTab === 'archaeology' ? 'active' : ''}`}
            onClick={() => setActiveTab('archaeology')}
          >
            <span>🏛️ Museum Artifact Placards</span>
            <span className="trust-stage2-tab-badge">
              {categorizedData.archaeology.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'historians'}
            className={`trust-stage2-tab-btn ${activeTab === 'historians' ? 'active' : ''}`}
            onClick={() => setActiveTab('historians')}
          >
            <span>📜 Classical Historian Dossiers</span>
            <span className="trust-stage2-tab-badge">
              {categorizedData.historians.length}
            </span>
          </button>
        </div>

        <div className="trust-stage2-actions">
          {(activeTab === 'all' || activeTab === 'historians') && (
            <button
              type="button"
              className="trust-stage2-toggle-all-btn"
              onClick={toggleAllDrawers}
              title="Toggle Author Biography & Credibility Drawers"
            >
              <span>👤 {globalOpenSignal ? 'Collapse All Biographies' : 'Expand All Biographies'}</span>
            </button>
          )}

          <div className="trust-stage2-search-wrapper">
            <span className="trust-stage2-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artifacts or historians..."
              className="trust-stage2-search-input"
              aria-label="Search artifacts or historians"
            />
            {searchQuery && (
              <button
                type="button"
                className="trust-stage2-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty Search State */}
      {totalFilteredCount === 0 && (
        <div className="trust-stage2-empty-state">
          <h3 className="trust-stage2-empty-title">No matching records found</h3>
          <p className="trust-stage2-empty-desc">
            We could not find any artifacts or historian dossiers matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            className="trust-stage2-reset-btn"
            onClick={() => setSearchQuery('')}
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Feature 1: Museum Artifact Placards Section */}
      {(activeTab === 'all' || activeTab === 'archaeology') &&
        filteredData.archaeology.length > 0 && (
          <section className="trust-stage2-section" aria-labelledby="archaeology-heading">
            <header className="trust-stage2-section-header">
              <div className="trust-stage2-section-title-wrap">
                <span className="trust-stage2-section-icon" aria-hidden="true">🏛️</span>
                <h3 id="archaeology-heading" className="trust-stage2-section-title">
                  Museum Artifact Placards: NT &amp; OT Archaeology
                </h3>
              </div>
              <span className="trust-stage2-section-count">
                {filteredData.archaeology.length} Artifacts
              </span>
            </header>

            <div className="trust-stage2-grid">
              {filteredData.archaeology.map((item, idx) => (
                <MuseumPlacardCard key={item.id || idx} evidence={item} />
              ))}
            </div>
          </section>
        )}

      {/* Feature 2: Classical Roman Historian Dossiers Section */}
      {(activeTab === 'all' || activeTab === 'historians') &&
        filteredData.historians.length > 0 && (
          <section className="trust-stage2-section" aria-labelledby="historians-heading">
            <header className="trust-stage2-section-header">
              <div className="trust-stage2-section-title-wrap">
                <span className="trust-stage2-section-icon" aria-hidden="true">📜</span>
                <h3 id="historians-heading" className="trust-stage2-section-title">
                  Classical Roman &amp; Secular Historians: Historical Dossiers
                </h3>
              </div>
              <span className="trust-stage2-section-count">
                {filteredData.historians.length} Classical Sources
              </span>
            </header>

            <div className="trust-stage2-grid">
              {filteredData.historians.map((item, idx) => (
                <HistorianDossierCard
                  key={item.id || idx}
                  evidence={item}
                  globalOpenSignal={globalOpenSignal}
                />
              ))}
            </div>
          </section>
        )}
    </section>
  );
}
