// Pure, deterministic build-time view-model builder and validator for
// `/discover/divinity-timeline`.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  ALL_LEGACY_EVENT_IDS,
  ARTICLE_PATH,
  BASE,
  CANONICAL_URL,
  DATE_MODIFIED,
  DATE_PUBLISHED,
  DATING_BASIS_LABELS,
  EVIDENCE_TIER_LABELS,
  EXCLUDED_LEGACY_IDS,
  EXPECTED_DATA_SHA256,
  GROUPED_SUB_ANCHOR_IDS,
  MAX_RENDERED_IMAGE_BYTES,
  METHODOLOGY_SECTION_ID,
  NUMBERED_SECTION_IDS,
  OG_IMAGE,
  PRIMARY_CARD_IDS,
  SECTION_ORDER,
  sitePath,
  validateHref,
} from './config.js';
import {
  GLANCE_ROWS,
  METHODOLOGY_SECTION,
  PAGE_FRAMING,
  PAGE_META,
  SECTIONS,
  SOURCES_GROUPS,
  TIMELINE_SHOWCASE,
} from './content.js';
import {
  renderFormattedEpigraphicHtml,
  renderInlineMarkdown,
  renderPlainEpigraphicHtml,
} from './markdown.js';
import { DATASET_OVERRIDES } from './overrides.js';
import { scanTone } from './tone.js';

export function readJpegDimensions(buf) {
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    return null;
  }
  let i = 2;
  while (i + 8 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const segLen = buf.readUInt16BE(i + 2);
    if (segLen < 2) {
      return null;
    }
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      };
    }
    i += 2 + segLen;
  }
  return null;
}

function assertNoToneIssues(text, context, opts = {}) {
  const issues = scanTone(text, { context, ...opts });
  if (issues.length > 0) {
    throw new Error(`Academic register violation:\n  ${issues.join('\n  ')}`);
  }
}

function assertValidHref(href, context) {
  const res = validateHref(href);
  if (!res.ok) {
    throw new Error(`[${context}] invalid href (${res.reason})`);
  }
  return res;
}

export function assertExternalSourceHref(href, context) {
  const res = assertValidHref(href, context);
  if (res.kind !== 'external') {
    throw new Error(
      `[${context}] SOURCES_GROUPS requires an external https:// URL, got ${res.kind}: ${href}`,
    );
  }
  return res;
}

function renderNumberedAssessmentItems(markdown, context, anchors = null) {
  const lines = String(markdown)
    .trim()
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, idx) => {
    const stripped = line.replace(/^\d+\.\s+/, '');
    assertNoToneIssues(stripped, `${context}.item[${idx}]`);
    return renderInlineMarkdown(stripped, `${context}.item[${idx}]`, anchors);
  });
}

function verifyImageAsset(repoRoot, image, context, { requireCaption = true } = {}) {
  if (!image) return null;
  if (!image.src || !image.src.startsWith('/media/divinity_timeline/')) {
    throw new Error(`[${context}] unexpected image path: ${image.src}`);
  }
  const diskPath = path.join(repoRoot, 'public', image.src);
  if (!fs.existsSync(diskPath)) {
    throw new Error(`[${context}] missing image asset on disk: ${diskPath}`);
  }
  const stat = fs.statSync(diskPath);
  if (stat.size <= 0 || stat.size > MAX_RENDERED_IMAGE_BYTES) {
    throw new Error(
      `[${context}] image ${image.src} size ${stat.size} bytes exceeds mobile cap (${MAX_RENDERED_IMAGE_BYTES} bytes)`,
    );
  }
  if (!image.alt || image.alt.trim().length < 15) {
    throw new Error(`[${context}] image alt text is missing or too terse`);
  }
  assertNoToneIssues(image.alt, `${context}.image.alt`);
  let caption = '';
  let captionHtml = '';
  if (requireCaption) {
    if (!image.caption || image.caption.trim().length < 20) {
      throw new Error(`[${context}] image caption is missing or too terse`);
    }
    assertNoToneIssues(image.caption, `${context}.image.caption`);
    caption = image.caption.trim();
    captionHtml = renderFormattedEpigraphicHtml(caption);
  }
  const dims = readJpegDimensions(fs.readFileSync(diskPath));
  if (!dims || !dims.width || !dims.height) {
    throw new Error(`[${context}] unable to determine intrinsic dimensions for ${image.src}`);
  }
  return Object.freeze({
    src: sitePath(image.src),
    alt: image.alt.trim(),
    caption,
    captionHtml,
    width: dims.width,
    height: dims.height,
    bytes: stat.size,
  });
}

