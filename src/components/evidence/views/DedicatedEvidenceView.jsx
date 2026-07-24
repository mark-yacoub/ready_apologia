import React, { useState } from 'react';
import ScrollableTrack from '../../ScrollableTrack.jsx';
import { SourceBlock } from '../SourceBlock.jsx';
import { VerseGroup } from '../VerseGroup.jsx';
import {
  getTestamentCount,
  getAnfCount,
  getCenturyCount,
  getAncientJudaismCount
} from '../../../utils/evidenceCounters.js';

export const DedicatedEvidenceView = ({ evidenceObj, verseTexts }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash;
      if (h === '#ot') return 'Old Testament';
      if (h === '#early-church' || h === '#pre-nicene-writings' || h === '#fathers') return 'Fathers';
      if (h === '#ancient-judaism' || h === '#judaism') return 'Ancient Judaism';
    }
    return 'New Testament';
  });
  const [activeFilter, setActiveFilter] = useState('All');

  const ntCount = getTestamentCount(evidenceObj.Scripture?.['New Testament']);
  const otCount = getTestamentCount(evidenceObj.Scripture?.['Old Testament']);
  const anfCount = getAnfCount(evidenceObj['Ante-Nicene Fathers']);
  const ajCount = getAncientJudaismCount(evidenceObj['Ancient Judaism']);

  const handleTabChange = (tab, hash) => {
    setActiveTab(tab);
    setActiveFilter('All');
    if (typeof window !== 'undefined' && hash) {
      window.history.replaceState(null, '', `#${hash}`);
    }
  };

  const renderScriptureFeed = (testament) => {
    const tData = evidenceObj.Scripture?.[testament];
    if (!tData || !tData.structure) return <div className="empty-state">No {testament} data available.</div>;

    const categories = tData.structure;
    const verseBank = tData.verse_bank || {};
    const totalTestamentCount = testament === 'New Testament' ? ntCount : otCount;

    const availableFilters = [
      { id: 'All', label: `All (${totalTestamentCount})` },
      ...categories.map((c, idx) => {
        const title = c?.title || (categories.length === 1 ? 'General Evidence' : `Category ${idx + 1}`);
        return { id: title, label: `${title} (${c?.verses?.length || 0})` };
      })
    ];

    const feedContent = categories
      .map((cat, idx) => ({ cat, title: cat?.title || (categories.length === 1 ? 'General Evidence' : `Category ${idx + 1}`) }))
      .filter(item => activeFilter === 'All' || activeFilter === item.title)
      .map(({ cat, title }) => (
        <div key={title} className="feed-category-block animate-fade-in">
          <h2 className="feed-category-title">{title} <span className="item-count">({cat?.verses?.length || 0})</span></h2>
          <VerseGroup verses={cat?.verses || []} verseBank={verseBank} verseTexts={verseTexts} evidenceId={evidenceObj._id} testamentName={testament} />
        </div>
      ));

    return (
      <div className="scripture-feed-container">
        <div className="feed-controls-bar">
          <div className="pills-scroll-container">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  const renderFathersFeed = () => {
    const anfData = evidenceObj['Ante-Nicene Fathers'];
    if (!anfData) return <div className="empty-state">No Patristic data available.</div>;
    const centuries = Object.keys(anfData);

    const availableFilters = [
      { id: 'All', label: `All (${anfCount})` },
      ...centuries.map(c => ({ id: c, label: `${c} (${getCenturyCount(anfData[c])})` }))
    ];

    const feedContent = centuries
      .filter(c => activeFilter === 'All' || activeFilter === c)
      .map(century => {
        const fathers = anfData[century];
        const centCount = getCenturyCount(fathers);
        return (
          <div key={century} className="feed-category-block animate-fade-in">
            <h2 className="feed-category-title">{century} <span className="item-count">({centCount})</span></h2>
            <div className="fathers-grid">
              {Object.keys(fathers || {}).map(fatherName => {
                const fData = fathers[fatherName];
                return (
                  <SourceBlock key={fatherName} sourceName={fatherName} sData={fData} />
                );
              })}
            </div>
          </div>
        );
      });

    return (
      <div className="scripture-feed-container">
        <div className="feed-controls-bar">
          <div className="pills-scroll-container">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  const renderAncientJudaismFeed = () => {
    const ajData = evidenceObj['Ancient Judaism'];
    if (!ajData) return <div className="empty-state">No Ancient Judaism data available.</div>;
    const eras = Object.keys(ajData);

    const availableFilters = [
      { id: 'All', label: `All (${ajCount})` },
      ...eras.map(e => ({ id: e, label: `${e} (${getCenturyCount(ajData[e])})` }))
    ];

    const feedContent = eras
      .filter(e => activeFilter === 'All' || activeFilter === e)
      .map(era => {
        const authors = ajData[era];
        const eraCount = getCenturyCount(authors);
        return (
          <div key={era} className="feed-category-block animate-fade-in">
            <h2 className="feed-category-title">{era} <span className="item-count">({eraCount})</span></h2>
            <div className="fathers-grid">
              {Object.keys(authors || {}).map(authorName => {
                const aData = authors[authorName];
                return (
                  <SourceBlock key={authorName} sourceName={authorName} sData={aData} />
                );
              })}
            </div>
          </div>
        );
      });

    return (
      <div className="scripture-feed-container">
        <div className="feed-controls-bar">
          <div className="pills-scroll-container">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="feed-content-area">
          {feedContent}
        </div>
      </div>
    );
  };

  return (
    <div className="dedicated-evidence-view">
      <ScrollableTrack containerClass="master-tabs-container" activeTrigger={activeTab}>
        <button id="nt" className={`master-tab ${activeTab === 'New Testament' ? 'active' : ''}`} onClick={() => handleTabChange('New Testament', 'nt')}>
          New Testament <span className="tab-count">({ntCount})</span>
        </button>
        <button id="ot" className={`master-tab ${activeTab === 'Old Testament' ? 'active' : ''}`} onClick={() => handleTabChange('Old Testament', 'ot')}>
          Old Testament <span className="tab-count">({otCount})</span>
        </button>
        <button id="early-church" className={`master-tab ${activeTab === 'Fathers' ? 'active' : ''}`} onClick={() => handleTabChange('Fathers', 'early-church')}>
          Pre-Nicene Writings <span className="tab-count">({anfCount})</span>
        </button>
        {ajCount > 0 && (
          <button id="ancient-judaism" className={`master-tab ${activeTab === 'Ancient Judaism' ? 'active' : ''}`} onClick={() => handleTabChange('Ancient Judaism', 'ancient-judaism')}>
            Ancient Judaism <span className="tab-count">({ajCount})</span>
          </button>
        )}
      </ScrollableTrack>
      <div className="master-tab-content">
        {activeTab === 'New Testament' && renderScriptureFeed('New Testament')}
        {activeTab === 'Old Testament' && renderScriptureFeed('Old Testament')}
        {activeTab === 'Fathers' && renderFathersFeed()}
        {activeTab === 'Ancient Judaism' && renderAncientJudaismFeed()}
      </div>
    </div>
  );
};
