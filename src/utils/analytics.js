/**
 * Client-side Google Analytics 4 (GA4) helper module (L6 Production Standard).
 * Provides safe singleton gtag wrappers, global event delegation for outbound clicks,
 * and robust regex-based SPA transition tracking.
 */

// Singleton GA4 dispatcher resilient to SSR and offline states
const sendGtag = (...args) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  } else {
    window.dataLayer.push(args);
  }
};

// Helper to dispatch structured custom events
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  sendGtag('event', eventName, {
    ...params,
    send_to: window.GA_MEASUREMENT_ID || undefined,
  });

  if (import.meta.env.DEV || window.GA_DEBUG) {
    console.log(`[GA4 Debug] Event: ${eventName}`, params);
  }
}

/**
 * Track virtual page views during Astro ClientRouter transitions.
 */
export function trackPageView(url, title) {
  if (typeof window === 'undefined') return;
  
  trackEvent('page_view', {
    page_location: url || window.location.href,
    page_path: window.location.pathname,
    page_title: title || document.title,
  });
}

/**
 * Track evidence drawer tab views (Bible or Quran).
 */
export function trackEvidenceTabView({ testament, bookOrSurah, chapterOrAyah, verseId, tabId }) {
  trackEvent('evidence_tab_view', {
    testament: testament || 'Unknown',
    book_or_surah: bookOrSurah || '',
    chapter_or_ayah: chapterOrAyah || '',
    verse_id: verseId || '',
    tab_id: tabId || '',
  });
}

/**
 * Track visits to special Quran pages (Codex comparisons, Qiraat Variants, Lost/Abrogated verses).
 */
export function trackQuranSpecialView({ pageType, slugOrId }) {
  trackEvent('quran_special_view', {
    page_type: pageType || '',
    slug_or_id: slugOrId || '',
  });
}

/**
 * Track user interactions inside the Topics section.
 */
export function trackTopicInteraction({ topicId, action, verseRef }) {
  trackEvent('topic_interaction', {
    topic_id: topicId || '',
    action: action || '',
    verse_ref: verseRef || '',
  });
}

/**
 * Track user interactions with Quran Verse Labels (Theological Defects, Mutilations, etc.)
 */
export function trackQuranLabelInteraction({ surahNum, verseNum, labelName, action }) {
  trackEvent('quran_label_interaction', {
    surah_num: surahNum || '',
    verse_num: verseNum || '',
    label_name: labelName || '',
    action: action || '',
  });
}

/**
 * Track when a user customizes their tab hierarchy in the settings modal.
 */
export function trackTabReorder({ testament, topTab, fullOrder }) {
  trackEvent('tab_reorder_customized', {
    testament: testament || '',
    top_tab: topTab || '',
    full_order: Array.isArray(fullOrder) ? fullOrder.join(',') : (fullOrder || ''),
  });
}

/**
 * Track clicks on outbound actions (external origins or target="_blank").
 */
export function trackOutboundClick({ targetName, url }) {
  trackEvent('outbound_click', {
    target_name: targetName || '',
    destination_url: url || '',
  });
}

// ---------------------------------------------------------------------------
// Route & Global Event Delegation Handlers
// ---------------------------------------------------------------------------

// Self-documenting route regex matchers immune to query params or slashes
const BIBLE_TAB_REGEX = /^\/bible\/(?<book>[^/]+)\/(?<chapter>\d+)\/(?<verse>[^/]+)\/(?<tabId>[^/?#]+)/;
const QURAN_TAB_REGEX = /^\/quran\/(?<surah>\d+)\/(?<ayah>\d+)\/(?<tabId>[^/?#]+)/;
const QURAN_CODEX_REGEX = /^\/quran\/codex\/(?<companion>[^/?#]+)/;
const QURAN_VARIANT_REGEX = /^\/quran\/variant\/(?<slug>[^/?#]+)/;
const QURAN_SPECIAL_NUM_REGEX = /^\/quran\/(?<num>0|-1)(?:$|[/?#])/;

let lastTrackedPath = null;

/**
 * Automatically inspect current pathname using regex patterns and dispatch route-based tracking.
 */
export function handleRouteTracking() {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (lastTrackedPath === currentPath) return;
  lastTrackedPath = currentPath;

  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  const activePath = currentPath.startsWith(base) ? currentPath.slice(base.length) : currentPath;

  // 1. Always track virtual page_view on client transition
  trackPageView(window.location.href, document.title);

  // 2. Bible verse evidence drawer tab
  const matchBible = activePath.match(BIBLE_TAB_REGEX);
  if (matchBible?.groups) {
    const { book, chapter, verse, tabId } = matchBible.groups;
    trackEvidenceTabView({
      testament: 'Bible',
      bookOrSurah: book,
      chapterOrAyah: chapter,
      verseId: `${book}_${chapter}_${verse}`,
      tabId,
    });
    return;
  }

  // 3. Quran verse evidence drawer tab
  const matchQuran = activePath.match(QURAN_TAB_REGEX);
  if (matchQuran?.groups) {
    const { surah, ayah, tabId } = matchQuran.groups;
    trackEvidenceTabView({
      testament: 'Quran',
      bookOrSurah: surah,
      chapterOrAyah: ayah,
      verseId: `${surah}:${ayah}`,
      tabId,
    });
    return;
  }

  // 4. Special Quran routes (Codex, Variant, Lost/Abrogated)
  const matchCodex = activePath.match(QURAN_CODEX_REGEX);
  if (matchCodex?.groups) {
    trackQuranSpecialView({ pageType: 'codex', slugOrId: matchCodex.groups.companion });
    return;
  }

  const matchVariant = activePath.match(QURAN_VARIANT_REGEX);
  if (matchVariant?.groups) {
    trackQuranSpecialView({ pageType: 'variant', slugOrId: matchVariant.groups.slug });
    return;
  }

  const matchNum = activePath.match(QURAN_SPECIAL_NUM_REGEX);
  if (matchNum?.groups) {
    const pageType = matchNum.groups.num === '0' ? 'lost_verses' : 'abrogated_verses';
    trackQuranSpecialView({ pageType, slugOrId: matchNum.groups.num });
    return;
  }
}

let isDelegationInitialized = false;

/**
 * Initialize global event delegation once to capture all outbound link clicks across SPA transitions.
 */
export function initGlobalClickTracking() {
  if (typeof window === 'undefined' || isDelegationInitialized) return;
  isDelegationInitialized = true;

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Node)) return;
    const link = e.target.closest('a');
    if (!link || !link.href) return;

    try {
      const linkUrl = new URL(link.href, window.location.origin);
      const isExternal = linkUrl.origin !== window.location.origin;
      const isNewTab = link.getAttribute('target') === '_blank';

      if (isExternal || isNewTab) {
        const label = link.textContent?.trim() || link.getAttribute('aria-label') || linkUrl.hostname;
        trackOutboundClick({ targetName: label, url: link.href });
      }
    } catch (err) {
      // Ignore malformed URLs or javascript: protocols
    }
  });
}
