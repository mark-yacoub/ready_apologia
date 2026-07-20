/**
 * Utility functions for manuscript data processing.
 */

/**
 * Iterates through raw manuscript data and appends "(Scan N)" to the names
 * of manuscripts that appear multiple times for a single verse.
 *
 * @param {Array} rawManuscripts - The raw SQL result of manuscripts for a verse.
 * @returns {Array} Processed manuscripts with uniquely serialized display names.
 */
export function assignManuscriptScanNames(rawManuscripts) {
  if (!rawManuscripts || !Array.isArray(rawManuscripts)) return [];

  const msCounts = {};
  rawManuscripts.forEach(ms => {
    if (ms.ms_id) {
      msCounts[ms.ms_id] = (msCounts[ms.ms_id] || 0) + 1;
    }
  });

  const msTracker = {};
  return rawManuscripts.map(ms => {
    const total = msCounts[ms.ms_id] || 0;
    let displayName = ms.name || ms.ms_id;

    if (total > 1) {
      msTracker[ms.ms_id] = (msTracker[ms.ms_id] || 0) + 1;
      displayName = `${ms.name || ms.ms_id} (Scan ${msTracker[ms.ms_id]})`;
    }

    return {
      ...ms,
      name: displayName
    };
  });
}
