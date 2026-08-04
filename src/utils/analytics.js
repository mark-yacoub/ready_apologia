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
  } else if (args[0] === 'event') {
    window.dataLayer.push({ event: args[1], ...args[2] });
  } else {
    window.dataLayer.push(args);
  }
};

// Helper to dispatch structured custom events
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  const payload = { ...params };
  if (window.GA_MEASUREMENT_ID && window.GA_MEASUREMENT_ID !== 'G-PLACEHOLDER') {
    payload.send_to = window.GA_MEASUREMENT_ID;
  }

  sendGtag('event', eventName, payload);

  if (import.meta.env.DEV || window.GA_DEBUG) {
    console.log(`[GA4 Debug] Event: ${eventName}`, payload);
  }
}

/**
 * Track virtual page views during Astro ClientRouter transitions.
 * 
 * @warning IMPORTANT - GA4 SPA DOUBLE TRACKING:
 * GA4 "Enhanced Measurement" has natively enabled "Page changes based on browser history" by default since 2023.
 * Since Astro ClientRouter uses the History API, GA4 will natively fire a page_view event when the URL changes.
 * Immediately after, this trackPageView function fires a 2nd manual page_view event, resulting in inflated duplicate page views.
 * To use this custom implementation properly (which has superior tracking fidelity for Astro's DOM titles), 
 * you MUST open the Google Analytics UI -> Admin -> Data Streams -> Web Stream Details -> Enhanced Measurement settings,
 * and DISABLE "Page changes based on browser history events", or you will double-track all SPA navigations.
 */
export function trackPageView(url, title) {
  trackEvent('page_view', {
    page_location: url || (typeof window !== 'undefined' ? window.location.href : ''),
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    page_title: title || (typeof window !== 'undefined' ? document.title : ''),
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
 * Track user interactions inside the Evidence section.
 */
export function trackEvidenceInteraction({ evidenceId, action, verseRef }) {
  trackEvent('evidence_interaction', {
    evidence_id: evidenceId || '',
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

// Removed trackOutboundClick since it is handled natively by GA4 Enhanced Measurement

/**
 * Track timeline event viewing
 */
export function trackTimelineEventView({ eventId, eventTitle }) {
  trackEvent('timeline_event_view', {
    event_id: eventId || '',
    event_title: eventTitle || '',
  });
}

/**
 * Track timeline filter applied
 */
export function trackTimelineFilterApplied({ filterType, activeCount }) {
  trackEvent('timeline_filter_applied', {
    filter_type: filterType || '',
    active_count: activeCount || 0,
  });
}

/**
 * Track onboarding banner interactions
 */
export function trackOnboardingInteraction({ tipId, action }) {
  trackEvent('onboarding_interaction', {
    tip_id: tipId || '',
    action: action || '',
  });
}

// ---------------------------------------------------------------------------
// Route & Global Event Delegation Handlers
// ---------------------------------------------------------------------------

let lastTrackedPath = null;

/**
 * Inspect declarative route metadata (#route-analytics-payload) and dispatch GA4 tracking.
 * Standard L6 Production pattern: routes define their analytics schema contract via <RouteAnalytics />.
 */
export function handleRouteTracking() {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (lastTrackedPath === currentPath) return;
  lastTrackedPath = currentPath;

  // 1. Always track virtual page_view on client transition
  trackPageView(window.location.href, document.title);

  // 2. [L6 Standard] Declarative DOM-first Routing
  // Pages inject <RouteAnalytics /> which renders <div id="route-analytics-payload" data-payload={JSON}>.
  const payloadEl = document.getElementById('route-analytics-payload');
  if (payloadEl && payloadEl.dataset.payload) {
    try {
      const payload = JSON.parse(payloadEl.dataset.payload);
      if (payload.eventName && payload.params) {
        trackEvent(payload.eventName, payload.params);
      }
    } catch (e) {
      console.warn('[GA4] Failed to parse route-analytics-payload JSON', e);
    }
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
    
    // 1. Intercept declarative custom tracking metrics
    const trackEl = e.target.closest('[data-track-event]');
    if (trackEl) {
      const eventName = trackEl.getAttribute('data-track-event');
      const params = {};
      for (let i = 0; i < trackEl.attributes.length; i++) {
        const attr = trackEl.attributes[i];
        if (attr.name.startsWith('data-track-') && attr.name !== 'data-track-event') {
          const paramName = attr.name.slice(11).replace(/-/g, '_');
          params[paramName] = attr.value;
        }
      }
      trackEvent(eventName, params);
    }

    // Outbound link tracking has been removed in favor of GA4's native Enhanced Measurement
  });
}
