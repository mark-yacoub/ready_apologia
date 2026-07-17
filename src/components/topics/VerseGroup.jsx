import React from 'react';
import { VerseItem } from '../common/VerseItem.jsx';
import { sortCanonicalVerses } from '../../utils/topicHelpers.js';

export const VerseGroup = ({ verses, verseBank, verseTexts, topicId, testamentName, verseCategories = null }) => {
  const sortedIds = sortCanonicalVerses(verses, testamentName);
  return (
    <div className="verse-group-list">
      {sortedIds.map(vId => (
        <VerseItem
          key={vId}
          vId={vId}
          text={verseTexts[vId] || 'Verse text unavailable'}
          note={verseBank[vId]}
          topicId={topicId}
          categoryTitle={verseCategories ? verseCategories[vId]?.join(', ') : null}
        />
      ))}
    </div>
  );
};
