/**
 * @file section_navigator.js
 * @description L6 centralized navigation utility for Discover articles and deep-dive pages.
 * Handles responsive container scrolling (.main-content vs window), dynamic sticky header offsets,
 * initial URL hash positioning with layout stabilization, and scroll-spy IntersectionObservers.
 */

/**
 * Finds the active scrolling container in Ready Apologia's responsive layout.
 * On mobile (< 768px), `<main class="main-content">` scrolls.
 * On desktop (>= 768px), `window` or `.main-content` may scroll depending on docking layout.
 * @returns {HTMLElement|Window}
 */
export function getScrollContainer() {
  if (typeof document === 'undefined') return window;
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return window;

  // Check if .main-content is actually scrollable (overflow-y is auto/scroll or has scrollHeight > clientHeight)
  const hasVerticalOverflow = mainContent.scrollHeight > mainContent.clientHeight;
  return hasVerticalOverflow ? mainContent : window;
}

/**
 * Dynamically determines the height of sticky header bars to offset scroll position.
 * @param {number} fallbackOffset Default offset in pixels if no header is found.
 * @returns {number}
 */
export function getStickyHeaderOffset(fallbackOffset = 80) {
  if (typeof document === 'undefined') return fallbackOffset;
  const stickyNav = document.querySelector('.dilemma-sticky-nav, .journey-sticky-nav, .filter-pills-container, .meta-header');
  if (stickyNav) {
    return stickyNav.getBoundingClientRect().height + 24;
  }
  return fallbackOffset;
}

/**
 * Scrolls cleanly to a target DOM element by ID, accounting for sticky header offsets.
 * @param {string} id - The DOM ID of the target element.
 * @param {object} [options] - Options for scroll behavior and offset.
 * @param {ScrollBehavior} [options.behavior='smooth'] - Scroll animation behavior.
 * @param {number} [options.offset] - Explicit offset override in px.
 * @returns {boolean} True if the element was found and scrolled to.
 */
export function scrollToSection(id, options = {}) {
  if (typeof document === 'undefined' || !id) return false;
  const target = document.getElementById(id);
  if (!target) return false;

  const { behavior = 'smooth', offset } = options;
  const scrollContainer = getScrollContainer();
  const navOffset = offset !== undefined ? offset : getStickyHeaderOffset(80);

  if (scrollContainer === window) {
    const elementTop = target.getBoundingClientRect().top;
    const offsetPosition = elementTop + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(0, offsetPosition), behavior });
  } else {
    const elementTop = target.getBoundingClientRect().top;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const currentScroll = scrollContainer.scrollTop;
    const offsetPosition = currentScroll + (elementTop - containerTop) - navOffset;
    scrollContainer.scrollTo({ top: Math.max(0, offsetPosition), behavior });
  }

  return true;
}

/**
 * Handles initial URL hash positioning on page load with layout stabilization retry loop.
 * Prevents initial mount observers from overwriting the URL hash before layout settles.
 *
 * @param {object} config - Configuration options.
 * @param {string[]} [config.validIds] - Optional allowlist of DOM IDs that are valid hash targets.
 * @param {number} [config.offset] - Custom scroll offset in pixels.
 * @param {number} [config.maxAttempts=40] - Max animation frame retry attempts.
 * @param {(id: string) => void} [config.onHashFound] - Callback fired when hash target is identified.
 * @param {() => void} [config.onComplete] - Callback fired when initial scroll lock can be safely released.
 * @returns {() => void} Cleanup function to cancel pending frames and timers on unmount.
 */
export function setupInitialHashScroll(config = {}) {
  if (typeof window === 'undefined') return () => {};

  const {
    validIds = null,
    offset,
    maxAttempts = 40,
    onHashFound = () => {},
    onComplete = () => {}
  } = config;

  let rafId = null;
  let timerId = null;
  let cancelled = false;

  const cleanup = () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) clearTimeout(timerId);
  };

  const hash = window.location.hash ? window.location.hash.substring(1) : '';
  if (!hash || (validIds && !validIds.includes(hash))) {
    timerId = setTimeout(() => {
      if (!cancelled) onComplete();
    }, 100);
    return cleanup;
  }

  onHashFound(hash);

  let attempts = 0;
  const tryScroll = () => {
    if (cancelled) return;
    const el = document.getElementById(hash);
    if (el) {
      scrollToSection(hash, { behavior: 'auto', offset });
      timerId = setTimeout(() => {
        if (!cancelled) onComplete();
      }, 600);
    } else if (attempts < maxAttempts) {
      attempts++;
      rafId = requestAnimationFrame(tryScroll);
    } else {
      onComplete();
    }
  };

  rafId = requestAnimationFrame(tryScroll);
  return cleanup;
}

/**
 * Sets up an IntersectionObserver to track active sections and update the URL hash.
 *
 * @param {object} config - Configuration options.
 * @param {string} [config.selector='.dilemma-section'] - CSS selector for sections to observe.
 * @param {string} [config.rootMargin='-20% 0px -60% 0px'] - Observer rootMargin.
 * @param {() => boolean} [config.isLocked] - Function returning true if observer updates should be ignored.
 * @param {(id: string) => void} [config.onActiveIdChange] - Callback when active section changes.
 * @param {boolean} [config.updateUrl=true] - Whether to call history.replaceState automatically.
 * @returns {() => void} Disconnect cleanup function.
 */
export function setupSectionObserver(config = {}) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const {
    selector = '.dilemma-section',
    rootMargin = '-20% 0px -60% 0px',
    isLocked = () => false,
    onActiveIdChange = () => {},
    updateUrl = true
  } = config;

  const observer = new IntersectionObserver(
    (entries) => {
      if (isLocked()) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          const id = entry.target.id;
          onActiveIdChange(id);
          if (updateUrl && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${id}`);
          }
        }
      });
    },
    { rootMargin, threshold: 0 }
  );

  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => observer.observe(el));

  return () => {
    observer.disconnect();
  };
}