export function loadVerifiedRawDataset(repoRoot = process.cwd()) {
  const dataPath = path.join(repoRoot, 'src/data/divinityTimeline.json');
  const rawBytes = fs.readFileSync(dataPath);
  const sha256 = crypto.createHash('sha256').update(rawBytes).digest('hex');
  if (sha256 !== EXPECTED_DATA_SHA256) {
    throw new Error(
      `src/data/divinityTimeline.json SHA-256 mismatch: expected ${EXPECTED_DATA_SHA256}, got ${sha256}`,
    );
  }
  const parsed = JSON.parse(rawBytes.toString('utf8'));
  if (!Array.isArray(parsed) || parsed.length !== ALL_LEGACY_EVENT_IDS.length) {
    throw new Error(
      `Expected ${ALL_LEGACY_EVENT_IDS.length} entries in divinityTimeline.json, got ${parsed?.length}`,
    );
  }
  const rawIds = parsed.map((item) => item.id);
  const rawSet = new Set(rawIds);
  const configSet = new Set(ALL_LEGACY_EVENT_IDS);
  const overrideIds = Object.keys(DATASET_OVERRIDES);
  const overrideSet = new Set(overrideIds);

  if (
    rawSet.size !== ALL_LEGACY_EVENT_IDS.length ||
    configSet.size !== ALL_LEGACY_EVENT_IDS.length ||
    overrideSet.size !== ALL_LEGACY_EVENT_IDS.length
  ) {
    throw new Error('Duplicate IDs detected across dataset, config, or overrides');
  }
  for (const id of rawIds) {
    if (!configSet.has(id) || !overrideSet.has(id)) {
      throw new Error(`Dataset ID '${id}' missing from config or overrides`);
    }
  }
  return { sha256, items: parsed };
}

