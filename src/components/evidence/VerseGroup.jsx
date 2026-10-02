import React from 'react';
import { VerseItem } from '../common/VerseItem.jsx';

export const VerseGroup = ({ verses, verseBank, verseTexts, evidenceId, testamentName, verseCategories = null }) => {
  return (
    <div className="verse-group-list">
      {verses.map(vId => (
        <VerseItem
          key={vId}
          vId={vId}
          text={verseTexts[vId] || 'Verse text unavailable'}
          note={verseBank[vId]}
          evidenceId={evidenceId}
          categoryTitle={verseCategories ? verseCategories[vId]?.join(', ') : null}
        />
      ))}
    </div>
  );
};
