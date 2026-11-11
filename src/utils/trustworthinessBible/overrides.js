/**
 * Unified scholarly overrides, added primary witnesses, and verified comparative tables for
 * /discover/trustworthiness-of-the-bible.
 *
 * src/data/trustworthiness-of-the-bible.json is strictly read-only in this worktree; model.js
 * validates that all 12 locked theme IDs and all 92 locked item IDs in the JSON match these
 * scholarly records (plus the 4 added primary items: ketef-hinnom-silver-scrolls,
 * bracketed-comma-johanneum, josephus-antiquities, and thallus-histories = 96 total cataloged items).
 */

import { MANUSCRIPT_GROUPS, MANUSCRIPT_ITEMS, VARIANT_ITEMS, CLASSICAL_ROWS } from './stage1Data.js';
import { ARCHAEOLOGY_NT_ITEMS, ARCHAEOLOGY_OT_ITEMS, HISTORIANS_ITEMS } from './stage2Data.js';
import {
  EMBARRASSMENT_ITEMS,
  UNDESIGNED_ITEMS,
  ONOMASTICS_TABLES,
  ONOMASTICS_ITEMS,
  CANON_ITEMS,
  PATRISTIC_TABLE,
  PATRISTIC_ITEMS,
  SYNTHESIS_ITEMS,
} from './stage34Data.js';

export {
  MANUSCRIPT_GROUPS,
  MANUSCRIPT_ITEMS,
  VARIANT_ITEMS,
  CLASSICAL_ROWS,
  ARCHAEOLOGY_NT_ITEMS,
  ARCHAEOLOGY_OT_ITEMS,
  HISTORIANS_ITEMS,
  EMBARRASSMENT_ITEMS,
  UNDESIGNED_ITEMS,
  ONOMASTICS_TABLES,
  ONOMASTICS_ITEMS,
  CANON_ITEMS,
  PATRISTIC_TABLE,
  PATRISTIC_ITEMS,
  SYNTHESIS_ITEMS,
};

/** The 4 primary items added beyond the 92 items in src/data/trustworthiness-of-the-bible.json. */
export const ADDED_ITEM_IDS = new Set([
  'ketef-hinnom-silver-scrolls',
  'bracketed-comma-johanneum',
  'josephus-antiquities',
  'thallus-histories',
]);