export function buildDivinityTimelinePage(repoRoot = process.cwd()) {
  const { sha256 } = loadVerifiedRawDataset(repoRoot);

  // Verify H1 count parity (Playbook §2.6): "Five Lines" / "5 Lines" === 5 Glance rows === 5 numbered sections.
  const WORD_COUNTS = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  const h1CountMatch = PAGE_META.h1.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+Lines\b/i,
  );
  const declaredCount = h1CountMatch
    ? Number.isNaN(Number(h1CountMatch[1]))
      ? WORD_COUNTS[h1CountMatch[1].toLowerCase()]
      : Number(h1CountMatch[1])
    : null;
  if (
    declaredCount !== NUMBERED_SECTION_IDS.length ||
    GLANCE_ROWS.length !== NUMBERED_SECTION_IDS.length ||
    SECTIONS.length !== NUMBERED_SECTION_IDS.length
  ) {
    throw new Error(
      `Count mismatch: H1=${declaredCount}, Glance=${GLANCE_ROWS.length}, Sections=${SECTIONS.length}`,
    );
  }

  const referencedAnchors = new Set();
  const mdInline = (s, ctx) => renderInlineMarkdown(s, ctx, referencedAnchors);

  // Tone-check page header & intro (2–3 crisp sentences, Rule 2).
  assertNoToneIssues(PAGE_META.title, 'page.title', { isHeadline: true });
  assertNoToneIssues(PAGE_META.metaTitle, 'page.metaTitle', { isHeadline: true });
  assertNoToneIssues(PAGE_META.description, 'page.description');
  assertNoToneIssues(PAGE_META.eyebrow, 'page.eyebrow', { isHeadline: true });
  assertNoToneIssues(PAGE_META.h1, 'page.h1', { isHeadline: true });
  if (PAGE_META.intro.length < 2 || PAGE_META.intro.length > 3) {
    throw new Error(
      `Intro must be 2–3 sentences (Rule 2); got ${PAGE_META.intro.length}`,
    );
  }
  const introParagraphs = PAGE_META.intro.map((s, idx) => {
    assertNoToneIssues(s, `page.intro[${idx}]`);
    return mdInline(s, `page.intro[${idx}]`);
  });

  // Hero-adjacent historical framing & 3-tier key (`X5` + `X1`).
  assertNoToneIssues(PAGE_FRAMING.eyebrow, 'framing.eyebrow', { isHeadline: true });
  assertNoToneIssues(PAGE_FRAMING.heading, 'framing.heading', { isHeadline: true });
  assertNoToneIssues(PAGE_FRAMING.hypothesesMarkdown, 'framing.hypotheses');
  assertNoToneIssues(PAGE_FRAMING.tiersHeading, 'framing.tiersHeading', {
    isHeadline: true,
  });
  const framingTiers = PAGE_FRAMING.tiers.map((t, idx) => {
    const tierLabel = EVIDENCE_TIER_LABELS[t.tier];
    if (!tierLabel) {
      throw new Error(`framing.tiers[${idx}] unknown tier '${t.tier}'`);
    }
    assertNoToneIssues(t.bodyMarkdown, `framing.tiers[${idx}].body`);
    return Object.freeze({
      tier: t.tier,
      badge: tierLabel,
      bodyHtml: mdInline(t.bodyMarkdown, `framing.tiers[${idx}].body`),
    });
  });
  const framing = Object.freeze({
    eyebrow: PAGE_FRAMING.eyebrow,
    heading: PAGE_FRAMING.heading,
    hypothesesHtml: mdInline(
      PAGE_FRAMING.hypothesesMarkdown,
      'framing.hypotheses',
    ),
    tiersHeading: PAGE_FRAMING.tiersHeading,
    tiers: Object.freeze(framingTiers),
  });

  // Verify OG image exists on disk.
  const ogRel = BASE && OG_IMAGE.startsWith(`${BASE}/`) ? OG_IMAGE.slice(BASE.length) : OG_IMAGE;
  const ogDiskPath = path.join(repoRoot, 'public', ogRel);
  if (!fs.existsSync(ogDiskPath)) {
    throw new Error(`Missing OG image on disk: ${ogDiskPath}`);
  }

  // Timeline showcase validation.
  assertNoToneIssues(TIMELINE_SHOWCASE.caption, 'timeline.caption');
  const timelineEvents = TIMELINE_SHOWCASE.events.map((ev, idx) => {
    assertNoToneIssues(ev.date, `timeline.events[${idx}].date`);
    assertNoToneIssues(ev.label, `timeline.events[${idx}].label`, {
      isHeadline: true,
    });
    assertNoToneIssues(ev.detail, `timeline.events[${idx}].detail`);
    const evHrefRes = assertValidHref(ev.href, `timeline.events[${idx}].href`);
    if (evHrefRes.kind === 'anchor') {
      referencedAnchors.add(ev.href.slice(1));
    }
    return Object.freeze({
      ...ev,
      detailHtml: renderFormattedEpigraphicHtml(ev.detail),
    });
  });

  // Glance rows validation.
  const glanceRows = GLANCE_ROWS.map((row, idx) => {
    if (row.id !== NUMBERED_SECTION_IDS[idx]) {
      throw new Error(
        `Glance row ${idx} id '${row.id}' does not match section '${NUMBERED_SECTION_IDS[idx]}'`,
      );
    }
    assertNoToneIssues(row.title, `glance[${idx}].title`, { isHeadline: true });
    assertNoToneIssues(row.summary, `glance[${idx}].summary`);
    return Object.freeze({
      ...row,
      titleHtml: renderFormattedEpigraphicHtml(row.title),
      summaryHtml: renderFormattedEpigraphicHtml(row.summary),
      href: `#${row.id}`,
    });
  });

  // Pre-index grouped dataset overrides by parentCardId.
  const groupedByParent = new Map();
  for (const groupedId of GROUPED_SUB_ANCHOR_IDS) {
    const ov = DATASET_OVERRIDES[groupedId];
    if (!ov || ov.disposition !== 'grouped' || !ov.parentCardId) {
      throw new Error(`Invalid grouped override for '${groupedId}'`);
    }
    if (!groupedByParent.has(ov.parentCardId)) {
      groupedByParent.set(ov.parentCardId, []);
    }
    groupedByParent.get(ov.parentCardId).push({ id: groupedId, ...ov });
  }

  const emittedEventAnchors = [];
  const contextualCardAnchors = [];
  const primarySeen = new Set();

  const sections = SECTIONS.map((sec, sIdx) => {
    if (sec.id !== NUMBERED_SECTION_IDS[sIdx]) {
      throw new Error(
        `Section ${sIdx} id '${sec.id}' does not match NUMBERED_SECTION_IDS`,
      );
    }
    assertNoToneIssues(sec.eyebrow, `section[${sec.id}].eyebrow`, {
      isHeadline: true,
    });
    assertNoToneIssues(sec.title, `section[${sec.id}].title`, {
      isHeadline: true,
    });
    assertNoToneIssues(sec.leadMarkdown, `section[${sec.id}].lead`);

    const cards = sec.cardOrder.map((ref) => {
      let rawCard;
      let anchorId;
      let isDataset = false;

      if (ref.kind === 'dataset') {
        isDataset = true;
        const ov = DATASET_OVERRIDES[ref.id];
        if (!ov || ov.disposition !== 'primary') {
          throw new Error(
            `Section '${sec.id}' references non-primary dataset id '${ref.id}'`,
          );
        }
        if (ov.sectionId !== sec.id) {
          throw new Error(
            `Card '${ref.id}' sectionId '${ov.sectionId}' !== '${sec.id}'`,
          );
        }
        primarySeen.add(ref.id);
        anchorId = `event-${ref.id}`;
        emittedEventAnchors.push(anchorId);
        rawCard = { id: ref.id, ...ov };
      } else if (ref.kind === 'contextual') {
        const ctxCard = sec.contextualCards?.[ref.id];
        if (!ctxCard) {
          throw new Error(
            `Missing contextual card '${ref.id}' in section '${sec.id}'`,
          );
        }
        anchorId = ctxCard.id;
        contextualCardAnchors.push(anchorId);
        rawCard = ctxCard;
      } else {
        throw new Error(`Unknown card kind '${ref.kind}'`);
      }

      const datingBasisLabel = DATING_BASIS_LABELS[rawCard.datingBasis];
      if (!datingBasisLabel) {
        throw new Error(
          `[${anchorId}] unknown datingBasis '${rawCard.datingBasis}'`,
        );
      }
      const evidenceTierLabel = EVIDENCE_TIER_LABELS[rawCard.evidenceTier];
      if (!evidenceTierLabel) {
        throw new Error(
          `[${anchorId}] missing or unknown evidenceTier '${rawCard.evidenceTier}'`,
        );
      }
      if (!rawCard.showsMarkdown || rawCard.showsMarkdown.trim().length < 30) {
        throw new Error(`[${anchorId}] missing or too terse showsMarkdown`);
      }

      assertNoToneIssues(rawCard.title, `${anchorId}.title`, {
        isHeadline: true,
      });
      assertNoToneIssues(rawCard.displayYear, `${anchorId}.displayYear`);
      assertNoToneIssues(rawCard.location, `${anchorId}.location`);
      assertNoToneIssues(rawCard.repository, `${anchorId}.repository`);
      assertNoToneIssues(rawCard.language, `${anchorId}.language`);
      assertNoToneIssues(rawCard.quoteTranslation, `${anchorId}.quoteTranslation`, {
        isVerbatimAncientQuote: true,
      });
      assertNoToneIssues(rawCard.showsMarkdown, `${anchorId}.shows`);
      assertNoToneIssues(rawCard.editionCitation, `${anchorId}.editionCitation`);
      assertNoToneIssues(rawCard.analysisMarkdown, `${anchorId}.analysis`);

      const verifiedImage = verifyImageAsset(
        repoRoot,
        rawCard.image,
        anchorId,
        { requireCaption: true },
      );
      const verifiedSecondaryImage = verifyImageAsset(
        repoRoot,
        rawCard.secondaryImage,
        `${anchorId}.secondary`,
        { requireCaption: false },
      );

      const verifyLinks = (rawCard.verifyLinks || []).map((lnk, lIdx) => {
        assertNoToneIssues(lnk.label, `${anchorId}.verifyLinks[${lIdx}]`);
        const check = assertValidHref(
          lnk.href,
          `${anchorId}.verifyLinks[${lIdx}]`,
        );
        if (check.kind === 'anchor') {
          referencedAnchors.add(lnk.href.slice(1));
        }
        return Object.freeze({
          label: lnk.label,
          href: check.kind.startsWith('internal-') ? sitePath(lnk.href) : lnk.href,
          external: check.kind === 'external',
          noPrefetch:
            check.kind === 'internal-bible' || check.kind === 'internal-quran',
        });
      });

      const groupedRaw = isDataset ? groupedByParent.get(ref.id) || [] : [];
      const groupedWitnesses = groupedRaw.map((g) => {
        const gAnchor = `event-${g.id}`;
        emittedEventAnchors.push(gAnchor);
        const gBasisLabel = DATING_BASIS_LABELS[g.datingBasis];
        if (!gBasisLabel) {
          throw new Error(`[${gAnchor}] unknown datingBasis '${g.datingBasis}'`);
        }
        assertNoToneIssues(g.title, `${gAnchor}.title`, { isHeadline: true });
        assertNoToneIssues(g.displayYear, `${gAnchor}.displayYear`);
        assertNoToneIssues(g.summaryMarkdown, `${gAnchor}.summary`);
        return Object.freeze({
          id: g.id,
          anchorId: gAnchor,
          title: g.title,
          displayYear: g.displayYear,
          datingBasisLabel: gBasisLabel,
          summaryHtml: mdInline(
            g.summaryMarkdown,
            `${gAnchor}.summary`,
          ),
        });
      });

      const keyExcerpt = rawCard.keyExcerpt
        ? rawCard.keyExcerpt.trim()
        : rawCard.quoteOriginal;
      const hasExtendedOriginal = Boolean(
        rawCard.keyExcerpt && rawCard.keyExcerpt.trim() !== rawCard.quoteOriginal.trim(),
      );

      if (rawCard.groupedHeading) {
        assertNoToneIssues(rawCard.groupedHeading, `${anchorId}.groupedHeading`, {
          isHeadline: true,
        });
      }

      return Object.freeze({
        id: rawCard.id,
        anchorId,
        isDataset,
        title: rawCard.title,
        displayYear: rawCard.displayYear,
        datingBasis: rawCard.datingBasis,
        datingBasisLabel,
        evidenceTier: rawCard.evidenceTier,
        evidenceTierLabel,
        location: rawCard.location,
        repository: rawCard.repository,
        language: rawCard.language,
        languageHtml: renderFormattedEpigraphicHtml(rawCard.language),
        image: verifiedImage,
        secondaryImage: verifiedSecondaryImage,
        keyExcerpt,
        keyExcerptHtml: renderPlainEpigraphicHtml(keyExcerpt),
        hasExtendedOriginal,
        quoteOriginal: rawCard.quoteOriginal,
        quoteOriginalHtml: renderPlainEpigraphicHtml(rawCard.quoteOriginal),
        quoteTranslation: rawCard.quoteTranslation,
        quoteTranslationHtml: renderPlainEpigraphicHtml(rawCard.quoteTranslation),
        showsHtml: mdInline(
          rawCard.showsMarkdown,
          `${anchorId}.shows`,
        ),
        editionCitation: rawCard.editionCitation,
        editionCitationHtml: renderFormattedEpigraphicHtml(rawCard.editionCitation),
        analysisHtml: mdInline(
          rawCard.analysisMarkdown,
          `${anchorId}.analysis`,
        ),
        verifyLinks: Object.freeze(verifyLinks),
        groupedHeading:
          rawCard.groupedHeading ||
          `Related regional & manuscript comparators (${groupedWitnesses.length})`,
        groupedWitnesses: Object.freeze(groupedWitnesses),
      });
    });

    // Historiography discussion block.
    const hist = sec.historiography;
    assertNoToneIssues(hist.heading, `section[${sec.id}].hist.heading`, {
      isHeadline: true,
    });
    assertNoToneIssues(
      hist.hypothesisTitle,
      `section[${sec.id}].hist.hypothesisTitle`,
      { isHeadline: true },
    );
    assertNoToneIssues(
      hist.hypothesisMarkdown,
      `section[${sec.id}].hist.hypothesis`,
    );
    assertNoToneIssues(
      hist.assessmentTitle,
      `section[${sec.id}].hist.assessmentTitle`,
      { isHeadline: true },
    );

    const historiography = Object.freeze({
      heading: hist.heading,
      hypothesisTitle: hist.hypothesisTitle,
      hypothesisHtml: mdInline(
        hist.hypothesisMarkdown,
        `section[${sec.id}].hist.hypothesis`,
      ),
      assessmentTitle: hist.assessmentTitle,
      assessmentItemsHtml: Object.freeze(
        renderNumberedAssessmentItems(
          hist.assessmentMarkdown,
          `section[${sec.id}].hist.assessment`,
          referencedAnchors,
        ),
      ),
    });

    return Object.freeze({
      num: sec.num,
      id: sec.id,
      eyebrow: sec.eyebrow,
      title: sec.title,
      leadHtml: mdInline(sec.leadMarkdown, `section[${sec.id}].lead`),
      cards: Object.freeze(cards),
      historiography,
    });
  });

  if (primarySeen.size !== PRIMARY_CARD_IDS.length) {
    throw new Error(
      `Expected ${PRIMARY_CARD_IDS.length} primary dataset cards, emitted ${primarySeen.size}`,
    );
  }

  // Methodology & Scope section + 14 excluded items.
  assertNoToneIssues(METHODOLOGY_SECTION.eyebrow, 'methodology.eyebrow', {
    isHeadline: true,
  });
  assertNoToneIssues(METHODOLOGY_SECTION.title, 'methodology.title', {
    isHeadline: true,
  });
  assertNoToneIssues(METHODOLOGY_SECTION.leadMarkdown, 'methodology.lead');
  assertNoToneIssues(
    METHODOLOGY_SECTION.excludedDisclosure.summaryLabel,
    'methodology.excluded.summaryLabel',
    { isHeadline: true },
  );
  assertNoToneIssues(
    METHODOLOGY_SECTION.excludedDisclosure.introMarkdown,
    'methodology.excluded.intro',
  );

  const methodologyPrinciples = METHODOLOGY_SECTION.principles.map((p, idx) => {
    assertNoToneIssues(p.title, `methodology.principles[${idx}].title`, {
      isHeadline: true,
    });
    assertNoToneIssues(p.bodyMarkdown, `methodology.principles[${idx}].body`);
    return Object.freeze({
      title: p.title,
      bodyHtml: mdInline(
        p.bodyMarkdown,
        `methodology.principles[${idx}].body`,
      ),
    });
  });

  const excludedItems = EXCLUDED_LEGACY_IDS.map((exId) => {
    const ov = DATASET_OVERRIDES[exId];
    if (!ov || ov.disposition !== 'excluded') {
      throw new Error(`Invalid excluded override for '${exId}'`);
    }
    const anchorId = `event-${exId}`;
    emittedEventAnchors.push(anchorId);
    assertNoToneIssues(ov.legacyTitle, `${anchorId}.legacyTitle`, {
      isHeadline: true,
    });
    assertNoToneIssues(ov.exclusionCategory, `${anchorId}.category`);
    assertNoToneIssues(ov.exclusionReason, `${anchorId}.reason`);
    return Object.freeze({
      id: exId,
      anchorId,
      legacyTitle: ov.legacyTitle,
      rawDateClaim: ov.rawDateClaim,
      exclusionCategory: ov.exclusionCategory,
      exclusionReason: ov.exclusionReason,
      exclusionReasonHtml: renderFormattedEpigraphicHtml(ov.exclusionReason),
    });
  });

  // Guarantee all 42 `event-<id>` anchors were emitted exactly once.
  const anchorSet = new Set(emittedEventAnchors);
  if (
    emittedEventAnchors.length !== ALL_LEGACY_EVENT_IDS.length ||
    anchorSet.size !== ALL_LEGACY_EVENT_IDS.length
  ) {
    throw new Error(
      `Expected ${ALL_LEGACY_EVENT_IDS.length} unique #event-<id> anchors, got ${emittedEventAnchors.length} (${anchorSet.size} unique)`,
    );
  }
  for (const id of ALL_LEGACY_EVENT_IDS) {
    if (!anchorSet.has(`event-${id}`)) {
      throw new Error(`Missing required anchor #event-${id}`);
    }
  }

  const methodologyLeadHtml = mdInline(
    METHODOLOGY_SECTION.leadMarkdown,
    'methodology.lead',
  );
  const methodologyExcludedIntroHtml = mdInline(
    METHODOLOGY_SECTION.excludedDisclosure.introMarkdown,
    'methodology.excluded.intro',
  );

  // Verify every in-page `#...` link resolves to an emitted DOM ID.
  const validPageIds = new Set([
    'top',
    'sources',
    ...SECTION_ORDER,
    ...emittedEventAnchors,
    ...contextualCardAnchors,
  ]);
  for (const refId of referencedAnchors) {
    if (!validPageIds.has(refId)) {
      throw new Error(`Broken in-page fragment #${refId} in divinityTimeline content`);
    }
  }

  // Sources groups validation (SOURCES_GROUPS must contain external https:// URLs only).
  const sourcesGroups = SOURCES_GROUPS.map((grp, gIdx) => {
    assertNoToneIssues(grp.category, `sources[${gIdx}].category`, {
      isHeadline: true,
    });
    const items = grp.items.map((item, iIdx) => {
      assertNoToneIssues(item.title, `sources[${gIdx}].items[${iIdx}].title`);
      assertNoToneIssues(item.note, `sources[${gIdx}].items[${iIdx}].note`);
      assertExternalSourceHref(item.href, `sources[${gIdx}].items[${iIdx}].href`);
      return Object.freeze({
        ...item,
        titleHtml: renderFormattedEpigraphicHtml(item.title),
        noteHtml: renderFormattedEpigraphicHtml(item.note),
      });
    });
    return Object.freeze({
      category: grp.category,
      items: Object.freeze(items),
    });
  });

  // Nav chips (5 numbered sections + Methodology + Sources).
  const navChips = Object.freeze([
    ...SECTIONS.map((s) =>
      Object.freeze({
        id: s.id,
        num: s.num,
        label:
          s.id === 'inscriptions-and-archaeology'
            ? 'Inscriptions'
            : s.id === 'hostile-and-external-witnesses'
              ? 'External Witnesses'
              : s.id === 'first-century-creeds'
                ? 'First-Century Creeds'
                : s.id === 'earliest-biblical-papyri'
                  ? 'Papyri'
                  : 'Patristic Texts & Martyr Acts',
      }),
    ),
    Object.freeze({
      id: METHODOLOGY_SECTION_ID,
      num: null,
      label: 'Methodology',
    }),
    Object.freeze({
      id: 'sources',
      num: null,
      label: 'Sources',
    }),
  ]);

  // Structured JSON-LD (`BreadcrumbList` + `Article`).
  const citations = sourcesGroups.flatMap((grp) =>
    grp.items.map((it) => ({
      '@type': 'CreativeWork',
      name: it.title.replace(/\*([^*]+)\*/g, '$1'),
      url: it.href,
    })),
  );

  const jsonLd = Object.freeze([
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://readyapologia.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Discover',
          item: 'https://readyapologia.com/discover',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: PAGE_META.breadcrumbLabel,
          item: CANONICAL_URL,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${CANONICAL_URL}#article`,
      headline: PAGE_META.title,
      description: PAGE_META.description,
      url: CANONICAL_URL,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': CANONICAL_URL,
      },
      image: `https://readyapologia.com${OG_IMAGE}`,
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      inLanguage: 'en',
      author: {
        '@type': 'Organization',
        name: 'Ready Apologia',
        url: 'https://readyapologia.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Ready Apologia',
        url: 'https://readyapologia.com',
      },
      about: [
        { '@type': 'Thing', name: 'Early Christology' },
        { '@type': 'Thing', name: 'Early Christian Epigraphy' },
        { '@type': 'Thing', name: 'New Testament Papyrology' },
        { '@type': 'Thing', name: 'First Council of Nicaea' },
      ],
      citation: citations,
    },
  ]);

  return Object.freeze({
    slug: 'divinity-timeline',
    path: ARTICLE_PATH,
    canonicalUrl: CANONICAL_URL,
    ogImage: OG_IMAGE,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    rawDataSha256: sha256,
    sectionOrder: SECTION_ORDER,
    meta: PAGE_META,
    introParagraphs: Object.freeze(introParagraphs),
    framing,
    navChips,
    timelineShowcase: Object.freeze({
      ariaLabel: TIMELINE_SHOWCASE.ariaLabel,
      caption: TIMELINE_SHOWCASE.caption,
      events: Object.freeze(timelineEvents),
    }),
    glanceRows: Object.freeze(glanceRows),
    sections: Object.freeze(sections),
    methodology: Object.freeze({
      id: METHODOLOGY_SECTION.id,
      eyebrow: METHODOLOGY_SECTION.eyebrow,
      title: METHODOLOGY_SECTION.title,
      leadHtml: methodologyLeadHtml,
      principles: Object.freeze(methodologyPrinciples),
      excludedDisclosure: Object.freeze({
        summaryLabel: METHODOLOGY_SECTION.excludedDisclosure.summaryLabel,
        introHtml: methodologyExcludedIntroHtml,
        items: Object.freeze(excludedItems),
      }),
    }),
    sourcesGroups: Object.freeze(sourcesGroups),
    emittedEventAnchors: Object.freeze(emittedEventAnchors),
    jsonLd,
  });
}
