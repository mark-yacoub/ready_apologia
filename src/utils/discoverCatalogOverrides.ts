export interface DiscoverCatalogOverride {
  title: string;
  description: string;
}

/**
 * Runtime catalog overrides keeping `src/data/discoverCatalog.json` untouched while matching
 * the rewritten Discover article titles, formal third-person academic register, and verified counts.
 */
export const DISCOVER_CATALOG_OVERRIDES: Record<string, DiscoverCatalogOverride> = {
  'divinity-timeline': {
    title: 'Worship of Jesus Before Nicaea: Pre-AD 325 Evidence',
    description:
      'Chronological dossier of pre-Nicene mosaics, inscriptions, Roman and pagan records, first-century creedal hymns, and second- and third-century Greek papyri before AD 325.',
  },
  'extrabiblical-evidence-for-jesus': {
    title: '16 Non-Christian Literary Sources and 10 Archaeological Finds Relating to Jesus and the Early Christians',
    description:
      'Roman historians and governors, Flavius Josephus, Greek and Syrian philosophers, rabbinic texts, and excavated inscriptions examined in original text and translation.',
  },
  'trustworthiness-of-the-bible': {
    title: 'Textual Transmission and Historical Corroboration of the Bible',
    description:
      'A primary-source reference dossier examining 96 biblical manuscripts, Qumran scrolls, textual-variant classifications, Greco-Roman inscriptions, Palestinian name frequencies, and pre-Nicene patristic citations.',
  },
};
